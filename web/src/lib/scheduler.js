export const POLICY = "sm-v1";

const STOP = new Set(
  "with from that this your have does into across about there their which where when what than then through because will just been were they them your".split(
    " "
  )
);

export function answerMatches(response, expected) {
  const norm = (value) => value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = norm(expected)
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP.has(word));
  const answer = norm(response || "");
  if (!answer.trim() || words.length === 0) return false;
  const hits = words.filter((word) => answer.includes(word)).length;
  return hits / words.length >= 0.45;
}

export function scheduleNext(review, rating, nowMs) {
  let intervalDays = review.intervalDays || 0;
  let ease = review.ease || 2.3;
  let reps = review.reps || 0;
  let lapses = review.lapses || 0;

  if (rating === "correct") {
    reps += 1;
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = 3;
    else intervalDays = Math.max(1, Math.round(intervalDays * ease));
    ease = Math.min(2.8, round(ease + 0.1));
  } else if (rating === "partial") {
    intervalDays = 1;
  } else if (rating === "incorrect") {
    lapses += 1;
    reps = 0;
    intervalDays = 0;
    ease = Math.max(1.3, round(ease - 0.2));
  } else {
    intervalDays = 1;
  }

  const delay = rating === "incorrect" ? 4 * 60 * 60 * 1000 : intervalDays * 24 * 60 * 60 * 1000;
  return {
    intervalDays,
    ease,
    reps,
    lapses,
    dueAt: new Date(nowMs + delay).toISOString(),
    lastRating: rating,
    policy: POLICY,
  };
}

function round(value) {
  return Math.round(value * 100) / 100;
}
