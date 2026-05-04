import{ useState } from 'react'
import '../admin/styles/admin.css'
import { Link,useNavigate } from "react-router-dom";

 function Addabout() {
    const [about,setabout]= useState({})
    const myNavigator = useNavigate();

          function addabout(e){
        e.preventDefault();
        fetch(`https://tumorhospital.runasp.net/api/about`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(about)
        })
        .then(res => {
            if(!res.ok){
                throw("about couldn't be updated. Kindly try again");
            }
            return res.json();
        })
        .then(data => {
            myNavigator('/admin');
        })
    }

  return (
    <>
    <div className='container-fluid'>
        
      <h1 className="display-1 text-primary mt-5">ADD About</h1>
            <form onSubmit={addabout} className="my-5">
                <div className="form-group">
                    <label htmlFor="hospitalName">HospitalName</label>
                    <input type="text" id="hospitalName" className="form-control mt-2 mb-4" onChange={(e) =>setabout(prev => ({...prev,hospitalName: e.target.value}))} />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input type="text" id="description" className="form-control mt-2 mb-4" onChange={(e) =>setabout(prev => ({...prev,description: e.target.value}))} />
                </div>
                <div className="form-group">
                    <label htmlFor="mission">Mission</label>
                    <input type="text" id="mission" className="form-control mt-2 mb-4" onChange={(e) =>setabout(prev => ({...prev,mission: e.target.value}))}  />
                </div>
                <div className="form-group">
                    <label htmlFor="vision">Vision</label>
                    <input type="text" id="vision" className="form-control mt-2 mb-4" onChange={(e) =>setabout(prev => ({...prev,vision: e.target.value}))} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input type="text" id="email" className="form-control mt-2 mb-4" onChange={(e) =>setabout(prev => ({...prev,email: e.target.value}))} />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input type="text" id="phone" className="form-control mt-2 mb-4" onChange={(e) =>setabout(prev => ({...prev,phone: e.target.value}))} />
                </div>
                
                <div className="form-group">
                    <button type="submit" className="btn btn-primary me-3">Add About</button>
                    <Link to='/admin' className="btn btn-secondary">Back to Dashboard</Link>
                </div>
            </form>

            
    </div>
    </>
  )
}
export default  Addabout
