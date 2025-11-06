import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Link, Outlet } from 'react-router-dom'
import ClientSurveyMock from './pages/ClientSurveyMock.jsx'
import GradingAdminMock from './pages/GradingAdminMock.jsx'
import SurveyFormEditor from './pages/SurveyFormEditor.jsx'
import './styles/variables.css'
import './styles/global.css'

function AppShell() {
  return (
    <>
      <nav className="wf-nav">
        <div className="wf-nav-top">
          <span className="wf-brand">Five Eyes — Wireframes</span>
          <div className="wf-spacer" />
          {/* you can add a mock “Logout” here if you want */}
        </div>
        <div className="wf-nav-bottom">
          <Link to="/client" className="wf-link">Client Survey</Link>
          <Link to="/grading" className="wf-link">Admin Grading</Link>
          <Link to="/admin/surveys/editor" className="wf-link">Survey Form Editor</Link>
        </div>
      </nav>
      <main className="wf-main">
        <Outlet />
      </main>
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <ClientSurveyMock /> },
      { path: 'client', element: <ClientSurveyMock /> },
      { path: 'grading', element: <GradingAdminMock /> },
      { path: 'admin/surveys/editor', element: <SurveyFormEditor />},
    ],
  },
])

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
