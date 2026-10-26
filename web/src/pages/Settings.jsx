import { useState } from "react";
import { resetWorkspace, setPreferences, setProfile, useStore } from "../lib/store.js";

export default function Settings() {
  const data = useStore();
  const [name, setName] = useState(data.profile.name);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="page narrow">
      <header className="page-head">
        <p className="eyebrow">Settings</p>
        <h1>Account</h1>
        <p className="lede">This prototype keeps a private workspace in this browser. It is not a shared login.</p>
      </header>

      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault();
          setProfile(name);
        }}
      >
        <label className="field" htmlFor="name">
          Your name
          <input id="name" className="input" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button className="btn btn-secondary" type="submit">
          Save name
        </button>
      </form>

      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setPreferences({
            reminders: form.get("reminders") === "on",
            quietStart: form.get("quietStart"),
            quietEnd: form.get("quietEnd"),
          });
        }}
      >
        <p className="label">In-app reminders</p>
        <p className="muted">Reminders stay inside smaran. Viewing one does not count as studying. There is no push or email.</p>
        <label className="check-row">
          <input type="checkbox" name="reminders" defaultChecked={data.preferences.reminders} />
          Show a recall card on Today
        </label>
        <div className="grid-2">
          <label className="field" htmlFor="quiet-start">
            Quiet from
            <input id="quiet-start" className="input" type="time" name="quietStart" defaultValue={data.preferences.quietStart} />
          </label>
          <label className="field" htmlFor="quiet-end">
            Until
            <input id="quiet-end" className="input" type="time" name="quietEnd" defaultValue={data.preferences.quietEnd} />
          </label>
        </div>
        <button className="btn btn-secondary" type="submit">
          Save reminders
        </button>
      </form>

      <article className="card danger-zone">
        <h2>Delete everything in this browser</h2>
        <p className="muted">Removes sources, questions, answers, and the plan. There is no backup in this prototype.</p>
        {confirm ? (
          <div className="row-actions">
            <button className="btn btn-destructive" type="button" onClick={resetWorkspace}>
              Yes, delete it
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-destructive" type="button" onClick={() => setConfirm(true)}>
            Delete workspace
          </button>
        )}
      </article>
    </div>
  );
}
