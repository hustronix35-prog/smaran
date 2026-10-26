import { Link } from "react-router-dom";
import { formatDay, planStatus, useStore } from "../lib/store.js";

export default function Plan() {
  const data = useStore();
  const plan = planStatus();

  return (
    <div className="page narrow">
      <header className="page-head">
        <p className="eyebrow">Plan</p>
        <h1>{plan.feasible ? "This fits your time." : "The plan needs a decision."}</h1>
        <p className="lede">Scheduling uses policy sm-v1. Changing the plan does not call an AI model.</p>
      </header>

      <article className="card">
        <p className="label">Workload</p>
        <h2>
          {plan.remaining} questions · about {plan.minutesNeeded} min
        </h2>
        {plan.deadline ? (
          <p className="muted">
            {formatDay(plan.deadline)} · {plan.dailyMinutes} min a day · {plan.minutesAvailable} min available
          </p>
        ) : (
          <p className="muted">No deadline yet.</p>
        )}
        {!data.materials.length && <p>Add material before a plan means anything.</p>}
      </article>

      {plan.reason === "no-goal" && (
        <Link className="btn btn-primary" to="/goal">
          Set a deadline
        </Link>
      )}
      {plan.reason === "no-material" && (
        <Link className="btn btn-primary" to="/upload">
          Add material
        </Link>
      )}
      {plan.reason === "shortfall" && (
        <div className="stack list">
          <p className="banner">
            You're short by about {plan.shortfall} min. Nothing was dropped. Pick one of these.
          </p>
          <article className="item">
            <h2>Give it more time each day</h2>
            <Link className="text-link" to="/goal">
              Raise the daily limit
            </Link>
          </article>
          <article className="item">
            <h2>Move the deadline</h2>
            <Link className="text-link" to="/goal">
              Choose a later date
            </Link>
          </article>
          <article className="item">
            <h2>Reduce the scope</h2>
            <Link className="text-link" to="/library">
              Remove a source you don't need yet
            </Link>
          </article>
        </div>
      )}
      {plan.reason === "deadline-passed" && (
        <article className="card card-warn">
          <p>That date has passed. The questions are still here.</p>
          <Link className="btn btn-secondary" to="/goal">
            Choose a new date
          </Link>
        </article>
      )}
      {plan.feasible && (
        <Link className="btn btn-primary" to="/recall">
          Start learning
        </Link>
      )}
    </div>
  );
}
