import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import LoginScreen from './components/LoginScreen'
import SchoolSetupScreen from './components/SchoolSetupScreen'
import PrincipalDashboard from './components/PrincipalDashboard'
import TeacherDashboard from './components/TeacherDashboard'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/setup" element={<SchoolSetupScreen />} />
          <Route path="/principal/*" element={<PrincipalDashboard />} />
          <Route path="/teacher/*" element={<TeacherDashboard />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App