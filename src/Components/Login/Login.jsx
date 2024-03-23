import './Login.css'
import { useNavigate } from 'react-router-dom'
import { 
  sendPasswordResetEmail, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  browserLocalPersistence 
  } from 'firebase/auth'
import { auth } from '../../firebaseConfig'
import { useState, useEffect } from 'react'

function Login() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [resetPassRequested, setResetPassRequested] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false) 
  const [isEmailVerified, setIsEmailVerified] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsEmailVerified(user.emailVerified)
      }
    })
  
    return () => {
      unsubscribe()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEmail(e.target.email.value)
    setPassword(e.target.password.value)
  
    try {
      setLoading(true)

      await auth.signOut()

      await auth.setPersistence(browserLocalPersistence)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
  
      await user.getIdToken(true)
  
      if (!user.emailVerified) {
        setErrorMessage('Email not verified. Verify your email before logging in.')
        setLoading(false)
        return
      }

      navigate('/home')
    } catch (error) {
      console.error('Error signing in:', error)
      let customErrorMessage = ''
      switch (error.code) {
        case 'auth/invalid-credential':
          customErrorMessage = 'Invalid email or password.'
          break;
        case 'auth/network-request-failed':
          customErrorMessage = 'Network error occurred. Please check your internet connection and try again.';
          break;
        default:
          customErrorMessage = 'An error occurred. Please try again later.'
      }
      setErrorMessage(customErrorMessage)
    } finally {
      setLoading(false)
    }
  }
  

  const [passwordVisible, setPasswordVisible] = useState(false)

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const handlePasswordReset = () => {
    setResetPassRequested(true)
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setErrorMessage('Password reset email sent. Check your inbox.')
      })
      .catch((error) => {
        console.error('Error sending password reset email:', error.code)
        setErrorMessage('Failed to send password reset email.')
      })
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-container">
      <div className="form-container p-5 rounded bg-white shadow">
        <form onSubmit={handleSubmit}>
          <h2 className="text-start fw-bold mb-1">Login</h2>
          <p className='text-start fs-8'>Please login to continue</p>
          <div className="my-3">
            <input
              name="email"
              type="email"
              placeholder="Email"
              className={`form-control ${resetPassRequested && !email && 'is-invalid'}`}
              value={email}
              onChange={handleEmailChange}
            />
            {resetPassRequested && !email && <div className="invalid-feedback">Please enter your email.</div>}
          </div>
          <div className="my-3">
            <div className="input-group">
              <input
                name="password"
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Password"
                className="form-control"
                value={password}
                onChange={handlePasswordChange}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={togglePasswordVisibility}
              >
                <i
                  className={`bi bi-${passwordVisible ? 'eye-slash-fill' : 'eye-fill'}`}
                />
              </button>
            </div>
          </div>
          <div className="d-grid my-3 shadow">
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}> 
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              Login
            </button>
          </div>
          <div className="my-3">
            {errorMessage && (<p className={`text-${errorMessage === 'Password reset email sent. Check your inbox.' ? 'success' : 'danger'}`}>
              {errorMessage}</p>)}
          </div>
          <p className="text-center my-3 text-primary" role="button" onClick={handlePasswordReset}>
            Forgot password?
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
