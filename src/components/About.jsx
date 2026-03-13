import { Link } from 'react-router-dom';
function About() {

  return (
    <div>
      <h1>About Us</h1>

      <nav>
        <Link className="navbar-item" to="/">Home</Link>
      </nav>
    </div>
  );
}

export default About;
