import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { School } from 'lucide-react'

export default function WelcomeScreen({ schoolData }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-8 text-center">
          {/* App Logo */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-blue-900 rounded-full mx-auto flex items-center justify-center mb-6">
              <School className="h-16 w-16 text-pink-200" />
            </div>
            
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              आपली शाळा
            </h1>
            
            <p className="text-lg text-gray-600 font-medium mb-4">
              "विद्या विनय सेवा"
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-800">
                {schoolData?.schoolName || 'जिल्हा परिषद प्राथमिक शाळा'}
              </h2>
              {schoolData?.address && (
                <p className="text-gray-600 mt-1">{schoolData.address}</p>
              )}
            </div>
          </div>

          {/* Start Button */}
          <Button 
            onClick={() => navigate('/login')}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-4 text-lg font-medium"
            size="lg"
          >
            प्रारंभ करा
          </Button>
        </div>
      </Card>
    </div>
  )
}

