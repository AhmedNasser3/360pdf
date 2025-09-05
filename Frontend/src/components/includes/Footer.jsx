import React from "react";
import "../css/Footer.css";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        {/* PRODUCT */}
        <div className="footer-col">
          <h3>PRODUCT</h3>
          <ul>
            <li>Home</li>
            <li>Features</li>
            <li>Pricing</li>
            <li>Tools</li>
            <li>FAQ</li>
          </ul>
        </div>

        {/* RESOURCES */}
        <div className="footer-col">
          <h3>RESOURCES</h3>
          <ul>
            <li>MySite Desktop</li>
            <li>MySite Mobile</li>
            <li>iLoveSign</li>
            <li>iLoveAPI</li>
            <li>iLoveIMG</li>
          </ul>
        </div>

        {/* SOLUTIONS */}
        <div className="footer-col">
          <h3>SOLUTIONS</h3>
          <ul>
            <li>Business</li>
            <li>Education</li>
          </ul>
        </div>

        {/* LEGAL */}
        <div className="footer-col">
          <h3>LEGAL</h3>
          <ul>
            <li>Security</li>
            <li>Privacy policy</li>
            <li>Terms & conditions</li>
            <li>Cookies</li>
          </ul>
        </div>

        {/* COMPANY */}
        <div className="footer-col">
          <h3>COMPANY</h3>
          <ul>
            <li>About us</li>
            <li>Contact us</li>
            <li>Blog</li>
            <li>Press</li>
          </ul>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom">
        {/* Language */}
        <div className="language">
          🌐 English
        </div>

        {/* Store Buttons */}
        <div className="stores">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
            alt="Google Play"
          />
          <img
            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
            alt="App Store"
          />
          <img
            src="https://developer.apple.com/assets/elements/badges/download-on-the-mac-app-store.svg"
            alt="Mac App Store"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/89/Microsoft_Store_badge_EN.svg"
            alt="Microsoft Store"
          />
        </div>

        {/* Social */}
        <div className="social">
          <FaXTwitter />
          <FaFacebookF />
          <FaLinkedinIn />
          <FaInstagram />
          <FaTiktok />
        </div>
      </div>

      <div className="copyright">
        © MySite 2025 - Your PDF Editor
      </div>
    </footer>
  );
};

export default Footer;
