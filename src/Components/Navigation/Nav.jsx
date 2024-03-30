import { useAuth } from '../Login/AuthContext'
import { useState } from 'react'

function Nav({ Toggle, pageTitle }) {
  const { currentUser } = useAuth()

  const renderUserText = () => {
    if (currentUser) {
      return currentUser.email.split('@')[0]
    } else {
      return 'User'
    }
  }

  return (
    <nav className="navbar navbar-expand-sm navbar-dark bg-transparent">
      <i className="navbar-brand bi bi-border-width fs-4 zoom-on" role="button" onClick={Toggle} data-bs-toggle="tooltip" data-bs-placement="top" title="Toggle sidebar"></i>
      <span className='fs-5 text-white'>{pageTitle}</span>
    <div className="navbar-text ms-auto text-white">
        <i className="bi bi-person-circle me-2"></i>
        {renderUserText()}
    </div>
    </nav>
  )
}

export default Nav
