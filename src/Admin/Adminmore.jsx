import React from 'react'
import { Link } from 'react-router-dom'

export default function Adminmore() {
  return (
    <> 
<div className="dropdown">
  <input
    hidden=""
    className="sr-only"
    name="state-dropdown"
    id="state-dropdown"
    type="checkbox"
  />
  <label
    aria-label="dropdown scrollbar"
    htmlFor="state-dropdown"
    className="trigger"
  ></label>

  <ul className="list webkit-scrollbar" role="list" dir="auto">
    <li className="listitem" role="listitem">
      <Link className="navbar-brand active" aria-current="page" to="/admin/addDoctor">
      <button className='btn btn-info me-2 add' >Add Doctor</button>
      </Link>
    </li>
    <li className="listitem" role="listitem">
      <Link className="navbar-brand active" aria-current="page" to="/admin/addRecipionist">
      <button className='btn btn-info me-2 add' >Add Reciptionist</button>
      </Link>
    </li>
    <li className="listitem" role="listitem">
      <Link className="navbar-brand active" aria-current="page" to="/admin/addhospital">
      <button className='btn btn-info me-2 add' >Add Hospital</button>
      </Link>
    </li>

    
  </ul>
</div>


    </>
  )
}
