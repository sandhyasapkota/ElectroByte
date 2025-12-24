import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './Component/Navbar';
import Footer from './Component/Footer';
import SignupPage from './Component/SignupPage';
import Login from './Component/Login';

function App() {
  return (
    <>
    <Navbar />
    <SignupPage />
    <Footer />
    </>
  );
}

export default App;
