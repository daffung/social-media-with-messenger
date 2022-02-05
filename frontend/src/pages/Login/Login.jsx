import React, { useContext, useRef } from 'react'
import { loginCall} from '../../apiCalls'
import { AuthContext } from '../../context/AuthContext'
import "./login.css"
import {CircularProgress} from '@material-ui/core'
export default function Login() {
    
    const{user,isFetching,error,dispatch}= useContext(AuthContext)
    console.log('user',user)
    const email = useRef()
    const password = useRef()
    const handleClick=(e)=>{
        e.preventDefault()
        loginCall({email:email.current.value,password:password.current.value},dispatch)
    }
    if(error){
        console.log(error)
    }
    return (
        <div className="login">
            <div className="loginWrapper">
                <div className="loginLeft">
                    <h3 className="loginLogo">MySocial</h3>
                    <span className="loginDesc">
                        Connect with every body
                    </span>
                </div>
                <div className="loginRight">
                    <form onSubmit={handleClick} className="loginBox">
                        <h3 className="loginHead">Login</h3>
                        <input type="email" placeholder="Email" className="loginInput" ref={email} required/>
                        <input type="password" placeholder="Password" className="loginInput" ref={password} required minLength="6"/>
                        <button className="loginButton" disabled={isFetching}>{isFetching?<CircularProgress color="secondary" size="20px"/>:"Log In"}</button>
                        <span className="loginForgot">Forgot Password ?</span>
                        <button onClick={()=>window.location.href='/register'}className="loginRegisterButton">
                            Create a New Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
