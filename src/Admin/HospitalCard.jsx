import "./style/hospitalcard.scss";
import hospital from "../assets/hospital.jpg";
import { useNavigate } from "react-router-dom";

export default function HospitalCard(props) {
  const navigate = useNavigate();
  const hosid = props.id;

  const handleNavigate = () => {
    navigate(`HospitalInfo/${props.id}`, { state: { hosid } });
  };

  return (
    <div className="hoscard">
      <div className="hoscard-details">
        <div className="hoscard-img-wrapper">
          <img className="img-card" src={hospital} alt={props.name} />
        </div>

        <div className="hoscard-content">
          <h3 className="hostext-title">{props.name}</h3>
          <p className="hostext-gov">
            <i className="bi bi-geo-alt"></i> {props.government}
          </p>
        </div>
      </div>

      <button className="hoscard-button" onClick={handleNavigate}>
        More Info
      </button>
    </div>
  );
}
