import { useState } from "react";
import { Link } from "react-router-dom";
import { deleteMaterial, statusLabel, unitStatus, useStore } from "../lib/store.js";

export default function Library() {
  const data = useStore();
  const [pending, setPending] = useState(null);

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Library</p>
        <h1>Your material</h1>
        <p className="lede">Deleting a source removes its text, units, questions, and saved answers from this browser.</p>
      </header>

      {!data.materials.length && (
        <article className="card">
          <p>No uploads yet.</p>
          <Link className="btn btn-primary" to="/upload">
            Add material
          </Link>
        </article>
      )}

      <div className="list">
        {data.materials.map((material) => {
          const units = data.units.filter((unit) => unit.materialId === material.id);
          return (
            <article key={material.id} className="item">
              <div className="split">
                <div>
                  <h2>{material.title}</h2>
                  <p className="muted">
                    {units.length} {units.length === 1 ? "unit" : "units"} · {material.status === "needs_review" ? "Needs a look" : "Ready"}
                  </p>
                </div>
                {pending === material.id ? (
                  <div className="row-actions">
                    <button className="btn btn-destructive" type="button" onClick={() => deleteMaterial(material.id)}>
                      Delete
                    </button>
                    <button className="btn btn-ghost" type="button" onClick={() => setPending(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-ghost" type="button" onClick={() => setPending(material.id)}>
                    Delete
                  </button>
                )}
              </div>
              {material.note && <p className="muted">{material.note}</p>}
              {units.map((unit) => {
                const questions = data.questions.filter((question) => question.unitId === unit.id);
                const status = unitStatus(unit.id);
                return (
                  <details key={unit.id}>
                    <summary>
                      {unit.title} · {unit.pageRef} · {statusLabel(status)}
                    </summary>
                    <p>{unit.passage}</p>
                    <p className="muted">Key idea: {unit.keyIdea}</p>
                    {questions.map((question) => (
                      <p key={question.id} className="muted">
                        {question.flagged ? "Flagged draft: " : "Question: "}
                        {question.prompt}
                      </p>
                    ))}
                  </details>
                );
              })}
            </article>
          );
        })}
      </div>
    </div>
  );
}
