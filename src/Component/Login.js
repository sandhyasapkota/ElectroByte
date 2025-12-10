import React, { useState } from "react";
import "./Register.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Login success", formData);
    }
  };

  return (
    <div className="login-container">

      <h2 className="login-title">Customer Login</h2>

      <div className="login-wrapper">

        {/* Left Card */}
        <div className="login-card left-card">
          <h3>Registered Customers</h3>
          <p>If you have an account, log in with your email address.</p>

          <form onSubmit={handleSubmit}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}

            <label>Password:</label>
            <input
              type="password"
              name="password"
              placeholder="Your Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error">{errors.password}</span>}
            <div className="button-container">
            <button type="submit" className="btn-primary">Sign In</button>

            <div className="forgot">Forgot Your Password?</div>
            </div>
          </form>

        </div>

        {/* Right Card */}
        <div className="login-card right-card">
          <h3>New Customer?</h3>
          <p>
            Creating an account has many benefits: <br />
            •  Check out faster<br />
            •  Keep more than one address<br />
            •  Track orders and mores  
          </p>

          <button className="btn-secondary">Create An Account</button>
        </div>

      </div>
    </div>
  );
};

export default Login;
