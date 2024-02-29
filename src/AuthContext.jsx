import { Navigate, Route } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const authed = isAuth(); 

  return authed ? children : <Navigate to="/Home" replace />;
}

export default PrivateRoute;
