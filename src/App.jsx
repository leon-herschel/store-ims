import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Sidebar from './Sidebar'
import Home from './Home'
import { useState } from 'react'

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
          <div className="col px-0">
            <Home Toggle={Toggle}/>
          </div>
        </div>
    </div>
  )
}

export default App
