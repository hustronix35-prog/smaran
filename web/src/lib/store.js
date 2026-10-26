import { useEffect, useState } from "react";
import { POLICY, answerMatches, scheduleNext } from "./scheduler.js";

const KEY = "smaran.v1";
const MIN_PER_QUESTION = 1;

const empty = () => ({
  profile: { name: "" },
  preferences: { reminders: true, quietStart: "23:00", quietEnd: "07:00" },
  materials: [],
  units: [],
  questions: [],
  goal: null,
  attempts: [],
  reviews: [],
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return {
      ...empty(),
      ...parsed,
      profile: { ...empty().profile, ...parsed.profile },
      preferences: { ...empty().preferences, ...parsed.preferences },
    };
  } catch {
    return empty();
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Keep the session usable if storage is full. */
  }
  listeners.forEach((fn) => fn(state));
}

function uid() {
  return crypto.randomUUID();
}

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useStore() {
  const [snap, setSnap] = useState(state);
  useEffect(() => subscribe(setSnap), []);
  return snap;
}

export function setProfile(name) {
  state = { ...state, profile: { name: name.trim().slice(0, 40) } };
  persist();
}

export function setPreferences(patch) {
  state = { ...state, preferences: { ...state.preferences, ...patch } };
  persist();
}

export function addMaterial({ title, text, note = "" }) {
  const blocks = chunkText(text);
  if (!blocks.length) return null;
  const materialId = uid();
  const now = new Date().toISOString();
  const units = [];
  const questions = [];
  const reviews = [];

  blocks.forEach((block) => {
    const unitId = uid();
    const drafted = makeQuestion(block.sentence);
    const questionId = uid();
    units.push({
      id: unitId,
      materialId,
      title: block.title,
      keyIdea: block.sentence,
      passage: block.text,
      pageRef: block.pageRef,
      importance: block.importance,
      effortMin: MIN_PER_QUESTION,
      state: drafted.flagged ? "needs_review" : "ready",
    });
    questions.push({
      id: questionId,
      unitId,
      materialId,
      prompt: drafted.prompt,
      expected: drafted.expected,
      explanation: block.sentence,
      sourceRef: block.pageRef,
      passage: block.text,
      flagged: drafted.flagged,
    });
    reviews.push(newReview(questionId, now));
  });

  const truncated = countBlocks(text) > 24;
  state = {
    ...state,
    materials: [
      {
        id: materialId,
        title: (title || "").trim() || "Untitled notes",
        text,
        createdAt: now,
        status: questions.some((q) => !q.flagged) ? "ready" : "needs_review",
        note: [note, truncated ? "Only the first 24 sections were turned into questions." : ""]
          .filter(Boolean)
          .join(" "),
      },
      ...state.materials,
    ],
    units: [...units, ...state.units],
    questions: [...questions, ...state.questions],
    reviews: [...reviews, ...state.reviews],
  };
  persist();
  return materialId;
}

export function addSample() {
  if (state.materials.some((m) => m.id === "sample")) return "sample";
  const now = new Date().toISOString();
  const units = [];
  const questions = [];
  const reviews = [];
  SAMPLE.forEach((unit) => {
    units.push({
      id: unit.id,
      materialId: "sample",
      title: unit.title,
      keyIdea: unit.keyIdea,
      passage: unit.passage,
      pageRef: unit.pageRef,
      importance: unit.importance,
      effortMin: MIN_PER_QUESTION,
      state: "ready",
    });
    unit.questions.forEach((q) => {
      questions.push({
        id: q.id,
        unitId: unit.id,
        materialId: "sample",
        prompt: q.prompt,
        expected: q.expected,
        explanation: q.explanation,
        sourceRef: unit.pageRef,
        passage: unit.passage,
        flagged: false,
      });
      reviews.push(newReview(q.id, now));
    });
  });
  const goal =
    state.goal ||
    {
      deadline: plusDays(12),
      dailyMinutes: 20,
      updatedAt: now,
    };
  state = {
    ...state,
    goal,
    materials: [
      {
        id: "sample",
        title: "Cell membranes and photosynthesis",
        text: SAMPLE.map((u) => u.passage).join("\n\n"),
        createdAt: now,
        status: "ready",
        note: "",
      },
      ...state.materials,
    ],
    units: [...units, ...state.units],
    questions: [...questions, ...state.questions],
    reviews: [...reviews, ...state.reviews],
  };
  persist();
  return "sample";
}

export function deleteMaterial(id) {
  const questionIds = new Set(state.questions.filter((q) => q.materialId === id).map((q) => q.id));
  state = {
    ...state,
    materials: state.materials.filter((m) => m.id !== id),
    units: state.units.filter((u) => u.materialId !== id),
    questions: state.questions.filter((q) => q.materialId !== id),
    reviews: state.reviews.filter((r) => !questionIds.has(r.questionId)),
    attempts: state.attempts.filter((a) => !questionIds.has(a.questionId)),
  };
  persist();
}

export function resetWorkspace() {
  state = empty();
  persist();
}

export function setGoal({ deadline, dailyMinutes }) {
  if (!deadline) return "Choose a date.";
  const minutes = Math.min(120, Math.max(5, Number(dailyMinutes) || 15));
  state = {
    ...state,
    goal: { deadline, dailyMinutes: minutes, updatedAt: new Date().toISOString() },
  };
  persist();
  return "";
}

export function planStatus(now = new Date()) {
  const remaining = state.questions.length;
  const minutesNeeded = remaining * MIN_PER_QUESTION;
  const goal = state.goal;
  const base = {
    minutesNeeded,
    remaining,
    daysLeft: null,
    studyDays: 0,
    minutesAvailable: 0,
    shortfall: minutesNeeded,
    dailyMinutes: goal?.dailyMinutes ?? null,
    deadline: goal?.deadline ?? null,
    feasible: false,
    reason: remaining ? "no-goal" : "no-material",
    policy: POLICY,
  };
  if (!remaining) return { ...base, shortfall: 0, minutesNeeded: 0, reason: "no-material" };
  if (!goal?.deadline) return base;

  const daysLeft = dayDiff(parseDay(goal.deadline), startOfDay(now));
  const studyDays = daysLeft < 0 ? 0 : daysLeft + 1;
  const minutesAvailable = studyDays * goal.dailyMinutes;
  const shortfall = Math.max(0, minutesNeeded - minutesAvailable);
  let reason = "ok";
  if (daysLeft < 0) reason = "deadline-passed";
  else if (shortfall > 0) reason = "shortfall";
  return {
    ...base,
    daysLeft,
    studyDays,
    minutesAvailable,
    shortfall,
    feasible: reason === "ok",
    reason,
  };
}

export function todayQueue(now = new Date()) {
  const budget = state.goal?.dailyMinutes ?? 15;
  const all = dueItems(now);
  const cap = Math.max(1, budget);
  const upcoming = state.reviews
    .map((r) => new Date(r.dueAt).getTime())
    .filter((t) => t > now.getTime())
    .sort((a, b) => a - b)[0];
  const items = all.slice(0, cap);
  return {
    items,
    totalDue: all.length,
    minutes: items.length * MIN_PER_QUESTION,
    nextDueAt: upcoming ? new Date(upcoming).toISOString() : null,
  };
}

export function placementQueue() {
  const unseen = state.questions
    .filter((q) => !state.attempts.some((a) => a.questionId === q.id))
    .slice(0, 3);
  return unseen.map(toItem).filter(Boolean);
}

export function submitAttempt({ questionId, response, rating, placement = false }) {
  const allowed = ["correct", "partial", "incorrect", "skipped"];
  if (!allowed.includes(rating)) return null;
  const review = state.reviews.find((r) => r.questionId === questionId);
  const question = state.questions.find((q) => q.id === questionId);
  if (!review || !question) return null;
  const now = Date.now();
  const recent = state.attempts.some(
    (a) => a.questionId === questionId && now - new Date(a.createdAt).getTime() < 4000
  );
  if (recent) return null;
  const attempt = {
    id: uid(),
    questionId,
    response: (response || "").slice(0, 2000),
    rating,
    objectiveMatch: answerMatches(response || "", question.expected),
    placement: Boolean(placement),
    createdAt: new Date(now).toISOString(),
  };
  const next = placement
    ? { dueAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(), lastRating: rating, policy: POLICY }
    : scheduleNext(review, rating, now);
  state = {
    ...state,
    attempts: [...state.attempts, attempt],
    reviews: state.reviews.map((r) => (r.questionId === questionId ? { ...r, ...next } : r)),
  };
  persist();
  return attempt;
}

export function progress() {
  const units = state.units;
  const mastered = units.filter((u) => statusForUnit(u) === "mastered").length;
  const weak = units.filter((u) => statusForUnit(u) === "weak");
  let delayed = 0;
  const correctCount = {};
  state.attempts.forEach((a) => {
    if (a.placement || a.rating !== "correct") return;
    correctCount[a.questionId] = (correctCount[a.questionId] || 0) + 1;
    if (correctCount[a.questionId] >= 2) delayed += 1;
  });
  return {
    total: units.length,
    mastered,
    pct: units.length ? Math.round((mastered / units.length) * 100) : 0,
    weak,
    due: dueItems().length,
    attempts: state.attempts.length,
    delayed,
  };
}

export function missedCount(now = new Date()) {
  const start = startOfDay(now).getTime();
  return state.reviews.filter((r) => r.lastRating && new Date(r.dueAt).getTime() < start).length;
}

export function showReminder(now = new Date()) {
  if (!state.preferences.reminders) return false;
  return !isQuiet(now);
}

export function unitLesson(unitId) {
  const unit = state.units.find((item) => item.id === unitId);
  if (!unit) return null;
  const questions = state.questions.filter((question) => question.unitId === unitId);
  return {
    id: unit.id,
    title: unit.title,
    keyIdea: unit.keyIdea,
    passage: unit.passage,
    sourceRef: unit.pageRef,
    gaps: questions.map((question) => {
      const attempts = state.attempts.filter((attempt) => attempt.questionId === question.id);
      const latest = attempts[attempts.length - 1];
      return {
        prompt: question.prompt,
        expected: question.expected,
        response: latest?.response || "",
        rating: latest?.rating || "unseen",
      };
    }),
  };
}

export function unitQuestionIds(unitId) {
  return state.questions.filter((question) => question.unitId === unitId).map((question) => question.id);
}

export function unitStatus(unitId) {
  const unit = state.units.find((u) => u.id === unitId);
  return unit ? statusForUnit(unit) : "ready";
}

export function statusLabel(status) {
  if (status === "weak") return "Needs review";
  if (status === "mastered") return "Mastered";
  if (status === "due") return "Due";
  if (status === "scheduled") return "Scheduled";
  return "Ready";
}

export function upcomingByDay() {
  const groups = new Map();
  state.reviews.forEach((review) => {
    const question = state.questions.find((q) => q.id === review.questionId);
    const unit = state.units.find((u) => u.id === question?.unitId);
    if (!question) return;
    const day = new Date(review.dueAt);
    const key = localDayKey(day);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ title: unit?.title || "Question", prompt: question.prompt });
  });
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, items]) => ({ day, items }));
}

export function formatDay(iso) {
  if (!iso) return "";
  return parseDay(iso.slice(0, 10)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export { answerMatches, POLICY };

function newReview(questionId, dueAt) {
  return {
    id: uid(),
    questionId,
    dueAt,
    intervalDays: 0,
    ease: 2.3,
    reps: 0,
    lapses: 0,
    lastRating: null,
    policy: POLICY,
  };
}

function dueItems(now = new Date()) {
  return state.reviews
    .filter((r) => new Date(r.dueAt).getTime() <= now.getTime())
    .map((r) => toItem(state.questions.find((q) => q.id === r.questionId)))
    .filter(Boolean);
}

function toItem(question) {
  if (!question) return null;
  const unit = state.units.find((u) => u.id === question.unitId);
  const review = state.reviews.find((r) => r.questionId === question.id);
  return { question, unit, review };
}

function statusForUnit(unit) {
  const reviews = state.questions
    .filter((q) => q.unitId === unit.id)
    .map((q) => state.reviews.find((r) => r.questionId === q.id))
    .filter(Boolean);
  if (!reviews.length) return "ready";
  if (reviews.some((r) => r.lastRating === "incorrect" || r.lastRating === "partial")) return "weak";
  if (reviews.every((r) => r.reps >= 2 && r.lastRating === "correct")) return "mastered";
  if (reviews.some((r) => new Date(r.dueAt).getTime() <= Date.now())) return "due";
  return "scheduled";
}

function countBlocks(text) {
  let count = 0;
  text.split(/\n(?=\[Page \d+\])/).forEach((page) => {
    const body = page.replace(/\[Page \d+\]/g, "").trim();
    const paras = body.split(/\n\s*\n/).map((part) => part.trim()).filter((part) => part.length > 40);
    count += paras.length || (body.length > 40 ? 1 : 0);
  });
  return count || (text.trim().length > 40 ? 1 : 0);
}

function chunkText(text) {
  const blocks = [];
  const pages = text.split(/\n(?=\[Page \d+\])/);
  pages.forEach((page) => {
    const pageMatch = page.match(/\[Page (\d+)\]/);
    const body = page.replace(/\[Page \d+\]/g, "").trim();
    const paras = body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 40);
    const pieces = paras.length ? paras : body.length > 40 ? [body] : [];
    pieces.forEach((para) => {
      blocks.push({ text: para, pageRef: pageMatch ? `Page ${pageMatch[1]}` : null });
    });
  });
  if (!blocks.length && text.trim().length > 40) blocks.push({ text: text.trim(), pageRef: null });
  return blocks.slice(0, 24).map((block, index) => {
    const sentence = (block.text.replace(/\s+/g, " ").match(/[^.!?]{40,}[.!?]?/) || [block.text])[0].trim();
    return {
      text: block.text,
      sentence,
      title: sentence.split(/\s+/).slice(0, 7).join(" "),
      pageRef: block.pageRef || `Section ${index + 1}`,
      importance: block.text.length > 400 ? "high" : "normal",
    };
  });
}

const STOP = new Set("the a an of to and in on for with from by as is are was were be this that it its at or if into across your you we their his her they them than then not".split(" "));

function makeQuestion(sentence) {
  const words = sentence.replace(/[^\w\s'-]/g, "").split(/\s+/);
  const candidates = words.filter((word) => word.length > 5 && !STOP.has(word.toLowerCase()));
  if (!candidates.length) {
    return {
      prompt: "What is the key idea in this passage?",
      expected: sentence,
      flagged: true,
    };
  }
  const target = [...candidates].sort((a, b) => b.length - a.length)[0];
  return {
    prompt: `Fill the gap from memory: ${sentence.replace(target, "______")}`,
    expected: target,
    flagged: false,
  };
}

function isQuiet(now) {
  const { quietStart, quietEnd } = state.preferences;
  const mins = now.getHours() * 60 + now.getMinutes();
  const start = toMinutes(quietStart);
  const end = toMinutes(quietEnd);
  if (Number.isNaN(start) || Number.isNaN(end) || start === end) return false;
  if (start < end) return mins >= start && mins < end;
  return mins >= start || mins < end;
}

function toMinutes(value) {
  const [h, m] = String(value || "").split(":").map(Number);
  return h * 60 + m;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDay(iso) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dayDiff(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

function plusDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function localDayKey(date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${day}`;
}

const SAMPLE = [
  {
    id: "sample-u1",
    title: "Diffusion across a membrane",
    pageRef: "Page 12",
    importance: "high",
    keyIdea: "Diffusion is driven by a concentration gradient, from higher concentration toward lower concentration.",
    passage:
      "Diffusion is the net movement of particles from a region of higher concentration to a region of lower concentration. A steeper concentration gradient makes the movement faster until the two sides even out. The cell does not spend energy on it.",
    questions: [
      {
        id: "sample-q1",
        prompt: "What drives diffusion across a membrane?",
        expected: "A concentration gradient. Particles move from higher concentration to lower concentration.",
        explanation: "Diffusion is passive movement down a concentration gradient. The cell does not spend energy on it.",
      },
      {
        id: "sample-q2",
        prompt: "Why is diffusion described as a passive process?",
        expected: "The cell does not spend energy. Particles move on their own down the gradient.",
        explanation: "Passive means the membrane does not use cellular energy for that movement.",
      },
    ],
  },
  {
    id: "sample-u2",
    title: "A selective membrane",
    pageRef: "Page 13",
    importance: "normal",
    keyIdea: "Small nonpolar molecules cross the lipid bilayer freely. Ions need a protein channel.",
    passage:
      "A membrane is selectively permeable. Small nonpolar molecules such as oxygen and carbon dioxide cross the lipid bilayer freely. Charged ions and large polar molecules need a protein channel or carrier.",
    questions: [
      {
        id: "sample-q3",
        prompt: "Which small molecules cross the lipid bilayer freely?",
        expected: "Oxygen and carbon dioxide. They are small and nonpolar.",
        explanation: "The bilayer lets small nonpolar molecules through without a transport protein.",
      },
      {
        id: "sample-q4",
        prompt: "What do charged ions need in order to cross the membrane?",
        expected: "A protein channel or carrier.",
        explanation: "Ions cannot slip through the lipid bilayer on their own.",
      },
    ],
  },
  {
    id: "sample-u3",
    title: "Photosynthesis stores light",
    pageRef: "Page 20",
    importance: "high",
    keyIdea: "Photosynthesis converts light energy into chemical energy stored in glucose, inside the chloroplast.",
    passage:
      "Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. It takes place in the chloroplast. The light reactions capture photons and split water.",
    questions: [
      {
        id: "sample-q5",
        prompt: "What does photosynthesis store light energy as?",
        expected: "Chemical energy stored in glucose.",
        explanation: "Light energy is captured and stored in sugar, not left as light.",
      },
      {
        id: "sample-q6",
        prompt: "Where in the cell does photosynthesis take place?",
        expected: "In the chloroplast.",
        explanation: "The chloroplast is the organelle that houses the light reactions and the Calvin cycle.",
      },
    ],
  },
  {
    id: "sample-u4",
    title: "Chlorophyll and oxygen",
    pageRef: "Page 21",
    importance: "normal",
    keyIdea: "Splitting water in the light reactions releases oxygen. Chlorophyll looks green because it reflects green light.",
    passage:
      "The light reactions split water and release oxygen. Chlorophyll looks green because it reflects green light and absorbs red and blue wavelengths.",
    questions: [
      {
        id: "sample-q7",
        prompt: "What gas is released when the light reactions split water?",
        expected: "Oxygen.",
        explanation: "Splitting water in the light reactions releases oxygen.",
      },
      {
        id: "sample-q8",
        prompt: "Why does chlorophyll look green?",
        expected: "It reflects green light and absorbs red and blue wavelengths.",
        explanation: "The colour you see is the light chlorophyll does not absorb.",
      },
    ],
  },
];
