import axios from "axios"
//import {EmptyVariable,interceptor} from './refreshToken'


export const loginCall = async (userCredential,dispatch) => {

    dispatch({type:"LOGIN_START"})
    console.log(234455)
    try{
        const res = await axios.post("auth/login",userCredential)
        const {CreatedDate,accessToken,...user}=res.data
        
        dispatch({type:"LOGIN_SUCCESS",payload:user})
    }catch(e){
        dispatch({type:"LOGIN_FAILURE",payload:e})
    }
}
const getUser = async (dispatch)=>{

    try {
        const res = await axios.get('/user/')
        dispatch({type:"GET_USER",payload:res.data})
    } catch (error) {
        //console.log(error.response)
        if(error.response)
        {if(error.response.status === 401){
            await refreshInternal(dispatch)
        }
        else{
            console.log(error)
        }}
    }
 }
const refreshInternal = async (dispatch)=>{
    try {
        await axios.get('/auth/refresh')
        getUser(dispatch)
    } catch (error) {
        console.log(error)
    }
}
export const getUserWhenStillTokenValid = async (user,error,dispatch)=>{
    //await loginCall(null,dispatch)
    //console.log(error)
    if (!user && !error) {
        try {
            await getUser(dispatch)
        } catch (error) {
            dispatch({type:'LOGOUT'})
        }
         
       }

    //   if (user && window.localStorage.getItem('TimeLogIn') !== '0') {
    //     if (Date.now() - parseInt(window.localStorage.getItem('TimeLogIn')) > 450*1000) {
    //       window.localStorage.setItem("timeAlive",Date.now() - parseInt(window.localStorage.getItem('TimeLogIn')))
    //       dispatch({type:'LOGOUT'})
    //       window.localStorage.setItem("TimeLogIn","0")
    //       window.location.href='/login'
    //     }
     // }
}
