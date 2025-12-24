import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Footer from './Component/Footer';
import Navbar from './Component/Navbar';
import HomePage from './Pages/HomePage';
import ProductCatalog from './Pages/ProductCatalog';
import SignupPage from './Pages/SignupPage';
import Login from './Pages/Login';
import UserProfile from './Pages/UserProfile';
import FAQ from './Pages/FAQ';

function App() {
  return (
    // <Router>
    //   <Routes>
    //     <Route path="/" element={<SignupPage />} />
    //     <Route path="/login" element={<Login />} />
    //     <Route path="/home" element={<HomePage />} />
    //     <Route path="/products" element={<ProductCatalog />} />
    //     <Route path="*" element={<UserProfile />} />
        
    //   </Routes>
    // </Router>
    <FAQ />
  );
}

export default App;
