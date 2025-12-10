import React from "react";
import "./Footer.css";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaDiscord } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">

     
      <div className="newsletter">
        <h2>Sign Up To Our ElectroByte</h2>
        <p>Be the first to hear about the latest offers.</p>
      </div>

      
      <div className="footer-grid">

        {/* Column 1 */}
        <div className="footer-col">
          <h3>Information</h3>
          <ul>
            <li>About Us</li>
            <li>About Zip</li>
            <li>Privacy Policy</li>
            <li>Search</li>
            <li>Terms</li>
            <li>Orders and Returns</li>
            <li>Contact Us</li>
            <li>Advanced Search</li>
          </ul>
        </div>

        {/* Column 2 */}
        <div className="footer-col">
          <h3>PC Parts</h3>
          <ul>
            <li>CPUs</li>
            <li>Add On Cards</li>
            <li>Hard Drives (Internal)</li>
            <li>Graphic Cards</li>
            <li>Keyboards / Mice</li>
            <li>Cases / Power Supplies / Cooling</li>
            <li>RAM (Memory)</li>
            <li>Software</li>
            <li>Speakers / Headsets</li>
            <li>Motherboards</li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="footer-col">
          <h3>Desktop PCs</h3>
          <ul>
            <li>Custom PCs</li>
            <li>Servers</li>
            <li>MSI All-In-One PCs</li>
            <li>HP/Compaq PCs</li>
            <li>ASUS PCs</li>
            <li>Tecs PCs</li>
            <li>Laptops</li>
            <li>Everyday Use Notebooks</li>
            <li>MSI Workstation Series</li>
            <li>MSI Prestige Series</li>
            <li>Tablets and Pads</li>
            <li>Netbooks</li>
            <li>Infinity Gaming Notebooks</li>
          </ul>
        </div>

        {/* Column 4 - Address */}
        <div className="footer-col">
          <h3>Address</h3>
          <ul>
            <li>Address: Newroad</li>
            <li>Phones: 9705439512</li>
            <li>We are open:</li>
            <li>Mon–Thu: 9:00 AM - 5:30 PM</li>
            <li>Friday: 9:00 AM - 6:00 PM</li>
            <li>Saturday: 11:00 AM - 5:00 PM</li>
            <li>Email: electrobyte@email.com</li>
          </ul>
        </div>

      </div>

      {/* Social Icons */}
      <div className="footer-social">
        <FaFacebook />
        <FaInstagram />
        <FaTwitter />
        <FaYoutube />
        <FaDiscord />
      </div>

      <p className="copyright">
        Copyright © 2020 Shop Pty. Ltd.
      </p>

    </footer>
  );
};

export default Footer;
