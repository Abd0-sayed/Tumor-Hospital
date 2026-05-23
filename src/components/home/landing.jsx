import "./homeStyle/landing.scss";
import {
  MdCalendarToday,
  MdPeopleOutline,
  MdAccountBalanceWallet,
} from "react-icons/md";
const Landing = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <span className="subtitle">CARING FOR LIFE</span>
          <h1>
            Leading the Way <br /> in Medical Excellence
          </h1>
          <button className="btn-primary">Our Services</button>
        </div>

        <div className="hero-cards">
          <div className="card dark-blue">
            <span>Available All The Time</span>
            <MdCalendarToday className="card-icon" />
          </div>
          <div className="card light-blue">
            <span>We Care About The People</span>
            <MdPeopleOutline className="card-icon" />
          </div>
          <div className="card sky-blue">
            <span>We Have Free Services</span>
            <MdAccountBalanceWallet className="card-icon" />
          </div>
        </div>
      </div>
    </section>
  );
};
export default Landing;
