import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApp } from '../../context/AppContext'
import { Checkbox } from '@/components/ui/checkbox'
import { Users, Save, RotateCcw } from 'lucide-react'

export default function TodayAttendanceModule() {
  const { state } = useApp()
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  useEffect(() => {
    loadStudents()
    loadAttendance()
  }, [state.currentClass, date])

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

  const loadAttendance = () => {
    if (!state.currentClass || !date) return
    
    try {
      const attendanceKey = `attendance_${state.currentClass}_${date}`
      const savedAttendance = localStorage.getItem(attendanceKey)
      
      if (savedAttendance) {
        setAttendance(JSON.parse(savedAttendance))
        setIsSaved(true)
      } else {
        // Initialize with all students present
        const newAttendance = {}
        students.forEach(student => {
          newAttendance[student.id] = true
        })
        setAttendance(newAttendance)
        setIsSaved(false)
      }
    } catch (error) {
      console.error('Error loading attendance:', error)
      setAttendance({})
      setIsSaved(false)
    }
  }

  const handleAttendanceChange = (studentId, isPresent) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: isPresent
    }))
    setIsSaved(false)
  }

  const handleToggleAll = (isPresent) => {
    const newAttendance = {}
    students.forEach(student => {
      newAttendance[student.id] = isPresent
    })
    setAttendance(newAttendance)
    setIsSaved(false)
  }

  const handleSaveAttendance = () => {
    if (!state.currentClass || !date) return
    
    setIsLoading(true)
    
    try {
      const attendanceKey = `attendance_${state.currentClass}_${date}`
      localStorage.setItem(attendanceKey, JSON.stringify(attendance))
      setIsSaved(true)
      
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error saving attendance:', error)
      setIsLoading(false)
    }
  }

  const handleDateChange = (e) => {
    setDate(e.target.value)
  }

  const getPresentCount = () => {
    return Object.values(attendance).filter(Boolean).length
  }

  const getAbsentCount = () => {
    return students.length - getPresentCount()
  }

  const getAttendancePercentage = () => {
    if (students.length === 0) return 0
    return ((getPresentCount() / students.length) * 100).toFixed(1)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              आजची हजेरी
            </div>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="border rounded-md px-2 py-1 text-sm"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              या वर्गात विद्यार्थी उपलब्ध नाहीत
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4 text-sm">
                  <div>एकूण विद्यार्थी: <span className="font-semibold">{students.length}</span></div>
                  <div>उपस्थित: <span className="font-semibold text-green-600">{getPresentCount()}</span></div>
                  <div>अनुपस्थित: <span className="font-semibold text-red-600">{getAbsentCount()}</span></div>
                  <div>उपस्थिती: <span className="font-semibold">{getAttendancePercentage()}%</span></div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAll(true)}
                  >
                    सर्व उपस्थित
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAll(false)}
                  >
                    सर्व अनुपस्थित
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>अनु. क्र.</TableHead>
                      <TableHead>विद्यार्थ्याचे नाव</TableHead>
                      <TableHead>अनुक्रमांक</TableHead>
                      <TableHead className="text-center">उपस्थिती</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.roll_number}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={!!attendance[student.id]}
                            onCheckedChange={(checked) => handleAttendanceChange(student.id, checked)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSaveAttendance}
            className="flex items-center gap-1"
            disabled={isLoading || students.length === 0}
          >
            {isLoading ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaved ? 'जतन केले' : 'हजेरी जतन करा'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}