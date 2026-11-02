import { useEffect, useRef, useState } from "react";
import { loadLiteRt, loadAndCompile, Tensor } from "@litertjs/core";

import {
  FiActivity,
  FiArrowRight,
  FiAward,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiSquare,
  FiXCircle,
} from "react-icons/fi";

import { GESTURE_QUESTIONS } from "../data/gestureQuizQuestions";

import {
  CONFIDENCE_THRESHOLD,
  HOLD_MS,
  RELEASE_MS,
  interruptHold,
  manualNext,
  newQuizState,
  processGesture,
  scoreQuiz,
} from "../utils/gestureQuizEngine";

// ========================================
// MODEL CONFIGURATION
// ========================================

const MODEL_URL = "/models/gesture-quiz/model_unquant.tflite";

const LABELS_URL = "/models/gesture-quiz/labels.txt";

const WASM_URL = "/litert-wasm/";

const IMAGE_SIZE = 224;

const EXPECTED_LABELS = ["1", "2", "3", "4", "No Hand"];

const FALLBACK_SCORES = EXPECTED_LABELS.map((label) => ({
  label,
  score: 0,
}));

const OPTION_LETTERS = ["A", "B", "C", "D"];

// Dynamic settings from the quiz engine.
const HOLD_SECONDS = HOLD_MS / 1000;

const CONFIDENCE_PERCENT = Math.round(CONFIDENCE_THRESHOLD * 100);

// Camera hold ring.
const RING_RADIUS = 38;

const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Called during camera inference,
// not during React rendering.

function getTimestamp() {
  return performance.now();
}

// ========================================
// LOAD TFLITE MODEL ONCE
// ========================================

let modelBundlePromise = null;

function getModelBundle() {
  if (!modelBundlePromise) {
    modelBundlePromise = (async () => {
      await loadLiteRt(WASM_URL);

      const [model, labelResponse] = await Promise.all([
        loadAndCompile(MODEL_URL, {
          accelerator: "wasm",
        }),

        fetch(LABELS_URL),
      ]);

      if (!labelResponse.ok) {
        throw new Error(`Cannot load labels: HTTP ${labelResponse.status}`);
      }

      const labels = (await labelResponse.text())
        .trim()
        .split(/\r?\n/)
        .map((line) => line.trim().replace(/^\d+\s+/, ""));

      if (labels.length !== 5) {
        throw new Error("Expected exactly five gesture labels.");
      }

      const invalidLabels = EXPECTED_LABELS.some(
        (label, index) => label !== labels[index],
      );

      if (invalidLabels) {
        throw new Error("labels.txt must contain: 1, 2, 3, 4, No Hand.");
      }

      return {
        model,
        labels,
      };
    })().catch((error) => {
      modelBundlePromise = null;
      throw error;
    });
  }

  return modelBundlePromise;
}

// ========================================
// CONVERT OUTPUT TENSOR
// ========================================

function asFloatArray(raw) {
  if (raw instanceof ArrayBuffer) {
    return Array.from(new Float32Array(raw));
  }

  if (ArrayBuffer.isView(raw)) {
    return Array.from(raw);
  }

  if (Array.isArray(raw)) {
    return raw;
  }

  throw new Error("Unexpected LiteRT output tensor format.");
}

// ========================================
// PREPARE CAMERA INPUT
// ========================================

function prepareInput(video, canvas) {
  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;

  const side = Math.min(sourceWidth, sourceHeight);

  if (!side) {
    return null;
  }

  // Center crop webcam image.
  context.drawImage(
    video,

    (sourceWidth - side) / 2,
    (sourceHeight - side) / 2,

    side,
    side,

    0,
    0,

    IMAGE_SIZE,
    IMAGE_SIZE,
  );

  const rgba = context.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE).data;

  const rgb = new Float32Array(IMAGE_SIZE * IMAGE_SIZE * 3);

  // Teachable Machine normalization:
  // RGB Float32 values in [-1, +1].

  for (let px = 0, dest = 0; px < rgba.length; px += 4) {
    rgb[dest++] = rgba[px] / 127.5 - 1;

    rgb[dest++] = rgba[px + 1] / 127.5 - 1;

    rgb[dest++] = rgba[px + 2] / 127.5 - 1;
  }

  return rgb;
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function GesturePrediction() {
  // ======================================
  // CAMERA REFS

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const streamRef = useRef(null);
  const runningRef = useRef(false);
  const timerRef = useRef(null);

  const cameraRequestRef = useRef(0);
  const bundleRef = useRef(null);

  // ======================================
  // QUIZ REF
  // ======================================

  const quizRef = useRef(newQuizState());

  // ======================================
  // FPS MEASUREMENT REF
  // ======================================

  const fpsWindowRef = useRef({
    start: null,
    count: 0,
  });

  // ======================================
  // CAMERA STATE
  // ======================================

  const [modelState, setModelState] = useState("loading");

  const [cameraOn, setCameraOn] = useState(false);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  const [prediction, setPrediction] = useState(null);

  const [inferenceMs, setInferenceMs] = useState(null);

  // Actual predictions per second.
  const [predictionsPerSecond, setPredictionsPerSecond] = useState(null);

  // ======================================
  // QUIZ STATE
  // ======================================

  const [quiz, setQuiz] = useState(newQuizState);

  // ======================================
  // UPDATE QUIZ STATE
  // ======================================

  const publishQuiz = (next) => {
    if (next === quizRef.current) {
      return;
    }

    quizRef.current = next;
    setQuiz(next);
  };

  // ======================================
  // INITIALIZE TENSORFLOW LITE
  // ======================================

  useEffect(() => {
    let active = true;

    getModelBundle()
      .then((bundle) => {
        if (!active) {
          return;
        }

        bundleRef.current = bundle;

        setModelState("ready");
      })
      .catch((err) => {
        if (!active) {
          return;
        }

        console.error("LiteRT model load failed:", err);

        setError(err.message || "Failed to load TensorFlow Lite model.");

        setModelState("error");
      });

    return () => {
      active = false;

      cameraRequestRef.current += 1;

      runningRef.current = false;

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());

      streamRef.current = null;
    };
  }, []);

  // ======================================
  // STOP CAMERA
  // ======================================

  const stopCamera = () => {
    cameraRequestRef.current += 1;

    runningRef.current = false;

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setBusy(false);

    setPrediction(null);
    setInferenceMs(null);

    setPredictionsPerSecond(null);

    fpsWindowRef.current = {
      start: null,
      count: 0,
    };

    publishQuiz(interruptHold(quizRef.current));
  };

  // ======================================
  // LIVE PREDICTION LOOP
  // ======================================

  const predictLoop = async () => {
    if (!runningRef.current) {
      return;
    }

    let inputTensor = null;
    let outputTensors = [];

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const bundle = bundleRef.current;

      if (!video || !canvas || !bundle) {
        return;
      }

      if (video.readyState >= 2 && video.videoWidth > 0) {
        const inputPixels = prepareInput(video, canvas);

        if (inputPixels) {
          const started = getTimestamp();

          // ==================================
          // CREATE INPUT TENSOR
          // ==================================

          inputTensor = new Tensor(inputPixels, [1, 224, 224, 3]);

          // ==================================
          // RUN ACTUAL TFLITE MODEL
          // ==================================

          outputTensors = await bundle.model.run(inputTensor);

          const raw = await outputTensors[0].data();

          const probabilities = asFloatArray(raw);

          if (probabilities.length !== 5) {
            throw new Error(`Expected 5 scores, got ${probabilities.length}`);
          }

          const scores = probabilities.map((score, index) => ({
            label: bundle.labels[index],

            score: Math.max(0, Math.min(1, Number(score) || 0)),
          }));

          const top = scores.reduce((best, item) =>
            item.score > best.score ? item : best,
          );

          if (runningRef.current) {
            // ==================================
            // SHOW LIVE PREDICTION
            // ==================================

            setPrediction({
              scores,
              top,
            });

            const finishedAt = getTimestamp();

            // ==================================
            // INFERENCE TIME
            // ==================================

            setInferenceMs(Math.round(finishedAt - started));

            // ==================================
            // ACTUAL PREDICTIONS PER SECOND
            // ==================================

            const fpsWindow = fpsWindowRef.current;

            if (fpsWindow.start === null) {
              fpsWindow.start = finishedAt;
            }

            fpsWindow.count += 1;

            const windowMs = finishedAt - fpsWindow.start;

            // Update actual prediction rate
            // approximately once per second.

            if (windowMs >= 1000) {
              const actualRate = (fpsWindow.count * 1000) / windowMs;

              setPredictionsPerSecond(actualRate);

              fpsWindow.start = finishedAt;

              fpsWindow.count = 0;
            }

            // ==================================
            // GESTURE QUIZ INTEGRATION
            // ==================================

            const updatedQuiz = processGesture(
              quizRef.current,

              top,

              finishedAt,

              GESTURE_QUESTIONS,
            );

            publishQuiz(updatedQuiz);
          }
        }
      }
    } catch (err) {
      console.error("LiteRT inference error:", err);

      if (runningRef.current) {
        stopCamera();

        setError(err.message || "Model prediction failed.");
      }

      return;
    } finally {
      // Release input tensor.
      try {
        inputTensor?.delete();
      } catch {
        // Ignore cleanup error.
      }

      // Release output tensors.
      outputTensors.forEach((tensor) => {
        try {
          tensor?.delete();
        } catch {
          // Ignore cleanup error.
        }
      });
    }

    // Keep only one active inference loop.
    if (runningRef.current) {
      timerRef.current = setTimeout(predictLoop, 160);
    }
  };

  // ======================================
  // START CAMERA
  // ======================================

  const startCamera = async () => {
    if (busy || runningRef.current || !bundleRef.current) {
      return;
    }

    const requestId = ++cameraRequestRef.current;

    setBusy(true);
    setError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera requires localhost or HTTPS.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",

          width: {
            ideal: 640,
          },

          height: {
            ideal: 480,
          },
        },

        audio: false,
      });

      if (requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());

        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => track.stop());

        streamRef.current = null;

        return;
      }

      video.srcObject = stream;

      await video.play();

      if (requestId !== cameraRequestRef.current) {
        return;
      }

      // Reset prediction speed counter.
      fpsWindowRef.current = {
        start: null,
        count: 0,
      };

      setPredictionsPerSecond(null);

      runningRef.current = true;

      setCameraOn(true);

      void predictLoop();
    } catch (err) {
      if (requestId === cameraRequestRef.current) {
        console.error("Camera error:", err);

        stopCamera();

        setError(err.message || "Unable to open camera.");
      }
    } finally {
      if (requestId === cameraRequestRef.current) {
        setBusy(false);
      }
    }
  };

  // ======================================
  // QUIZ CONTROLS
  // ======================================

  const handleNext = () => {
    publishQuiz(manualNext(quizRef.current, GESTURE_QUESTIONS));
  };

  const handleRestart = () => {
    // Require No Hand before restarting
    // if the camera is still active.

    publishQuiz(newQuizState(runningRef.current));
  };

  // ======================================
  // QUIZ VALUES
  // ======================================

  const currentQuestion = GESTURE_QUESTIONS[quiz.index];

  const totalQuestions = GESTURE_QUESTIONS.length;

  const completed = quiz.answers.length;

  const correctAnswers = scoreQuiz(quiz);

  const finished = quiz.phase === "finished";

  const submitted = quiz.phase === "submitted";

  const awaitingRelease = quiz.phase === "wait-release";

  const latestAnswer = quiz.answers.at(-1) || null;

  const confidence = prediction?.top?.score ?? 0;

  const reliable = confidence >= CONFIDENCE_THRESHOLD;

  // ======================================
  // UI
  // ======================================

  return (
    <main className="min-h-screen bg-[#0B1120] px-4 py-10 text-white sm:px-6 lg:py-10">
      <div className="mx-auto max-w-7xl">
      
        {/* ==================================
            PAGE HEADER
        ================================== */}

        <header className="mb-7 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-400">
              SkillSphere AI · AI Learning Lab
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Gesture-Controlled MCQ Quiz
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
              Answer with 1–4 fingers. Hold a confident gesture for{" "}
              {HOLD_SECONDS} seconds to submit automatically. Your TensorFlow
              Lite model runs locally in the browser.
            </p>
          </div>

          {/* TENSORFLOW LITE BADGE */}

          <div
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-300 ${
              modelState === "ready"
                ? "border-green-500/30 bg-green-200/10 text-green-400"
                : modelState === "loading"
                  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            <FiActivity
              className={modelState === "loading" ? "animate-pulse" : ""}
            />
            Powered by TensorFlow Lite ·{" "}
            {modelState === "ready"
              ? "Ready"
              : modelState === "loading"
                ? "Loading"
                : "Error"}
          </div>
        </header>

        {/* ==================================
            QUIZ SUMMARY
        ================================== */}

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#151B2B] p-4">
            <p className="text-xs text-gray-400">Question Progress</p>

            <p className="mt-2 text-2xl font-bold">
              {completed}

              <span className="text-base text-gray-500">
                {" "}
                / {totalQuestions}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#151B2B] p-4">
            <p className="text-xs text-gray-400">Correct Answers</p>

            <p className="mt-2 text-2xl font-bold text-emerald-300">
              {correctAnswers}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#151B2B] p-4">
            <p className="text-xs text-gray-400">Gesture Hold</p>

            <p className="mt-2 flex items-center gap-2 text-2xl font-bold">
              <FiClock className="text-indigo-300" size={21} />
              {HOLD_SECONDS}s{/* Dynamic confidence text */}
              <span className="text-sm font-normal text-gray-400">
                at ≥{CONFIDENCE_PERCENT}%
              </span>
            </p>
          </div>
        </div>

        {/* ==================================
            MAIN GRID
        ================================== */}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)]">
          {/* ==================================
              LEFT SIDE: CAMERA
              On mobile: shown after quiz
          ================================== */}

          <div className="order-last space-y-6 lg:order-0">
            {/* CAMERA SECTION */}

            <section className="rounded-2xl border border-white/10 bg-[#151B2B] p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-semibold">
                  <FiCamera className="text-indigo-300" />
                  Laptop Camera
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    cameraOn
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  {cameraOn ? "Live" : "Camera Off"}
                </span>
              </div>

              {/* CAMERA PREVIEW */}

              <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full -scale-x-100 object-cover"
                />

                {!cameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/65 text-sm text-gray-300">
                    Camera is off
                  </div>
                )}

                {/* DETECTED GESTURE */}

                {cameraOn &&
                  reliable &&
                  prediction?.top?.label !== "No Hand" && (
                    <div className="absolute bottom-3 left-3 rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-sm font-bold backdrop-blur-sm">
                      Gesture {prediction.top.label} ·{" "}
                      {(confidence * 100).toFixed(0)}%
                    </div>
                  )}

                {/* ==================================
                    IMPROVEMENT 2:
                    CAMERA HOLD RING OVERLAY
                ================================== */}

                {cameraOn && quiz.phase === "holding" && (
                  <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-indigo-300/30 bg-[#0B1120]/90 px-4 py-2 shadow-xl backdrop-blur-md">
                      {/* CIRCULAR PROGRESS */}

                      <div className="relative h-16 w-16 shrink-0">
                        <svg
                          viewBox="0 0 88 88"
                          className="h-full w-full -rotate-90"
                          aria-hidden="true"
                        >
                          <circle
                            cx="44"
                            cy="44"
                            r={RING_RADIUS}
                            fill="none"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="8"
                          />

                          <circle
                            cx="44"
                            cy="44"
                            r={RING_RADIUS}
                            fill="none"
                            stroke="#818cf8"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={RING_CIRCUMFERENCE}
                            strokeDashoffset={
                              RING_CIRCUMFERENCE * (1 - quiz.holdProgress)
                            }
                          />
                        </svg>

                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                          {Math.round(quiz.holdProgress * 100)}%
                        </span>
                      </div>

                      {/* HOLD TIMER */}

                      <div>
                        <p className="text-sm font-bold text-white">
                          Holding {quiz.candidate}...
                        </p>

                        <p className="mt-1 text-xs text-indigo-200">
                          {(quiz.holdProgress * HOLD_SECONDS).toFixed(1)}s
                          {" / "}
                          {HOLD_SECONDS.toFixed(1)}s
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* HIDDEN INPUT CANVAS */}

                <canvas
                  ref={canvasRef}
                  width={224}
                  height={224}
                  className="hidden"
                />
              </div>

              {/* CAMERA CONTROLS */}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={modelState !== "ready" || cameraOn || busy}
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiCamera />

                  {busy ? "Opening Camera..." : "Start Camera"}
                </button>

                <button
                  type="button"
                  disabled={!cameraOn}
                  onClick={stopCamera}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10 disabled:opacity-40"
                >
                  <FiSquare />
                  Stop Camera
                </button>
              </div>

              {/* ERROR MESSAGE */}

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              <p className="mt-4 text-xs text-gray-500">
                Input: 224 × 224 RGB Float32 · LiteRT.js WASM · Camera frames
                stay on this device.
              </p>
            </section>

            {/* ==================================
                LIVE PREDICTION PANEL
            ================================== */}

            <section className="rounded-2xl border border-white/10 bg-[#151B2B] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">Live AI Prediction</h2>

                {/* IMPROVEMENT 3:
                    ACTUAL PREDICTIONS/SEC */}

                <div className="text-right text-xs text-gray-400">
                  <p>
                    {inferenceMs === null
                      ? "— ms/inference"
                      : `${inferenceMs} ms/inference`}
                  </p>

                  <p className="mt-1 text-indigo-300">
                    {predictionsPerSecond === null
                      ? "— predictions/sec"
                      : `${predictionsPerSecond.toFixed(1)} predictions/sec`}
                  </p>
                </div>
              </div>

              {/* TOP PREDICTION */}

              <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                <p className="text-xs text-indigo-300">Top Class</p>

                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-2xl font-bold">
                    {prediction?.top?.label ?? "—"}
                  </p>

                  <p className="text-sm font-medium text-indigo-200">
                    {prediction
                      ? `${(confidence * 100).toFixed(1)}%`
                      : "Start Camera"}
                  </p>
                </div>
              </div>

              {/* CONFIDENCE BARS */}

              <div className="mt-5 space-y-3">
                {(prediction?.scores ?? FALLBACK_SCORES).map(
                  ({ label, score }) => (
                    <div key={label}>
                      <div className="mb-1.5 flex justify-between text-xs text-gray-400">
                        <span>{label}</span>

                        <span>{(score * 100).toFixed(1)}%</span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        {/* Compatible solid progress */}

                        <div
                          className="h-full rounded-full bg-indigo-500 transition-[width] duration-150"
                          style={{
                            width: `${score * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>
          </div>

          {/* ==================================
              RIGHT SIDE: QUIZ
              On mobile: appears first
          ================================== */}

          <section className="order-first rounded-2xl border border-white/10 bg-[#151B2B] p-5 sm:p-6 lg:order-0">
            {finished ? (
              /* ==============================
                  FINAL RESULT SCREEN
              ============================== */

              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                  <FiAward size={29} />
                </div>

               <div className="flex items-center justify-between pb-2">
                 <div>
                  <p
                  role="status"
                  className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300"
                >
                  Quiz Completed
                </p>

                <h2 className="mt-2 text-3xl font-bold">Your Final Score</h2>
                </div>

                <div>
                  <p className=" text-5xl font-extrabold text-emerald-300">
                  {correctAnswers}

                  <span className="text-2xl text-gray-500">
                    {" "}
                    / {totalQuestions}
                  </span>
                </p>

                <p className="mt-3  text-gray-400">
                  {Math.round((correctAnswers / totalQuestions) * 100)}% correct
                </p>
                </div>
               </div>

                {/* ==================================
                    SAFE ANSWER SUMMARY
                ================================== */}

                <div className="mt-7 space-y-3">
                  {GESTURE_QUESTIONS.map((item, index) => {
                    // Find matching answer safely.
                    const answer = quiz.answers.find(
                      (entry) => entry.questionId === item.id,
                    );

                    const selectedAnswer =
                      answer &&
                      Number.isInteger(answer.selectedIndex) &&
                      item.options[answer.selectedIndex] !== undefined
                        ? item.options[answer.selectedIndex]
                        : "Not answered";

                    const correctAnswer = item.options[item.correctIndex];

                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                      >
                        {/* ANSWER STATUS ICON */}

                        {answer?.correct ? (
                          <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-400" />
                        ) : answer ? (
                          <FiXCircle className="mt-0.5 shrink-0 text-red-400" />
                        ) : (
                          <FiClock className="mt-0.5 shrink-0 text-amber-400" />
                        )}

                        <div className="min-w-0">
                          <p className="text-sm text-gray-200">
                            {index + 1}. {item.question}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Your Answer: {selectedAnswer} · Correct:{" "}
                            {correctAnswer}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RESTART QUIZ */}

                <button
                  type="button"
                  onClick={handleRestart}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold hover:bg-indigo-500"
                >
                  <FiRefreshCw />
                  Restart Quiz
                </button>
              </>
            ) : (
              /* ==============================
                  ACTIVE QUIZ SCREEN
              ============================== */

              <>
                {/* QUESTION HEADER */}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
                    Question {quiz.index + 1} of {totalQuestions}
                  </p>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                    {currentQuestion.topic}
                  </span>
                </div>

                {/* QUESTION PROGRESS */}

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-[width] duration-300"
                    style={{
                      width: `${(completed / totalQuestions) * 100}%`,
                    }}
                  />
                </div>

                {/* QUESTION TEXT */}

                <h2 className="mt-6 text-xl font-bold leading-relaxed sm:text-2xl">
                  {currentQuestion.question}
                </h2>

                {/* ==============================
                    MCQ OPTIONS
                ============================== */}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((option, index) => {
                    const held =
                      quiz.phase === "holding" &&
                      quiz.candidate === String(index + 1);

                    const markedCorrect =
                      submitted && index === currentQuestion.correctIndex;

                    const markedWrong =
                      submitted &&
                      latestAnswer?.selectedIndex === index &&
                      !latestAnswer.correct;

                    const optionStyle = markedCorrect
                      ? "border-emerald-500/70 bg-emerald-500/15 text-emerald-100"
                      : markedWrong
                        ? "border-red-500/70 bg-red-500/15 text-red-100"
                        : held
                          ? "border-indigo-400 bg-indigo-500/15 text-indigo-100"
                          : "border-white/10 bg-white/5 text-gray-200";

                    return (
                      <div
                        key={`${currentQuestion.id}-${index}`}
                        className={`rounded-xl border p-4 transition-colors ${optionStyle}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-lg border border-white/15 px-2 py-1 text-xs font-bold">
                            {OPTION_LETTERS[index]} · Gesture {index + 1}
                          </span>

                          {markedCorrect && (
                            <FiCheckCircle className="text-emerald-300" />
                          )}

                          {markedWrong && (
                            <FiXCircle className="text-red-300" />
                          )}
                        </div>

                        <p className="mt-4 text-base font-semibold">{option}</p>

                        {held && (
                          <p className="mt-2 text-xs text-indigo-300">
                            Holding... {Math.round(quiz.holdProgress * 100)}%
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ==============================
                    HOLD / ANSWER FEEDBACK
                ============================== */}

                <div className="mt-6 rounded-xl border border-white/10 bg-[#0E1626] p-4">
                  {submitted ? (
                    /* ANSWER SUBMITTED */

                    <>
                      <div role="status" className="flex items-center gap-2">
                        {latestAnswer?.correct ? (
                          <FiCheckCircle className="text-emerald-300" />
                        ) : (
                          <FiXCircle className="text-red-300" />
                        )}

                        <p
                          className={`font-semibold ${
                            latestAnswer?.correct
                              ? "text-emerald-300"
                              : "text-red-300"
                          }`}
                        >
                          {latestAnswer?.correct
                            ? "Correct Answer!"
                            : "Incorrect Answer"}
                        </p>
                      </div>

                      <p className="mt-2 text-sm text-gray-300">
                        Correct Answer:{" "}
                        {currentQuestion.options[currentQuestion.correctIndex]}
                      </p>

                      <p className="mt-2 text-xs leading-6 text-gray-400">
                        {currentQuestion.explanation}
                      </p>

                      <p className="mt-3 text-xs text-indigo-300">
                        Remove your hand and keep "No Hand" visible for{" "}
                        {RELEASE_MS / 1000}s to continue automatically.
                      </p>

                      {/* RELEASE PROGRESS */}

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-[width] duration-100"
                          style={{
                            width: `${Math.round(quiz.releaseProgress * 100)}%`,
                          }}
                        />
                      </div>

                      {/* MANUAL NEXT */}

                      <button
                        type="button"
                        onClick={handleNext}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold hover:bg-indigo-500"
                      >
                        Next Question
                        <FiArrowRight />
                      </button>
                    </>
                  ) : awaitingRelease ? (
                    /* WAIT FOR NO HAND */

                    <>
                      <p className="font-semibold text-amber-300">
                        Release Gesture to Start
                      </p>

                      <p className="mt-2 text-sm text-gray-400">
                        Show "No Hand" clearly before answering. This prevents
                        repeating the previous gesture.
                      </p>

                      {/* RELEASE PROGRESS */}

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-[width] duration-100"
                          style={{
                            width: `${Math.round(quiz.releaseProgress * 100)}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    /* READY / HOLDING */

                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-white">
                          {quiz.phase === "holding"
                            ? `Holding Gesture ${quiz.candidate}`
                            : "Ready for your gesture"}
                        </p>

                        {/* DYNAMIC HOLD TIME */}

                        <span className="text-sm font-bold text-indigo-300">
                          {quiz.phase === "holding"
                            ? `${(quiz.holdProgress * HOLD_SECONDS).toFixed(
                                1,
                              )} / ${HOLD_SECONDS.toFixed(1)}s`
                            : `0.0 / ${HOLD_SECONDS.toFixed(1)}s`}
                        </span>
                      </div>

                      {/* HOLD PROGRESS BAR */}

                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-[width] duration-100"
                          style={{
                            width: `${Math.round(quiz.holdProgress * 100)}%`,
                          }}
                        />
                      </div>

                      {/* DYNAMIC STATUS TEXT */}

                      <p className="mt-3 text-xs leading-6 text-gray-400">
                        {!cameraOn
                          ? "Start your camera to answer."
                          : !reliable
                            ? `Low confidence — show your hand clearly (${CONFIDENCE_PERCENT}% required).`
                            : prediction?.top?.label === "No Hand"
                              ? "No hand detected. Show 1, 2, 3, or 4 fingers."
                              : `Hold the same finger count steady for ${HOLD_SECONDS} seconds.`}
                      </p>
                    </>
                  )}
                </div>

                {/* RESTART BUTTON */}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-gray-500">
                    Each answer is submitted only once.
                  </span>

                  <button
                    type="button"
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10"
                  >
                    <FiRefreshCw />
                    Restart Quiz
                  </button>
                </div>
              </>
            )}
          </section>
        </div>

        {/* ==================================
            FOOTER
        ================================== */}

        <p className="mt-6 text-xs leading-6 text-gray-500">
          Prediction threshold: {CONFIDENCE_PERCENT}% · Hold: {HOLD_SECONDS}s ·
          Release: {RELEASE_MS}ms · Model scores are confidence estimates, not
          measured accuracy percentages. No video is uploaded to the server.
        </p>
      </div>
    </main>
  );
}
