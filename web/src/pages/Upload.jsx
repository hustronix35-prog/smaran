import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addMaterial } from "../lib/store.js";
import { readLearningFile } from "../lib/extract.js";

export default function Upload() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pdf");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [drag, setDrag] = useState(false);

  async function ingest(file) {
    setError("");
    setNote("");
    setStatus("reading");
    try {
      const result = await readLearningFile(file);
      setTitle((current) => current || file.name.replace(/\.[^.]+$/, ""));
      setText(result.text);
      setNote(result.note || "");
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setText("");
      setError(err.message || "Could not read that file.");
    }
  }

  function onSubmit(event) {
    event.preventDefault();
    if (text.trim().length < 40) {
      setError("Add a bit more text. A heading alone is not enough to learn from.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    const id = addMaterial({ title, text, note });
    if (!id) {
      setError("Could not find a passage long enough to turn into a question.");
      setStatus("error");
      return;
    }
    navigate("/goal");
  }

  return (
    <div className="page narrow">
      <header className="page-head">
        <p className="eyebrow">Add material</p>
        <h1>Turn your notes into recall.</h1>
        <p className="lede">Text-based PDF, TXT, or MD. Up to 2 MB. Scanned pages are not supported yet.</p>
      </header>

      <div className="tabs" role="tablist" aria-label="Material type">
        {[
          ["pdf", "PDF"],
          ["text", "Text"],
          ["image", "Image"],
        ].map(([id, label]) => (
          <button
            key={id}
            className="tab"
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              setError("");
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <form className="card" onSubmit={onSubmit}>
        <label className="field" htmlFor="title">
          Title
          <input
            id="title"
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Organic chemistry, week 3"
          />
        </label>

        {tab === "image" && (
          <p className="banner">Images and handwriting need OCR, which isn't in this version. Paste the text instead.</p>
        )}

        {tab !== "text" && tab !== "image" && (
          <label
            className={drag ? "dropzone drag" : "dropzone"}
            onDragOver={(event) => {
              event.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDrag(false);
              const file = event.dataTransfer.files?.[0];
              if (file) ingest(file);
            }}
          >
            <input
              type="file"
              accept=".pdf,.txt,.md,application/pdf,text/plain"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) ingest(file);
              }}
            />
            <strong>{status === "reading" ? "Reading your file…" : "Drop a file here"}</strong>
            <span className="muted">or choose a file · PDF, TXT, MD · 2 MB max</span>
          </label>
        )}

        {(tab === "text" || text) && tab !== "image" && (
          <label className="field" htmlFor="notes">
            Notes
            <textarea
              id="notes"
              className={error ? "textarea invalid" : "textarea"}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste the section you need to remember."
            />
          </label>
        )}

        {text && tab !== "image" && <p className="preview">{text.slice(0, 280)}</p>}
        {note && <p className="muted">{note}</p>}
        {error && <p className="error">{error}</p>}
        <p className="muted">
          This prototype keeps notes in this browser and drafts questions on your device. They are not sent to Sarvam.
        </p>
        <button className="btn btn-primary" type="submit" disabled={status === "reading" || status === "saving" || tab === "image"}>
          {status === "saving" ? "Structuring notes…" : status === "reading" ? "Reading…" : "Structure into questions"}
        </button>
      </form>
    </div>
  );
}
