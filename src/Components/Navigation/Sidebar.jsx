import { Link, useLocation, useNavigate } from 'react-router-dom' 
import './Sidebar.css'
import logo from '../../assets/logo.svg'
import { useAuth } from '../Login/AuthContext'
import { auth, db } from '../../firebaseConfig'
import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate() 
  const { currentUser } = useAuth()
  const [userAccess, setUserAccess] = useState(null)

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

  useEffect(() => {
    const fetchUserAccess = () => {
        try {
            if (currentUser) {
                const uid = currentUser.uid;
                const userRef = ref(db, `users/${uid}/access`)
                onValue(userRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const access = snapshot.val()
                        setUserAccess(access)
                    } else {
                        console.error('User access data does not exist.')
                    }
                })
            }
        } catch (error) {
            console.error('Error fetching user access:', error)
        }
    }

    if (db && currentUser) {
        fetchUserAccess()
    }
  }, [currentUser, db])

  return (
    <div className='bg-white p-2' style={{ animation: 'fadeIn 0.2s ease-out forwards', opacity: 0 }}>
      <div className='pt-2'>
        <img src={logo} alt="CFS" className="p-0 fs-2 store-logo img-fluid" style={{ animation: 'fadeIn 0.2s ease-out forwards', opacity: 0 }}/>
      </div>
      <hr className='text-dark'/>
      <div className='list-group list-group-flush'>
        <Link to="/home" className={location.pathname === '/home' ? 'active list-group-item py-2 m-0 rounded' : 'list-group-item py-2 rounded'}>
          <i className='bi bi-house-door fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Home</span>
        </Link>
        <Link to="/products" className={location.pathname === '/products' ? 'active list-group-item py-2 rounded' : 'list-group-item py-2 rounded'}>
          <i className='bi bi-cart fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Products</span>
        </Link>
        <Link to="/inventory" className={location.pathname === '/inventory' ? 'active list-group-item py-2 rounded' : 'list-group-item py-2 rounded'}>
          <i className='bi bi-box-seam fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Inventory</span>
        </Link>
        <Link to="/sales" className={location.pathname === '/sales' ? 'active list-group-item py-2 rounded' : 'list-group-item py-2 rounded'}>
          <i className='bi bi-receipt fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Sales</span>
        </Link>
        {userAccess === 'Admin' || userAccess === 'Superadmin' ? (
            <>
                <Link to="/users" className={location.pathname === '/users' ? 'active list-group-item py-2 rounded' : 'list-group-item py-2 rounded'}>
                    <i className='bi bi-people fs-5 me-3'></i>
                    <span className="d-none d-sm-inline">Users</span>
                </Link>
                <Link to="/reports" className={location.pathname === '/reports' ? 'active list-group-item py-2 rounded' : 'list-group-item py-2 rounded'}>
                    <i className='bi bi-clipboard-data fs-5 me-3'></i>
                    <span className="d-none d-sm-inline">Reports</span>
                </Link>
            </>
          ) : null}
        <Link to="/" className='list-group-item py-2 rounded' onClick={handleSignOut}>
          <i className='bi bi-power fs-5 me-3'></i>
          <span className="d-none d-sm-inline">Logout</span>
        </Link>
        <div>
      </div>
      </div>
    </div>
  )
}

export default Sidebar
