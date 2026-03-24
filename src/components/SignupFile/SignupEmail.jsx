import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";

// ✅ Firestore imports
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../../Firebase"; // ✅ make sure db is exported
import { useNavigate, Link } from "react-router-dom";

import { MdEmail } from "react-icons/md";
import { FiLock } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";




import "./SignupEmail.css";

const SignupEmail = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    try {
      setLoading(true);

      // ✅ Create User in Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // ✅ Generate Anonymous Username
      const anonymousName = "User" + Math.floor(Math.random() * 10000);

      // ✅ Save User in Firestore Database
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        email: res.user.email,
        anonymousName: anonymousName,
        createdAt: new Date(),
      });

      alert("Account Created + User Saved 🎉");

      // ✅ Redirect to HomePage
      navigate("/profile-setup");
    } catch (error) {
      alert(error.message);
      console.log(error);
    }

    setLoading(false);
  };

  return (
    <div className="emailSignup-page">
      <div className="emailSignup-card">
        <h1 className="emailSignup-title">Signup with Email</h1>

        <p className="emailSignup-subtitle">
          Create your ChatApp account in seconds 🚀
        </p>

        <form onSubmit={handleSignup} className="emailSignup-form">
          {/* Email */}
          <div className="field">
            <MdEmail className="field-icon" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="field password-field">
            <FiLock className="field-icon" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          {/* Button */}
          <button type="submit" className="emailSignup-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="emailSignup-footer">
          Back to <Link to="/signup">Signup Options</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupEmail;
