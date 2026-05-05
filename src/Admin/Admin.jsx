import "./style/admin.scss";
import doctor from "../assets/doctor-svgrepo-com.svg";
import Admincrd from "./Admincrd";
import profit from "../assets/money-receive-svgrepo-com.svg";
import reciptionist from "../assets/office-secretary-svgrepo-com.svg";
import { Link } from "react-router-dom";
import Achart from "./Achart";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import PageLoad from "../components/pageLoad";
function Admin() {
  var x1array = ["Appointments", "Bills", "Patients"];
  var y1array = [100, 220, 150];
  var x2array = [
    "pendingBills",
    "cancelled bills",
    "totalCharityNeeds",
    "completedCharityNeeds",
  ];
  var y2array = [200, 20, 180, 100];
  const [da, setdata] = useState("");
  const [faqs, setfaqs] = useState([]);
  const [about, setabout] = useState({});
  const [loading, setLoading] = useState(false);
  const notify = () => toast.success("FAQ Deleted Successfully!");
  //----dashboard------
  useEffect(() => {
    setLoading(true);
    fetch("https://tumorhospital.runasp.net/api/Admin/Dashboard")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setdata(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, []);
  //----------------------------------------------------//

  //-------About-------
  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/about")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setabout(data);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  function deleteabout(id) {
    fetch(`https://tumorhospital.runasp.net/api/about/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          throw "About couldn't be deleted";
        }
        setabout({});
      })
      .catch((err) => console.log(err));
  }

  //-------FAQS--------
  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/FAQs")
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        setfaqs(data);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  function deletefaq(id) {
    fetch(`https://tumorhospital.runasp.net/api/FAQs/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          throw "FAQ couldn't be deleted";
        }
        notify();

        setfaqs((prev) => prev.filter((faq) => faq.id !== id));
      })
      .catch((err) => console.log(err));
  }
  //----------------------------------------------------//

  if (loading) return <PageLoad />;
  {
    /*

  firstName: "",
    lastName: "try",
    email: "",
    gender: "",
    specializationName: "Brain",
    hospitalName: "treatment",
    isVideoCallDoctor: true,
    consultationCost: 250,
    followUpCost: 100,
    videoCallCost: 50,
    schedules: []
*/
  }

  return (
    <>
      <div className="main-div row">
        {/* ----Admin Card---- */}
        <div className="cards">
          <Admincrd
            image={doctor}
            val={da.totalDoctors}
            pfx={""}
            title={"DOCTORS"}
          />
          <Admincrd
            image={reciptionist}
            val={da.totalReceptionists}
            pfx={""}
            title={"Receptionists"}
          />
          <Admincrd
            image={profit}
            val={da.totalRevenue}
            pfx={"$"}
            title={"PROFITS"}
          />
        </div>

        {/* ----Charts---- */}
        <div id="chart" className="row align-items-bottom">
          <h1>Charts</h1>
          <div className="col-6">
            <Achart x={x1array} y={y1array}></Achart>
          </div>
          <div className="col-6">
            <Achart x={x2array} y={y2array}></Achart>
          </div>
        </div>

        <div className="container">
          <h1>FAQS</h1>

          <table className="table-custome">
            <thead>
              <tr>
                <th>Question</th>
                <th>Answer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faqs) => {
                return (
                  <tr key={faqs.id}>
                    <td>{faqs.question}</td>
                    <td>{faqs.answer}</td>
                    <td>
                      <Link to={`/faqs/${faqs.id}/edit`} className="btn-edit">
                        Edit
                      </Link>
                      <button
                        onClick={() => deletefaq(faqs.id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Link to="/admin/addFaq" className="btn-add-main">
            Add New FAQ
          </Link>
          <ToastContainer
            position="top-center"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
            progressStyle={{ background: "red" }}
          />

          <h1>About</h1>

          <div className="about">
            <table className="table-custome">
              <thead>
                <tr>
                  <th>hospitalName</th>
                  <th>description</th>
                  <th>mission</th>
                  <th>vision</th>
                  <th>email</th>
                  <th>phone</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  <tr key={about.id}>
                    <td>{about.hospitalName}</td>
                    <td>{about.description}</td>
                    <td>{about.mission}</td>
                    <td>{about.vision}</td>
                    <td>{about.email}</td>
                    <td>{about.phone}</td>
                    <td className="d-flex justify-content-center">
                      {Object.keys(about).length === 0 ? (
                        <Link to="/admin/addAbout" className="btn-add-main no">
                          Add About
                        </Link>
                      ) : (
                        <>
                          <Link
                            to={`/admin/editAbout/${about.id}`}
                            className="btn-edit"
                          >
                            Update
                          </Link>
                          <button
                            onClick={() => deleteabout(about.id)}
                            className="btn-delete"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
