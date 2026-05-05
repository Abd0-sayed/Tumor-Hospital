import NumberTicker from "./Counter";
import "./style/admin.scss";

function Admincrd({ image, val, pfx, title }) {
  return (
    <div className="card">
      <div className="content">
        <p className="para">{title}</p>
        <img src={image} alt="doctor" />
        <NumberTicker
          value={val || 0}
          duration={2500}
          className="rqm font-bold"
          prefix={pfx}
        />
      </div>
    </div>
  );
}
export default Admincrd;
