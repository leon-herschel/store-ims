import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Sidebar from './Sidebar'
import Home from './Home'
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  const [toggle, setToggle] = useState(true)

  const Toggle = () => {
    setToggle(!toggle)
  }

  return (
    <div className='container-fluid bg-dark min-vh-100'>
        <div className="row">
          {toggle && <div className="col-4 col-md-2 bg-white min-vh-100 position-fixed">
            <Sidebar/>
          </div>}
          {toggle && <div className='col-4 col-md-2'></div>}
          <div className="col-8 col-md-10 px-0 overflow-auto">
            <BrowserRouter>
             <Routes>
                <Route path='/' element={<><Home Toggle={Toggle}/></>}></Route>
                <Route path='/users' element={<><User /></>}></Route>
                <Route path='/users' element={<><Products /></>}></Route>
             </Routes>
            </BrowserRouter>
          </div>
        </div>
    </div>
  )
}

export default App
