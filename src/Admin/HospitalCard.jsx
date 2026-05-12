import React from 'react'
import "./style/hospitalcard.css"
import { Link } from "react-router-dom";
import hospital from'../assets/hospital.jpg'
import { useNavigate } from "react-router-dom";


export default function HospitalCard(props) {
  const navigate = useNavigate();
  const hosid=props.id
  console.log(props.government);
  
  return (
    <>
            <div className="hoscard my-5">
                <div className="hoscard-details">
                    <img className='img-card' src={hospital}  alt="" />
                    <p className="hostext-title">{props.name}</p>
                    <p className="hostext-gov">{props.government}</p>
                </div>
                <button className="hoscard-button"
                   onClick={() => navigate(`HospitalInfo/${props.id}`, { state: { hosid } })} >
                More info
                </button>
            </div>
    </>
  )
}
