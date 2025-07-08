import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react'

export default function CalendarModule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [holidays, setHolidays] = useState([])
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: ''
  })
  const [error, setError] = useState('')

  // Month names in Marathi
  const months = [
    'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
    'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
  ]

  // Day names in Marathi
  const days = ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि']

  useEffect(() => {
    loadHolidays()
    loadEvents()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      setNewEvent(prev => ({ ...prev, date: selectedDate }))
    }
  }, [selectedDate])

  const loadHolidays = () => {
    try {
      const savedHolidays = localStorage.getItem('holidays')
      if (savedHolidays) {
        setHolidays(JSON.parse(savedHolidays))
      } else {
        // Set some default holidays
        const defaultHolidays = [
          { id: 1, date: '2025-01-26', name: 'प्रजासत्ताक दिन' },
          { id: 2, date: '2025-08-15', name: 'स्वातंत्र्य दिन' },
          { id: 3, date: '2025-10-02', name: 'महात्मा गांधी जयंती' }
        ]
        localStorage.setItem('holidays', JSON.stringify(defaultHolidays))
        setHolidays(defaultHolidays)
      }
    } catch (error) {
      console.error('Error loading holidays:', error)
      setHolidays([])
    }
  }

  const loadEvents = () => {
    try {
      const savedEvents = localStorage.getItem('events')
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents))
      } else {
        localStorage.setItem('events', JSON.stringify([]))
      }
    } catch (error) {
      console.error('Error loading events:', error)
      setEvents([])
    }
  }

  const handleAddHoliday = () => {
    if (!selectedDate) {
      setError('कृपया तारीख निवडा')
      return
    }

    if (!newEvent.title.trim()) {
      setError('कृपया सुट्टीचे नाव प्रविष्ट करा')
      return
    }

    try {
      const holiday = {
        id: Date.now(),
        date: selectedDate,
        name: newEvent.title
      }

      const updatedHolidays = [...holidays, holiday]
      setHolidays(updatedHolidays)
      localStorage.setItem('holidays', JSON.stringify(updatedHolidays))

      // Reset form
      setNewEvent({
        title: '',
        description: '',
        date: selectedDate
      })
      setError('')
    } catch (error) {
      console.error('Error adding holiday:', error)
      setError('सुट्टी जोडताना त्रुटी')
    }
  }

  const handleAddEvent = () => {
    if (!selectedDate) {
      setError('कृपया तारीख निवडा')
      return
    }

    if (!newEvent.title.trim()) {
      setError('कृपया कार्यक्रमाचे शीर्षक प्रविष्ट करा')
      return
    }

    try {
      const event = {
        id: Date.now(),
        date: selectedDate,
        title: newEvent.title,
        description: newEvent.description
      }

      const updatedEvents = [...events, event]
      setEvents(updatedEvents)
      localStorage.setItem('events', JSON.stringify(updatedEvents))

      // Reset form
      setNewEvent({
        title: '',
        description: '',
        date: selectedDate
      })
      setError('')
    } catch (error) {
      console.error('Error adding event:', error)
      setError('कार्यक्रम जोडताना त्रुटी')
    }
  }

  const handleDeleteHoliday = (id) => {
    if (confirm('ही सुट्टी काढायची आहे का?')) {
      try {
        const updatedHolidays = holidays.filter(holiday => holiday.id !== id)
        setHolidays(updatedHolidays)
        localStorage.setItem('holidays', JSON.stringify(updatedHolidays))
      } catch (error) {
        console.error('Error deleting holiday:', error)
        setError('सुट्टी काढताना त्रुटी')
      }
    }
  }

  const handleDeleteEvent = (id) => {
    if (confirm('हा कार्यक्रम काढायचा आहे का?')) {
      try {
        const updatedEvents = events.filter(event => event.id !== id)
        setEvents(updatedEvents)
        localStorage.setItem('events', JSON.stringify(updatedEvents))
      } catch (error) {
        console.error('Error deleting event:', error)
        setError('कार्यक्रम काढताना त्रुटी')
      }
    }
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const isHoliday = (dateString) => {
    return holidays.some(holiday => holiday.date === dateString)
  }

  const getHolidayName = (dateString) => {
    const holiday = holidays.find(h => h.date === dateString)
    return holiday ? holiday.name : null
  }

  const hasEvents = (dateString) => {
    return events.some(event => event.date === dateString)
  }

  const getDateString = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const handleDateClick = (year, month, day) => {
    const dateString = getDateString(year, month, day)
    setSelectedDate(dateString)
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    // Create blank spaces for days before the first day of the month
    const blanks = Array(firstDay).fill(null).map((_, index) => (
      <div key={`blank-${index}`} className="h-12 border border-gray-100"></div>
    ))

    // Create day cells
    const dayCells = Array(daysInMonth).fill(null).map((_, index) => {
      const day = index + 1
      const dateString = getDateString(year, month, day)
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
      const holiday = isHoliday(dateString)
      const hasEvent = hasEvents(dateString)
      const isSelected = selectedDate === dateString

      return (
        <div 
          key={`day-${day}`} 
          className={`h-12 border border-gray-100 p-1 cursor-pointer transition-colors
            ${isToday ? 'bg-blue-50' : ''}
            ${holiday ? 'bg-red-50' : ''}
            ${hasEvent ? 'bg-green-50' : ''}
            ${isSelected ? 'ring-2 ring-blue-500' : ''}
            hover:bg-gray-50
          `}
          onClick={() => handleDateClick(year, month, day)}
        >
          <div className="flex flex-col h-full">
            <span className={`text-right text-sm ${holiday ? 'text-red-600 font-semibold' : ''}`}>
              {day}
            </span>
            {holiday && (
              <span className="text-xs text-red-600 truncate" title={getHolidayName(dateString)}>
                {getHolidayName(dateString)}
              </span>
            )}
          </div>
        </div>
      )
    })

    // Combine blanks and days
    return [...blanks, ...dayCells]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              कॅलेंडर
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {days.map((day, index) => (
              <div key={day} className={`text-center font-medium py-2 text-sm ${index === 0 ? 'text-red-600' : ''}`}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-50 border border-gray-200 mr-1"></div>
              <span>आज</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-50 border border-gray-200 mr-1"></div>
              <span>सुट्टी</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-50 border border-gray-200 mr-1"></div>
              <span>कार्यक्रम</span>
            </div>
          </div>

          {/* Selected date details and input forms */}
          {selectedDate && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-4">
                  {new Date(selectedDate).toLocaleDateString('mr-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                
                {/* Add Holiday/Event Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>शीर्षक/नाव</Label>
                    <Input 
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="कार्यक्रम किंवा सुट्टीचे नाव"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>वर्णन (ऐच्छिक)</Label>
                    <Input 
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      placeholder="कार्यक्रमाचे वर्णन"
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleAddHoliday}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> सुट्टी जोडा
                  </Button>
                  <Button
                    onClick={handleAddEvent}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> कार्यक्रम जोडा
                  </Button>
                </div>

                {/* Current Day's Entries */}
                <div className="mt-6 space-y-4">
                  {/* Holidays for this day */}
                  {holidays
                    .filter(holiday => holiday.date === selectedDate)
                    .map(holiday => (
                      <div key={holiday.id} className="flex justify-between items-center p-2 bg-red-50 text-red-800 rounded">
                        <div className="font-medium">
                          <span className="mr-2">सुट्टी:</span> 
                          {holiday.name}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  }
                  
                  {/* Events for this day */}
                  {events
                    .filter(event => event.date === selectedDate)
                    .map(event => (
                      <div key={event.id} className="flex justify-between items-center p-2 bg-green-50 text-green-800 rounded">
                        <div>
                          <div className="font-medium">{event.title}</div>
                          {event.description && <div className="text-sm">{event.description}</div>}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  }

                  {holidays.filter(h => h.date === selectedDate).length === 0 && 
                   events.filter(e => e.date === selectedDate).length === 0 && (
                    <p className="text-gray-500 text-sm">या दिवसासाठी कोणतीही नोंद नाही.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Holidays List */}
	  {/* All Holidays List */}
      <Card>
        <CardHeader>
          <CardTitle>सुट्ट्या</CardTitle>
        </CardHeader>
        <CardContent>
          {holidays.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              कोणत्याही सुट्ट्या जोडलेल्या नाहीत
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>अनु. क्र.</TableHead>
                    <TableHead>दिनांक</TableHead>
                    <TableHead>सुट्टीचे नाव</TableHead>
                    <TableHead>कार्य</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((holiday, index) => (
                      <TableRow key={holiday.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {new Date(holiday.date).toLocaleDateString('mr-IN')}
                        </TableCell>
                        <TableCell className="font-medium">{holiday.name}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteHoliday(holiday.id)}
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

      {/* All Events List */}
      <Card>
        <CardHeader>
          <CardTitle>शाळेचे कार्यक्रम</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              कोणतेही कार्यक्रम जोडलेले नाहीत
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>अनु. क्र.</TableHead>
                    <TableHead>दिनांक</TableHead>
                    <TableHead>कार्यक्रमाचे नाव</TableHead>
                    <TableHead>वर्णन</TableHead>
                    <TableHead>कार्य</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((event, index) => (
                      <TableRow key={event.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {new Date(event.date).toLocaleDateString('mr-IN')}
                        </TableCell>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.description || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
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