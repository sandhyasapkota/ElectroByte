import React from "react";
import "./SignupPage.css";

const SignupPage = () => {
  return (
    <div className="signup-wrapper">

      {/* Page Title */}
      <div className="signup-title">
        <h1>Customer SignUp</h1>
      </div>

      <div className="signup-container">

        {/* LEFT – New Customer */}
        <div className="signup-left">
          <h3>New Customers</h3>
          <p>If you don’t have an account, Sign-up with your email address.</p>

          <label>Username *</label>
          <input type="text" placeholder="Your Username" />

          <label>Email *</label>
          <input type="email" placeholder="Your Email" />

          <label>Password *</label>
          <input type="password" placeholder="Your Password" />

          <button className="signup-btn">Sign Up</button>
        </div>

        {/* RIGHT – Existing Customer */}
        <div className="signup-right">
          <h3>Existing Customer?</h3>
          <p>Login to an account has many benefits:</p>
          <ul>
            <li>Checkout faster</li>
            <li>Keep more than one address</li>
            <li>Track orders and more</li>
          </ul>

          <button className="signin-btn">Sign In</button>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
