import 'bootstrap/js/dist/dropdown'
import 'bootstrap/js/dist/collapse'
import { Link } from 'react-router-dom'

function Nav({ Toggle, pageTitle }) {
  return (
    <nav className="navbar navbar-expand-sm navbar-dark bg-transparent">
      <i className="navbar-brand bi bi-justify-left fs-4" role="button" onClick={Toggle}></i>
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
            >User</Link>
            <div className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownId">
              <Link className="dropdown-item" to="#">Profile</Link>
              <Link className="dropdown-item" to="#">Setting</Link>
              <Link className="dropdown-item" to="#">Logout</Link>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Nav
