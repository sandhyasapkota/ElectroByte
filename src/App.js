// import logo from './logo.svg';
import './App.css';
import Footer from './Component/Footer';
import Navbar from './Component/Navbar';
import Homepage from './Component/HomePage';
import SignupPage from './Component/SignupPage';
import Login from './Component/Login';



function App() {
  return (
    <div className="App">
      <Navbar/>
      {/* <Register/> */}
      {/* <SignupPage/> */}
      <SignupPage/>
      <Footer/>
      
    </div>
  );
}

export default App;
