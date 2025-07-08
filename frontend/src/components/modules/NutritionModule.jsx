import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApp } from '../../context/AppContext'
import { UtensilsCrossed, Plus, Trash2, Save } from 'lucide-react'

export default function NutritionModule() {
  const { state } = useApp()
  const [mealPlans, setMealPlans] = useState([])
  const [selectedDay, setSelectedDay] = useState('')
  const [formData, setFormData] = useState({
    day: '',
    breakfast: '',
    lunch: '',
    comments: ''
  })
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const weekdays = [
    { value: 'monday', label: 'सोमवार' },
    { value: 'tuesday', label: 'मंगळवार' },
    { value: 'wednesday', label: 'बुधवार' },
    { value: 'thursday', label: 'गुरुवार' },
    { value: 'friday', label: 'शुक्रवार' },
    { value: 'saturday', label: 'शनिवार' }
  ]

  useEffect(() => {
    loadMealPlans()
  }, [])

  const loadMealPlans = () => {
    try {
      const savedMealPlans = localStorage.getItem('meal_plans')
      if (savedMealPlans) {
        setMealPlans(JSON.parse(savedMealPlans))
      } else {
        localStorage.setItem('meal_plans', JSON.stringify([]))
      }
    } catch (error) {
      console.error('Error loading meal plans:', error)
      setMealPlans([])
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.day) {
      newErrors.day = 'कृपया दिवस निवडा'
    } else if (!editingId) {
      // Check for duplicate day (only when adding new, not when editing)
      const existingDay = mealPlans.find(plan => 
        plan.day === formData.day && plan.id !== editingId
      )
      if (existingDay) {
        newErrors.day = 'या दिवसाचे जेवणाचे नियोजन आधीच जोडले आहे'
      }
    }

    if (!formData.breakfast.trim()) {
      newErrors.breakfast = 'कृपया नाश्ताचे वर्णन करा'
    }

    if (!formData.lunch.trim()) {
      newErrors.lunch = 'कृपया जेवणाचे वर्णन करा'
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
      const mealPlanData = {
        ...formData,
        id: editingId || Date.now()
      }

      let updatedMealPlans
      if (editingId) {
        updatedMealPlans = mealPlans.map(plan => plan.id === editingId ? mealPlanData : plan)
      } else {
        updatedMealPlans = [...mealPlans, mealPlanData]
      }
      
      setMealPlans(updatedMealPlans)
      localStorage.setItem('meal_plans', JSON.stringify(updatedMealPlans))
      
      resetForm()
      setIsLoading(false)
    } catch (error) {
      console.error('Error saving meal plan:', error)
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      day: '',
      breakfast: '',
      lunch: '',
      comments: ''
    })
    setErrors({})
    setEditingId(null)
  }

  const handleEdit = (plan) => {
    setFormData({
      day: plan.day,
      breakfast: plan.breakfast,
      lunch: plan.lunch,
      comments: plan.comments || ''
    })
    setEditingId(plan.id)
    setErrors({})
  }

  const handleDelete = (id) => {
    if (confirm('हे जेवणाचे नियोजन काढायचे आहे का?')) {
      try {
        const updatedMealPlans = mealPlans.filter(plan => plan.id !== id)
        setMealPlans(updatedMealPlans)
        localStorage.setItem('meal_plans', JSON.stringify(updatedMealPlans))
      } catch (error) {
        console.error('Error deleting meal plan:', error)
      }
    }
  }

  const getDayLabel = (dayValue) => {
    const day = weekdays.find(d => d.value === dayValue)
    return day ? day.label : dayValue
  }

  const filteredMealPlans = selectedDay 
    ? mealPlans.filter(plan => plan.day === selectedDay)
    : mealPlans

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            दैनिक पोषण आहार
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>दिवस</Label>
                <Select 
                  value={formData.day} 
                  onValueChange={(value) => setFormData({...formData, day: value})}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.day ? 'border-red-500' : ''}>
                    <SelectValue placeholder="दिवस निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekdays.map(day => (
                      <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.day && (
                  <p className="text-red-500 text-sm mt-1">{errors.day}</p>
                )}
              </div>
            </div>

            <div>
              <Label>नाश्ता</Label>
              <Textarea
                value={formData.breakfast}
                onChange={(e) => setFormData({...formData, breakfast: e.target.value})}
                placeholder="नाश्त्याचे वर्णन करा..."
                rows={2}
                className={errors.breakfast ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.breakfast && (
                <p className="text-red-500 text-sm mt-1">{errors.breakfast}</p>
              )}
            </div>

            <div>
              <Label>जेवण</Label>
              <Textarea
                value={formData.lunch}
                onChange={(e) => setFormData({...formData, lunch: e.target.value})}
                placeholder="जेवणाचे वर्णन करा..."
                rows={2}
                className={errors.lunch ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.lunch && (
                <p className="text-red-500 text-sm mt-1">{errors.lunch}</p>
              )}
            </div>

            <div>
              <Label>अतिरिक्त टिप्पणी</Label>
              <Textarea
                value={formData.comments}
                onChange={(e) => setFormData({...formData, comments: e.target.value})}
                placeholder="अतिरिक्त टिप्पणी प्रविष्ट करा (ऐच्छिक)..."
                rows={2}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex items-center gap-1"
                disabled={isLoading}
              >
                {editingId ? (
                  <>
                    <Save className="h-4 w-4" />
                    अपडेट करा
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    जोडा
                  </>
                )}
              </Button>
              {editingId && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  रद्द करा
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>सर्व आहार नियोजन</CardTitle>
            <Select 
              value={selectedDay}
              onValueChange={setSelectedDay}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="सर्व दिवस" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">सर्व दिवस</SelectItem>
                {weekdays.map(day => (
                  <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMealPlans.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              कोणतेही आहार नियोजन आढळले नाही
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMealPlans
                .sort((a, b) => {
                  const dayOrder = {
                    'monday': 1,
                    'tuesday': 2,
                    'wednesday': 3,
                    'thursday': 4,
                    'friday': 5,
                    'saturday': 6
                  }
                  return dayOrder[a.day] - dayOrder[b.day]
                })
                .map(plan => (
                  <Card key={plan.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-blue-900">
                          {getDayLabel(plan.day)}
                        </h3>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                            className="h-8 px-2"
                          >
                            संपादित करा
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(plan.id)}
                            className="text-red-600 hover:text-red-800 h-8 px-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">नाश्ता</p>
                          <p className="mt-1">{plan.breakfast}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">जेवण</p>
                          <p className="mt-1">{plan.lunch}</p>
                        </div>
                      </div>
                      
                      {plan.comments && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-500">टिप्पणी</p>
                          <p className="mt-1 text-gray-600">{plan.comments}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}