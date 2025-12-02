import React, { useState } from "react";
import "./Navbar.css";
import { FaSearch, FaUser, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import Electrobyte from "../Images/Electrobyte.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">

      {/* Logo */}
      <div className="nav-logo">
        <img src={Electrobyte} alt="Electrobyte" className="logo-image" />
        <span className="logo-text">ElectroByte</span>
      </div>

      {/* Desktop Menu */}
      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li>Laptops</li>
        <li>Desktop PCs</li>
        <li>Laptop Parts</li>
        <li>Printers & Scanners</li>
        <li>PC Parts</li>
        <li>Repairs</li>
         <button className="appointment-btn">Book Appointment</button>
      </ul>

      {/* Right Icons */}
      <div className="nav-icons">
        <FaSearch />
        <FaShoppingCart />
        <FaUser />

       

        {/* Mobile Menu Icon */}
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
