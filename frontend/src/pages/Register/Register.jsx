import axios from 'axios'
import React, { useRef } from 'react'
import {useHistory} from 'react-router'


import "./register.css"
export default function Register() {
    const username = useRef()
    const email = useRef()
    const password = useRef()
    const passwordAgain = useRef()
    const history = useHistory()
    
    const handleClick=async (e)=>{
        
        e.preventDefault()
        console.log(password.current.value,passwordAgain.current.value)
        if(passwordAgain.current.value !== password.current.value)
        {
            passwordAgain.current.setCustomValidity("Password doesn't match")
        }else{
            const user = {
                username: username.current.value,
                email:email.current.value,
                password:password.current.value
            }
            try
            {  await axios.post("/auth/register",user)
                history.push("/login")
                }
            catch(e){
                console.log(e)
            }
        }
    }
    return (
        <div className="register">
            <div className="registerWrapper">
                <div className="registerLeft">
                    <h3 className="registerLogo">MySocial</h3>
                    <span className="registerDesc">
                        Connect with every body
                    </span>
                </div>
                <div className="registerRight">
                    <div className="registerBox">
                    <form onSubmit={handleClick} className="registerForm">
                        <h3 className="registerHead">Register</h3>
                        <input placeholder="Email" type="email" required ref={email} className="registerInput" />
                        <input placeholder="Username" required ref={username} className="registerInput" />
                        <input placeholder="Password" type="password" required ref={password} minLength="6" className="registerInput" />
                        <input placeholder="Password Again" type="password" required ref={passwordAgain} className="registerInput" />
                        <button className="registerButton" type="submit">Sign Up</button>
                    </form>
                    <button  className="registerLoginButton" onClick={e => window.location.href="/login"}>
                        Login your Account
                    </button>
                    
                    </div>
                    
                </div>
            </div>
        </div>
    )
}
