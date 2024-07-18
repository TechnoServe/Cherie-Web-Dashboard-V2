import React,{useEffect} from 'react'

import {auth,provider} from '../config/firebase'
import { signInWithPopup } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
export const Login = () => {
    const navigate = useNavigate()
    const handleLogin = () => {
        signInWithPopup(auth,provider).then((data)=>{
            localStorage.setItem('user',JSON.stringify(data))
            navigate('/dashboard-screen')
        }).catch(err=>console.log('Pop up closed'))
    }
   
  return (
    <div class="row">
      <div class="col-6">
        <img src="/login_img.png" alt=""/>
      </div>
      <div class="col-6 bg-light">
        <div class="bg-white p-5 login-box">
          <h2 class="text-center">Login account</h2>
          <hr/>

           <div className='text-center'>
            <button className='btn btn-primary' onClick={handleLogin}>Login with google</button>
           </div>

         {/* <form>
            <div class="mb-3">
              <label for="exampleInputEmail1" class="form-label">Email address</label>
              <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"/>
            </div>
            <div class="mb-3">
              <label for="exampleInputPassword1" class="form-label">Password</label>
              <input type="password" class="form-control" id="exampleInputPassword1"/>
            </div>
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="exampleCheck1"/>
              <label class="form-check-label" for="exampleCheck1">Remember me</label>
            </div>
            <div class="d-grid gap-2">
              <Link to="/dashboard"  class="btn btn-primary">
              Login
              </Link>
            </div>
            <div class="d-flex mt-3">
              <p>Don't have account!</p>
              <Link to="/register" class="ms-2 text-decoration-none" >
               Register here
              </Link>
             
            </div>
          </form> */}
        </div>
      </div>
     
    </div>
  )
}
