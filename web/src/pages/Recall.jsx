import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { answerMatches, placementQueue, submitAttempt, todayQueue, unitQuestionIds, useStore } from "../lib/store.js";

export default function Recall() {
  const [params] = useSearchParams();
  const placement = params.get("mode") === "placement";
  const unitFocus = params.get("unit");
  const data = useStore();
  const [ids] = useState(() => {
    if (unitFocus) return unitQuestionIds(unitFocus);
    return (placement ? placementQueue() : todayQueue().items).map((item) => item.question.id);
  });
  const [cursor, setCursor] = useState(0);
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState("ask");
  const [last, setLast] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const question = data.questions.find((item) => item.id === ids[cursor]);
  const finished = phase === "ask" && (cursor >= ids.length || !question);

  if (!ids.length || finished) {
    return (
      <div className="page narrow">
        <header className="page-head">
          <p className="eyebrow">Recall</p>
          <h1>{placement && !data.attempts.length ? "Nothing to warm up with yet." : "Nothing is due."}</h1>
          <p className="lede">Missed work stays on the list until you answer it. It is never marked finished on its own.</p>
        </header>
        <Link className="btn btn-primary" to="/">
          Back to today
        </Link>
      </div>
    );
  }

  function rate(rating) {
    if (busy || !question) return;
    setBusy(true);
    const attempt = submitAttempt({
      questionId: question.id,
      response: draft,
      rating,
      placement,
    });
    if (!attempt) {
      setBusy(false);
      setError("That answer was already saved.");
      return;
    }
    setLast({
      rating,
      unitId: question.unitId,
      expected: question.expected,
      explanation: question.explanation,
      sourceRef: question.sourceRef,
      passage: question.passage,
    });
    setPhase("feedback");
    setError("");
  }

  function next() {
    setCursor((current) => current + 1);
    setDraft("");
    setRevealed(false);
    setPhase("ask");
    setLast(null);
    setBusy(false);
  }

  if (phase === "feedback" && last) {
    const tone = last.rating === "correct" ? "Great! You got it right." : last.rating === "partial" ? "Close. The source is a little more precise." : "Not yet. Here's the key idea.";
    return (
      <div className="page narrow">
        <article className={last.rating === "correct" ? "card feedback ok" : "card feedback"}>
          <p className="eyebrow">{last.rating === "correct" ? "Correct" : last.rating === "partial" ? "Partly" : "Not yet"}</p>
          <h1>{tone}</h1>
          <p>{last.expected}</p>
          <p className="muted">{last.explanation}</p>
          <p className="source">Your notes · {last.sourceRef}</p>
          <blockquote>{last.passage}</blockquote>
          <p className="muted">Saved to this browser.</p>
          <div className="row-actions">
            {last.rating !== "correct" && (
              <Link className="btn btn-secondary" to={`/teach/${last.unitId}`}>
                Teach me this
              </Link>
            )}
            <button className="btn btn-primary" type="button" onClick={next}>
              {cursor + 1 >= ids.length ? "Finish" : "Next question"}
            </button>
          </div>
        </article>
      </div>
    );
  }

  const match = draft.trim() ? answerMatches(draft, question.expected) : false;

  return (
    <div className="page narrow">
      <article className="recall">
        <p className="eyebrow">One question · {String(cursor + 1).padStart(2, "0")}</p>
        <h1>{question.prompt}</h1>
        <p className="hint">Try to recall the answer before revealing it.</p>
        {question.flagged && (
          <p className="flag-note">This draft needs a look. Treat it as unsupported until you check the passage.</p>
        )}
        <label className="field" htmlFor="recall-answer">
          Your answer
          <textarea
            id="recall-answer"
            className="textarea"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write what you remember"
          />
        </label>
        {!revealed ? (
          <button className="btn btn-lime" type="button" onClick={() => setRevealed(true)}>
            Reveal answer
          </button>
        ) : (
          <div className="answer-box">
            <p className="label">From your notes</p>
            <p>{question.expected}</p>
            <p className="muted">{question.explanation}</p>
            {draft.trim() && (
              <p className="muted">
                {match
                  ? "Your wording looks close. You still choose the rating."
                  : "Your wording doesn't overlap much with the source. Rate it honestly."}
              </p>
            )}
            <p className="source">Your notes · {question.sourceRef}</p>
            <details>
              <summary>Read the passage</summary>
              <p>{question.passage}</p>
            </details>
          </div>
        )}
        {revealed && (
          <div className="choice">
            <button className="btn btn-lime" type="button" onClick={() => rate("correct")} disabled={busy}>
              I recalled it
            </button>
            <button className="btn btn-ghost-light" type="button" onClick={() => rate("partial")} disabled={busy}>
              Partly
            </button>
            <button className="btn btn-ghost-light" type="button" onClick={() => rate("incorrect")} disabled={busy}>
              Not yet
            </button>
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </article>
    </div>
  );
}
