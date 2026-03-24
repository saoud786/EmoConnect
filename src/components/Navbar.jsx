import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {

  const location = useLocation();

  return (
    <nav className="navbar">

      <div className="nav-container">

        {/* LEFT */}
        <div className="nav-left">

          <Link 
            to="/" 
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            <Home size={20}/>
            Home
          </Link>

        </div>

        {/* RIGHT */}
        <div className="nav-right">

          {!location.pathname.startsWith("/admin") && (
            <Link to="/admin-login" className="nav-btn admin-btn">
              Admin
            </Link>
          )}

          <Link to="/signup" className="nav-btn signup-btn">
            Sign Up
          </Link>

          <Link to="/login" className="nav-btn login-btn">
            Login
          </Link>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;