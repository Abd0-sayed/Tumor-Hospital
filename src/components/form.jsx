import "./componentsStyle/form.scss";
import { MdExpandMore } from "react-icons/md";

const Appointment = () => {
  return (
    <section className="appointment">
      <div className="container appointment-wrapper">
        <div className="appointment-info">
          <h2>Book an Appointment</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
            placerat scelerisque tortor ornare ornare. Convallis felis vitae
            tortor augue. Velit nascetur proin massa in. Consequat faucibus
            porttitor enim et.
          </p>
        </div>

        <form className="appointment-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-grid">
            <div className="input-group">
              <input type="text" placeholder="Name" />
            </div>
            <div className="input-group">
              <select>
                <option value="Male">Male</option>
                <option value="female">Female</option>
              </select>
              <MdExpandMore className="select-icon" />
            </div>
            <div className="input-group">
              <input type="email" placeholder="Email" />
            </div>
            <div className="input-group">
              <input type="tel" placeholder="Phone" />
            </div>
            <div className="input-group">
              <select>
                <option>Date</option>
              </select>
              <MdExpandMore className="select-icon" />
            </div>
            <div className="input-group">
              <select>
                <option>Time</option>
              </select>
              <MdExpandMore className="select-icon" />
            </div>
            <div className="input-group">
              <select>
                <option>Doctor</option>
              </select>
              <MdExpandMore className="select-icon" />
            </div>
            <div className="input-group">
              <select>
                <option>Department</option>
              </select>
              <MdExpandMore className="select-icon" />
            </div>
          </div>

          <textarea placeholder="Message"></textarea>

          <button type="submit" className="submit-btn">
            SUBMIT
          </button>
        </form>
      </div>
    </section>
  );
};

export default Appointment;
