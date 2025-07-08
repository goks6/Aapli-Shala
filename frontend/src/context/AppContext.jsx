import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext()

const initialState = {
  user: null,
  schoolData: null,
  currentClass: null,
  students: [],
  teachers: [],
  attendance: {},
  homework: [],
  notices: [],
  holidays: []
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_SCHOOL_DATA':
      return { ...state, schoolData: action.payload }
    case 'SET_CURRENT_CLASS':
      return { ...state, currentClass: action.payload }
    case 'SET_STUDENTS':
      return { ...state, students: action.payload }
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.payload] }
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(student =>
          student.id === action.payload.id ? action.payload : student
        )
      }
    case 'SET_TEACHERS':
      return { ...state, teachers: action.payload }
    case 'ADD_TEACHER':
      return { ...state, teachers: [...state.teachers, action.payload] }
    case 'SET_ATTENDANCE':
      return { ...state, attendance: action.payload }
    case 'UPDATE_ATTENDANCE':
      return {
        ...state,
        attendance: { ...state.attendance, ...action.payload }
      }
    case 'ADD_HOMEWORK':
      return { ...state, homework: [...state.homework, action.payload] }
    case 'ADD_NOTICE':
      return { ...state, notices: [...state.notices, action.payload] }
    case 'ADD_HOLIDAY':
      return { ...state, holidays: [...state.holidays, action.payload] }
    case 'LOGOUT':
      return { ...state, user: null, currentClass: null }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  // localStorage मधून initial state लोड करा
  const loadedState = JSON.parse(localStorage.getItem('appState')) || initialState;
  const [state, dispatch] = useReducer(appReducer, loadedState);

  // state बदलल्यावर localStorage मध्ये सेव्ह करा
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}