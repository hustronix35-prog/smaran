import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setGoal, useStore } from "../lib/store.js";

export default function Goal() {
  const data = useStore();
  const navigate = useNavigate();
  const today = localToday();
  const [deadline, setDeadline] = useState(data.goal?.deadline || plusDays(12));
  const [minutes, setMinutes] = useState(data.goal?.dailyMinutes || 20);
  const [error, setError] = useState("");

  function onSubmit(event) {
    event.preventDefault();
    const message = setGoal({ deadline, dailyMinutes: minutes });
    if (message) {
      setError(message);
      return;
    }
    navigate("/plan");
  }

  return (
    <div className="page narrow">
      <header className="page-head">
        <p className="eyebrow">Schedule</p>
        <h1>Set your deadline.</h1>
        <p className="lede">We'll check whether the material fits the time you actually have.</p>
      </header>
      <form className="card" onSubmit={onSubmit}>
        <label className="field" htmlFor="deadline">
          Target date
          <input
            id="deadline"
            className={error ? "input invalid" : "input"}
            type="date"
            min={today}
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            required
          />
        </label>
        <label className="field" htmlFor="minutes">
          Daily study limit
          <strong>
            {minutes} min · about {minutes} questions
          </strong>
          <input
            id="minutes"
            className="range"
            type="range"
            min="5"
            max="90"
            step="5"
            value={minutes}
            onChange={(event) => setMinutes(Number(event.target.value))}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit">
          Create plan
        </button>
      </form>
    </div>
  );
}

function localToday() {
  const date = new Date();
  return format(date);
}

function plusDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return format(date);
}

function format(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
