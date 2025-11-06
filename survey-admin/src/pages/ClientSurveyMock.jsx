import React from "react";
import { useMemo, useState } from "react";
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

export default function ClientSurveyMock() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const step = STEPS[i];

  const progress = useMemo(() => {
    const questionCount = STEPS.filter(s => s.kind === "question").length;
    const answered = Object.keys(answers).length;
    return 0;
    //return Math.round((answered / questionCount) * 100);
  }, [answers]);

  function setAnswer(id, value) {
    setAnswers(prev => ({ ...prev, [id]: value }));
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
          <span className="progress-label">Progress: {progress}%</span>
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
            <ReviewStep answers={answers} onSubmit={() => alert("Stub: submit to backend")} />
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
          <button className="btn btn-primary" onClick={next} disabled={i === STEPS.length - 1}>
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
          {step.options.map(opt => (
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
          {step.options.map(opt => {
            const set = new Set(value || []);
            const checked = set.has(opt);
            return (
              <li key={opt}>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => {
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
          {Array.from({ length: step.scale }, (_, n) => n + 1).map(n => (
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
          onChange={e => onChange(step.id, e.target.value)}
        />
      )}
    </>
  );
}

function ReviewStep({ answers, onSubmit }) {
  return (
    <>
      <h2>Review your answers</h2>
      <ul className="review-list">
        {Object.entries(answers).map(([id, v]) => (
          <li key={id}>
            <div className="muted">{id}</div>
            <div className="review-value">
              {Array.isArray(v) ? v.join(", ") : String(v)}
            </div>
          </li>
        ))}
      </ul>
      <div className="row end mt-2">
        <button className="btn btn-primary" onClick={onSubmit}>
          Submit
        </button>
      </div>
    </>
  );
}
