// src/components/includes/Header.js

import { useEffect, useState } from "react";
import {
  FaBars,
  FaTimes,
  FaTag,
  FaUserCircle
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineDown } from "react-icons/ai";
import toast from "react-hot-toast";
import axios from "axios";
import "../css/Header.css";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSubCategoryOpen, setSubCategoryOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // التحقق من صلاحية التوكن عند التحميل
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      // ✨ إضافة التوكن إلى axios بشكل افتراضي
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/check-auth");

        if (response.data.authenticated) {
          setIsLoggedIn(true);
        } else {
          handleLogout();
        }
      } catch (error) {
        handleLogout();
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserMenuOpen(false);
    toast.success("تم تسجيل الخروج بنجاح 👋");
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
<Link to="/" className="logo">
  MyLogo
</Link>
        <nav className="nav">
          <div className="dropdown">
            <button
              onClick={() => setSubCategoryOpen(!isSubCategoryOpen)}
              className="dropdown-btn"
            >
              Convert Pdf <AiOutlineDown size={14} />
            </button>
            <AnimatePresence>
              {isSubCategoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="dropdown-menu subcategory-grid"
                >
                  <div className="sub-item"><FaTag /> JPG to PDF</div>
                  <div className="sub-item"><FaTag /> PDF to JPG</div>
                  <div className="sub-item"><FaTag /> WORD to PDF</div>
                  <div className="sub-item"><FaTag /> POWERPOINT to PDF</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="#">Merge PDF</Link>
          <Link to="#">Split PDF</Link>
          <Link to="#">Compress PDF</Link>

          {!isLoggedIn ? (
            <Link to="/register" className="btn-primary-header">Login</Link>
          ) : (
            <div className="user-menu-container">
              <FaUserCircle
                size={26}
                onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                className="user-icon"
              />
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    className="user-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Link to="/account" onClick={() => setUserMenuOpen(false)}>
                      Account
                    </Link>
                    <button onClick={handleLogout}>Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
          <FaBars size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
          >
            <div className="sidebar-header">
              <h2>Menu</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <FaTimes size={22} />
              </button>
            </div>
            <ul className="sidebar-links">
              <li>Category</li>
              <li>Subcategory</li>
              <li>About</li>
              <li>Contact</li>
              {!isLoggedIn ? (
                <li>
                  <Link to="/register" onClick={() => setSidebarOpen(false)}>
                    تسجيل
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/account" onClick={() => setSidebarOpen(false)}>
                      Account
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout}>تسجيل الخروج</button>
                  </li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {isSidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </header>
  );
}
