import './Login.css'
import { Link } from 'react-router-dom'

function Signup() {
  return (
    <div className="signup template d-flex justify-content-center align-items-center vh-100 bg-primary">
        <div className="form-container p-5 rounded bg-white">
            <form action="">
                <h3 className="text-center">Sign Up</h3>
                <div className="mb-2">
                    <label htmlFor="uname">Create username</label>
                    <input type="text" placeholder="Enter Last Name" className="form-control"/>
                </div>
                <div className="mb-2">
                    <label htmlFor="password">Create password</label>
                    <input type="password" placeholder="Enter Password" className="form-control"/>
                </div>
                
                <div className="d-grid">
                    <button className="btn-btn-primary">Sign Up</button>
                </div>
                <p className="text-end mt-2">
                    Already Registered <Link to="/login" className='ms-2'>Sign in</Link>
                </p>
            </form>
        </div>
    </div>
  )
}

export default Signup
