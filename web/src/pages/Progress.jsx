import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDay, progress, statusLabel, unitStatus, upcomingByDay, useStore } from "../lib/store.js";

export default function Progress() {
  const data = useStore();
  const stats = progress();
  const days = upcomingByDay();
  const [tab, setTab] = useState("overview");
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Progress</p>
        <h1>Your progress</h1>
        <p className="lede">Mastery means a unit was recalled correctly more than once. Activity alone does not count.</p>
      </header>

      <div className="tabs" role="tablist">
        {["overview", "topics", "calendar"].map((id) => (
          <button key={id} className="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)}>
            {id[0].toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>

      {!data.units.length && (
        <article className="card">
          <p>Nothing to measure yet.</p>
          <Link className="btn btn-primary" to="/upload">
            Add material
          </Link>
        </article>
      )}

      {!!data.units.length && tab === "overview" && (
        <>
          <article className="card ring-row">
            <div className="ring" style={{ "--p": stats.pct }} aria-label={`${stats.pct} percent estimated mastery`}>
              <strong>{stats.pct}%</strong>
            </div>
            <div>
              <p className="label">Estimated mastery</p>
              <h2>
                {stats.mastered} of {stats.total} units
              </h2>
              <p className="muted">{stats.due} due now · {stats.attempts} answers saved · {stats.delayed} recalled correctly again</p>
            </div>
          </article>
          <section className="list">
            <h2>Needs review</h2>
            {!stats.weak.length && <p className="muted">No weak units yet. A miss will show up here, without a streak penalty.</p>}
            {stats.weak.map((unit) => (
              <article key={unit.id} className="item">
                <div className="split">
                  <strong>{unit.title}</strong>
                  <span className="pill weak">Needs review</span>
                </div>
                <p className="muted">{unit.pageRef}</p>
                <Link className="text-link" to={`/teach/${unit.id}`}>
                  Teach me this
                </Link>
              </article>
            ))}
          </section>
        </>
      )}

      {tab === "topics" && (
        <section className="list">
          {data.units.map((unit) => {
            const status = unitStatus(unit.id);
            return (
              <article key={unit.id} className="item">
                <div className="split">
                  <strong>{unit.title}</strong>
                  <span className={`pill ${status}`}>{statusLabel(status)}</span>
                </div>
                <p className="muted">{unit.keyIdea}</p>
                {status === "weak" && (
                  <Link className="text-link" to={`/teach/${unit.id}`}>
                    Teach me this
                  </Link>
                )}
              </article>
            );
          })}
        </section>
      )}

      {tab === "calendar" && (
        <section className="list">
          {days.map((group) => (
            <article key={group.day} className="item">
              <p className="label">{group.day === todayKey ? "Today" : formatDay(group.day)}</p>
              {group.items.slice(0, 4).map((item) => (
                <p key={item.prompt}>{item.title}</p>
              ))}
              {group.items.length > 4 && <p className="muted">{group.items.length - 4} more</p>}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
