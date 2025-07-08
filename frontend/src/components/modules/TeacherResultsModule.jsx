
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, Save, RotateCcw } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function TeacherResultsModule() {
  const { state } = useApp()
  const [students, setStudents] = useState([])
  const [examTypes, setExamTypes] = useState(['प्रथम सत्र', 'द्वितीय सत्र', 'वार्षिक'])
  const [subjects, setSubjects] = useState(['मराठी', 'हिंदी', 'इंग्रजी', 'गणित', 'विज्ञान', 'सामाजिक शास्त्र'])
  const [selectedExam, setSelectedExam] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [marks, setMarks] = useState({})
  const [maxMarks, setMaxMarks] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  useEffect(() => {
    loadStudents()
  }, [state.currentClass])
  
  useEffect(() => {
    if (selectedExam && selectedSubject) {
      loadMarks()
    }
  }, [selectedExam, selectedSubject, state.currentClass])

  const loadStudents = () => {
    if (!state.currentClass) return
    
    try {
      const savedStudents = localStorage.getItem('students')
      if (savedStudents) {
        // Filter students by current class
        const classStudents = JSON.parse(savedStudents).filter(
          student => student.class === state.currentClass
        )
        setStudents(classStudents)
      }
    } catch (error) {
      console.error('Error loading students:', error)
      setStudents([])
    }
  }
  
  const loadMarks = () => {
    if (!state.currentClass || !selectedExam || !selectedSubject) return
    
    try {
      const marksKey = `marks_${state.currentClass}_${selectedExam}_${selectedSubject}`
      const savedMarks = localStorage.getItem(marksKey)
      
      if (savedMarks) {
        const parsedData = JSON.parse(savedMarks)
        setMarks(parsedData.marks || {})
        setMaxMarks(parsedData.maxMarks || 100)
        setIsSaved(true)
      } else {
        // Initialize with empty marks
        setMarks({})
        setMaxMarks(100)
        setIsSaved(false)
      }
    } catch (error) {
      console.error('Error loading marks:', error)
      setMarks({})
      setIsSaved(false)
    }
  }
  
  const handleMarksChange = (studentId, value) => {
    // Validate that marks are within range
    const numValue = parseInt(value) || 0
    const validValue = Math.min(Math.max(0, numValue), maxMarks)
    
    setMarks(prev => ({
      ...prev,
      [studentId]: validValue
    }))
    setIsSaved(false)
  }
  
  const handleMaxMarksChange = (value) => {
    const numValue = parseInt(value) || 0
    setMaxMarks(Math.max(1, numValue))
    setIsSaved(false)
  }
  
  const handleSaveMarks = () => {
    if (!state.currentClass || !selectedExam || !selectedSubject) return
    
    setIsLoading(true)
    
    try {
      const marksKey = `marks_${state.currentClass}_${selectedExam}_${selectedSubject}`
      localStorage.setItem(marksKey, JSON.stringify({
        marks,
        maxMarks,
        updatedAt: new Date().toISOString()
      }))
      setIsSaved(true)
      
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error saving marks:', error)
      setIsLoading(false)
    }
  }
  
  const getPercentage = (studentId) => {
    const studentMarks = marks[studentId] || 0
    return ((studentMarks / maxMarks) * 100).toFixed(1)
  }
  
  const getGrade = (studentId) => {
    const percentage = parseFloat(getPercentage(studentId))
    
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B+'
    if (percentage >= 60) return 'B'
    if (percentage >= 50) return 'C'
    if (percentage >= 40) return 'D'
    return 'F'
  }
  
  const getClassAverage = () => {
    if (students.length === 0) return 0
    
    const total = students.reduce((sum, student) => {
      return sum + (marks[student.id] || 0)
    }, 0)
    
    return (total / students.length).toFixed(1)
  }
  
  const getPassPercentage = () => {
    if (students.length === 0) return 0
    
    const passCount = students.filter(student => {
      return (marks[student.id] || 0) >= (maxMarks * 0.4)
    }).length
    
    return ((passCount / students.length) * 100).toFixed(1)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            निकाल
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label>परीक्षा</Label>
              <Select 
                value={selectedExam}
                onValueChange={setSelectedExam}
              >
                <SelectTrigger>
                  <SelectValue placeholder="परीक्षा निवडा" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map(exam => (
                    <SelectItem key={exam} value={exam}>{exam}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>विषय</Label>
              <Select 
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                disabled={!selectedExam}
              >
                <SelectTrigger>
                  <SelectValue placeholder="विषय निवडा" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>कमाल गुण</Label>
              <Input 
                type="number" 
                min="1"
                value={maxMarks}
                onChange={(e) => handleMaxMarksChange(e.target.value)}
                disabled={!selectedExam || !selectedSubject}
              />
            </div>
          </div>
          
          {selectedExam && selectedSubject ? (
            <>
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  या वर्गात विद्यार्थी उपलब्ध नाहीत
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <div className="flex gap-4">
                      <div>एकूण विद्यार्थी: <span className="font-semibold">{students.length}</span></div>
                      <div>सरासरी: <span className="font-semibold">{getClassAverage()}</span></div>
                      <div>उत्तीर्ण: <span className="font-semibold">{getPassPercentage()}%</span></div>
                    </div>
                    <Button
                      onClick={handleSaveMarks}
                      className="flex items-center gap-1"
                      disabled={isLoading}
                    >
                      {isLoading ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {isSaved ? 'जतन केले' : 'गुण जतन करा'}
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>अनु. क्र.</TableHead>
                          <TableHead>विद्यार्थ्याचे नाव</TableHead>
                          <TableHead>अनुक्रमांक</TableHead>
                          <TableHead className="text-center">प्राप्त गुण</TableHead>
                          <TableHead className="text-center">टक्केवारी</TableHead>
                          <TableHead className="text-center">श्रेणी</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student, index) => (
                          <TableRow key={student.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.roll_number}</TableCell>
                            <TableCell className="text-center">
                              <Input
                                type="number"
                                min="0"
                                max={maxMarks}
                                className="w-20 text-center mx-auto"
                                value={marks[student.id] || ''}
                                onChange={(e) => handleMarksChange(student.id, e.target.value)}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              {getPercentage(student.id)}%
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {getGrade(student.id)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              कृपया परीक्षा आणि विषय निवडा
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
