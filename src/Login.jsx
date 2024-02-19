import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const history = useHistory()

  const handleLogin = () => {
    if (username === 'admin' && password === 'password') {
      history.push('/')
    } else {
      setError('Invalid username or password') 
    }
  }

  return (
    <div className="login template d-flex justify-content-center align-items-center vh-100 bg-primary">
      <div className="form-container p-5 rounded bg-white">
        <form onSubmit={(e) => {
          e.preventDefault() // Prevent form submission
          handleLogin()
        }}>
          <h3 className="text-center">Sign In</h3>
          {error && <div className="text-danger mb-2">{error}</div>}
          <div className="mb-2">
            <label htmlFor="username">Username</label> 
            <input
              type="text" 
              placeholder="Enter Username" 
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          <div className="mb-2">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <input type="checkbox" className="custom-control custom-checkbox" id="check" />
            <label htmlFor="check" className="custom-input-label">
              Remember me
            </label>
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Sign in</button>
          </div>
          <p className="text-end mt-2">
            Forgot <a href="">Password?</a> or <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
