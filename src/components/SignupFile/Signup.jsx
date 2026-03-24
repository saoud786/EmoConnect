import React from "react";
import { Link } from "react-router-dom";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhone } from "react-icons/fi";



import "./Signup.css";

const SignupOptions = () => {
  return (
    <div className="signup-container" role="main">
      <div className="signup-card" aria-labelledby="signup-heading">
        {/* Title */}
        <h1 id="signup-heading" className="title">Create Account</h1>
        <p className="subtitle">Choose a signup method to continue</p>

        {/* Options */}
        <div className="options" role="list">
          <Link to="/signupEmail" className="option-btn" role="listitem" aria-label="Sign up with email">
            <HiOutlineMail className="icon" aria-hidden="true" />
            <span>Signup with Email</span>
          </Link>

          <Link to="/signupPhone" className="option-btn phone" role="listitem" aria-label="Sign up with phone">
            <FiPhone className="icon" aria-hidden="true" />
            <span>Signup with Phone Number</span>
          </Link>
        </div>

        {/* Redirect */}
        <p className="footer-text">
          Already have an account?{" "}
          <Link to="/login" className="footer-link">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupOptions;
