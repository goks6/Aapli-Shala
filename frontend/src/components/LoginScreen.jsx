import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Eye, EyeOff, School } from 'lucide-react'

export default function LoginScreen() {
  const navigate = useNavigate()
  const { dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('principal')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    mobile: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'मोबाईल क्रमांक आवश्यक आहे'
    } else if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'वैध मोबाईल क्रमांक प्रविष्ट करा'
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'पासवर्ड आवश्यक आहे'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      console.log('Attempting login with:', { mobile: formData.mobile, role: activeTab })
      
      // Get school setup data from localStorage
      const schoolSetup = JSON.parse(localStorage.getItem('schoolSetup') || '{}')
      
      if (activeTab === 'principal') {
        // Principal login - check against school setup data
        const principalMobile = schoolSetup.principalMobile
        
        if (formData.mobile === principalMobile && formData.password === principalMobile) {
          const userData = {
            id: 1,
            mobile: principalMobile,
            role: 'principal',
            name: schoolSetup.principalName || 'Principal'
          }
          
          console.log('Principal login successful:', userData)
          
          // Store user data in context
          dispatch({ type: 'SET_USER', payload: userData })
          
          // Store in localStorage for persistence
          localStorage.setItem('user', JSON.stringify(userData))
          
          // Navigate to principal dashboard
          navigate('/principal')
        } else {
          setErrors({ general: 'चुकीची माहिती. कृपया पुन्हा प्रयत्न करा.' })
        }
      } else {
        // Teacher login - check against teachers data
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]')
        console.log("Available teachers:", teachers);
        console.log("Looking for mobile:", formData.mobile);
        
        const teacher = teachers.find(t => t.mobile === formData.mobile)
        console.log("Found teacher:", teacher);
        
        if (teacher && formData.password === formData.mobile) {
          // सुधारित कोड - class_assigned फील्ड वापरणे
          const userData = {
            id: teacher.id,
            mobile: teacher.mobile,
            role: 'teacher',
            name: teacher.name,
            class_assigned: teacher.class_assigned  // class_assigned फील्ड वापरले
          }
          
          console.log('Teacher login successful:', userData)
          
          // Store user data in context
          dispatch({ type: 'SET_USER', payload: userData })
          
          // Store in localStorage for persistence
          localStorage.setItem('user', JSON.stringify(userData))
          
          // Navigate to teacher dashboard
          navigate('/teacher')
        } else {
          setErrors({ general: 'चुकीची माहिती. कृपया पुन्हा प्रयत्न करा.' })
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'लॉगिन करताना त्रुटी. कृपया पुन्हा प्रयत्न करा.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center bg-blue-600 text-white rounded-t-lg">
          <div className="flex justify-center mb-2">
            <School className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl">आपली शाळा</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="principal">मुख्याध्यापक</TabsTrigger>
              <TabsTrigger value="teacher">शिक्षक</TabsTrigger>
            </TabsList>
            
            <TabsContent value="principal" className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">मुख्याध्यापक लॉगिन</h3>
              </div>
            </TabsContent>
            
            <TabsContent value="teacher" className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">शिक्षक लॉगिन</h3>
              </div>
            </TabsContent>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">मोबाईल क्रमांक</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="मोबाईल क्रमांक प्रविष्ट करा"
                value={formData.mobile}
                onChange={handleInputChange}
                className={errors.mobile ? 'border-red-500' : ''}
              />
              {errors.mobile && (
                <p className="text-sm text-red-500">{errors.mobile}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">पासवर्ड</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="पासवर्ड प्रविष्ट करा"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              {activeTab === 'teacher' && (
                <p className="text-xs text-gray-500 mt-1">
                  नोंद: शिक्षकांसाठी मोबाईल क्रमांकच पासवर्ड आहे.
                </p>
              )}
            </div>

            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'लॉगिन करत आहे...' : 'लॉगिन करा'}
            </Button>

            <div className="text-center">
              <Button variant="link" className="text-sm text-blue-600">
                पासवर्ड विसरलात?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}