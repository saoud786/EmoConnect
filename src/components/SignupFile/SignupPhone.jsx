import React, { useState } from "react";
import { Link } from "react-router-dom";

import { FiPhone } from "react-icons/fi";



import "./SignupPhone.css";

const SignupPhone = () => {
  const [phone, setPhone] = useState("");

  const handlePhoneSignup = (e) => {
    e.preventDefault();

    if (!phone) {
      alert("Please enter phone number!");
      return;
    }

    alert("OTP will be sent to: " + phone);
  };

  return (
    <div className="phoneSignup-page">
      <div className="phoneSignup-card">
        {/* Title */}
        <h1 className="phoneSignup-title">Signup with Phone</h1>

        <p className="phoneSignup-subtitle">
          Create your ChatApp account with OTP 📲
        </p>

        {/* Form */}
        <form onSubmit={handlePhoneSignup} className="phoneSignup-form">
          {/* Phone Input */}
          <div className="field">
            <FiPhone className="field-icon" />

            <input
              type="tel"
              placeholder="Enter phone number (+91...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Button */}
          <button type="submit" className="phoneSignup-btn">
            Send OTP
          </button>
        </form>

        {/* Footer */}
        <p className="phoneSignup-footer">
          Back to <Link to="/signup">Signup Options</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPhone;
