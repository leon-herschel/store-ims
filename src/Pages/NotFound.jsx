import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const PageNotFound = () => {
  const [toggle, setToggle] = useState(true); 

  useEffect(() => {
    setToggle(false); 
  }, []); 
  return ( 
    <div className="main-container mt-5 text-white">
      <h1 className="display-1 text-center">404</h1>
      <p className="lead text-center">Page Not Found</p>
      <p className="text-center">The page you are looking for might have been removed or the URL might be incorrect.</p>
      <p className="text-center">
        <Link to="/home" className="btn btn-primary">Return to Homepage</Link>
      </p>
    </div>
  )
}

export default PageNotFound
