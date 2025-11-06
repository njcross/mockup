import React from "react";
import { useEffect, useMemo, useState } from "react";
import "./survey.css";

const STEPS = [
  { id: "intro", kind: "intro" },
  {
    id: "s1",
    kind: "question",
    title: "What best describes your device inventory practice?",
    type: "single",
    options: [
      "We track some devices informally",
      "We maintain a spreadsheet",
      "We use an asset tool with auto discovery",
      "We have real-time CMDB and decommission flows",
    ],
  },
  {
    id: "s2",
    kind: "question",
    title: "Which software inventory sources do you use?",
    type: "multi",
    options: ["MDM", "SCCM/Intune", "Jamf", "EDR/AV", "Other"],
  },
  {
    id: "s3",
    kind: "question",
    title: "Patch cadence effectiveness",
    type: "rating",
    scale: 5,
    help: "1 = rarely patched; 5 = consistently within SLA",
  },
  {
    id: "s4",
    kind: "question",
    title: "Briefly describe your vulnerability remediation workflow",
    type: "text",
  },
  { id: "review", kind: "review" },
];

/** Demo grading to seed into localStorage if not present */
const DEMO_GRADES = {
  s1: {
    score: 4,
    comment: "Good maturity—move toward automated discovery for full coverage.",
    tasks: [
      { text: "Evaluate auto-discovery with Lansweeper/CMDB", status: "open" },
      { text: "Add decommission checklist to SOP", status: "review" },
    ],
  },
  s2: {
    score: 3,
    comment: "Coverage is partial; unify sources via MDM + EDR for accuracy.",
    tasks: [{ text: "Roll out MDM to remaining endpoints", status: "attention" }],
  },
  s3: {
    score: 2,
    comment: "Patch SLAs frequently missed; implement weekly cadence for crit vulns.",
    tasks: [
      { text: "Define SLAs (7/30/90) by severity", status: "open" },
      { text: "Add SLA alerts to Slack", status: "open" },
    ],
  },
  s4: {
    score: 5,
    comment: "Clear workflow with ticketing + validation. Strong evidence provided.",
    tasks: [],
  },
};

export default function ClientSurveyMock() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const step = STEPS[i];

  // Seed demo grading data once (non-destructive: only if keys are missing)
  useEffect(() => {
    Object.entries(DEMO_GRADES).forEach(([qid, payload]) => {
      const key = `fe_grade:${qid}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(payload));
      }
    });
  }, []);

  const progress = useMemo(() => {
    const questionIds = STEPS.filter((s) => s.kind === "question").map((s) => s.id);
    const answered = questionIds.filter(
      (id) => answers[id] !== undefined && answers[id] !== null
    ).length;
    return Math.round((answered / questionIds.length) * 100);
  }, [answers]);

  function setAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }
  function back() {
    if (i > 0) setI(i - 1);
  }
  function next() {
    if (i < STEPS.length - 1) setI(i + 1);
  }

  return (
    <div className="survey-wrap">
      <header className="survey-top">
        <div>
          <h1>Cyber Hygiene Survey</h1>
          <p className="muted">Save &amp; resume anytime from this device.</p>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span className="progress-label">{progress}%</span>
        </div>
      </header>

      <main className="survey-main">
        <div className="card">
          {step.kind === "intro" && (
            <div className="intro">
              <h2>Welcome!</h2>
              <p className="muted">
                This survey takes ~10–15 minutes. You can save & resume at any time.
              </p>
              <button className="btn btn-primary" onClick={next}>
                Start
              </button>
            </div>
          )}

          {step.kind === "question" && (
            <QuestionStep step={step} value={answers[step.id]} onChange={setAnswer} />
          )}

          {step.kind === "review" && (
            <ReviewStep
              answers={answers}
              onSubmit={() => alert("Stub: submit to backend")}
            />
          )}
        </div>
      </main>

      <footer className="survey-footer">
        <div className="row gap">
          <button className="btn" onClick={() => alert("Stub: save draft locally")}>
            Save &amp; Resume
          </button>
        </div>
        <div className="row gap">
          <button className="btn" disabled={i === 0} onClick={back}>
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={next}
            disabled={i === STEPS.length - 1}
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}

function QuestionStep({ step, value, onChange }) {
  return (
    <>
      <h2 className="q-title">{step.title}</h2>
      {step.help && <p className="muted">{step.help}</p>}

      {step.type === "single" && (
        <ul className="choice-list">
          {step.options.map((opt) => (
            <li key={opt}>
              <label className="choice">
                <input
                  type="radio"
                  name={step.id}
                  checked={value === opt}
                  onChange={() => onChange(step.id, opt)}
                />
                <span>{opt}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {step.type === "multi" && (
        <ul className="choice-list">
          {step.options.map((opt) => {
            const set = new Set(value || []);
            const checked = set.has(opt);
            return (
              <li key={opt}>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = new Set(value || []);
                      if (e.target.checked) next.add(opt);
                      else next.delete(opt);
                      onChange(step.id, Array.from(next));
                    }}
                  />
                  <span>{opt}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {step.type === "rating" && (
        <div className="score-row">
          {Array.from({ length: step.scale }, (_, n) => n + 1).map((n) => (
            <button
              key={n}
              className={`score-pill ${value === n ? "active" : ""}`}
              onClick={() => onChange(step.id, n)}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {step.type === "text" && (
        <textarea
          className="textarea"
          rows={6}
          placeholder="Write your answer…"
          value={value || ""}
          onChange={(e) => onChange(step.id, e.target.value)}
        />
      )}
    </>
  );
}

function ReviewStep({ answers, onSubmit }) {
  const entries = Object.entries(answers);

  function getQuestionLabel(id) {
    const q = STEPS.find((s) => s.kind === "question" && s.id === id);
    return q ? q.title : id;
  }
  function loadGradingFor(questionId) {
    try {
      const raw = localStorage.getItem(`fe_grade:${questionId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  return (
    <>
      <h2>Review your answers</h2>
      <ul className="review-list">
        {entries.length === 0 && <li className="muted">No answers yet.</li>}

        {entries.map(([id, v]) => {
          const label = getQuestionLabel(id);
          const grading = loadGradingFor(id); // {score, comment, tasks[]}|null
          return (
            <li key={id} className="review-item">
              <div className="review-label">{label}</div>

              <div className="review-value">
                {Array.isArray(v) ? v.join(", ") : String(v)}
              </div>

              {grading && (
                <div className="review-grading">
                  <div className="grade-line">
                    <span className="badge">Score</span>
                    <span className="grade-score">
                      {typeof grading.score === "number" ? `${grading.score}/5` : "—"}
                    </span>
                  </div>

                  {grading.comment && (
                    <div className="grade-comment">
                      <span className="badge">Reviewer Comment</span>
                      <p>{grading.comment}</p>
                    </div>
                  )}

                  <div className="grade-tasks">
                    <span className="badge">Tasks</span>
                    {Array.isArray(grading.tasks) && grading.tasks.length ? (
                      <ul className="task-list">
                        {grading.tasks.map((t, i) => (
                          <li key={i} className="task-line">
                            <span className="task-text">{t.text}</span>
                            <span className="task-status">{t.status ?? "open"}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted">No tasks assigned.</p>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="row end mt-2">
        <button className="btn btn-primary" onClick={onSubmit}>
          Submit
        </button>
      </div>
    </>
  );
}
