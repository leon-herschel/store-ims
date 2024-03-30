import { useAuth } from '../Login/AuthContext'
import UserAccessFetcher from '../../UserAccessFetcher'
import { useState } from 'react'

function Nav({ Toggle, pageTitle }) {
  const { currentUser } = useAuth()
  const [userAccess, setUserAccess] = useState(null)

  const renderUserText = () => {
    if (currentUser) {
      return currentUser.email.split('@')[0]
    } else {
      return 'User'
    }
  }

  return (
    <nav className="navbar navbar-expand-sm navbar-dark bg-transparent">
      <UserAccessFetcher currentUser={currentUser} setUserAccess={setUserAccess} />
      <i className="navbar-brand bi bi-border-width fs-4 zoom-on" role="button" onClick={Toggle} data-bs-toggle="tooltip" data-bs-placement="top" title="Toggle sidebar"></i>
      <span className='fs-5 text-white'>{pageTitle}</span>
      <div className="navbar-text ms-auto text-white"><i className="bi bi-person-circle me-2"></i>{renderUserText()} ({userAccess})</div>
    </nav>
  )
}

export default Nav
