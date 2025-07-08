import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApp } from '../../context/AppContext'
import { RotateCcw } from 'lucide-react'

export default function ResetPasswordModule() {
  const { state } = useApp()
  const [teachers, setTeachers] = useState([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [principalMobile, setPrincipalMobile] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load teachers when component mounts
  useState(() => {
    try {
      const savedTeachers = localStorage.getItem('teachers')
      if (savedTeachers) {
        setTeachers(JSON.parse(savedTeachers))
      }
    } catch (error) {
      console.error('Error loading teachers:', error)
    }
  }, [])

  const validateForm = () => {
    const newErrors = {}

    if (!selectedTeacherId) {
      newErrors.selectedTeacherId = 'कृपया शिक्षक निवडा'
    }

    if (!principalMobile) {
      newErrors.principalMobile = 'मुख्याध्यापकांचा मोबाईल क्रमांक आवश्यक आहे'
    } else {
      // Verify principal mobile
      const setupData = JSON.parse(localStorage.getItem('schoolSetup') || '{}')
      if (principalMobile !== setupData.principalMobile) {
        newErrors.principalMobile = 'मुख्याध्यापकांचा मोबाईल क्रमांक चुकीचा आहे'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Get the selected teacher
      const selectedTeacher = teachers.find(t => t.id.toString() === selectedTeacherId.toString())
      
      if (!selectedTeacher) {
        setErrors({
          selectedTeacherId: 'निवडलेले शिक्षक आढळले नाही'
        })
        setIsLoading(false)
        return
      }

      // Reset the teacher's password (mobile) to its original value
      // In this case, we're not actually changing anything since
      // the password is already the mobile number
      
      setSuccess(true)
      setPrincipalMobile('')
      setSelectedTeacherId('')
    } catch (error) {
      console.error('Error resetting password:', error)
      setErrors({
        general: 'पासवर्ड रीसेट करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            शिक्षकांचा पासवर्ड रीसेट करा
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 p-2 bg-green-50 text-green-800 rounded">
              शिक्षकांचा पासवर्ड यशस्वीरित्या रीसेट केला गेला आहे. शिक्षकांना त्यांचा मोबाईल क्रमांक पासवर्ड म्हणून वापरण्यास सांगा.
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-2 bg-red-50 text-red-800 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>शिक्षक निवडा</Label>
              <Select 
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.selectedTeacherId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="शिक्षक निवडा" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.name} ({teacher.mobile})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.selectedTeacherId && (
                <p className="text-red-500 text-sm">{errors.selectedTeacherId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="principalMobile">मुख्याध्यापकांचा मोबाईल क्रमांक</Label>
              <Input
                id="principalMobile"
                type="tel"
                value={principalMobile}
                onChange={(e) => setPrincipalMobile(e.target.value)}
                placeholder="मुख्याध्यापकांचा मोबाईल क्रमांक प्रविष्ट करा"
                maxLength={10}
                className={errors.principalMobile ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.principalMobile && (
                <p className="text-red-500 text-sm">{errors.principalMobile}</p>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'रीसेट करत आहे...' : 'पासवर्ड रीसेट करा'}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            <p>टीप: पासवर्ड रीसेट केल्यानंतर, शिक्षकांचा मोबाईल क्रमांक त्यांचा पासवर्ड असेल.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}