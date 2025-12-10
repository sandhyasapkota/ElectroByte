// import logo from './logo.svg';
import './App.css';
import Footer from './Component/Footer';
import Navbar from './Component/Navbar';
import Homepage from './Component/HomePage';

function App() {
  return (
    <div className="App">
      <Navbar/>
      {/* <Register/> */}
      <Homepage/>
      <Footer/>
      
    </div>
  );
}

export default App;
