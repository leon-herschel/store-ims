import 'bootstrap/js/dist/dropdown'
import 'bootstrap/js/dist/collapse'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../Login/AuthContext'

function Nav({ Toggle, pageTitle }) {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const renderUserText = () => {
    if (currentUser) {
        return currentUser.email.split('@')[0]
    } else {
      return 'User'
    }
  }

  const handleSignOut = () => {
    auth.signOut()
      .then(() => {
        console.log('User signed out successfully')
        navigate('/')
      })
      .catch((error) => {
        console.error('Error signing out:', error)
      })
  }

  return (
    <nav className="navbar navbar-expand-sm navbar-dark bg-transparent">
      <i className="navbar-brand bi bi-justify fs-4 zoom-on" role="button" onClick={Toggle}></i>
      <span className='fs-5 text-white'>{pageTitle}</span>
      <button
        className="navbar-toggler d-lg-none"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapsibleNavId"
        aria-controls="collapsibleNavId"
        aria-expanded="false"
        aria-label="Toggle navigation"
      ><i className='bi bi-justify'></i></button>
      <div className="collapse navbar-collapse" id="collapsibleNavId">
        <ul className="navbar-nav ms-auto mt-2 mt-lg-0">
          <li className="nav-item dropdown">
            <Link
              className="nav-link dropdown-toggle"
              to="#"
              id="dropdownId"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            > {renderUserText()}</Link>
            <div className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownId">
              <Link className="dropdown-item" to="#">Profile</Link>
              <Link className="dropdown-item" to="#">Setting</Link>
              <Link className="dropdown-item" to="/" onClick={handleSignOut}>Logout</Link>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Nav
