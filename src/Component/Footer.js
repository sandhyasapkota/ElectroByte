import React from "react";

import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaDiscord } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white p-[30px] lg:py-[50px] lg:px-[100px] font-['Poppins',_sans-serif]">

      <div className="text-center sm:text-left mb-[30px]">
        <h2 className="text-[22px] mb-[5px]">Sign Up To Our ElectroByte</h2>
        <p className="text-sm text-[#cccccc]">Be the first to hear about the latest offers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

        {/* Column 1 */}
        <div>
          <h3 className="text-base font-semibold mb-[15px]">Information</h3>
          <ul className="list-none p-0">
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">About Us</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">About Zip</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Privacy Policy</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Search</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Terms</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Orders and Returns</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Contact Us</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Advanced Search</li>
          </ul>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="text-base font-semibold mb-[15px]">PC Parts</h3>
          <ul className="list-none p-0">
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">CPUs</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Add On Cards</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Hard Drives (Internal)</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Graphic Cards</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Keyboards / Mice</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Cases / Power Supplies / Cooling</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">RAM (Memory)</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Software</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Speakers / Headsets</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Motherboards</li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className="text-base font-semibold mb-[15px]">Desktop PCs</h3>
          <ul className="list-none p-0">
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Custom PCs</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Servers</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">MSI All-In-One PCs</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">HP/Compaq PCs</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">ASUS PCs</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Tecs PCs</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Laptops</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Everyday Use Notebooks</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">MSI Workstation Series</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">MSI Prestige Series</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Tablets and Pads</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Netbooks</li>
            <li className="text-[13px] mb-2 text-[#cccccc] cursor-pointer hover:text-[#1e90ff]">Infinity Gaming Notebooks</li>
          </ul>
        </div>

        {/* Column 4 - Address */}
        <div>
          <h3 className="text-base font-semibold mb-[15px]">Address</h3>
          <ul className="list-none p-0">
            <li className="text-[13px] mb-2 text-[#cccccc]">Address: Newroad</li>
            <li className="text-[13px] mb-2 text-[#cccccc]">Phones: 9705439512</li>
            <li className="text-[13px] mb-2 text-[#cccccc]">We are open:</li>
            <li className="text-[13px] mb-2 text-[#cccccc]">Mon–Thu: 9:00 AM - 5:30 PM</li>
            <li className="text-[13px] mb-2 text-[#cccccc]">Friday: 9:00 AM - 6:00 PM</li>
            <li className="text-[13px] mb-2 text-[#cccccc]">Saturday: 11:00 AM - 5:00 PM</li>
            <li className="text-[13px] mb-2 text-[#cccccc]">Email: electrobyte@email.com</li>
          </ul>
        </div>

      </div>

      {/* Social Icons */}
      <div className="flex justify-center sm:justify-start gap-5 text-[22px] mb-5">
        <FaFacebook className="cursor-pointer hover:text-[#1e90ff]" />
        <FaInstagram className="cursor-pointer hover:text-[#1e90ff]" />
        <FaTwitter className="cursor-pointer hover:text-[#1e90ff]" />
        <FaYoutube className="cursor-pointer hover:text-[#1e90ff]" />
        <FaDiscord className="cursor-pointer hover:text-[#1e90ff]" />
      </div>

      <p className="text-[13px] text-[#888]">
        Copyright © 2020 Shop Pty. Ltd.
      </p>

    </footer>
  );
};

export default Footer;
