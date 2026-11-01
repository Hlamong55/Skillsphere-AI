
/*
============================================
SkillSphere AI - Gesture Quiz Engine
============================================

Features:
- 2-second gesture hold
- 85% minimum confidence
- Auto answer submission
- Duplicate answer prevention
- No Hand gesture to move next
- Manual next question
- Score calculation

Gesture Mapping:
1 = Option 1
2 = Option 2
3 = Option 3
4 = Option 4
No Hand = Release gesture
*/

// ==========================================
// QUIZ CONFIGURATION

export const HOLD_MS = 2000;
export const CONFIDENCE_THRESHOLD = 0.85;
export const RELEASE_MS = 750;
export const JITTER_GRACE_MS = 250;


// ==========================================
// VALID ANSWER GESTURE

const isAnswer = (label) => {
  return ["1", "2", "3", "4"].includes(label);
};


// ==========================================
// CREATE INITIAL QUIZ STATE

export function newQuizState(
  waitForRelease = false
) {
  return {
    index: 0,

    answers: [],

    phase: waitForRelease
      ? "wait-release"
      : "ready",

    candidate: null,

    startedAt: null,

    lastStrongAt: null,

    holdProgress: 0,

    releaseSince: null,

    releaseProgress: 0,
  };
}


// ==========================================
// CLEAR CURRENT GESTURE HOLD

function clearHold(
  state,
  phase = "ready"
) {
  return {
    ...state,

    phase,

    candidate: null,

    startedAt: null,

    lastStrongAt: null,

    holdProgress: 0,
  };
}


// ==========================================
// ADVANCE TO NEXT QUESTION

function advance(
  state,
  waitForRelease = false
) {
  return {
    ...clearHold(
      state,
      waitForRelease
        ? "wait-release"
        : "ready"
    ),

    index: state.index + 1,

    releaseSince: null,

    releaseProgress: 0,
  };
}


// ==========================================
// TRACK NO HAND RELEASE

function trackRelease(
  state,
  confidentNoHand,
  now,
  onReleased
) {
  if (!confidentNoHand) {
    if (
      state.releaseSince === null &&
      state.releaseProgress === 0
    ) {
      return state;
    }

    return {
      ...state,

      releaseSince: null,

      releaseProgress: 0,
    };
  }

  const releaseSince =
    state.releaseSince ?? now;

  const elapsed = Math.max(
    0,
    now - releaseSince
  );

  if (elapsed >= RELEASE_MS) {
    return onReleased(state);
  }

  return {
    ...state,

    releaseSince,

    releaseProgress: Math.min(
      1,
      elapsed / RELEASE_MS
    ),
  };
}


// ==========================================
// PROCESS LIVE GESTURE PREDICTION

/*
Parameters:

state:
Current quiz state

top:
{
  label: "1",
  score: 0.95
}

now:
Current time in milliseconds.
Use performance.now().

questions:
Array of MCQ questions.

Returns:
Updated quiz state.
*/

export function processGesture(
  state,
  top,
  now,
  questions
) {
  // Quiz already finished
  // or no questions available.

  if (
    !questions.length ||
    state.phase === "finished"
  ) {
    return state;
  }

  const label = String(
    top?.label ?? ""
  );

  const score = Number(
    top?.score ?? 0
  );

  const confident =
    Number.isFinite(score) &&
    score >= CONFIDENCE_THRESHOLD;

  const confidentNoHand =
    label === "No Hand" &&
    confident;


  // ======================================
  // WAIT FOR HAND RELEASE

  if (state.phase === "wait-release") {
    return trackRelease(
      state,
      confidentNoHand,
      now,
      (current) => ({
        ...current,

        phase: "ready",

        releaseSince: null,

        releaseProgress: 0,
      })
    );
  }


  // ======================================
  // ANSWER ALREADY SUBMITTED

  if (state.phase === "submitted") {
    return trackRelease(
      state,
      confidentNoHand,
      now,
      (current) => advance(current)
    );
  }


  // ======================================
  // INVALID / LOW CONFIDENCE GESTURE

  if (
    !confident ||
    !isAnswer(label)
  ) {
    // Ignore very short prediction jitter.
    if (
      state.phase === "holding" &&
      state.lastStrongAt !== null &&
      now - state.lastStrongAt <=
        JITTER_GRACE_MS
    ) {
      return state;
    }

    return state.phase === "holding"
      ? clearHold(state)
      : state;
  }


  // ======================================
  // START A NEW GESTURE HOLD

  if (
    state.candidate !== label ||
    state.phase !== "holding"
  ) {
    return {
      ...state,

      phase: "holding",

      candidate: label,

      startedAt: now,

      lastStrongAt: now,

      holdProgress: 0,

      releaseSince: null,

      releaseProgress: 0,
    };
  }


  // ======================================
  // CALCULATE HOLD DURATION

  const elapsed = Math.max( 0, now - state.startedAt );
  const progress = Math.min( 1, elapsed / HOLD_MS );


  // ======================================
  // KEEP HOLDING UNTIL 2 SECONDS

  if (elapsed < HOLD_MS) {
    return {
      ...state,

      lastStrongAt: now,

      holdProgress: progress,
    };
  }


  // ======================================
  // AUTO SUBMIT ANSWER

  const selectedIndex = Number(label) - 1;

  const question = questions[state.index];

  if (!question) {
    return state;
  }

  const answer = {
    questionId: question.id,

    selectedIndex,

    correctIndex:
      question.correctIndex,

    correct:
      selectedIndex ===
      question.correctIndex,
  };

  // Save the answer in quiz state.
  const answers = [
    ...state.answers,
    answer,
  ];

  const lastQuestion =
    state.index ===
    questions.length - 1;

  // Submit once only.
  // Wait for No Hand before next question.
  return {
    ...clearHold(
      state,
      lastQuestion
        ? "finished"
        : "submitted"
    ),

    answers,

    releaseSince: null,

    releaseProgress: 0,
  };
}


// ==========================================
// MANUAL NEXT QUESTION

export function manualNext(
  state,
  questions
) {
  if (
    state.phase !== "submitted" ||
    state.index >=
      questions.length - 1
  ) {
    return state;
  }

  // Even after manual Next,
  // user must release the hand
  // before answering again.
  return advance(state, true);
}


// ==========================================
// INTERRUPT GESTURE HOLD

export function interruptHold(state) {
  if (state.phase !== "holding") {
    return state;
  }

  return clearHold(state);
}


// ==========================================
// CALCULATE QUIZ SCORE

export function scoreQuiz(state) {
  return state.answers.reduce(
    (score, answer) =>
      score + Number(answer.correct),
    0
  );
}
