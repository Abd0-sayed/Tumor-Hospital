    import React from 'react'
    import "./style/Notfound.css"
    import { Link, useNavigate } from "react-router-dom";
    export default function Notfound() {
            const navigate = useNavigate();
    return (
        <div className='d-flex flex-column justify-content-center align-items-center' >
    <h1 className='ntitle'>404</h1>
    <p>Oops! Something is wrong.</p>
    <Link
        to="#"
        onClick={(e) => {
            e.preventDefault();
            navigate(-1);
        }}
        >previous page</Link>
        </div>
    )
    }
