import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Sidebar from './Components/Navigation/Sidebar'
import Home from './Pages/Home'
import Products from './Pages/Products'
import Inventory from './Pages/Inventory'
import Sales from './Pages/Sales/Sales'
import Users from './Pages/Users'
import Reports from './Pages/Reports'
import Login from './Components/Login/Login'
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Private from './Components/Login/Private'
import PageNotFound from './Pages/NotFound'
import { AuthProvider } from './Components/Login/AuthContext'
import bg from '../src/assets/bg.svg'

function App() {
  const [toggle, setToggle] = useState(true)

  const handleToggle = () => {
    setToggle(!toggle)
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className='container-fluid min-vh-100' style={{
            backgroundColor: 'rgb(0, 0, 30)',
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}>
          <Routes>
            <Route path="/" element={<Login />} /> 
            <Route path="/*" element={
              <div className="row">
                <div className={`col-md-2 bg-white min-vh-100 position-fixed transition-all`} style={{ maxWidth: '225px', zIndex: '1000', transform: `translateX(${toggle ? '0' : '-100%'})`, transition: 'transform 0.3s ease' }}>
                  <Sidebar />
                </div>
                <div className={`col-${toggle ? '10' : '12'} px-${toggle ? '0' : '5'} overflow-auto page-container`} style={{ marginLeft: toggle ? '235px' : '0', transition: 'ease 0.3s' }}>
                  <Routes>
                    <Route path="/home" element={Private(<Home Toggle={handleToggle}/>)}></Route>
                    <Route path="/products" element={Private(<Products Toggle={handleToggle}/>)}></Route>
                    <Route path="/inventory" element={Private(<Inventory Toggle={handleToggle}/>)}></Route>
                    <Route path="/sales" element={Private(<Sales Toggle={handleToggle}/>)}></Route>
                    <Route path="/users" element={Private(<Users Toggle={handleToggle}/>)}></Route>
                    <Route path="/reports" element={Private(<Reports Toggle={handleToggle}/>)}></Route>
                    <Route path="*" element={Private(<PageNotFound/>)} />
                  </Routes>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
