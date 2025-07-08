import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApp } from '../../context/AppContext'
import { BookOpen, Search, Download, Eye } from 'lucide-react'

export default function GeneralRegisterModule() {
  const { state } = useApp()
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [generalRegisterNumbers, setGeneralRegisterNumbers] = useState({})
  const [detailView, setDetailView] = useState(null)
  
  const classes = ['1 ली', '2 री', '3 री', '4 थी', '5 वी', '6 वी', '7 वी', '8 वी']

  useEffect(() => {
    loadStudents()
    loadGeneralRegisterNumbers()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, selectedClass])

  const loadStudents = () => {
    try {
      const savedStudents = localStorage.getItem('students')
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents))
      }
    } catch (error) {
      console.error('Error loading students:', error)
      setStudents([])
    }
  }

  const loadGeneralRegisterNumbers = () => {
    try {
      const savedNumbers = localStorage.getItem('general_register_numbers')
      if (savedNumbers) {
        setGeneralRegisterNumbers(JSON.parse(savedNumbers))
      } else {
        localStorage.setItem('general_register_numbers', JSON.stringify({}))
      }
    } catch (error) {
      console.error('Error loading GR numbers:', error)
      setGeneralRegisterNumbers({})
    }
  }

  const filterStudents = () => {
    let filtered = [...students]
    
    // Filter by class
    if (selectedClass) {
      filtered = filtered.filter(student => student.class === selectedClass)
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(term) ||
        student.father_name.toLowerCase().includes(term) ||
        (student.roll_number && student.roll_number.toString().includes(term)) ||
        (generalRegisterNumbers[student.id] && generalRegisterNumbers[student.id].toString().includes(term))
      )
    }
    
    setFilteredStudents(filtered)
  }

  const assignGeneralRegisterNumber = (studentId) => {
    // Find the highest GR number currently assigned
    const highestGR = Object.values(generalRegisterNumbers).reduce((max, num) => 
      Math.max(max, num), 0)
    
    // Assign the next number
    const newGR = highestGR + 1
    
    const updatedNumbers = {
      ...generalRegisterNumbers,
      [studentId]: newGR
    }
    
    setGeneralRegisterNumbers(updatedNumbers)
    localStorage.setItem('general_register_numbers', JSON.stringify(updatedNumbers))
  }

  const getGenderInMarathi = (gender) => {
    return gender === 'male' ? 'पुरुष' : 
           gender === 'female' ? 'स्त्री' : 'इतर'
  }

  const handleViewDetails = (student) => {
    setDetailView(student)
  }

  const handleCloseDetails = () => {
    setDetailView(null)
  }

  const handleDownloadPDF = () => {
    alert('PDF डाउनलोड फंक्शन विकसित केला जात आहे.')
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            जनरल रजिस्टर
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
            
            <div className="md:col-span-2">
              <Label>शोधा</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="नाव, अनुक्रमांक किंवा जनरल रजिस्टर क्रमांक द्वारे शोधा"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          {detailView ? (
            <div className="bg-white rounded-lg p-6 border">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-semibold">विद्यार्थी तपशील</h3>
                <Button variant="outline" size="sm" onClick={handleCloseDetails}>
                  बंद करा
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">जनरल रजिस्टर क्रमांक</p>
                  <p className="font-medium text-lg">
                    {generalRegisterNumbers[detailView.id] || 'अद्याप नियुक्त नाही'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">विद्यार्थ्याचे नाव</p>
                  <p className="font-medium text-lg">{detailView.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">वडिलांचे नाव</p>
                  <p className="font-medium">{detailView.father_name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">आईचे नाव</p>
                  <p className="font-medium">{detailView.mother_name || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">इयत्ता</p>
                  <p className="font-medium">{detailView.class}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">अनुक्रमांक</p>
                  <p className="font-medium">{detailView.roll_number}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">जन्मतारीख</p>
                  <p className="font-medium">
                    {detailView.date_of_birth ? 
                      new Date(detailView.date_of_birth).toLocaleDateString('mr-IN') : 
                      '-'
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">मोबाईल क्रमांक</p>
                  <p className="font-medium">{detailView.mobile || '-'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">पत्ता</p>
                  <p className="font-medium">{detailView.address || '-'}</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={handleDownloadPDF}
                >
                  <Download className="h-4 w-4" />
                  प्रमाणपत्र डाउनलोड करा
                </Button>
              </div>
            </div>
          ) : (
            <>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {students.length === 0 ? 
                    'कोणतेही विद्यार्थी आढळले नाहीत' : 
                    'शोध निकषांशी जुळणारे विद्यार्थी आढळले नाहीत'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>GR क्र.</TableHead>
                        <TableHead>विद्यार्थ्याचे नाव</TableHead>
                        <TableHead>वडिलांचे नाव</TableHead>
                        <TableHead>इयत्ता</TableHead>
                        <TableHead>अनुक्रमांक</TableHead>
                        <TableHead>जन्मतारीख</TableHead>
                        <TableHead>कार्य</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            {generalRegisterNumbers[student.id] || (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => assignGeneralRegisterNumber(student.id)}
                              >
                                नियुक्त करा
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.father_name}</TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell>{student.roll_number}</TableCell>
                          <TableCell>
                            {student.date_of_birth ? 
                              new Date(student.date_of_birth).toLocaleDateString('mr-IN') : 
                              '-'
                            }
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(student)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              तपशील
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}