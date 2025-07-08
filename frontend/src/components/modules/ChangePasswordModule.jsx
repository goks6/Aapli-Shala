import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '../../context/AppContext'
import { Lock } from 'lucide-react'

export default function ChangePasswordModule() {
  const { state } = useApp()
  const [currentMobile, setCurrentMobile] = useState('')
  const [newMobile, setNewMobile] = useState('')
  const [confirmMobile, setConfirmMobile] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!currentMobile) {
      newErrors.currentMobile = 'सध्याचा मोबाईल क्रमांक आवश्यक आहे'
    } else if (!/^\d{10}$/.test(currentMobile)) {
      newErrors.currentMobile = 'अवैध मोबाईल क्रमांक'
    }

    if (!newMobile) {
      newErrors.newMobile = 'नवीन मोबाईल क्रमांक आवश्यक आहे'
    } else if (!/^\d{10}$/.test(newMobile)) {
      newErrors.newMobile = 'अवैध मोबाईल क्रमांक'
    }

    if (newMobile !== confirmMobile) {
      newErrors.confirmMobile = 'मोबाईल क्रमांक जुळत नाही'
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
      // Verify current mobile
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const setupData = JSON.parse(localStorage.getItem('schoolSetup') || '{}')

      if (userData.role !== 'principal' || currentMobile !== setupData.principalMobile) {
        setErrors({
          currentMobile: 'सध्याचा मोबाईल क्रमांक चुकीचा आहे'
        })
        setIsLoading(false)
        return
      }

      // Update mobile number
      setupData.principalMobile = newMobile
      localStorage.setItem('schoolSetup', JSON.stringify(setupData))

      // Update current user data
      userData.mobile = newMobile
      localStorage.setItem('user', JSON.stringify(userData))

      setSuccess(true)
      resetForm()
    } catch (error) {
      console.error('Error changing password:', error)
      setErrors({
        general: 'पासवर्ड बदलताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setCurrentMobile('')
    setNewMobile('')
    setConfirmMobile('')
    setErrors({})
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            पासवर्ड बदला
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 p-2 bg-green-50 text-green-800 rounded">
              पासवर्ड (मोबाईल क्रमांक) यशस्वीरित्या बदलला गेला आहे.
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-2 bg-red-50 text-red-800 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentMobile">सध्याचा मोबाईल क्रमांक</Label>
              <Input
                id="currentMobile"
                type="tel"
                value={currentMobile}
                onChange={(e) => setCurrentMobile(e.target.value)}
                placeholder="सध्याचा मोबाईल क्रमांक प्रविष्ट करा"
                maxLength={10}
                className={errors.currentMobile ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.currentMobile && (
                <p className="text-red-500 text-sm">{errors.currentMobile}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newMobile">नवीन मोबाईल क्रमांक</Label>
              <Input
                id="newMobile"
                type="tel"
                value={newMobile}
                onChange={(e) => setNewMobile(e.target.value)}
                placeholder="नवीन मोबाईल क्रमांक प्रविष्ट करा"
                maxLength={10}
                className={errors.newMobile ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.newMobile && (
                <p className="text-red-500 text-sm">{errors.newMobile}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmMobile">नवीन मोबाईल क्रमांक पुन्हा प्रविष्ट करा</Label>
              <Input
                id="confirmMobile"
                type="tel"
                value={confirmMobile}
                onChange={(e) => setConfirmMobile(e.target.value)}
                placeholder="नवीन मोबाईल क्रमांक पुन्हा प्रविष्ट करा"
                maxLength={10}
                className={errors.confirmMobile ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.confirmMobile && (
                <p className="text-red-500 text-sm">{errors.confirmMobile}</p>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'बदलत आहे...' : 'पासवर्ड बदला'}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            <p>टीप: मोबाईल क्रमांकच लॉगिन साठी पासवर्ड म्हणून वापरला जातो.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}