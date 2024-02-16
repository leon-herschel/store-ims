import { Link, useLocation } from 'react-router-dom'
import './Style.css'

function Sidebar() {
  const location = useLocation()

  return (
    <div className='bg-white p-2'>
      <div className='m-2'>
        <i className='bi bi-facebook me-3 fs-4'></i>
        <span className="brand-name fs-4">Fishbook</span>
      </div>
      <hr className='text-dark'/>
      <div className='list-group list-group-flush'>
        <Link to="/" className={location.pathname === '/' ? 'active list-group-item py-2' : 'list-group-item py-2'}>
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
        <a href="/logout" className='list-group-item py-2'>
          <i className='bi bi-power fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Logout</span>
        </a>
      </div>
    </div>
  )
}

export default Sidebar
