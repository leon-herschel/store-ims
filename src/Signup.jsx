import './Signup.css'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebaseConfig'

function Signup() {
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const email = e.target.email.value
        const password = e.target.password.value

        try {
            await createUserWithEmailAndPassword(auth, email, password)
            navigate('/') 
        } catch (error) {
            console.error('Error signing up:', error.message)
        }
    }

    return (
        <div className="signup template d-flex justify-content-center align-items-center vh-100 bg-primary">
            <div className="form-container p-5 rounded bg-white">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-center">Sign Up</h3>
                    <div className="mb-2">
                        <label htmlFor="email">Email</label>
                        <input name="email" type="email" placeholder="Enter Email" className="form-control"/>
                    </div>
                    <div className="mb-2">
                        <label htmlFor="password">Password</label>
                        <input name="password" type="password" placeholder="Enter Password" className="form-control"/>
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">Sign Up</button>
                    </div>
                    <p className="text-end mt-2">
                        Already Registered <Link to="/" className='ms-2'>Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Signup
