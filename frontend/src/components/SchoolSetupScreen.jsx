import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '../context/AppContext'

export default function SchoolSetupScreen() {
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolUdise: '',
    schoolAddress: '',
    principalName: '',
    principalMobile: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { dispatch } = useApp()

  useEffect(() => {
    // Check if setup is already complete
    const schoolSetup = localStorage.getItem('schoolSetup')
    if (schoolSetup) {
      navigate('/login')
    }
  }, [navigate])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'शाळेचे नाव आवश्यक आहे'
    }

    if (!formData.schoolUdise.trim()) {
      newErrors.schoolUdise = 'यु-डाईस क्रमांक आवश्यक आहे'
    } else if (!/^\d{11}$/.test(formData.schoolUdise)) {
      newErrors.schoolUdise = 'यु-डाईस क्रमांक 11 अं
	  newErrors.schoolUdise = 'यु-डाईस क्रमांक 11 अंकी असावा'
    }

    if (!formData.schoolAddress.trim()) {
      newErrors.schoolAddress = 'शाळेचा पत्ता आवश्यक आहे'
    }

    if (!formData.principalName.trim()) {
      newErrors.principalName = 'मुख्याध्यापकांचे नाव आवश्यक आहे'
    }

    if (!formData.principalMobile.trim()) {
      newErrors.principalMobile = 'मोबाईल क्रमांक आवश्यक आहे'
    } else if (!/^\d{10}$/.test(formData.principalMobile)) {
      newErrors.principalMobile = 'मोबाईल क्रमांक 10 अंकी असावा'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Save school setup data
      localStorage.setItem('schoolSetup', JSON.stringify(formData))
      
      // Create principal user data
      const userData = {
        role: 'principal',
        name: formData.principalName,
        mobile: formData.principalMobile
      }
      
      // Save to app context
      dispatch({ type: 'SET_SCHOOL_DATA', payload: {
        name: formData.schoolName,
        udise: formData.schoolUdise,
        address: formData.schoolAddress
      }})
      
      // Redirect to login
      navigate('/login')
    } catch (error) {
      console.error('Setup error:', error)
      alert('सेटअप करताना त्रुटी. कृपया पुन्हा प्रयत्न करा.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900">आपली शाळा सेटअप</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="schoolName">शाळेचे नाव *</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                placeholder="शाळेचे नाव प्रविष्ट करा"
                className={errors.schoolName ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.schoolName && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="schoolUdise">यु-डाईस क्रमांक (11 अंकी) *</Label>
              <Input
                id="schoolUdise"
                value={formData.schoolUdise}
                onChange={(e) => handleInputChange('schoolUdise', e.target.value)}
                placeholder="यु-डाईस क्रमांक प्रविष्ट करा"
                maxLength={11}
                className={errors.schoolUdise ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.schoolUdise && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolUdise}</p>
              )}
            </div>

            <div>
              <Label htmlFor="schoolAddress">शाळेचा पत्ता *</Label>
              <Input
                id="schoolAddress"
                value={formData.schoolAddress}
                onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
                placeholder="शाळेचा पत्ता प्रविष्ट करा"
                className={errors.schoolAddress ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.schoolAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolAddress}</p>
              )}
            </div>

            <div>
              <Label htmlFor="principalName">मुख्याध्यापकांचे नाव *</Label>
              <Input
                id="principalName"
                value={formData.principalName}
                onChange={(e) => handleInputChange('principalName', e.target.value)}
                placeholder="मुख्याध्यापकांचे नाव प्रविष्ट करा"
                className={errors.principalName ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.principalName && (
                <p className="text-red-500 text-sm mt-1">{errors.principalName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="principalMobile">मुख्याध्यापकांचा मोबाईल क्रमांक (10 अंकी) *</Label>
              <Input
                id="principalMobile"
                value={formData.principalMobile}
                onChange={(e) => handleInputChange('principalMobile', e.target.value)}
                placeholder="मोबाईल क्रमांक प्रविष्ट करा"
                maxLength={10}
                className={errors.principalMobile ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.principalMobile && (
                <p className="text-red-500 text-sm mt-1">{errors.principalMobile}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                नोंद: मोबाईल क्रमांकच डिफॉल्ट पासवर्ड असेल
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'सेटअप होत आहे...' : 'सेटअप पूर्ण करा'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}