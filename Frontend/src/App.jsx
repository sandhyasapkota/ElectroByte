import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Footer from './Component/Footer';
import Navbar from './Component/Navbar';
import HomePage from './Component/HomePage';

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <HomePage />
      <Footer />
    </>
  )
}

export default App
