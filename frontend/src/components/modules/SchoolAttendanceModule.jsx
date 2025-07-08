import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Calendar, BarChart3, BarChart2, Download } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function SchoolAttendanceModule() {
  const { state } = useApp()
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [attendanceData, setAttendanceData] = useState({})
  const [classes, setClasses] = useState(['1 ली', '2 री', '3 री', '4 थी', '5 वी', '6 वी', '7 वी', '8 वी'])
  
  const months = [
    { value: '01', label: 'जानेवारी' },
    { value: '02', label: 'फेब्रुवारी' },
    { value: '03', label: 'मार्च' },
    { value: '04', label: 'एप्रिल' },
    { value: '05', label: 'मे' },
    { value: '06', label: 'जून' },
    { value: '07', label: 'जुलै' },
    { value: '08', label: 'ऑगस्ट' },
    { value: '09', label: 'सप्टेंबर' },
    { value: '10', label: 'ऑक्टोबर' },
    { value: '11', label: 'नोव्हेंबर' },
    { value: '12', label: 'डिसेंबर' }
  ]
  
  // Initialize years (current year and previous 2 years)
  const years = [
    (new Date().getFullYear()).toString(),
    (new Date().getFullYear() - 1).toString(),
    (new Date().getFullYear() - 2).toString()
  ]

  useEffect(() => {
    // If no month is selected, set current month
    if (!selectedMonth) {
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0')
      setSelectedMonth(currentMonth)
    }
    
    loadAttendanceData()
  }, [selectedClass, selectedMonth, selectedYear])

  const loadAttendanceData = () => {
    if (!selectedMonth || !selectedYear) return
    
    try {
      const classesToLoad = selectedClass ? [selectedClass] : classes
      const results = {}
      
      classesToLoad.forEach(className => {
        const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate()
        const monthData = { totalStudents: 0, days: {} }
        
        // Get student count for the class
        try {
          const savedStudents = JSON.parse(localStorage.getItem('students') || '[]')
          const classStudents = savedStudents.filter(student => student.class === className)
          monthData.totalStudents = classStudents.length
          
          // For each day in month, get attendance data
          for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${selectedYear}-${selectedMonth}-${day.toString().padStart(2, '0')}`
            const attendanceKey = `attendance_${className}_${dateString}`
            
            try {
              const dayAttendance = JSON.parse(localStorage.getItem(attendanceKey) || '{}')
              const presentCount = Object.values(dayAttendance).filter(Boolean).length
              
              monthData.days[day] = {
                total: classStudents.length,
                present: presentCount,
                absent: classStudents.length - presentCount,
                percentage: classStudents.length > 0 
                  ? ((presentCount / classStudents.length) * 100).toFixed(1)
                  : '0.0'
              }
            } catch (e) {
              monthData.days[day] = { total: classStudents.length, present: 0, absent: classStudents.length, percentage: '0.0' }
            }
          }
        } catch (e) {
          monthData.totalStudents = 0
        }
        
        results[className] = monthData
      })
      
      setAttendanceData(results)
    } catch (error) {
      console.error('Error loading attendance data:', error)
    }
  }

  const getDaysArray = () => {
    if (!selectedMonth || !selectedYear) return []
    
    const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }

  const getClassAttendanceAverage = (className) => {
    if (!attendanceData[className]) return '0.0'
    
    const days = attendanceData[className].days
    const validDays = Object.values(days).filter(day => day.total > 0)
    
    if (validDays.length === 0) return '0.0'
    
    const totalPercentage = validDays.reduce((sum, day) => sum + parseFloat(day.percentage), 0)
    return (totalPercentage / validDays.length).toFixed(1)
  }

  const getSchoolAttendanceAverage = () => {
    const classAverages = classes
      .filter(className => attendanceData[className])
      .map(className => parseFloat(getClassAttendanceAverage(className)))
    
    if (classAverages.length === 0) return '0.0'
    
    const totalAverage = classAverages.reduce((sum, avg) => sum + avg, 0)
    return (totalAverage / classAverages.length).toFixed(1)
  }

  const handleDownloadReport = () => {
    alert('अहवाल डाउनलोड फंक्शन विकसित केले जात आहे.')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            शाळेची हजेरी
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label>इयत्ता</Label>
              <Select 
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="सर्व इयत्ता" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">सर्व इयत्ता</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>महिना</Label>
              <Select 
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger>
                  <SelectValue placeholder="महिना निवडा" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>वर्ष</Label>
              <Select 
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="वर्ष निवडा" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">एकूण उपस्थिती</p>
                  <p className="text-2xl font-bold">{getSchoolAttendanceAverage()}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">महिना</p>
                  <p className="text-2xl font-bold">
                    {months.find(m => m.value === selectedMonth)?.label || ''}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleDownloadReport}
                >
                  <Download className="h-4 w-4" />
                  अहवाल डाउनलोड करा
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Class-wise Attendance */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">वर्ग-निहाय उपस्थिती</h3>
            
            {selectedClass ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>दिनांक</TableHead>
                      <TableHead className="text-right">एकूण विद्यार्थी</TableHead>
                      <TableHead className="text-right">उपस्थित</TableHead>
                      <TableHead className="text-right">अनुपस्थित</TableHead>
                      <TableHead className="text-right">टक्केवारी</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getDaysArray().map(day => {
                      const dayData = attendanceData[selectedClass]?.days[day] || {
                        total: 0, present: 0, absent: 0, percentage: '0.0'
                      }
                      
                      return (
                        <TableRow key={day}>
                          <TableCell>{day} {months.find(m => m.value === selectedMonth)?.label}</TableCell>
                          <TableCell className="text-right">{dayData.total}</TableCell>
                          <TableCell className="text-right text-green-600">{dayData.present}</TableCell>
                          <TableCell className="text-right text-red-600">{dayData.absent}</TableCell>
                          <TableCell className="text-right font-medium">{dayData.percentage}%</TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow className="bg-gray-50 font-semibold">
                      <TableCell>एकूण सरासरी</TableCell>
                      <TableCell className="text-right">{attendanceData[selectedClass]?.totalStudents || 0}</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">{getClassAttendanceAverage(selectedClass)}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>इयत्ता</TableHead>
                      <TableHead className="text-right">एकूण विद्यार्थी</TableHead>
                      <TableHead className="text-right">सरासरी उपस्थिती</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map(className => (
                      <TableRow key={className}>
                        <TableCell className="font-medium">{className}</TableCell>
                        <TableCell className="text-right">{attendanceData[className]?.totalStudents || 0}</TableCell>
                        <TableCell className="text-right">{getClassAttendanceAverage(className)}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50 font-semibold">
                      <TableCell>एकूण</TableCell>
                      <TableCell className="text-right">
                        {classes.reduce((total, className) => 
                          total + (attendanceData[className]?.totalStudents || 0), 0
                        )}
                      </TableCell>
                      <TableCell className="text-right">{getSchoolAttendanceAverage()}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}