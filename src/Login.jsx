import './Login.css'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebaseConfig'

function Login() {
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const email = e.target.email.value
        const password = e.target.password.value

        try {
            await signInWithEmailAndPassword(auth, email, password)
            navigate('/home')
        } catch (error) {
            console.error('Error signing in:', error.message)
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 main-container">
            <div className="form-container p-5 rounded bg-white">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-center">Sign In</h3>
                    <div className="my-2">
                        <input name="email" type="email" placeholder="Email" className="form-control"/>
                    </div>
                    <div className="my-2">
                        <input name="password" type="password" placeholder="Password" className="form-control"/>
                    </div>
                    <div className="d-grid pt-2">
                        <button type="submit" className="btn btn-primary login-btn">Login</button>
                    </div>
                    <p className="text-start mt-2">
                        Forgot your <a href="">password?</a>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login
