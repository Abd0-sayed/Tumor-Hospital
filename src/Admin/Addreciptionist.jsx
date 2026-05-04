import React from 'react'
import { useEffect, useState } from "react";
import { Link,useNavigate } from "react-router-dom";

export default function Addreciptionist() {
    // const [reciptionist,setreciptionist]= useState({})
    const [hospitalname,sethosName]=useState([])
    // const [Specation,setpec]=useState("")
    // const [selectedSpec, setSelectedSpec] = useState("");
    const myNavigator = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    hospitalName: "",
    email: "",
    gender: "",
    address:"",
  });

   useEffect(() => {
      fetch("https://tumorhospital.runasp.net/api/Hospitals")
      .then((response) => {return response.json()})
      .then(data => {
            sethosName(data);
      })
      .catch((error) => {console.error("Error:", error)});
      
    }, []);

    // Handle basic inputs
const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gender
  const handleGenderChange = (e) => {
    setFormData(prev => ({
      ...prev,
      gender: e.target.value
    }));
  };


          function Addrec(e){
        e.preventDefault();
        fetch(`https://tumorhospital.runasp.net/api/Admin/create-receptionist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(res => {
            if(!res.ok){
                throw("Reciptionist couldn't be Created . Kindly try again");
            }
            return res.json();
        })
        .then(data => {
          console.log(formData);
          
            myNavigator('/admin');
        })
    }

  return (
    <>
    <div className='container-fluid'>
        
      <h1 className="display-1 text-primary mt-5">Add Reciptionist</h1>
        <form onSubmit={Addrec} className="my-5">
            <input
        type="text"
        name="firstName"
        placeholder="firstName"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="lastName"
        placeholder="lastName"
        onChange={handleChange}
        required
      />

      {/* Email */}
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        required
      />
        {/* Hopital Names */}
      <select
  value={formData.hospitalName}
    onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          hospitalName: e.target.value
        }))
  }>
  <option value="">Select hospitalName</option>

  {hospitalname.map((hospital) => (
    <option key={hospital.id} value={hospital.name}>
      {hospital.name}
    </option>
  ))}
</select>
   {/* Gender */}
      <div className="my-2 ">
        <h3 className="d-inline-block">Gender :</h3>
        <label className="mx-2">
          <input name="gender" type="radio" value="Male" onChange={handleGenderChange} />
          Male
        </label>
        <label>
          <input name="gender" type="radio" value="Female" onChange={handleGenderChange} />
          Female
        </label>
      </div>
      {/* Address */}
      <input
        type="text"
        name="address"
        placeholder="Address"
        onChange={handleChange}
        required
      />
      <div className="form-group">
                    <button type="submit" className="btn btn-primary me-3">Add Reciptionist</button>
                    <Link to='/admin' className="btn btn-secondary">Back to Dashboard</Link>
                </div>
        </form>     
    </div>
    </>
  )

}
