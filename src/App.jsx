import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Sidebar from './Sidebar'
import Home from './Pages/Home'
import Products from './Pages/Products'
import Sales from './Pages/Sales'
import Users from './Pages/Users'
import Settings from './Pages/Settings'
import Reports from './Pages/Reports'
import Login from './Login'
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  const [toggle, setToggle] = useState(true)

  const Toggle = () => {
    setToggle(!toggle)
  }

  return (
    <BrowserRouter>
      <div className='container-fluid min-vh-100 main-container'>
        <Routes>
          <Route path="/" element={<Login Toggle={Toggle} />} /> 
          <Route path="/*" element={<MainRoutes Toggle={Toggle} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function MainRoutes({ Toggle }) {
  const [toggle, setToggle] = useState(true)

  return (
    <div className="row">
      {toggle && (
        <div className="col-4 col-md-2 bg-white min-vh-100 position-fixed">
          <Sidebar/>
        </div>
      )}
      {toggle && (
        <div className='col-4 col-md-2'></div>
      )}
      <div className={`col-${toggle ? '8' : '12'} col-md-${toggle ? '10' : '12'} px-0 overflow-auto`}>
        <Routes>
          <Route path="/home" element={<Home Toggle={Toggle}/>}></Route>
          <Route path="/products" element={<Products Toggle={Toggle}/>}></Route>
          <Route path="/sales" element={<Sales Toggle={Toggle}/>}></Route>
          <Route path="/users" element={<Users Toggle={Toggle}/>}></Route>
          <Route path="/settings" element={<Settings Toggle={Toggle}/>}></Route>
          <Route path="/reports" element={<Reports Toggle={Toggle}/>}></Route>
        </Routes>
      </div>
    </div>
  )
}

export default App
