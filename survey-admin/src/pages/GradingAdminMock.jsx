import React, { useMemo, useState } from "react";
import { QUESTIONS as MOCK_QUESTIONS } from "../shared/questions.js";
import "./grading.css";

const MOCK_CLIENTS = [
  { id: 1, name: "Contoso Ltd." },
  { id: 2, name: "Fabrikam Inc." },
  { id: 3, name: "Northwind Traders" },
];

const MOCK_SURVEYS = [
  { id: 101, title: "Cyber Hygiene v1.2" },
  { id: 102, title: "Cyber Hygiene v1.3 (Pilot)" },
];


/** New: mock responses keyed by clientId -> surveyId -> questionId */
const MOCK_RESPONSES = {
  1: {
    101: {
      q1: "Yes. Asset inventory maintained in Lansweeper; monthly exports.",
      q2: "Partial. Software inventory tracked only for Windows fleet.",
      q3: "Quarterly vuln scans via OpenVAS; remediation within 30 days.",
      q4: "Baseline hardening via CIS L1, drift checked monthly.",
    },
    102: {
      q1: "In progress—migrating to CMDB. Current list is 80% complete.",
      q2: "Pilot agent rolling out; Mac coverage missing.",
      q3: "Moving to weekly scans for external-facing services.",
      q4: "Drift alerts wired into Slack; exceptions documented.",
    },
  },
  2: {
    101: {
      q1: "Spreadsheet-based; updated ad hoc.",
      q2: "Not tracked.",
      q3: "No formal scanning solution yet.",
      q4: "Hardened images exist but not consistently applied.",
    },
  },
  3: {
    101: {
      q1: "Full asset DB in ServiceNow; auto-discovery enabled.",
      q2: "Yes—SaaS inventory + endpoints collected via agent.",
      q3: "Weekly authenticated scans; SLA: 14 days high, 30 days med.",
      q4: "CIS L2 for servers; PRs enforce hardening checks.",
    },
  },
};

export default function GradingAdminMock() {
  const [clientId, setClientId] = useState(MOCK_CLIENTS[0].id);
  const [surveyId, setSurveyId] = useState(MOCK_SURVEYS[0].id);
  const [filter, setFilter] = useState("");
  const [selectedQ, setSelectedQ] = useState(MOCK_QUESTIONS[0].id);
  const [grades, setGrades] = useState(() =>
    Object.fromEntries(
      MOCK_QUESTIONS.map((q) => [q.id, { score: 0, comment: "", tasks: [] }])
    )
  );
  const [showTasks, setShowTasks] = useState(true);

  const visibleQuestions = useMemo(() => {
    const s = filter.trim().toLowerCase();
    return s
      ? MOCK_QUESTIONS.filter((q) => q.label.toLowerCase().includes(s))
      : MOCK_QUESTIONS;
  }, [filter]);

  const q = visibleQuestions.find((x) => x.id === selectedQ) ?? visibleQuestions[0];

  function setScore(id, score) {
    setGrades((g) => ({ ...g, [id]: { ...g[id], score } }));
  }
  function setComment(id, comment) {
    setGrades((g) => ({ ...g, [id]: { ...g[id], comment } }));
  }
  function addTask(id) {
    const text = prompt("Task description?");
    if (!text) return;
    setGrades((g) => ({
      ...g,
      [id]: {
        ...g[id],
        tasks: [...g[id].tasks, { id: crypto.randomUUID(), text, status: "open" }],
      },
    }));
    setShowTasks(true);
  }
  function updateTask(id, taskId, patch) {
    setGrades((g) => ({
      ...g,
      [id]: {
        ...g[id],
        tasks: g[id].tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
      },
    }));
  }
  function removeTask(id, taskId) {
    setGrades((g) => ({
      ...g,
      [id]: { ...g[id], tasks: g[id].tasks.filter((t) => t.id !== taskId) },
    }));
  }

  const total = useMemo(() => {
    return Object.values(grades).reduce((acc, v) => acc + Number(v.score || 0), 0);
  }, [grades]);

  /** Helper: get the client’s answer for the selected Q */
  const clientAnswer =
    (MOCK_RESPONSES?.[clientId]?.[surveyId]?.[q?.id || ""]) ?? "No response provided.";

  // derive simple status from MOCK_RESPONSES
  const TOTAL_Q = MOCK_QUESTIONS.length;

  function computeStatuses() {
  const inProgress = [];
  const needsGrading = [];

  // Walk all clients × surveys, look at how many answers exist
  for (const c of MOCK_CLIENTS) {
      const bySurvey = MOCK_RESPONSES[c.id] || {};
      for (const s of MOCK_SURVEYS) {
      const answers = bySurvey[s.id] || {};
      // count how many of our canonical questions have a non-empty answer
      const answered = MOCK_QUESTIONS.reduce(
          (acc, q) => acc + (answers[q.id] ? 1 : 0),
          0
      );
      if (answered === 0) continue; // not started → ignore

      const pct = Math.round((answered / TOTAL_Q) * 100);

      if (answered < TOTAL_Q) {
          inProgress.push({
          clientId: c.id,
          clientName: c.name,
          surveyId: s.id,
          surveyTitle: s.title,
          answered,
          pct,
          lastUpdated: "today", // stub; wire to backend later
          });
      } else {
          // fully answered; assume "needs grading" (until you track grade state)
          needsGrading.push({
          clientId: c.id,
          clientName: c.name,
          surveyId: s.id,
          surveyTitle: s.title,
          answered,
          pct: 100,
          lastUpdated: "today", // stub
          });
      }
      }
  }
  return { inProgress, needsGrading };
  }

  const { inProgress, needsGrading } = computeStatuses();

  return (
    <div className="grading-wrap">
      {/* Top bar */}
      <header className="grading-topbar">
        <div className="gt-left">
          <h1>Grading</h1>
          <div className="crumbs">
            <span>Admin</span>
            <span className="sep">/</span>
            <span>Grading</span>
          </div>
        </div>
        <div className="gt-actions">
          <button className="btn">Save Draft</button>
          <button className="btn btn-primary">Publish Grades</button>
        </div>
      </header>

      <div className="grading-shell">
        {/* LEFT: Sidebar */}
        <aside className="grading-sidebar">
          <div className="panel">
            <label className="label">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(Number(e.target.value))}
              className="input"
            >
              {MOCK_CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="panel">
            <label className="label">Survey</label>
            <select
              value={surveyId}
              onChange={(e) => setSurveyId(Number(e.target.value))}
              className="input"
            >
              {MOCK_SURVEYS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="panel">
            <div className="row-between">
              <label className="label">Questions</label>
              <button
                className="btn btn-ghost"
                title="Add a new question to this survey"
                onClick={() => alert("Stub: open 'Add Question' modal")}
              >
                + Add
              </button>
            </div>
            <input
              className="input mb-2"
              placeholder="Search questions…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <ul className="q-list">
              {visibleQuestions.map((item) => (
                <li
                  key={item.id}
                  className={`q-item ${item.id === (q?.id ?? "") ? "active" : ""}`}
                  onClick={() => setSelectedQ(item.id)}
                >
                  <div className="q-title">{item.label}</div>
                  <div className="q-sub">Weight: {item.weight}</div>
                  <div className="q-overflow">
                    <button
                      className="icon-btn"
                      title="More actions"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("Stub: open question actions (edit, duplicate, archive)");
                      }}
                    >
                      ⋮
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* MAIN: per-question grading + client's answer */}
        <section className="grading-main">
          {q ? (
            <div className="card">
              <div className="card-head">
                <h2 className="card-title">{q.label}</h2>
                <div className="muted">Weight: {q.weight}</div>
              </div>

              {/* Client Answer block */}
              <div className="box">
                <label className="label">Client’s Answer</label>
                <div className="answer-box">
                  {clientAnswer}
                </div>
              </div>

              <div className="grid two">
                <div className="box">
                  <label className="label">Score (0–5)</label>
                  <div className="score-row">
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        className={`score-pill ${grades[q.id].score === n ? "active" : ""}`}
                        onClick={() => setScore(q.id, n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="box">
                  <label className="label">Reviewer Comment</label>
                  <textarea
                    className="textarea"
                    rows={4}
                    placeholder="Explain the score, cite evidence, link artifacts…"
                    value={grades[q.id].comment}
                    onChange={(e) => setComment(q.id, e.target.value)}
                  />
                </div>
              </div>

              <div className="row-between mt-2">
                <div className="muted">Quick Actions</div>
                <div className="row gap">
                  <button className="btn" onClick={() => addTask(q.id)}>
                    + Add Task
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => alert("Stub: open Quick Add: follow-up question")}
                  >
                    + Add Follow-up Q
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card empty">No question selected.</div>
          )}

          <div className="card">
            <div className="row-between">
              <h3 className="card-title">Overall</h3>
              <div className="badge">Total (naive): {total}</div>
            </div>
            <p className="muted">
              Replace with your rubric math (weights, sections, normalization) when ready.
            </p>
          </div>
        </section>
        

        {/* RIGHT: Tasks drawer */}
        <aside className={`tasks-drawer ${showTasks ? "open" : ""}`}>
          <div className="drawer-head">
            <h3>Tasks</h3>
            <button className="icon-btn" onClick={() => setShowTasks(!showTasks)}>
              {showTasks ? "→" : "←"}
            </button>
          </div>

          {q ? (
            <ul className="tasks">
              {grades[q.id].tasks.map((t) => (
                <li key={t.id} className="task">
                  <span className="task-text">{t.text}</span>
                  <div className="task-actions">
                    <select
                      className="input sm"
                      value={t.status}
                      onChange={(e) => updateTask(q.id, t.id, { status: e.target.value })}
                    >
                      <option value="open">Open</option>
                      <option value="review">Under Review</option>
                      <option value="attention">Attention</option>
                      <option value="done">Done</option>
                    </select>
                    <button
                      className="icon-btn"
                      onClick={() => removeTask(q.id, t.id)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
              {!grades[q.id].tasks.length && (
                <li className="task empty">No tasks yet. Use “Add Task”.</li>
              )}
            </ul>
          ) : (
            <div className="muted p-2">Select a question.</div>
          )}
        </aside>
        
      </div>
      <section className="status-section">
  <div className="status-row">
    <div className="card status-card">
      <div className="row-between">
        <h3 className="card-title">In-Progress Surveys</h3>
        <span className="badge">{inProgress.length}</span>
      </div>
      {inProgress.length === 0 ? (
        <p className="muted">No in-progress surveys found.</p>
      ) : (
        <ul className="status-list">
          {inProgress.map(item => (
            <li key={`${item.clientId}-${item.surveyId}`} className="status-item">
              <div className="status-main">
                <div className="status-title">
                  {item.clientName} — <span className="muted">{item.surveyTitle}</span>
                </div>
                <div className="status-sub muted">
                  {item.answered}/{TOTAL_Q} answered • {item.pct}% • updated {item.lastUpdated}
                </div>
              </div>
              <div className="status-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setClientId(item.clientId);
                    setSurveyId(item.surveyId);
                    // jump to first unanswered question if you want:
                    const answers = (MOCK_RESPONSES[item.clientId]?.[item.surveyId]) || {};
                    const firstUnanswered = MOCK_QUESTIONS.find(q => !answers[q.id])?.id;
                    if (firstUnanswered) setSelectedQ(firstUnanswered);
                  }}
                  title="Jump to first unanswered"
                >
                  Continue →
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className="card status-card">
      <div className="row-between">
        <h3 className="card-title">Surveys Needing Grading</h3>
        <span className="badge">{needsGrading.length}</span>
      </div>
      {needsGrading.length === 0 ? (
        <p className="muted">No fully answered surveys awaiting grading.</p>
      ) : (
        <ul className="status-list">
          {needsGrading.map(item => (
            <li key={`${item.clientId}-${item.surveyId}`} className="status-item">
              <div className="status-main">
                <div className="status-title">
                  {item.clientName} — <span className="muted">{item.surveyTitle}</span>
                </div>
                <div className="status-sub muted">
                  {item.answered}/{TOTAL_Q} answered • {item.pct}% • updated {item.lastUpdated}
                </div>
              </div>
              <div className="status-actions">
                <button
                  className="btn"
                  onClick={() => {
                    setClientId(item.clientId);
                    setSurveyId(item.surveyId);
                    // pick first question by default when grading
                    setSelectedQ(MOCK_QUESTIONS[0].id);
                  }}
                  title="Open in grading"
                >
                  Grade →
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
</section>
    </div>
  );
}