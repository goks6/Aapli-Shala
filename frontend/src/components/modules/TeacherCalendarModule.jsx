import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight } from 'lucide-react'

export default function TeacherCalendarModule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [holidays, setHolidays] = useState([])
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)

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

  const loadHolidays = () => {
    try {
      const savedHolidays = localStorage.getItem('holidays')
      if (savedHolidays) {
        setHolidays(JSON.parse(savedHolidays))
      } else {
        // Set some default holidays
        const defaultHolidays = [
          { date: '2025-01-26', name: 'प्रजासत्ताक दिन' },
          { date: '2025-08-15', name: 'स्वातंत्र्य दिन' },
          { date: '2025-10-02', name: 'महात्मा गांधी जयंती' }
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
          <div className="mt-4 flex items-center space-x-
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

          {/* Selected date details */}
          {selectedDate && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">
                {new Date(selectedDate).toLocaleDateString('mr-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              
              {isHoliday(selectedDate) && (
                <div className="mb-2 p-2 bg-red-50 text-red-800 rounded">
                  <span className="font-medium">सुट्टी: </span>
                  {getHolidayName(selectedDate)}
                </div>
              )}
              
              {events
                .filter(event => event.date === selectedDate)
                .map(event => (
                  <div key={event.id} className="mb-2 p-2 bg-green-50 text-green-800 rounded">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm">{event.description}</div>
                  </div>
                ))
              }
              
              {!isHoliday(selectedDate) && events.filter(event => event.date === selectedDate).length === 0 && (
                <p className="text-gray-500">या दिवशी कोणतेही विशेष कार्यक्रम नाहीत.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}