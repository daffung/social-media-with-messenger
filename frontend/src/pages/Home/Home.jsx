import React from 'react'
import Feed from '../../components/feed/Feed'
import Rightbar from '../../components/rightbar/Rightbar'
import Sidebar from '../../components/sidebar/Sidebar'
import Topbar from '../../components/topbar/Topbar'
import './home.css'

import { useEffect } from 'react'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import {socket} from '../../socket-config'

export default function Home(){
    const {user:currentUser,dispatch} = useContext(AuthContext)

    //console.log("home rendering")
    
    useEffect(()=>{
        socket.emit('addUser',currentUser?._id)
    },[currentUser])
    useEffect(()=>{
        const listener = (users)=>{
            const onlineFriends = currentUser.following.filter((f) => users.some((u) => u.userId === f))
            dispatch({type:"FETCH_ONLINE_FRIENDS",payload:onlineFriends})
          }
        socket.on("getUsers", (users) => listener(users))
        return ()=>{
            socket.off("getUsers");
        }
    },[currentUser,dispatch])
    return(
        <div>
            <Topbar/>
            <div className="homeContainer">
            <Sidebar/>
            <Feed/>
            <Rightbar />
            </div>
            
        </div>
    )
}