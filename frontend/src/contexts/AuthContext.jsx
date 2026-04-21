import { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'

// Create context
const AuthContext = createContext()

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  role: null,
  loading: true,
  isAuthenticated: false
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  LOAD_USER: 'LOAD_USER',
  AUTH_ERROR: 'AUTH_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS'
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token)
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role,
        isAuthenticated: true,
        loading: false
      }
    
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token')
      return {
        ...state,
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        loading: false
      }
    
    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        role: action.payload.role,
        isAuthenticated: true,
        loading: false
      }
    
    case AUTH_ACTIONS.AUTH_ERROR:
      localStorage.removeItem('token')
      return {
        ...state,
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        loading: false
      }
    
    case AUTH_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Create provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Set up axios default headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [state.token])

  // Load user on app start
  useEffect(() => {
    console.log('🚀 AuthContext useEffect triggered!')
    const loadUser = async () => {
      console.log('🚀 AuthContext - Starting user load...')
      const token = localStorage.getItem('token')
      console.log('🔍 Loading user, token found:', !!token)
      console.log('🔍 Token value:', token)
      
      if (token) {
        try {
          // Set token in axios headers first
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          console.log('🔑 Token set in headers')
          
          const response = await axios.get('/api/auth/me')
          console.log('✅ User loaded successfully:', response.data.data)
          
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: response.data.data
          })
        } catch (error) {
          console.error('❌ Load user error:', error)
          // Clear invalid token
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
          dispatch({ type: AUTH_ACTIONS.AUTH_ERROR })
        }
      } else {
        console.log('❌ No token found, user not logged in')
        dispatch({ type: AUTH_ACTIONS.AUTH_ERROR })
      }
    }

    loadUser()
  }, [])

  // Test backend connectivity
  const testBackendConnection = async () => {
    try {
      const response = await axios.get('/api/health')
      console.log('Backend is running:', response.data)
      return true
    } catch (error) {
      console.error('Backend connection failed:', error)
      return false
    }
  }

  // Register user
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData)
      const authData = response?.data?.data || {}

      // Log OTP for development
      if (authData.otp) {
        console.log('🔢 Registration OTP:', authData.otp)
        console.log('📧 Registration Response:', response.data)
      }

      if (authData.token) {
        localStorage.setItem('token', authData.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: authData
        })
      }

      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Register error:', error)
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR })
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const { data } = error.response
        if (data.errors && Array.isArray(data.errors)) {
          // Validation errors
          return { 
            success: false, 
            error: data.errors.map(err => err.msg || err.message).join(', ')
          }
        } else {
          // General server error
          return { 
            success: false, 
            error: data.message || 'Registration failed' 
          }
        }
      } else if (error.request) {
        // Network error
        return { 
          success: false, 
          error: 'Network error. Please check your connection and try again.' 
        }
      } else {
        // Other error
        return { 
          success: false, 
          error: error.message || 'Registration failed' 
        }
      }
    }
  }

  // Login user
  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials)
      const authData = response?.data?.data || {}

      // Log OTP for development
      if (authData.otp) {
        console.log('🔢 Login OTP:', authData.otp)
        console.log('📧 Login Response:', response.data)
      }

      if (authData.token) {
        localStorage.setItem('token', authData.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: authData
        })
      }

      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Login error:', error)
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR })
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const { data } = error.response
        if (data.errors && Array.isArray(data.errors)) {
          // Validation errors
          return { 
            success: false, 
            error: data.errors.map(err => err.msg || err.message).join(', ')
          }
        } else {
          // General server error
          return { 
            success: false, 
            error: data.message || 'Login failed' 
          }
        }
      } else if (error.request) {
        // Network error
        return { 
          success: false, 
          error: 'Network error. Please check your connection and try again.' 
        }
      } else {
        // Other error
        return { 
          success: false, 
          error: error.message || 'Login failed' 
        }
      }
    }
  }

  const verifyOtp = async ({ email, otp, purpose }) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { email, otp, purpose })
      const authData = response?.data?.data || {}

      if (authData.token) {
        localStorage.setItem('token', authData.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`
        dispatch({
          type: purpose === 'register' ? AUTH_ACTIONS.REGISTER_SUCCESS : AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: authData
        })
      }

      return { success: true, data: authData }
    } catch (error) {
      if (error.response) {
        const { data } = error.response
        return {
          success: false,
          error: data.message || 'OTP verification failed'
        }
      }
      if (error.request) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.'
        }
      }
      return {
        success: false,
        error: error.message || 'OTP verification failed'
      }
    }
  }

  // Admin login
  const adminLogin = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/admin/login', credentials)
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.data.token)
      
      // Set axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data.data
      })
      
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Admin login error:', error)
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR })
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const { data } = error.response
        if (data.errors && Array.isArray(data.errors)) {
          // Validation errors
          return { 
            success: false, 
            error: data.errors.map(err => err.msg || err.message).join(', ')
          }
        } else {
          // General server error
          return { 
            success: false, 
            error: data.message || 'Admin login failed' 
          }
        }
      } else if (error.request) {
        // Network error
        return { 
          success: false, 
          error: 'Network error. Please check your connection and try again.' 
        }
      } else {
        // Other error
        return { 
          success: false, 
          error: error.message || 'Admin login failed' 
        }
      }
    }
  }

  // Logout user
  const logout = async () => {
    try {
      // Call backend logout endpoint (optional)
      await axios.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // Clear localStorage
    localStorage.removeItem('token')
    
    // Clear axios headers
    delete axios.defaults.headers.common['Authorization']
    
    // Dispatch logout action
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERRORS })
  }

  const value = {
    ...state,
    register,
    login,
    verifyOtp,
    adminLogin,
    logout,
    clearErrors
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
