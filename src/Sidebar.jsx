import { Link, useLocation, useNavigate } from 'react-router-dom' 
import './Sidebar.css'
import logo from './assets/logo.png'
import { auth } from './firebaseConfig'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate() 

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
    <div className='bg-white p-1'>
      <div className='pt-3'>
        <img src={logo} alt="Carlos Fishing Supplies" className="p-0 fs-2 store-logo img-fluid" />
      </div>
      <hr className='text-dark'/>
      <div className='list-group list-group-flush'>
        <Link to="/home" className={location.pathname === '/home' ? 'active list-group-item py-2' : 'list-group-item py-2'}>
          <i className='bi bi-speedometer2 fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Dashboard</span>
        </Link>
        <Link to="/products" className={location.pathname === '/products' ? 'active list-group-item py-2' : 'list-group-item py-2'}>
          <i className='bi bi-table fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Products</span>
        </Link>
        <Link to="/sales" className={location.pathname === '/sales' ? 'active list-group-item py-2' : 'list-group-item py-2'}>
          <i className='bi bi-receipt fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Sales</span>
        </Link>
        <Link to="/users" className={location.pathname === '/users' ? 'active list-group-item py-2' : 'list-group-item py-2'}>
          <i className='bi bi-people fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Users</span>
        </Link>
        <Link to="/settings" className={location.pathname === '/settings' ? 'active list-group-item py-2' : 'list-group-item py-2'}>
          <i className='bi bi-gear fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Settings</span>
        </Link>
        <Link to="/reports" className={location.pathname === '/reports' ? 'active list-group-item py-2' : 'list-group-item py-2'}>
          <i className='bi bi-clipboard-data fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Reports</span>
        </Link>
        <Link to="/" className='list-group-item py-2' onClick={handleSignOut}>
          <i className='bi bi-power fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Logout</span>
        </Link>
      </div>
    </div>
  )
}

export default Sidebar
