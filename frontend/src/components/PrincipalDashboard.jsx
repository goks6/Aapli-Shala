import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Calendar, 
  UserPlus, 
  BookOpen, 
  FileText, 
  Users, 
  UtensilsCrossed, 
  Trophy, 
  ClipboardList, 
  Lock, 
  RotateCcw,
  Home,
  BarChart3,
  User,
  LogOut
} from 'lucide-react'
import { useApp } from '../context/AppContext'

// Import dashboard modules
import AddTeacherModule from './modules/AddTeacherModule'

// Placeholder components for modules that might not exist yet
const PlaceholderModule = ({ name }) => (
  <div className="p-6 bg-white rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">{name} मॉड्यूल</h2>
    <p className="text-gray-600">हे मॉड्यूल विकसित केले जात आहे.</p>
  </div>
);

// Use placeholders for modules that aren't created yet
const CalendarModule = props => <PlaceholderModule name="कॅलेंडर" {...props} />;
const GeneralRegisterModule = props => <PlaceholderModule name="जनरल रजिस्टर" {...props} />;
const SchoolAttendanceModule = props => <PlaceholderModule name="शाळेची हजेरी" {...props} />;
const NutritionModule = props => <PlaceholderModule name="दैनिक पोषण आहार" {...props} />;
const ResultsModule = props => <PlaceholderModule name="शाळेचा निकाल" {...props} />;
const ChangePasswordModule = props => <PlaceholderModule name="पासवर्ड बदला" {...props} />;
const ResetPasswordModule = props => <PlaceholderModule name="पासवर्ड रिसेट" {...props} />;
const SchoolCertificateModule = props => <PlaceholderModule name="शाळा सोडायचा दाखला" {...props} />;
const FormAModule = props => <PlaceholderModule name="प्रपत्र अ" {...props} />;

export default function PrincipalDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch } = useApp()
  const [schoolData, setSchoolData] = useState(null)

  useEffect(() => {
    // Load school data
    const setupData = localStorage.getItem('schoolSetup')
    if (setupData) {
      try {
        setSchoolData(JSON.parse(setupData))
      } catch (error) {
        console.error("Error parsing school data:", error);
      }
    }

    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      navigate('/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      if (user.role !== 'principal') {
        navigate('/login')
        return
      }

      dispatch({ type: 'SET_USER', payload: user })
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate('/login');
    }
  }, [navigate, dispatch])

  const handleLogout = () => {
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
    navigate('/login')
  }

  const dashboardItems = [
    { id: 'calendar', title: 'कॅलेंडर', icon: Calendar, path: '/principal/calendar' },
    { id: 'add-teacher', title: 'शिक्षक जोडा', icon: UserPlus, path: '/principal/add-teacher' },
    { id: 'general-register', title: 'जनरल रजिस्टर', icon: BookOpen, path: '/principal/general-register' },
    { id: 'school-certificate', title: 'शाळा सोडायचा दाखला', icon: FileText, path: '/principal/school-certificate' },
    { id: 'school-attendance', title: 'शाळेची हजेरी', icon: Users, path: '/principal/school-attendance' },
    { id: 'nutrition', title: 'दैनिक पोषण आहार', icon: UtensilsCrossed, path: '/principal/nutrition' },
    { id: 'results', title: 'शाळेचा निकाल', icon: Trophy, path: '/principal/results' },
    { id: 'form-a', title: 'प्रपत्र अ', icon: ClipboardList, path: '/principal/form-a' },
    { id: 'change-password', title: 'पासवर्ड बदला', icon: Lock, path: '/principal/change-password' },
    { id: 'reset-password', title: 'पासवर्ड रिसेट', icon: RotateCcw, path: '/principal/reset-password' }
  ]

  const isHomePage = location.pathname === '/principal' || location.pathname === '/principal/'

  if (isHomePage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-blue-900 text-white p-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-center">आपली शाळा</h1>
            <p className="text-blue-100 text-center text-sm mt-1">
              मुख्याध्यापक - {state.user?.name || 'नाव'}
            </p>
          </div>
        </div>

        {/* School Info */}
        <div className="max-w-4xl mx-auto p-4">
          <Card className="mb-6">
            <CardContent className="p-4 bg-blue-50 text-center">
              <p className="text-sm text-gray-600">शाळेचे नाव</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {schoolData?.schoolName || 'जिल्हा परिषद प्राथमिक शाळा'}
              </h2>
            </CardContent>
          </Card>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {dashboardItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Card 
                  key={item.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(item.path)}
                >
                  <CardContent className="p-4 text-center">
                    <IconComponent className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto flex justify-around py-2">
            <button className="flex flex-col items-center p-2 text-blue-900">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">होम</span>
            </button>
            <button className="flex flex-col items-center p-2 text-gray-500">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs mt-1">रिपोर्ट</span>
            </button>
            <button className="flex flex-col items-center p-2 text-gray-500">
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">प्रोफाईल</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex flex-col items-center p-2 text-gray-500"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-xs mt-1">बाहेर पडा</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-blue-900 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/principal')}
            className="text-white hover:bg-blue-800 mr-4"
          >
            ← परत
          </Button>
          <h1 className="text-xl font-bold">आपली शाळा</h1>
        </div>
      </div>

      {/* Module Content */}
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <Routes>
          <Route path="/calendar" element={<CalendarModule />} />
          <Route path="/add-teacher" element={<AddTeacherModule />} />
          <Route path="/general-register" element={<GeneralRegisterModule />} />
          <Route path="/school-certificate" element={<SchoolCertificateModule />} />
          <Route path="/school-attendance" element={<SchoolAttendanceModule />} />
          <Route path="/nutrition" element={<NutritionModule />} />
          <Route path="/results" element={<ResultsModule />} />
          <Route path="/form-a" element={<FormAModule />} />
          <Route path="/change-password" element={<ChangePasswordModule />} />
          <Route path="/reset-password" element={<ResetPasswordModule />} />
        </Routes>
      </div>
    </div>
  )
}