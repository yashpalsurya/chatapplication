import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login  from './pages/Login';
import Signup from './pages/Signup';
import Home from './Componets/Home';
import ForgotPassword from './pages/ForgotPassword';


function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/"       element={<Navigate to="/home" replace />} />
    <Route path="/home"   element={<Home />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/login"  element={<Login  />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    
  </Routes>
    </BrowserRouter>
  );
}

export default App;
