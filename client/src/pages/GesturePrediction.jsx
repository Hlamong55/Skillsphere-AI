import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { loadLiteRt, loadAndCompile, Tensor } from "@litertjs/core";

// Actual exported Teachable Machine TFLite model:
// Input:  [1, 224, 224, 3] float32 (NHWC, RGB)
// Output: [1, 5] float32 (five class probabilities)
const MODEL_URL = "/models/gesture-quiz/model_unquant.tflite";
const LABELS_URL = "/models/gesture-quiz/labels.txt";
const WASM_URL = "/litert-wasm/";
const IMAGE_SIZE = 224;
const CONFIDENCE_THRESHOLD = 0.85;

// Share one LiteRT model among remounts and React StrictMode effects.
// Avoid compiling the same 2 MB model twice.
let modelBundlePromise = null;

function getModelBundle() {
  if (!modelBundlePromise) {
    modelBundlePromise = (async () => {
      // Google's official LiteRT.js runtime (actual .tflite inference).
      await loadLiteRt(WASM_URL);

      const [model, labelResponse] = await Promise.all([
        loadAndCompile(MODEL_URL, { accelerator: "wasm" }),
        fetch(LABELS_URL),
      ]);
      if (!labelResponse.ok) {
        throw new Error(`Cannot load labels: HTTP ${labelResponse.status}`);
      }
      const labelText = await labelResponse.text();
      const labels = labelText.trim().split(/\r?\n/).map((line) =>
        line.trim().replace(/^\d+\s+/, "")
      );
      if (labels.length !== 5) {
        throw new Error("Expected exactly five gesture labels.");
      }
      return { model, labels };
    })().catch((error) => {
      modelBundlePromise = null; // allow a later retry
      throw error;
    });
  }
  return modelBundlePromise;
}

// Keep probabilities safe to read whether LiteRT returns a typed view
// or a plain ArrayBuffer. Never change output order.
function asFloatArray(raw) {
  if (raw instanceof ArrayBuffer) return Array.from(new Float32Array(raw));
  if (ArrayBuffer.isView(raw)) return Array.from(raw);
  if (Array.isArray(raw)) return raw;
  throw new Error("Unexpected LiteRT output tensor format.");
}

function prepareInput(video, canvas) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas 2D context is unavailable.");

  // Teachable Machine image models use a square center crop.
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  const side = Math.min(sourceWidth, sourceHeight);
  if (!side) return null;
  const x = (sourceWidth - side) / 2;
  const y = (sourceHeight - side) / 2;
  context.drawImage(video, x, y, side, side, 0, 0, IMAGE_SIZE, IMAGE_SIZE);

  const rgba = context.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE).data;
  const rgb = new Float32Array(IMAGE_SIZE * IMAGE_SIZE * 3);
  // Teachable Machine's exported image classifier uses [-1, +1] RGB.
  for (let px = 0, dest = 0; px < rgba.length; px += 4) {
    rgb[dest++] = rgba[px] / 127.5 - 1;
    rgb[dest++] = rgba[px + 1] / 127.5 - 1;
    rgb[dest++] = rgba[px + 2] / 127.5 - 1;
  }
  return rgb;
}

export default function GesturePrediction() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const runningRef = useRef(false);
  const timerRef = useRef(null);
  const bundleRef = useRef(null);

  const [modelState, setModelState] = useState("loading");
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [inferenceMs, setInferenceMs] = useState(null);

  useEffect(() => {
    let active = true;
    getModelBundle()
      .then((bundle) => {
        if (!active) return;
        bundleRef.current = bundle;
        setModelState("ready");
      })
      .catch((err) => {
        if (!active) return;
        console.error("LiteRT model load failed:", err);
        setError(err.message || "Failed to load TFLite model.");
        setModelState("error");
      });

    return () => {
      active = false;
      runningRef.current = false;
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const stopCamera = () => {
    runningRef.current = false;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setPrediction(null);
  };

  const predictLoop = async () => {
    if (!runningRef.current) return;
    let inputTensor = null;
    let outputTensors = [];

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const bundle = bundleRef.current;
      if (!video || !canvas || !bundle) return;

      if (video.readyState >= 2 && video.videoWidth > 0) {
        const inputPixels = prepareInput(video, canvas);
        if (inputPixels) {
          const started = performance.now();
          inputTensor = new Tensor(inputPixels, [1, 224, 224, 3]);
          outputTensors = await bundle.model.run(inputTensor);
          const raw = await outputTensors[0].data();
          const probabilities = asFloatArray(raw);
          if (probabilities.length !== 5) {
            throw new Error(`Expected 5 model scores, got ${probabilities.length}`);
          }
          const scores = probabilities.map((score, i) => ({
            label: bundle.labels[i],
            score: Math.max(0, Math.min(1, Number(score) || 0)),
          }));
          const top = scores.reduce((best, item) =>
            item.score > best.score ? item : best
          );

          if (runningRef.current) {
            setPrediction({ scores, top });
            setInferenceMs(Math.round(performance.now() - started));
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
      try { inputTensor?.delete(); } catch { /* ignore cleanup errors */ }
      outputTensors.forEach((tensor) => {
        try { tensor?.delete(); } catch { /* ignore cleanup errors */ }
      });
    }

    // No overlapping inferences; slower laptops automatically run slower.
    if (runningRef.current) {
      timerRef.current = setTimeout(predictLoop, 160);
    }
  };

  const startCamera = async () => {
    if (busy || runningRef.current || !bundleRef.current) return;
    setBusy(true);
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera needs localhost or HTTPS in a supported browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        return;
      }
      video.srcObject = stream;
      await video.play();
      runningRef.current = true;
      setCameraOn(true);
      void predictLoop();
    } catch (err) {
      console.error("Camera error:", err);
      stopCamera();
      setError(err.message || "Unable to open the camera.");
    } finally {
      setBusy(false);
    }
  };

  const confidence = prediction?.top?.score ?? 0;
  const reliable = confidence >= CONFIDENCE_THRESHOLD;

  return (
    <main className="min-h-screen bg-[#0B1120] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link to="/feed" className="text-sm text-indigo-300 hover:underline">
          ← Back to Community Feed
        </Link>
        <div className="mt-6 mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            SKILLSPHERE AI / AI LEARNING LAB
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Live Gesture Prediction</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Actual TensorFlow Lite model running locally in your browser using LiteRT.js.
            Show 1, 2, 3 or 4 fingers, or remove your hand.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-2xl border border-white/10 bg-[#151B2B] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">Laptop Camera</h2>
              <span className={`rounded-full px-3 py-1 text-xs ${modelState === "ready" ? "bg-green-500/10 text-green-300" : "bg-amber-500/10 text-amber-300"}`}>
                Model: {modelState}
              </span>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover -scale-x-100"
              />
              {!cameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-gray-300">
                  Camera is off
                </div>
              )}
              <canvas ref={canvasRef} width={224} height={224} className="hidden" />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={modelState !== "ready" || cameraOn || busy}
                onClick={startCamera}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Opening Camera..." : "Start Camera"}
              </button>
              <button
                type="button"
                disabled={!cameraOn}
                onClick={stopCamera}
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10 disabled:opacity-40"
              >
                Stop Camera
              </button>
            </div>
            {error && (
              <div role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}
            <p className="mt-4 text-xs text-gray-500">
              Input: 224 × 224 RGB Float32 · Runtime: LiteRT.js WebAssembly · No video is uploaded.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#151B2B] p-5">
            <h2 className="font-semibold">Live AI Prediction</h2>
            <div className="mt-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5">
              <p className="text-xs text-indigo-300">Top Prediction</p>
              <p className="mt-2 text-3xl font-bold">
                {prediction ? prediction.top.label : "—"}
              </p>
              <p className="mt-2 text-sm text-gray-300">
                {prediction ? `${(confidence * 100).toFixed(1)}% confidence` : "Start camera to predict"}
              </p>
              {prediction && (
                <span className={`mt-3 inline-block rounded-lg px-3 py-1 text-xs ${reliable ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-300"}`}>
                  {reliable ? "Confidence threshold passed" : "Low confidence — adjust your hand"}
                </span>
              )}
            </div>
            <div className="mt-6 space-y-4">
              {(prediction?.scores ?? [
                { label: "1", score: 0 },
                { label: "2", score: 0 },
                { label: "3", score: 0 },
                { label: "4", score: 0 },
                { label: "No Hand", score: 0 },
              ]).map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-gray-300">{item.label}</span>
                    <span className="font-medium text-white">{(item.score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-[width] duration-150"
                      style={{ width: `${item.score * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs text-gray-400">
              Inference: {inferenceMs === null ? "—" : `${inferenceMs} ms`}
            </div>
          </section>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          This stage only verifies live prediction. MCQ answer selection and 2-second hold will be added after the camera test passes.
        </p>
      </div>
    </main>
  );
}
