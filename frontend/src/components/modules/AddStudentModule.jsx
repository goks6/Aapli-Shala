import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, UserPlus } from 'lucide-react'

export default function AddStudentModule() {
  const [students, setStudents] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    roll_number: '',
    father_name: '',
    mother_name: '',
    mobile: '',
    address: '',
    date_of_birth: ''
  })
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const classes = ['1 ली', '2 री', '3 री', '4 थी', '5 वी', '6 वी', '7 वी', '8 वी']

  useEffect(() => {
    fetchStudents()
  }, [])

  const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.token
  }

  const fetchStudents = async () => {
    try {
      // Try to fetch from localStorage first
      const savedStudents = localStorage.getItem('students')
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents))
        return
      }
      
      // If nothing in localStorage, try API (as a fallback)
      const token = getAuthToken()
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
        // Save to localStorage for offline access
        localStorage.setItem('students', JSON.stringify(data.students || []))
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      // Initialize empty array if both methods fail
      if (!localStorage.getItem('students')) {
        localStorage.setItem('students', JSON.stringify([]))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'विद्यार्थ्याचे नाव आवश्यक आहे'
    }

    if (!formData.class) {
      newErrors.class = 'इयत्ता निवडा'
    }

    if (!formData.roll_number.trim()) {
      newErrors.roll_number = 'अनुक्रमांक आवश्यक आहे'
    } else {
      // Check for duplicate roll number in same class
      const existingStudent = students.find(s => 
        s.class === formData.class && 
        s.roll_number === formData.roll_number && 
        s.id !== editingId
      )
      if (existingStudent) {
        newErrors.roll_number = 'या इयत्तेत हा अनुक्रमांक आधीच वापरला आहे'
      }
    }

    if (!formData.father_name.trim()) {
      newErrors.father_name = 'वडिलांचे नाव आवश्यक आहे'
    }

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'मोबाईल क्रमांक 10 अंकी असावा'
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

    try {
      // Create student data object
      const studentData = {
        ...formData,
        id: editingId || Date.now(),
        created_at: new Date().toISOString(),
        is_active: true
      }

      // Update local state
      let updatedStudents;
      if (editingId) {
        updatedStudents = students.map(s => s.id === editingId ? studentData : s)
      } else {
        updatedStudents = [...students, studentData]
      }
      
      setStudents(updatedStudents)
      localStorage.setItem('students', JSON.stringify(updatedStudents))
      
      // Try API call (optional)
      try {
        const token = getAuthToken()
        const method = editingId ? 'PUT' : 'POST'
        const url = editingId ? `/api/students/${editingId}` : '/api/students'
        
        await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        })
      } catch (apiError) {
        console.log('API call failed, but local data was saved', apiError)
        // This is fine - we've already updated localStorage
      }
      
      resetForm()
      alert(editingId ? 'विद्यार्थी यशस्वीरित्या अपडेट केला' : 'विद्यार्थी यशस्वीरित्या जोडला')
    } catch (error) {
      console.error('Error saving student:', error)
      alert('विद्यार्थी जतन करताना त्रुटी. कृपया पुन्हा प्रयत्न करा.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      class: '',
      roll_number: '',
      father_name: '',
      mother_name: '',
      mobile: '',
      address: '',
      date_of_birth: ''
    })
    setErrors({})
    setEditingId(null)
  }

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      class: student.class,
      roll_number: student.roll_number,
      father_name: student.father_name,
      mother_name: student.mother_name || '',
      mobile: student.mobile || '',
      address: student.address || '',
      date_of_birth: student.date_of_birth || ''
    })
    setEditingId(student.id)
    setErrors({})
	}

  const handleDelete = async (studentId) => {
    if (confirm('या विद्यार्थ्याची माहिती काढायची आहे का?')) {
      try {
        // Update local state first
        const updatedStudents = students.filter(s => s.id !== studentId)
        setStudents(updatedStudents)
        localStorage.setItem('students', JSON.stringify(updatedStudents))
        alert('विद्यार्थी यशस्वीरित्या काढला')
        
        // Try API call (optional)
        try {
          const token = getAuthToken()
          await fetch(`/api/students/${studentId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        } catch (apiError) {
          console.log('API call failed, but local data was updated', apiError)
          // This is fine - we've already updated localStorage
        }
      } catch (error) {
        console.error('Error deleting student:', error)
        alert('विद्यार्थी काढताना त्रुटी. कृपया पुन्हा प्रयत्न करा.')
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
      {/* Add Student Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            विद्यार्थी जोडा
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">विद्यार्थ्याचे नाव *</Label>
                <Input
                  id="studentName"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="विद्यार्थ्याचे नाव प्रविष्ट करा"
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label>इयत्ता *</Label>
                <Select 
                  value={formData.class} 
                  onValueChange={(value) => handleInputChange('class', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.class ? 'border-red-500' : ''}>
                    <SelectValue placeholder="इयत्ता निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.class && (
                  <p className="text-red-500 text-sm mt-1">{errors.class}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rollNumber">अनुक्रमांक *</Label>
                <Input
                  id="rollNumber"
                  value={formData.roll_number}
                  onChange={(e) => handleInputChange('roll_number', e.target.value)}
                  placeholder="अनुक्रमांक प्रविष्ट करा"
                  className={errors.roll_number ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.roll_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.roll_number}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dateOfBirth">जन्मतारीख</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fatherName">वडिलांचे नाव *</Label>
                <Input
                  id="fatherName"
                  value={formData.father_name}
                  onChange={(e) => handleInputChange('father_name', e.target.value)}
                  placeholder="वडिलांचे नाव प्रविष्ट करा"
                  className={errors.father_name ? 'border-red-500' : ''}
                  disabled={isLoading}
                />
                {errors.father_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.father_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="motherName">आईचे नाव</Label>
                <Input
                  id="motherName"
                  value={formData.mother_name}
                  onChange={(e) => handleInputChange('mother_name', e.target.value)}
                  placeholder="आईचे नाव प्रविष्ट करा"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mobile">मोबाईल क्रमांक (10 अंकी)</Label>
                <Input
                  id="mobile"
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
              </div>

              <div>
                <Label htmlFor="address">पत्ता</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="पत्ता प्रविष्ट करा"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'जोडत आहे...' : editingId ? 'विद्यार्थी अपडेट करा' : 'विद्यार्थी जोडा'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>
                रीसेट करा
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>विद्यार्थ्यांची यादी ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              अजून कोणतेही विद्यार्थी जोडलेले नाहीत
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>अनु. क्र.</TableHead>
                    <TableHead>विद्यार्थ्याचे नाव</TableHead>
                    <TableHead>इयत्ता</TableHead>
                    <TableHead>अनुक्रमांक</TableHead>
                    <TableHead>वडिलांचे नाव</TableHead>
                    <TableHead>मोबाईल क्र.</TableHead>
                    <TableHead>कार्य</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.roll_number}</TableCell>
                      <TableCell>{student.father_name}</TableCell>
                      <TableCell>{student.mobile || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(student)}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
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