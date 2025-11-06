import React, { useMemo, useState } from "react";
import "./SurveyFormEditor.css";

/** Replace these with API calls later */
const START_SURVEYS = [
  { id: 101, title: "Cyber Hygiene v1.2", version: "1.2" },
  { id: 102, title: "Cyber Hygiene v1.3 (Pilot)", version: "1.3" },
];

const START_QUESTIONS = {
  101: [
    { id: "q1", type: "yesno",  label: "Inventory and Control of Hardware Assets", required: true },
    { id: "q2", type: "text",   label: "Inventory and Control of Software Assets (notes)", required: false },
    { id: "q3", type: "rating", label: "Continuous Vulnerability Management (1–5)", required: true },
    { id: "q4", type: "select", label: "Secure Configurations baseline", options: ["CIS L1","CIS L2","Other"], required: true },
  ],
  102: [
    { id: "s1", type: "yesno",  label: "Hardware asset inventory complete?", required: true },
    { id: "s2", type: "rating", label: "Software inventory coverage (1–5)", required: false },
  ],
};

export default function SurveyFormEditor() {
  const [surveys, setSurveys] = useState(START_SURVEYS);
  const [questionsBySurvey, setQuestionsBySurvey] = useState(START_QUESTIONS);
  const [selectedId, setSelectedId] = useState(START_SURVEYS[0]?.id ?? null);

  const selSurvey = useMemo(
    () => surveys.find(s => s.id === selectedId) || null,
    [surveys, selectedId]
  );
  const selQs = useMemo(
    () => (selectedId ? (questionsBySurvey[selectedId] || []) : []),
    [questionsBySurvey, selectedId]
  );

  function updateSurveyMeta(patch) {
    if (!selSurvey) return;
    setSurveys(surveys.map(s => (s.id === selSurvey.id ? { ...s, ...patch } : s)));
  }

  function updateQuestion(qid, patch) {
    if (!selSurvey) return;
    setQuestionsBySurvey({
      ...questionsBySurvey,
      [selSurvey.id]: selQs.map(q => (q.id === qid ? { ...q, ...patch } : q)),
    });
  }
  function removeQuestion(qid) {
    if (!selSurvey) return;
    setQuestionsBySurvey({
      ...questionsBySurvey,
      [selSurvey.id]: selQs.filter(q => q.id !== qid),
    });
  }
  function moveQuestion(qid, dir) {
    if (!selSurvey) return;
    const idx = selQs.findIndex(q => q.id === qid);
    if (idx < 0) return;
    const swap = dir === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= selQs.length) return;
    const next = [...selQs];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setQuestionsBySurvey({ ...questionsBySurvey, [selSurvey.id]: next });
  }

  // NEW: Create brand-new survey (blank)
  function createNewSurvey() {
    const nextId = Math.max(0, ...surveys.map(s => s.id)) + 1;
    const newSurvey = { id: nextId, title: "Untitled Survey", version: "1.0" };
    setSurveys(prev => [...prev, newSurvey]);
    setQuestionsBySurvey(prev => ({ ...prev, [nextId]: [] }));
    setSelectedId(nextId);
  }

  function save() {
    // Wire to your API later
    console.log("SAVE survey meta", selSurvey);
    console.log("SAVE questions", selQs);
    alert("Saved (stub). Check console for payload.");
  }

  function duplicate() {
    if (!selSurvey) return;
    const nextId = Math.max(0, ...surveys.map(s => s.id)) + 1;
    const copy = { id: nextId, title: `${selSurvey.title} (Copy)`, version: selSurvey.version };
    setSurveys([...surveys, copy]);
    setQuestionsBySurvey({
      ...questionsBySurvey,
      [nextId]: selQs.map(q => ({ ...q, id: genId() })),
    });
    setSelectedId(nextId);
  }

  return (
    <div className="sfe-wrap">
      <header className="sfe-top">
        <div>
          <h1>Edit Survey</h1>
          <p className="muted">Select an existing survey or create a new one, then edit its meta and questions.</p>
        </div>
        <div className="row gap">
          <button className="btn" onClick={duplicate}>Duplicate</button>
          <button className="btn primary" onClick={save}>Save</button>
        </div>
      </header>

      <div className="sfe-shell">
        {/* LEFT: surveys list */}
        <aside className="sfe-left">
          <div className="left-head">
            <h3>Surveys</h3>
            {/* NEW: Create button */}
            <button className="btn small" onClick={createNewSurvey}>+ New</button>
          </div>
          <ul className="sfe-list">
            {surveys.map(s => (
              <li
                key={s.id}
                className={`sfe-item ${s.id === selectedId ? "active" : ""}`}
                onClick={() => setSelectedId(s.id)}
              >
                <div className="s-title">{s.title}</div>
                <div className="s-sub">v{s.version}</div>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN: editor */}
        <section className="sfe-main">
          {!selSurvey ? (
            <div className="sfe-empty">Choose a survey to edit.</div>
          ) : (
            <>
              <div className="meta-row">
                <div className="meta-field">
                  <label>Title</label>
                  <input
                    value={selSurvey.title}
                    onChange={e => updateSurveyMeta({ title: e.target.value })}
                  />
                </div>
                <div className="meta-field w-200">
                  <label>Version</label>
                  <input
                    value={selSurvey.version}
                    onChange={e => updateSurveyMeta({ version: e.target.value })}
                  />
                </div>
              </div>

              <ul className="q-list edit">
                {selQs.map((q, i) => (
                  <li key={q.id} className="q-item">
                    <div className="q-order">
                      <button className="icon-btn" onClick={() => moveQuestion(q.id, "up")} title="Move up">↑</button>
                      <span className="muted">{i + 1}</span>
                      <button className="icon-btn" onClick={() => moveQuestion(q.id, "down")} title="Move down">↓</button>
                    </div>

                    <div className="q-core">
                      <div className="q-line">
                        <label>Label</label>
                        <input
                          value={q.label}
                          onChange={e => updateQuestion(q.id, { label: e.target.value })}
                        />
                      </div>

                      <div className="q-line three">
                        <div>
                          <label>Type</label>
                          <select
                            value={q.type}
                            onChange={e => updateQuestion(q.id, normalizeTypeChange(q, e.target.value))}
                          >
                            <option value="yesno">Yes/No</option>
                            <option value="text">Short Answer</option>
                            <option value="rating">Rating (1–5)</option>
                            <option value="select">Select</option>
                          </select>
                        </div>
                        <div className="q-inline">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={!!q.required}
                              onChange={e => updateQuestion(q.id, { required: e.target.checked })}
                            />
                            <span>Required</span>
                          </label>
                        </div>
                        <div />
                      </div>

                      {q.type === "select" && (
                        <div className="q-line">
                          <label>Options (comma separated)</label>
                          <input
                            value={(q.options || []).join(", ")}
                            onChange={e =>
                              updateQuestion(q.id, {
                                options: e.target.value
                                  .split(",")
                                  .map(s => s.trim())
                                  .filter(Boolean),
                              })
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="q-actions">
                      <button className="btn danger" onClick={() => removeQuestion(q.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>

              {!selQs.length && (
                <div className="sfe-empty muted">This survey has no questions.</div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}
function normalizeTypeChange(q, newType) {
  if (newType === "select" && !q.options) return { type: newType, options: ["Option A", "Option B"] };
  if (q.type === "select" && newType !== "select") return { type: newType, options: undefined };
  return { type: newType };
}
