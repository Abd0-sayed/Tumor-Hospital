import React from 'react'
import "./style/Forbidden.css"
import { Link, useNavigate } from "react-router-dom";
export default function Forbidden() {
      const navigate = useNavigate();
  return (
    <div>
     <div class="page-wrap">
  <div class="page-not-found">
    <img src="https://res.cloudinary.com/razeshzone/image/upload/v1588316204/house-key_yrqvxv.svg" class="img-key" alt=""/>
    <h1 class="text-xl">
      <span>4</span>
      <span>0</span>
      <span class="broken">3</span>
    </h1>
    <h4 class="text-md">Access Denied !</h4>
    <h4 class="text-sm text-sm-btm">You don’t have access to this area of application. Speak to your administrator to unblock this feature. You can go back to 
        <Link
      to="#"
      onClick={(e) => {
        e.preventDefault();
        navigate(-1);
      }}
    >previous page</Link></h4>
  </div>
</div>
    </div>
  )
}
