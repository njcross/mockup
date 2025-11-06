# Survey Admin Application - AI Assistant Instructions

## Project Overview
This is a React-based survey administration application with three main functional areas:
- Form Builder: For creating customizable surveys
- Survey Management: For tracking client survey responses
- Grading Dashboard: For evaluating and scoring survey responses

## Architecture Patterns

### Component Structure
- Single-page application with tab-based navigation in `SurveyAdminWireframe.jsx`
- Components follow a "stub" pattern for feature placeholders (see `FormBuilderStub`, `ClientSurveyStub`, `GradingDashboardStub`)
- State management uses React hooks (e.g., `useState` for tab management)

### CSS Conventions
- Layout uses CSS Grid for structured layouts (e.g., `.builder-grid`, `.grading-grid`)
- BEM-like class naming: `block__element--modifier` pattern
- Components use semantic class names (e.g., `survey-admin-page`, `content-area`)

### Component Examples
```jsx
// Tab state management pattern
const [activeTab, setActiveTab] = useState('formBuilder');

// Conditional rendering pattern
{activeTab === 'formBuilder' && <FormBuilderStub />}

// Dynamic class assignment pattern
className={activeTab === 'formBuilder' ? 'active' : ''}
```

### UI Patterns
- Sidebar navigation with emoji icons for visual recognition
- Content headers include consistent action buttons (Preview/Save)
- Progress indicators use percentage-based width styling
- Status indicators use emoji (✅ for complete, ⚙️ for in progress)

## Development Workflow
- Components are defined in `.jsx` files with accompanying `.css` files
- New features should follow the established stub pattern until fully implemented
- UI components are organized hierarchically with parent-child relationships

## State Management
- Tab state is managed at the root component level
- Child components receive state through props (no global state management)
- State updates follow React's unidirectional data flow

## Integration Points
- CSS modules for styling
- React for UI components and state management
- No external service integrations currently implemented

_Note: This is a wireframe implementation. When extending functionality, maintain the established patterns for consistency._