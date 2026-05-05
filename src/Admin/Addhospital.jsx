import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Addhospital() {
  const myNavigator = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    government: "",
    address: "",
    maxNumberOfDoctors: 0,
    maxNumberOfReceptionists: 0,
  });

  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/Hospitals")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        sethosName(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  // Handle basic inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gender
  const handleGenderChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      gender: e.target.value,
    }));
  };

  //handle Max to numbers
  const handleNumberChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  function Addhospital(e) {
    e.preventDefault();
    fetch(`https://tumorhospital.runasp.net/api/Hospital`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) {
          throw "Hospital couldn't be Created . Kindly try again";
        }
        return res.json();
      })
      .then((data) => {
        console.log(formData);

        myNavigator("/admin");
      });
  }

  return (
    <>
      <div className="container-fluid">
        <h1 className="display-1 text-primary mt-5">Add Hospital</h1>
        <form onSubmit={Addhospital} className="my-5">
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
          />
          <br />

          {/* government */}
          <input
            type="text"
            name="government"
            placeholder="Government"
            onChange={handleChange}
            required
          />
          <br />
          {/* Address */}
          <input
            type="text"
            name="address"
            placeholder="Adress"
            onChange={handleChange}
            required
          />

          <br />

          {/*Max numbers */}

          <input
            type="number"
            name="maxNumberOfDoctors"
            placeholder="Max Number Of Doctors"
            value={formData.maxNumberOfDoctors}
            onChange={handleNumberChange}
          />
          <br />
          <input
            type="number"
            name="maxNumberOfReceptionists"
            placeholder="Max Number Of Receptionists"
            value={formData.maxNumberOfReceptionists}
            onChange={handleNumberChange}
          />

          <div className="form-group">
            <button type="submit" className="btn btn-primary me-3">
              Add Hospital
            </button>
            <Link to="/admin" className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
