import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { School } from 'lucide-react'

export default function InitialSetup({ onSetupComplete }) {
  const [formData, setFormData] = useState({
    schoolName: '',
    udiseCode: '',
    address: '',
    pinCode: '',
    phone: '',
    principalName: '',
    principalMobile: ''
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'शाळेचे नाव आवश्यक आहे'
    }

    if (!formData.udiseCode.trim()) {
      newErrors.udiseCode = 'UDISE क्रमांक आवश्यक आहे'
    } else if (!/^\d{11}$/.test(formData.udiseCode)) {
      newErrors.udiseCode = 'UDISE क्रमांक 11 अंकी असावा'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'शाळेचा पत्ता आवश्यक आहे'
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'पिन कोड आवश्यक आहे'
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'पिन कोड 6 अंकी असावा'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'फोन/मोबाईल नंबर आवश्यक आहे'
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'फोन/मोबाईल नंबर 10 अंकी असावा'
    }

    if (!formData.principalName.trim()) {
      newErrors.principalName = 'मुख्याध्यापकाचे नाव आवश्यक आहे'
    }

    if (!formData.principalMobile.trim()) {
      newErrors.principalMobile = 'मुख्याध्यापकाचा मोबाईल क्र. आवश्यक आहे'
    } else if (!/^\d{10}$/.test(formData.principalMobile)) {
      newErrors.principalMobile = 'मुख्याध्यापकाचा मोबाईल क्र. 10 अंकी असावा'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      // Save to localStorage
      localStorage.setItem('schoolSetup', JSON.stringify(formData))
      
      // Also save to backend
      const response = await fetch('/api/school/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSetupComplete(formData)
      } else {
        console.error('Failed to save school setup')
      }
    } catch (error) {
      console.error('Error saving school setup:', error)
      // Still proceed with local storage data
      onSetupComplete(formData)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center bg-blue-900 text-white rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <School className="h-12 w-12 text-pink-200" />
          </div>
          <CardTitle className="text-2xl font-bold">आपली शाळा</CardTitle>
          <p className="text-blue-100 mt-2">शाळेची माहिती</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="schoolName" className="text-gray-700 font-medium">
                शाळेचे नाव *
              </Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                placeholder="शाळेचे नाव प्रविष्ट करा"
                className={errors.schoolName ? 'border-red-500' : ''}
              />
              {errors.schoolName && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="udiseCode" className="text-gray-700 font-medium">
                UDISE क्रमांक (11 अंकी) *
              </Label>
              <Input
                id="udiseCode"
                value={formData.udiseCode}
                onChange={(e) => handleInputChange('udiseCode', e.target.value)}
                placeholder="UDISE क्रमांक प्रविष्ट करा"
                maxLength={11}
                className={errors.udiseCode ? 'border-red-500' : ''}
              />
              {errors.udiseCode && (
                <p className="text-red-500 text-sm mt-1">{errors.udiseCode}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address" className="text-gray-700 font-medium">
                शाळेचा पत्ता *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="शाळेचा पत्ता प्रविष्ट करा"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pinCode" className="text-gray-700 font-medium">
                  पिन कोड (6 अंकी) *
                </Label>
                <Input
                  id="pinCode"
                  value={formData.pinCode}
                  onChange={(e) => handleInputChange('pinCode', e.target.value)}
                  placeholder="पिन कोड प्रविष्ट करा"
                  maxLength={6}
                  className={errors.pinCode ? 'border-red-500' : ''}
                />
                {errors.pinCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  शाळेचा फोन/मोबाईल नंबर *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="फोन/मोबाईल नंबर प्रविष्ट करा"
                  maxLength={10}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="principalName" className="text-gray-700 font-medium">
                मुख्याध्यापकाचे नाव *
              </Label>
              <Input
                id="principalName"
                value={formData.principalName}
                onChange={(e) => handleInputChange('principalName', e.target.value)}
                placeholder="मुख्याध्यापकाचे नाव प्रविष्ट करा"
                className={errors.principalName ? 'border-red-500' : ''}
              />
              {errors.principalName && (
                <p className="text-red-500 text-sm mt-1">{errors.principalName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="principalMobile" className="text-gray-700 font-medium">
                मुख्याध्यापकाचा मोबाईल क्र. (10 अंकी) *
              </Label>
              <Input
                id="principalMobile"
                value={formData.principalMobile}
                onChange={(e) => handleInputChange('principalMobile', e.target.value)}
                placeholder="मुख्याध्यापकाचा मोबाईल क्र. प्रविष्ट करा"
                maxLength={10}
                className={errors.principalMobile ? 'border-red-500' : ''}
              />
              {errors.principalMobile && (
                <p className="text-red-500 text-sm mt-1">{errors.principalMobile}</p>
              )}
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 text-lg"
              >
                पुढे जा
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

