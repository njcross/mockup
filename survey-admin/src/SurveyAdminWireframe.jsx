import React, { useState } from 'react';
import './SurveyAdminWireframe.css';

export default function SurveyAdminWireframe() {
  const [activeTab, setActiveTab] = useState('formBuilder');

  return (
    <div className="survey-admin-page">
      <aside className="sidebar">
        <h3>Admin Tools</h3>
        <nav>
          <button
            className={activeTab === 'formBuilder' ? 'active' : ''}
            onClick={() => setActiveTab('formBuilder')}
          >
            🧩 Form Builder
          </button>
          <button
            className={activeTab === 'surveys' ? 'active' : ''}
            onClick={() => setActiveTab('surveys')}
          >
            📋 Surveys
          </button>
          <button
            className={activeTab === 'grades' ? 'active' : ''}
            onClick={() => setActiveTab('grades')}
          >
            🧭 Grading
          </button>
        </nav>
      </aside>

      <main className="content-area">
        <header className="content-header">
          <h1>{activeTab === 'formBuilder' ? 'Create Survey Form' : activeTab === 'surveys' ? 'Client Survey Responses' : 'Admin Grading Dashboard'}</h1>
          <div className="actions">
            <button className="btn">Preview</button>
            <button className="btn primary">Save</button>
          </div>
        </header>

        {activeTab === 'formBuilder' && <FormBuilderStub />}
        {activeTab === 'surveys' && <ClientSurveyStub />}
        {activeTab === 'grades' && <GradingDashboardStub />}
      </main>
    </div>
  );
}

function FormBuilderStub() {
  return (
    <div className="stub-card">
      <h2>Drag & Drop Question Blocks</h2>
      <div className="builder-grid">
        <div className="block">➕ Multiple Choice</div>
        <div className="block">➕ Yes / No</div>
        <div className="block">➕ Short Answer</div>
        <div className="block">➕ Rating (1–5)</div>
      </div>
      <p className="hint">(Drag components here to build your custom survey)</p>
    </div>
  );
}

function ClientSurveyStub() {
  return (
    <div className="stub-card">
      <h2>Client Survey Overview</h2>
      <p>View and manage survey submissions from clients.</p>
      <div className="survey-list">
        <div className="survey-item">Contoso Ltd — 10/10 Responses ✅</div>
        <div className="survey-item">Fabrikam Inc — 7/10 In Progress ⚙️</div>
      </div>
    </div>
  );
}

function GradingDashboardStub() {
  return (
    <div className="stub-card">
      <h2>Grading Overview</h2>
      <p>Review submitted surveys, assign scores, and add feedback or tasks.</p>
      <div className="grading-grid">
        <div className="grading-card">
          <h3>Access Control</h3>
          <p>Client Response: Partial MFA</p>
          <div className="score-bar">
            <div className="score-fill" style={{ width: '70%' }}></div>
          </div>
        </div>
        <div className="grading-card">
          <h3>Vulnerability Management</h3>
          <p>Client Response: Monthly Scans</p>
          <div className="score-bar">
            <div className="score-fill" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}