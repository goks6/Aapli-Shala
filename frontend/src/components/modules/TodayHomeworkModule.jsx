import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApp } from '../../context/AppContext'
import { BookOpen, Plus, Trash2 } from 'lucide-react'

export default function TodayHomeworkModule() {
  const { state } = useApp()
  const [homework, setHomework] = useState([])
  const [newHomework, setNewHomework] = useState({
    subject: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [subjects, setSubjects] = useState(['मराठी', 'हिंदी', 'इंग्रजी', 'गणित', 'विज्ञान', 'सामाजिक शास्त्र'])
  const [error, setError] = useState('')

  useEffect(() => {
    loadHomework()
  }, [state.currentClass])

  const loadHomework = () => {
    if (!state.currentClass) return
    
    try {
      const savedHomework = localStorage.getItem(`homework_${state.currentClass}`)
      if (savedHomework) {
        setHomework(JSON.parse(savedHomework))
      } else {
        localStorage.setItem(`homework_${state.currentClass}`, JSON.stringify([]))
      }
    } catch (error) {
      console.error('Error loading homework:', error)
      setHomework([])
    }
  }

  const handleAddHomework = () => {
    if (!newHomework.subject) {
      setError('कृपया विषय निवडा')
      return
    }
    
    if (!newHomework.description.trim()) {
      setError('कृपया अभ्यासाचे वर्णन करा')
      return
    }

    try {
      const homeworkEntry = {
        id: Date.now(),
        ...newHomework,
        createdAt: new Date().toISOString()
      }
      
      const updatedHomework = [...homework, homeworkEntry]
      setHomework(updatedHomework)
      localStorage.setItem(`homework_${state.currentClass}`, JSON.stringify(updatedHomework))
      
      // Reset form
      setNewHomework({
        subject: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      setError('')
    } catch (error) {
      console.error('Error adding homework:', error)
      setError('अभ्यास जोडताना त्रुटी')
    }
  }

  const handleDeleteHomework = (id) => {
    if (confirm('हा अभ्यास काढायचा आहे का?')) {
      try {
        const updatedHomework = homework.filter(hw => hw.id !== id)
        setHomework(updatedHomework)
        localStorage.setItem(`homework_${state.currentClass}`, JSON.stringify(updatedHomework))
      } catch (error) {
        console.error('Error deleting homework:', error)
        setError('अभ्यास काढताना त्रुटी')
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            आजचा अभ्यास
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>विषय</Label>
              <Select 
                value={newHomework.subject}
                onValueChange={(value) => setNewHomework({...newHomework, subject: value})}
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
              <Label>दिनांक</Label>
              <Input 
                type="date" 
                value={newHomework.date}
                onChange={(e) => setNewHomework({...newHomework, date: e.target.value})}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <Label>अभ्यासाचे वर्णन</Label>
            <Textarea 
              placeholder="अभ्यासाचे वर्णन प्रविष्ट करा..."
              rows={3}
              value={newHomework.description}
              onChange={(e) => setNewHomework({...newHomework, description: e.target.value})}
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <Button 
            className="flex items-center gap-1"
            onClick={handleAddHomework}
          >
            <Plus className="h-4 w-4" /> अभ्यास जोडा
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>अभ्यासाची यादी</CardTitle>
        </CardHeader>
        <CardContent>
          {homework.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              अभ्यासाची यादी रिकामी आहे
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>अनु. क्र.</TableHead>
                    <TableHead>विषय</TableHead>
                    <TableHead>दिनांक</TableHead>
                    <TableHead>अभ्यासाचे वर्णन</TableHead>
                    <TableHead>कार्य</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {homework.map((hw, index) => (
                    <TableRow key={hw.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{hw.subject}</TableCell>
                      <TableCell>{new Date(hw.date).toLocaleDateString('mr-IN')}</TableCell>
                      <TableCell>{hw.description}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHomework(hw.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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