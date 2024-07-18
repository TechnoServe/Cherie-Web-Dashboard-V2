import React,{useEffect, useState} from 'react'
import { Link, Outlet } from 'react-router-dom';
import '../css/Layout.css'
import Dropdown from 'react-bootstrap/Dropdown';
import logo from '../images/favicon.png'
import { useNavigate } from 'react-router-dom';
const Base = () => {
  const [user,setUser] = useState()
  const [showDropdown, setShowDropdown] = useState(false);
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const navigate = useNavigate()

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  const dropdownStyle = {
    backgroundColor: 'transparent', // Set the background color to transparent
    border: 'none', // Remove the border
    boxShadow: 'none', // Remove the shadow
  };

  useEffect(()=>{
    const userData = localStorage.getItem('user')
    setUser(JSON.parse(userData).user)
  },[])  
  return (
    <div class="LayoutDefault">
    <main class="contsdainer-fluid">
      <div class="row d-print-none">
        <div class="col-12" style={{padding:0}}>
        <nav class="navbar navbar-expand-md" style={{background:'#94d2bd'}}>
          <div class="container-fluid" style={{margin:'0 20px'}}>
            <Link to="/dashboard-screen">
              <img class="logo" src={logo} alt=""/>
            </Link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                  <Link to="/dashboard-screen" class="nav-link active">
                    Dashboard
                  </Link>
                </li>
                <li class="nav-item">
                  <Link to="/images-screen" class="nav-link">
                    <i className='fa fa-pencil'></i>
                    &nbsp;
                    Annotate
                  </Link>
                </li>
                <li class="nav-item">
                  <Link to="/artifacts-screen" class="nav-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-images" viewBox="0 0 16 16">
                      <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                      <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z"/>
                    </svg>
                    &nbsp;
                    Report
                  </Link>
                </li>
              </ul>
              <div class="d-flex prof-items">
                  
                  <Dropdown show={showDropdown} align="end">
                    <Dropdown.Toggle variant="success" id="dropdown-basic" style={dropdownStyle}>
                    <img class="mt-2 profile" src={user&&user.photoURL} alt="Profile image" onClick={toggleDropdown}/>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                    <Dropdown.Item>{user && user.displayName}</Dropdown.Item>
                    <Dropdown.Item>{user && user.email}</Dropdown.Item>
                    <Dropdown.Item><div onClick={logout}>Logout</div></Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
        </nav>  
        </div>
      </div>
      <Outlet/>
    </main>
    <footer class="LayoutDefault__footer text-center">
      &copy; TNS 2022
    </footer>
  </div>
  )
}

export default Base;
