import React from 'react'
import{ useState } from 'react'
import '../admin/styles/admin.css'
import { Link,useNavigate } from "react-router-dom";

export default function Addfaq() {
      const [faq,setfaq]= useState({})
    const myNavigator = useNavigate();

          function addfaq(e){
        e.preventDefault();
        fetch(`https://tumorhospital.runasp.net/api/FAQs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(faq)
        })
        .then(res => {
            if(!res.ok){
                throw("FAQ couldn't be updated. Kindly try again");
            }
            return res.json();
        })
        .then(data => {
          console.log(faq);
          
            myNavigator('/admin');
        })
    }

  return (
    <>
    <div className='container-fluid'>
        
      <h1 className="display-1 text-primary mt-5">ADD faq</h1>
            <form onSubmit={addfaq} className="my-5">
  <div className="mb-3">
    <label htmlFor="Question" className="form-label">Question</label>
    <input type="text" className="form-control" id="Question" onChange={(e) =>setfaq(prev => ({...prev,question: e.target.value}))}/>
  </div>
  <div className="mb-3">
    <label htmlFor="Answer" className="form-label">ANSWER</label>
    <input type="text" className="form-control" id="Answer" onChange={(e) =>setfaq(prev => ({...prev,answer: e.target.value}))}/>
  </div>
  <div className="form-group">
                    <button type="submit" className="btn btn-primary me-3">Add faq</button>
                    <Link to='/admin' className="btn btn-secondary">Back to Dashboard</Link>
                </div>
</form>     
    </div>
    </>
  )

}
