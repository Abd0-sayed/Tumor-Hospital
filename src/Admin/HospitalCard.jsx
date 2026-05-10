import React from 'react'
import "./style/hospitalcard.css"
import { Link } from "react-router-dom";
import hospital from'../assets/hospital.jpg'
import { useNavigate } from "react-router-dom";


export default function HospitalCard(props) {
  const navigate = useNavigate();
  const hosid=props.id
  return (
    <>
            <div className="hoscard">
                <div className="hoscard-details">
                    <img src={hospital} width={100} height={100} alt="" />
                    <p className="hostext-title">{props.name}</p>
                </div>
                <button className="hoscard-button"
                   onClick={() => navigate(`HospitalInfo/${props.id}`, { state: { hosid } })} >
                More info
                </button>
            </div>
    </>
  )
}
