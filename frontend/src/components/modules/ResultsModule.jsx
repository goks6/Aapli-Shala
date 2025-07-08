import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useApp } from '../../context/AppContext'
import { Trophy, FileText, ArrowUpDown, Download } from 'lucide-react'

export default function ResultsModule() {
  const { state } = useApp()
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedExam, setSelectedExam] = useState('')
  const [students, setStudents] = useState([])
  const [results, setResults] = useState([])
  const [sortBy, setSortBy] = useState('rank')
  const [sortOrder, setSortOrder] = useState('asc')
  
  const classes = ['1 ली', '2 री', '3 री', '4 थी', '5 वी', '6 वी', '7 वी', '8 वी']
  const examTypes = ['प्रथम सत्र', 'द्वितीय सत्र', 'वार्षिक']
  const subjects = ['मराठी', 'हिंदी', 'इंग्रजी', 'गणित', 'विज्ञान', 'सामाजिक शास्त्र']

  useEffect(() => {
    loadStudents()
  }, [selectedClass])
  
  useEffect(() => {
    if (selectedClass && selectedExam) {
      loadResults()
    } else {
      setResults([])
    }
  }, [selectedClass, selectedExam, students])

  const loadStudents = () => {
    try {
      const savedStudents = JSON.parse(localStorage.getItem('students') || '[]')
      
      if (selectedClass) {
        setStudents(savedStudents.filter(student => student.class === selectedClass))
      } else {
        setStudents([])
      }
    } catch (error) {
      console.error('Error loading students:', error)
      setStudents([])
    }
  }
  
  const loadResults = () => {
    try {
      if (!students.length) return
      
      const studentResults = students.map(student => {
        const subjectMarks = {}
        let totalMarks = 0
        let maxMarks = 0
        
        subjects.forEach(subject => {
          const marksKey = `marks_${selectedClass}_${selectedExam}_${subject}`
          try {
            const marksData = JSON.parse(localStorage.getItem(marksKey) || '{}')
            const studentMarks = marksData.marks?.[student.id] || 0
            const subjectMaxMarks = marksData.maxMarks || 100
            
            subjectMarks[subject] = {
              marks: studentMarks,
              maxMarks: subjectMaxMarks,
              percentage: (studentMarks / subjectMaxMarks * 100).toFixed(1)
            }
            
            totalMarks += studentMarks
            maxMarks += subjectMaxMarks
          } catch (e) {
            subjectMarks[subject] = { marks: 0, maxMarks: 100, percentage: '0.0' }
          }
        })
        
        const percentage = maxMarks > 0 ? (totalMarks / maxMarks * 100).toFixed(1) : '0.0'
        const grade = getGrade(percentage)
        const isPassed = parseFloat(percentage) >= 40
        
        return {