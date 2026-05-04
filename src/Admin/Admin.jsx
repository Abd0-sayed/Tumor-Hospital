import './styles/admin.css'
import ShowImage from './ShowImage';
import UploadImage from './UploadImage';
import doctor from'../assets/doc1.png'
import group from'../assets/group.png'
import Admincrd from './Admincrd';
import profit from '../assets/profit.png';
import reciptionist from '../assets/reciption.png';
import { Link } from "react-router-dom";
import Achart from './Achart';
import { ToastContainer,toast,Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import{ useEffect,useState} from "react";
import Adminmore from './Adminmore';
import './styles/adminmore.css'

function Admin () {

var x1array=["Appointments","Bills","Patients"];
var y1array=[100,220,150];
var x2array=["pendingBills","cancelled bills","totalCharityNeeds","completedCharityNeeds"];
var y2array=[200,20,180,100];
  const [da, setdata] = useState("");
  const[faqs,setfaqs]=useState([])
  const[about,setabout]=useState({})
  const [loading, setLoading] = useState(false)
const notify = () => toast.success("FAQ Deleted Successfully!");
  //----dashboard------
  useEffect(() => {
    setLoading(true)
    fetch("https://tumorhospital.runasp.net/api/Admin/Dashboard")
    .then((response) => {return response.json()})
    .then(data => {
        setdata(data);
        setLoading(false);
    })
    .catch((error) => {console.error("Error:", error) ;setLoading(false)});
    
  }, []);
  //----------------------------------------------------//
  
//-------About-------
useEffect(()=>{
fetch("https://tumorhospital.runasp.net/api/about")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
            setabout(data)
    })
    .catch((error) => console.error("Error:", error));
  },[])

function deleteabout(id){
        fetch(`https://tumorhospital.runasp.net/api/about/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(res => {
            if(!res.ok){
                throw("About couldn't be deleted")
            }
            setabout({});
        })
        .catch(err => console.log(err));
    }

//-------FAQS--------
useEffect(()=>{
fetch("https://tumorhospital.runasp.net/api/FAQs")
      .then((response) => response.json())
      .then((data) => {
       // console.log(data);
       setfaqs(data) 
    })
    .catch((error) => console.error("Error:", error));
  },[])

   function deletefaq(id){
        fetch(`https://tumorhospital.runasp.net/api/FAQs/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(res => {
            if(!res.ok){
                throw("FAQ couldn't be deleted")
            }
            notify();
            
            setfaqs(prev => prev.filter(faq => faq.id !== id));
        })
        .catch(err => console.log(err));
    }
    //----------------------------------------------------//

   
    if(loading) return (
          <div className=" d-flex justify-content-center align-items-center ldng">
              <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Loading...</span>
              </div>
          </div>
  )
{/*

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
    
    <div className='main-div row'>
              {/* ----Admin Card---- */}
        <div className='row g-5 col-12 justify-content-center'>
        <div className='d-flex justify-content-around'>
        <Admincrd image={doctor} val={da.totalDoctors} pfx={""} title={"DOCTORS"}/> 
        <Admincrd image={reciptionist} val={da.totalReceptionists} pfx={""} title={"Receptionists"}/>
        <Admincrd image={profit} val={da.totalRevenue} pfx={"$"} title={"PROFITS"}/>
        </div>
          
            </div>   

        {/* ----Charts---- */}
        <div id="chart" className="row align-items-bottom">
                  <h1>charts</h1>
              <div className='col-6'>
                  <Achart x={x1array} y={y1array}></Achart>
              </div>
              <div className='col-6'>
                  <Achart x={x2array} y={y2array} ></Achart>
              </div>
        </div>

        <div className='container'>

            <h1>FAQS</h1>

            <table className='table table-bordered'>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                            faqs.map(faqs => {
                                return (
                                    <tr key={faqs.id}>
                                        <td>{faqs.question}</td>
                                        <td>{faqs.answer}</td>
                                        <td className="d-flex justify-content-center">
                                            <Link to={`/faqs/${faqs.id}/edit`} className="btn btn-outline-primary me-2">Edit</Link>
                                            <button onClick={() => deletefaq(faqs.id) } className="btn btn-outline-danger">Delete</button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
              </tbody>
            </table>
                  <Link to="/admin/addFaq" className=" btn btn-outline-primary me-2 addbtn">
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

            <table className='table table-bordered'>
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
                                            {
                                                  Object.keys(about).length === 0 ? (
                                                    <Link to="/admin/addAbout" className="btn btn-success me-2">
                                                      Add
                                                    </Link>
                                                  ) : (
                                                    <Link to={`/admin/editAbout/${about.id}`} className="btn btn-outline-primary me-2">
                                                      Update
                                                    </Link>
                                                  )
                                                }
                                            <button onClick={() => deleteabout(about.id) } className="btn btn-outline-danger">Delete</button>
                                        </td>
                                    </tr>
                                
                            
                        }
              </tbody>
            </table>
        </div>
        <Adminmore/>
</div>

    </>
    )
  
}

export default Admin;




