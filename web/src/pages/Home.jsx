import { useState } from "react";
import { Link } from "react-router-dom";
import {
  addSample,
  formatDay,
  missedCount,
  planStatus,
  progress,
  setProfile,
  showReminder,
  todayQueue,
  useStore,
} from "../lib/store.js";

export default function Home() {
  const data = useStore();
  const plan = planStatus();
  const stats = progress();
  const queue = todayQueue();
  const missed = missedCount();
  const [draft, setDraft] = useState("");
  const [later, setLater] = useState(false);
  const name = data.profile.name;
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Today</p>
        <h1>
          {hello}
          {name ? `, ${name}` : ""}.
        </h1>
        <p className="lede">Let's keep learning. A short recall is enough.</p>
      </header>

      {!name && (
        <form
          className="name-row"
          onSubmit={(event) => {
            event.preventDefault();
            if (draft.trim()) setProfile(draft);
          }}
        >
          <label className="field" htmlFor="learner-name">
            What should we call you?
            <input
              id="learner-name"
              className="input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Your name"
            />
          </label>
          <button className="btn btn-secondary" type="submit">
            Save
          </button>
        </form>
      )}

      {!data.materials.length && (
        <section className="card empty-hero">
          <h2>Give smaran what you need to remember.</h2>
          <p>Add the material and the date you need it by. You'll practise it in the small pockets of time you already have.</p>
          <div className="row-actions">
            <Link className="btn btn-primary" to="/upload">
              Add material
            </Link>
            <button className="btn btn-secondary" type="button" onClick={addSample}>
              Try sample notes
            </button>
          </div>
        </section>
      )}

      {!!data.materials.length && (
        <>
          {missed > 0 && (
            <p className="banner">A session slipped. Those questions are still due — nothing was marked finished.</p>
          )}
          <div className="home-grid">
            <article className="card mastered">
              <div className="split">
                <p className="label">Knowledge mastered</p>
                <strong>{stats.pct}%</strong>
              </div>
              <div className="bar" role="img" aria-label={`${stats.pct} percent mastered`}>
                <span style={{ width: `${stats.pct}%` }} />
              </div>
              <p className="muted">
                {stats.mastered} of {stats.total} units recalled more than once. One correct answer is not mastery.
              </p>
            </article>
            <article className="card exam">
              <p className="label">Your deadline</p>
              {plan.deadline ? (
                <>
                  <p className="display">{Math.max(plan.daysLeft, 0)}</p>
                  <p>{plan.daysLeft < 0 ? "Past due" : plan.daysLeft === 1 ? "day left" : "days left"}</p>
                  <p className="muted">{formatDay(plan.deadline)}</p>
                  <Link className="text-link" to="/goal">
                    Change
                  </Link>
                </>
              ) : (
                <>
                  <p className="display">—</p>
                  <Link className="text-link" to="/goal">
                    Set a date
                  </Link>
                </>
              )}
            </article>
            <article className="card next-card">
              <p className="label">Your next review</p>
              <h2>{queue.totalDue ? `${queue.items.length} quick questions` : "Nothing due"}</h2>
              <p className="muted">
                {queue.totalDue
                  ? `About ${queue.minutes} min${queue.totalDue > queue.items.length ? ` · ${queue.totalDue} still due` : ""}`
                  : "You're clear for now."}
              </p>
              {queue.totalDue ? (
                <Link className="btn btn-primary" to="/recall">
                  Learn
                </Link>
              ) : (
                <Link className="btn btn-secondary" to="/progress">
                  See progress
                </Link>
              )}
            </article>
          </div>

          {stats.weak.length > 0 && (
            <article className="card">
              <p className="label">Topics you missed</p>
              <h2>{stats.weak[0].title}</h2>
              <p className="muted">Smaran will teach the gap from your notes, then ask you to say it back.</p>
              <div className="list">
                {stats.weak.slice(0, 3).map((unit) => (
                  <Link key={unit.id} className="text-link" to={`/teach/${unit.id}`}>
                    {unit.title}
                  </Link>
                ))}
              </div>
              <Link className="btn btn-primary" to={`/teach/${stats.weak[0].id}`}>
                Teach me this
              </Link>
            </article>
          )}

          {plan.reason === "shortfall" && (
            <article className="card card-warn">
              <p className="label">This plan doesn't fit the deadline</p>
              <p>
                The material needs about {plan.minutesNeeded} min. You have {plan.minutesAvailable} min before the date.
              </p>
              <Link className="btn btn-secondary" to="/plan">
                Adjust the plan
              </Link>
            </article>
          )}

          {!data.attempts.length && (
            <article className="card">
              <p className="label">Optional warm-up</p>
              <p>Three questions to see what already feels familiar. You can skip this.</p>
              <Link className="btn btn-secondary" to="/recall?mode=placement">
                Check what I know
              </Link>
            </article>
          )}

          {showReminder() && queue.totalDue > 0 && !later && (
            <article className="card card-dark reminder">
              <p className="eyebrow">Smaran</p>
              <h2>Ready for a quick recall?</h2>
              <p>{queue.items[0].question.prompt}</p>
              <div className="row-actions">
                <Link className="btn btn-lime" to="/recall">
                  Answer
                </Link>
                <button className="btn btn-ghost-light" type="button" onClick={() => setLater(true)}>
                  I'll do it later
                </button>
              </div>
            </article>
          )}
        </>
      )}
    </div>
  );
}
