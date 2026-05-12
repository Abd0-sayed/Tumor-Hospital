import Nav from "react-bootstrap/Nav";
import { Link } from "react-router-dom";
import "./navBar.scss";
import { MdOutlineLocalPhone } from "react-icons/md";
import { LuClock4 } from "react-icons/lu";
import { IoLocationSharp } from "react-icons/io5";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

function NavDropdownExample() {
  const role = sessionStorage.getItem("role");
  return (
    <>
      <Container>
        <header>
          <h1 className="myLogo">MED</h1>

          <ul>
            <li>
              <MdOutlineLocalPhone />
              <div>
                <p>EMERGENCY</p>
                <code>123456789</code>
              </div>
            </li>
            <li>
              <LuClock4 />
              <div>
                <p>WORK HOUR</p>
                <code>09:00 - 20:00</code>
              </div>
            </li>
            <li>
              <IoLocationSharp />
              <div>
                <p>LOCATION</p>
                <code>Some Place</code>
              </div>
            </li>
          </ul>
        </header>
      </Container>

      <Navbar expand="lg" className="navbar navbar-dark">
        <Container>
          <h1 className="myLogo" id="shrink" style={{ color: "white" }}>
            MED
          </h1>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav>
              <Link to="/" className="link">
                Home
              </Link>
              <Link to="/about" className="link">
                About
              </Link>
              <Link to="/donations" className="link">
                Donate
              </Link>

              {role === "Admin" ? (
                <Link to="/admin" className="link">
                  Profile
                </Link>
              ) : !role ? (
                <Link to="/login" className="link">
                  Profile
                </Link>
              ) : (
                <Link to={"/" + role + "Profile"} className="link">
                  Profile
                </Link>
              )}
              {sessionStorage.getItem("token") ? (
                <Link to="/logout" className="link">
                  Logout
                </Link>
              ) : (
                <Link to="/login" className="link">
                  Login
                </Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavDropdownExample;
