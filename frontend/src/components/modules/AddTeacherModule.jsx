import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, UserPlus } from 'lucide-react'

export default function AddTeacherModule() {
  const [teachers, setTeachers] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    subject: '',
    class_assigned: ''
  })
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const subjects = ['मराठी', 'हिंदी', 'इंग्रजी', 'गणित', 'विज्ञान', 'सामाजिक शास्त्र', 'कला', 'शारीरिक शिक्षण']
  const classes = ['1 ली', '2 री', '3 री', '4 थी', '5 वी', '6 वी', '7 वी', '8 वी']

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = () => {
    try {
      const savedTeachers = localStorage.getItem('teachers')
      if (savedTeachers) {
        setTeachers(JSON.parse(savedTeachers))
      } else {
        // Initialize an empty array if no teachers exist
        localStorage.setItem('teachers', JSON.stringify([]))
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
      // Ensure we have a valid array in localStorage
      localStorage.setItem('teachers', JSON.stringify([]))
      setTeachers([])
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'शिक्षकाचे नाव आवश्यक आहे'
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'मोबाईल क्रमांक आवश्यक आहे'
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'मोबाईल क्रमांक 10 अंकी असावा'
    } else {
      // Check for duplicate mobile number
      const existingTeacher = teachers.find(t => 
        t.mobile === formData.mobile && t.id !== editingId
      )
      if (existingTeacher) {
        newErrors.mobile = 'हा मोबाईल क्रमांक आधीच वापरला आहे'
      }
    }

    if (!formData.subject) {
      newErrors.subject = 'विषय निवडा'
    }

    if (!formData.class_assigned) {
      newErrors.class_assigned = 'इयत्ता निवडा'
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
      const teacherData = {
        ...formData,
        id: editingId || Date.now(), // Use existing ID if editing, otherwise generate new
        created_at: new Date().toISOString(),
        is_active: true
      }

      let updatedTeachers
      if (editingId) {
        updatedTeachers = teachers.map(t => t.id === editingId ? teacherData : t)
      } else {
        updatedTeachers = [...teachers, teacherData]
      }
      
      setTeachers(updatedTeachers)
      localStorage.setItem('teachers', JSON.stringify(updatedTeachers))
      
      resetForm()
      alert(editingId ? 'शिक्षक यशस्वीरित्या अपडेट केला' : 'शिक्षक यशस्वीरित्या जोडला')
    } catch (error) {
      console.error('Error saving teacher:', error)
      alert('शिक्षक जतन करताना त्रुटी. कृपया पुन्हा प्रयत्न करा.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', mobile: '', subject: '', class_assigned: '' })
    setErrors({})
    setEditingId(null)
  }

  const handleEdit = (teacher) => {
    setFormData({
      name: teacher.name,
      mobile: teacher.mobile,
      subject: teacher.subject,
      class_assigned: teacher.class_assigned
    })
    setEditingId(teacher.id)
    setErrors({})
  }

  const handleDelete = (teacherId) => {
    if (confirm('या शिक्षकाची माहिती काढायची आहे का?')) {
      try {
        const updatedTeachers = teachers.filter(t => t.id !== teacherId)
        setTeachers(updatedTeachers)
        localStorage.setItem('teachers', JSON.stringify(updatedTeachers))
        alert('शिक्षक यशस्वीरित्या काढला')
      } catch (error) {
        console.error('Error deleting teacher:', error)
        alert('शिक्षक काढताना त्रुटी. कृपया पुन्हा प्रयत्न करा.')
      }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Teacher Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            शिक्षक जोडा
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="teacherName">शिक्षकाचे नाव *</Label>
              <Input
                id="teacherName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="शिक्षकाचे नाव प्रविष्ट करा"
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="teacherMobile">मोबाईल क्रमांक (10 अंकी) *</Label>
              <Input
                id="teacherMobile"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                placeholder="मोबाईल क्रमांक प्रविष्ट करा"
                maxLength={10}
                className={errors.mobile ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                नोंद: मोबाईल क्रमांकच डिफॉल्ट पासवर्ड असेल
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>मुख्य विषय *</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(value) => handleInputChange('subject', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.subject ? 'border-red-500' : ''}>
                    <SelectValue placeholder="विषय निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                )}
              </div>

              <div>
                <Label>वर्ग शिक्षक (इयत्ता) *</Label>
                <Select 
                  value={formData.class_assigned} 
                  onValueChange={(value) => handleInputChange('class_assigned', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.class_assigned ? 'border-red-500' : ''}>
                    <SelectValue placeholder="इयत्ता निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.class_assigned && (
                  <p className="text-red-500 text-sm mt-1">{errors.class_assigned}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'जोडत आहे...' : editingId ? 'शिक्षक अपडेट करा' : 'शिक्षक जोडा'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>
                रीसेट करा
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <Card>
        <CardHeader>
          <CardTitle>शिक्षकांची यादी ({teachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              अजून कोणतेही शिक्षक जोडलेले नाहीत
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>अनु. क्र.</TableHead>
                    <TableHead>शिक्षकाचे नाव</TableHead>
                    <TableHead>मोबाईल क्र.</TableHead>
                    <TableHead>मुख्य विषय</TableHead>
                    <TableHead>वर्ग शिक्षक</TableHead>
                    <TableHead>स्थिती</TableHead>
                    <TableHead>कार्य</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher, index) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.mobile}</TableCell>
                      <TableCell>{teacher.subject}</TableCell>
                      <TableCell>{teacher.class_assigned}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          teacher.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {teacher.is_active ? 'सक्रिय' : 'निष्क्रिय'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(teacher)}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(teacher.id)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}