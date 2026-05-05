import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
export default function Adddoctor() {
  const [Specialization, setSpec] = useState([]);
  const [hospitalname, sethosName] = useState([]);
  // const [Specation,setpec]=useState("")
  // const [selectedSpec, setSelectedSpec] = useState("");
  const myNavigator = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "try",
    email: "",
    gender: "",
    specializationName: "Brain",
    hospitalName: "treatment",
    isVideoCallDoctor: true,
    consultationCost: 0,
    followUpCost: 0,
    videoCallCost: 0,
    schedules: [],
  });

  // Specialization//
  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/Specialization")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        //  const names = data.map(spc => spc.name);
        setSpec(data);
        //setSpec(data);
        //console.log(Specialization);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  // Hospital Names//
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

  const dayOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

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
  // Vediocall check
  const handleVedioChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isVideoCallDoctor: e.target.value === "true",
    }));
  };

  //handle costs to numbers
  const handleNumberChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  // Add / Remove Day
  const handleDayToggle = (dayOfWeek) => {
    setFormData((prev) => {
      const exists = prev.schedules.find((d) => d.dayOfWeek === dayOfWeek);

      if (exists) {
        return {
          ...prev,
          schedules: prev.schedules.filter((d) => d.dayOfWeek !== dayOfWeek),
        };
      } else {
        return {
          ...prev,
          schedules: [...prev.schedules, { dayOfWeek, startTime: "" }],
        };
      }
    });
  };

  // Update time
  const handleTimeChange = (dayOfWeek, field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d,
      ),
    }));
  };

  // Create Doctor//

  function createDoctor(e) {
    e.preventDefault();

    if (formData.schedules.length < 3) {
      alert("Select at least 3 days");
      return;
    }

    // check times filled
    for (let s of formData.schedules) {
      if (!s.startTime) {
        alert(`Please set time for ${s.dayOfWeek}`);
        return;
      }
    }
    console.log(formData);

    fetch(`https://tumorhospital.runasp.net/api/Admin/create-doctor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) {
          throw "Doctor couldn't be Created . Kindly try again";
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);

        myNavigator("/admin");
      })
      .catch((res) => {
        console.log(res);
      });
  }

  // ///////////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////////////////////////

  return (
    <form onSubmit={createDoctor}>
      <div className="container">
        <h2>Create Doctor</h2>

        {/* Name */}
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

        {/* Specialization */}
        <select
          value={formData.specializationName}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              specializationName: e.target.value,
            }))
          }
        >
          <option value="">Select Specialization</option>

          {Specialization.map((spc) => (
            <option key={spc.id} value={spc.name}>
              {spc.name}
            </option>
          ))}
        </select>

        {/* Hopital Names */}
        <select
          value={formData.hospitalName}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              hospitalName: e.target.value,
            }))
          }
        >
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
            <input
              name="gender"
              type="radio"
              value="Male"
              onChange={handleGenderChange}
            />
            Male
          </label>
          <label>
            <input
              name="gender"
              type="radio"
              value="Female"
              onChange={handleGenderChange}
            />
            Female
          </label>
        </div>

        {/* Vedio Doctor */}
        <div className="my-2">
          <h3 className="d-inline-block">
            Is Doctor available for VedioCall :
          </h3>
          <label className="mx-2">
            <input
              name="vedio"
              type="radio"
              value="true"
              onChange={handleVedioChange}
            />
            Yes
          </label>
          <label>
            <input
              name="vedio"
              type="radio"
              value="false"
              onChange={handleVedioChange}
            />
            No
          </label>
        </div>

        {/* Cost */}

        <input
          type="number"
          name="consultationCost"
          placeholder="Consultation Cost"
          value={formData.consultationCost}
          onChange={handleNumberChange}
        />

        <input
          type="number"
          name="followUpCost"
          placeholder="Follow Up Cost"
          value={formData.followUpCost}
          onChange={handleNumberChange}
        />

        <input
          type="number"
          name="videoCallCost"
          placeholder="Video Call Cost"
          value={formData.videoCallCost}
          onChange={handleNumberChange}
        />

        {/* Schedule */}
        <div>
          <p>Select days and times:</p>

          {dayOfWeek.map((dayOfWeek) => {
            const selectedDay = formData.schedules.find(
              (d) => d.dayOfWeek === dayOfWeek,
            );

            return (
              <div key={dayOfWeek}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!selectedDay}
                    onChange={() => handleDayToggle(dayOfWeek)}
                  />
                  {dayOfWeek}
                </label>

                {selectedDay && (
                  <>
                    <input
                      type="time"
                      value={selectedDay.startTime}
                      onChange={(e) =>
                        handleTimeChange(dayOfWeek, "startTime", e.target.value)
                      }
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="form-group">
          <button type="submit" className="btn btn-primary me-3">
            Add Doctor
          </button>
          <Link to="/admin" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </form>
  );
}

