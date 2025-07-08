import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  UserPlus, 
  BookOpen, 
  Users, 
  Bell, 
  Calendar, 
  Trophy,
  Home,
  BarChart3,
  User,
  LogOut
} from 'lucide-react'
import { useApp } from '../context/AppContext'

// Import teacher modules
import AddStudentModule from './modules/AddStudentModule'
import TodayHomeworkModule from './modules/TodayHomeworkModule'
import TodayAttendanceModule from './modules/TodayAttendanceModule'
import NoticesModule from './modules/NoticesModule'
import TeacherCalendarModule from './modules/TeacherCalendarModule'
import TeacherResultsModule from './modules/TeacherResultsModule'

// Placeholder components for modules that might not exist yet
const PlaceholderModule = ({ name }) => (
  <div className="p-6 bg-white rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">{name} मॉड्यूल</h2>
    <p className="text-gray-600">हे मॉड्यूल विकसित केले जात आहे.</p>
  </div>
);

// Use placeholders for modules that aren't created yet
const SafeTodayHomeworkModule = TodayHomeworkModule || (props => <PlaceholderModule name="आजचा अभ्यास" {...props} />);
const SafeTodayAttendanceModule = TodayAttendanceModule || (props => <PlaceholderModule name="आजची हजेरी" {...props} />);
const SafeNoticesModule = NoticesModule || (props => <PlaceholderModule name="सूचना" {...props} />);
const SafeTeacherCalendarModule = TeacherCalendarModule || (props => <PlaceholderModule name="कॅलेंडर" {...props} />);
const SafeTeacherResultsModule = TeacherResultsModule || (props => <PlaceholderModule name="निकाल" {...props} />);

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch } = useApp()
  const [teacherData, setTeacherData] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
  console.log('Teacher Dashboard - User data from localStorage:', userData)
  
  if (!userData) {
    navigate('/login')
    return
  }

    try {
    const user = JSON.parse(userData)
    console.log('Teacher Dashboard - Parsed user:', user)
    
    if (user.role !== 'teacher') {
      navigate('/login')
      return
    }

    dispatch({ type: 'SET_USER', payload: user })
      
      / Load teacher data from teachers list
const teachers = JSON.parse(localStorage.getItem('teachers') || '[]')
console.log('Teacher Dashboard - All teachers:', teachers)
console.log('Teacher Dashboard - Looking for mobile:', user.mobile)

    
    const teacher = teachers.find(t => String(t.mobile) === String(user.mobile))
console.log('Teacher Dashboard - Found teacher:', teacher)

if (teacher) {
  setTeacherData(teacher)
  // class_assigned फील्ड वापरा
  dispatch({ type: 'SET_CURRENT_CLASS', payload: teacher.class_assigned })
} else { 
          console.warn('Teacher data not found for logged in user')
}
  } catch (error) {
    console.error("Error parsing user data:", error)
    navigate('/login')
  }
}, [navigate, dispatch])

  const handleLogout = () => {
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
    navigate('/login')
  }

  const dashboardItems = [
    { id: 'add-student', title: 'विद्यार्थी जोडा', icon: UserPlus, path: '/teacher/add-student' },
    { id: 'today-homework', title: 'आजचा अभ्यास', icon: BookOpen, path: '/teacher/today-homework' },
    { id: 'today-attendance', title: 'आजची हजेरी', icon: Users, path: '/teacher/today-attendance' },
    { id: 'notices', title: 'सूचना', icon: Bell, path: '/teacher/notices' },
    { id: 'calendar', title: 'कॅलेंडर', icon: Calendar, path: '/teacher/calendar' },
    { id: 'results', title: 'निकाल', icon: Trophy, path: '/teacher/results' }
  ]

  const isHomePage = location.pathname === '/teacher' || location.pathname === '/teacher/'

  if (isHomePage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-blue-900 text-white p-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-center">आपली शाळा</h1>
            <p className="text-blue-100 text-center text-sm mt-1">
              शिक्षक - {state.user?.name || teacherData?.name || 'नाव'}
            </p>
          </div>
        </div>

        {/* Class Info */}
        <div className="max-w-4xl mx-auto p-4">
          <Card className="mb-6">
            <CardContent className="p-4 bg-blue-50 text-center">
              <p className="text-sm text-gray-600">वर्ग</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {teacherData ? `इयत्ता ${teacherData.class_assigned}` : 'वर्ग माहिती उपलब्ध नाही'}
              </h2>
            </CardContent>
          </Card>

          {/* Date and Student Count */}
          <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
            <div>{new Date().toLocaleDateString('mr-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              weekday: 'long'
            })}</div>
            <div>एकूण विद्यार्थी: <span className="font-semibold">35</span></div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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

          {/* Today's Attendance Status */}
          <Card className="mb-6">
            <CardContent className="p-4 bg-green-50">
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 mb-2">आजची उपस्थिती स्थिती:</h3>
                <div className="flex justify-between text-sm">
                  <div>उपस्थित: <span className="font-semibold">32</span></div>
                  <div>अनुपस्थित: <span className="font-semibold text-red-600">3</span></div>
                  <div>टक्केवारी: <span className="font-semibold">91.4%</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
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
            onClick={() => navigate('/teacher')}
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
          <Route path="/add-student" element={<AddStudentModule />} />
          <Route path="/today-homework" element={<SafeTodayHomeworkModule />} />
          <Route path="/today-attendance" element={<SafeTodayAttendanceModule />} />
          <Route path="/notices" element={<SafeNoticesModule />} />
          <Route path="/calendar" element={<SafeTeacherCalendarModule />} />
          <Route path="/results" element={<SafeTeacherResultsModule />} />
        </Routes>
      </div>
    </div>
  )
}