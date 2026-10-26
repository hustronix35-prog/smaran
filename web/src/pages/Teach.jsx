import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { askTutor } from "../lib/tutor.js";
import { unitLesson, useStore } from "../lib/store.js";

export default function Teach() {
  const { unitId } = useParams();
  useStore();
  const lesson = unitLesson(unitId);
  const [messages, setMessages] = useState([]);
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState("");
  const [check, setCheck] = useState("");
  const [grasped, setGrasped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lesson) return undefined;
    let cancel = false;
    setMessages([]);
    setTurns([]);
    setCheck("");
    setGrasped(false);
    setBusy(true);
    setError("");
    askTutor(lesson, [])
      .then((result) => {
        if (cancel) return;
        setMessages([{ role: "tutor", content: result.say }]);
        setTurns([{ role: "assistant", content: result.raw }]);
        setCheck(result.check || "");
        setGrasped(Boolean(result.grasped));
      })
      .catch((err) => {
        if (!cancel) setError(err.message);
      })
      .finally(() => {
        if (!cancel) setBusy(false);
      });
    return () => {
      cancel = true;
    };
  }, [unitId]);

  async function send(text) {
    const content = text.trim();
    if (!content || busy || !lesson || grasped) return;
    const nextTurns = [...turns, { role: "user", content }];
    setMessages((current) => [...current, { role: "learner", content }]);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const result = await askTutor(lesson, nextTurns);
      setTurns([...nextTurns, { role: "assistant", content: result.raw }]);
      setMessages((current) => [...current, { role: "tutor", content: result.say }]);
      setCheck(result.check || "");
      setGrasped(Boolean(result.grasped));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!lesson) {
    return (
      <div className="page narrow">
        <header className="page-head">
          <p className="eyebrow">Teach</p>
          <h1>That topic isn't in this browser.</h1>
        </header>
        <Link className="btn btn-primary" to="/progress">
          Back to progress
        </Link>
      </div>
    );
  }

  const missed = lesson.gaps.find((gap) => gap.rating === "incorrect" || gap.rating === "partial");

  return (
    <div className="page narrow">
      <header className="page-head">
        <p className="eyebrow">Teach · {lesson.sourceRef}</p>
        <h1>{lesson.title}</h1>
        <p className="lede">Sarvam teaches this from your notes, then checks that the idea stuck. A lesson is not mastery.</p>
      </header>

      {missed && (
        <article className="card">
          <p className="label">Where it slipped</p>
          <p>{missed.prompt}</p>
          <p className="muted">{missed.response ? `You wrote: ${missed.response}` : "You didn't write an answer."}</p>
        </article>
      )}

      <details className="card">
        <summary>Your notes · {lesson.sourceRef}</summary>
        <p>{lesson.passage}</p>
      </details>

      <div className="thread" aria-live="polite">
        {messages.map((message, index) => (
          <article key={`${message.role}-${index}`} className={message.role === "tutor" ? "bubble tutor" : "bubble learner"}>
            <p className="label">{message.role === "tutor" ? "Smaran" : "You"}</p>
            <p>{message.content}</p>
          </article>
        ))}
        {busy && (
          <article className="bubble tutor">
            <p className="label">Smaran</p>
            <p className="muted">Reading your notes…</p>
          </article>
        )}
      </div>

      {check && !grasped && (
        <article className="card check-card">
          <p className="label">Check</p>
          <h2>{check}</h2>
        </article>
      )}

      {grasped && (
        <article className="card feedback ok">
          <p className="eyebrow">Got it</p>
          <h2>Say it once more from memory.</h2>
          <p className="muted">This lesson does not mark the unit mastered. Recall does.</p>
          <Link className="btn btn-primary" to={`/recall?unit=${lesson.id}`}>
            Practise this topic
          </Link>
        </article>
      )}

      {error && <p className="error">{error}</p>}

      {!grasped && (
        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
        >
          <label className="field" htmlFor="lesson-reply">
            Your reply
            <textarea
              id="lesson-reply"
              className="textarea"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={check ? "Answer the check in your own words" : "Ask smaran to say it another way"}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(draft);
                }
              }}
            />
          </label>
          <div className="row-actions">
            <button className="btn btn-primary" type="submit" disabled={busy || !draft.trim()}>
              {busy ? "Teaching…" : "Send"}
            </button>
            <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => send("Give me a hint, but don't say the whole answer.")}>
              Hint
            </button>
            <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => send("Say that more simply, then ask me again.")}>
              Simpler
            </button>
          </div>
        </form>
      )}

      <p className="muted">This passage is sent to Sarvam so it can teach the gap. It is not used for the daily schedule.</p>
    </div>
  );
}
