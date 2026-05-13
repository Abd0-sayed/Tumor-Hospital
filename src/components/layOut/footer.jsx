import "./footer.scss";
import {
  FaLinkedinIn,
  FaFacebookF,
  FaInstagram,
  FaPaperPlane,
} from "react-icons/fa";
import { Link } from "react-router-dom";
const Footer = () => {
  const year = new Date();
  return (
    <footer className="meddical-footer" id="scroll-animation">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-col brand">
            <h2 className="logo">MED</h2>
            <p>Leading the Way in Medical Excellence, Trusted Care.</p>
          </div>

          <div className="footer-col links">
            <h3>Important Links</h3>
            <ul>
              <li>
                <Link to="/doctorsPage">Doctors</Link>
              </li>

              <li></li>
              <li>
                <Link to="/faq">Q&A</Link>
              </li>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#about">About Us</a>
              </li>
            </ul>
          </div>

          <div className="footer-col contact">
            <h3>Contact Us</h3>
            <p>Call: 010230123144</p>
            <p>Email: smsmsemo99@gmail.com</p>
            <p>Address: 0123 Some place</p>
            <p>EGYPT</p>
          </div>

          <div className="footer-col newsletter">
            <h3>Newsletter</h3>
            <div className="input-group">
              <input type="text" placeholder="Enter your email" />
              <button className="send-btn">
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
        <hr />
        <div className="footer-bottom">
          <p>© {year.getFullYear()} MEDAI All Rights Reserved by PNTEC-LTD</p>
          <div className="social-icons">
            <a href="#" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
            <a href="#" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
