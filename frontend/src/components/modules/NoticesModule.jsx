import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApp } from '../../context/AppContext'
import { Bell, Plus, Trash2 } from 'lucide-react'

export default function NoticesModule() {
  const { state } = useApp()
  const [notices, setNotices] = useState([])
  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [error, setError] = useState('')

  useEffect(() => {
    loadNotices()
  }, [])

  const loadNotices = () => {
    try {
      const savedNotices = localStorage.getItem('notices')
      if (savedNotices) {
        setNotices(JSON.parse(savedNotices))
      } else {
        localStorage.setItem('notices', JSON.stringify([]))
      }
    } catch (error) {
      console.error('Error loading notices:', error)
      setNotices([])
    }
  }

  const handleAddNotice = () => {
    if (!newNotice.title.trim()) {
      setError('कृपया सूचनेचे शीर्षक प्रविष्ट करा')
      return
    }
    
    if (!newNotice.description.trim()) {
      setError('कृपया सूचनेचे वर्णन प्रविष्ट करा')
      return
    }

    try {
      const noticeEntry = {
        id: Date.now(),
        ...newNotice,
        createdAt: new Date().toISOString(),
        createdBy: state.user?.name || 'अज्ञात'
      }
      
      const updatedNotices = [...notices, noticeEntry]
      setNotices(updatedNotices)
      localStorage.setItem('notices', JSON.stringify(updatedNotices))
      
      // Reset form
      setNewNotice({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      setError('')
    } catch (error) {
      console.error('Error adding notice:', error)
      setError('सूचना जोडताना त्रुटी')
    }
  }

  const handleDeleteNotice = (id) => {
    if (confirm('ही सूचना काढायची आहे का?')) {
      try {
        const updatedNotices = notices.filter(notice => notice.id !== id)
        setNotices(updatedNotices)
        localStorage.setItem('notices', JSON.stringify(updatedNotices))
      } catch (error) {
        console.error('Error deleting notice:', error)
        setError('सूचना काढताना त्रुटी')
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            नवीन सूचना जोडा
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>सूचनेचे शीर्षक</Label>
              <Input 
                placeholder="शीर्षक प्रविष्ट करा"
                value={newNotice.title}
                onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
              />
            </div>
            
            <div>
              <Label>दिनांक</Label>
              <Input 
                type="date" 
                value={newNotice.date}
                onChange={(e) => setNewNotice({...newNotice, date: e.target.value})}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <Label>सूचनेचे वर्णन</Label>
            <Textarea 
              placeholder="सूचनेचे वर्णन प्रविष्ट करा..."
              rows={3}
              value={newNotice.description}
              onChange={(e) => setNewNotice({...newNotice, description: e.target.value})}
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <Button 
            className="flex items-center gap-1"
            onClick={handleAddNotice}
          >
            <Plus className="h-4 w-4" /> सूचना जोडा
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>सूचनांची यादी</CardTitle>
        </CardHeader>
        <CardContent>
          {notices.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              सूचनांची यादी रिकामी आहे
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>अनु. क्र.</TableHead>
                    <TableHead>शीर्षक</TableHead>
                    <TableHead>दिनांक</TableHead>
                    <TableHead>वर्णन</TableHead>
                    <TableHead>प्रकाशक</TableHead>
                    <TableHead>कार्य</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notices.map((notice, index) => (
                    <TableRow key={notice.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{notice.title}</TableCell>
                      <TableCell>{new Date(notice.date).toLocaleDateString('mr-IN')}</TableCell>
                      <TableCell>{notice.description}</TableCell>
                      <TableCell>{notice.createdBy}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotice(notice.id)}
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