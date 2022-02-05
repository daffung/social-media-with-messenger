import { createContext, useReducer } from "react"
import AuthReducer from "./AuthReducer"



const INITIAL_STATE={
    user:null
    // {
    //     _id:"6093d7e26224700c14519802",
    //     profilePicture:"person/3.png",
    //     coverPicture:"post/2.jpeg",
    //     followers:
    //     ["6094adfca346a23c98272bde","6094b1198ecc301d5020e87f"],
    //     following:["6094adfca346a23c98272bde"],
    //     isAdmin:false,
    //     username:"johnnn",
    //     email:"Johnnn@gmail.com",
    //     password:"$2b$10$6BCSGMPcBjrlaVw7yldHkOqszbdfKo0ciNpAq6QZ8xNVaAXhq3wKG",
    //     createdAt:'2021-05-06T11:49:54.921+00:00',
    //     updatedAt:"2021-05-07T05:18:08.273+00:00",
    //     __v:1,
    //     desc:"hohohoho"
    // }
    ,
    isFetching:false,
    error:false,
    isLogOut:false,
    onlineFriends:null
}

export const AuthContext = createContext(INITIAL_STATE)
export const AuthContextProvider = ({children})=>{
    const [state,dispatch] = useReducer(AuthReducer,INITIAL_STATE)
    return (
        <AuthContext.Provider value={{user:state.user,isFetching:state.isFetching,error:state.error,isLogOut:state.isLogOut,onlineFriends:state.onlineFriends,dispatch}}>
            {children}
        </AuthContext.Provider>
    )
}