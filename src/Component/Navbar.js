import React, { useState } from "react";
// import "./Navbar.css"; // You can remove this import
import { FaSearch, FaUser, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import Electrobyte from "../Images/Electrobyte.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[#e5e5e5] py-3 px-[50px] flex items-center justify-between font-['Poppins',_sans-serif] sticky top-0 z-[1000]">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src={Electrobyte} alt="Electrobyte" className="logo-image" />
        <span className="text-lg font-semibold">ElectroByte</span>
      </div>

      {/* Desktop Menu */}
      <ul className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-[30px] items-center absolute md:relative top-[65px] md:top-0 left-0 md:left-auto w-full md:w-auto p-5 md:p-0 bg-white md:bg-transparent border-b md:border-b-0 border-[#ddd]`}>
        <li className="list-none text-sm cursor-pointer font-['Poppins',_sans-serif] font-[550] hover:text-[#1e90ff]">Laptops</li>
        <li className="list-none text-sm cursor-pointer font-['Poppins',_sans-serif] font-[550] hover:text-[#1e90ff]">Desktop PCs</li>
        <li className="list-none text-sm cursor-pointer font-['Poppins',_sans-serif] font-[550] hover:text-[#1e90ff]">Laptop Parts</li>
        <li className="list-none text-sm cursor-pointer font-['Poppins',_sans-serif] font-[550] hover:text-[#1e90ff]">Printers & Scanners</li>
        <li className="list-none text-sm cursor-pointer font-['Poppins',_sans-serif] font-[550] hover:text-[#1e90ff]">PC Parts</li>
        <li className="list-none text-sm cursor-pointer font-['Poppins',_sans-serif] font-[550] hover:text-[#1e90ff]">Repairs</li>
        <button className="hidden md:block py-2 px-4 border-none bg-white text-[#0156FF] border-2 border-[#0156FF] rounded-[40px] cursor-pointer text-[13px] hover:bg-[#0a6ed1] hover:text-white">Book Appointment</button>
      </ul>

      {/* Right Icons */}
      <div className="flex items-center gap-[18px] text-lg">
        <FaSearch className="cursor-pointer" />
        <FaShoppingCart className="cursor-pointer" />
        <FaUser className="cursor-pointer" />

        {/* Mobile Menu Icon */}
        <div className="block md:hidden text-[22px] cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
