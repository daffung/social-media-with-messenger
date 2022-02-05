
import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import "./conversation.css"

export default function Conversation({index,unread,conversation,currentChat}) {
    const {user:currentUser} = useContext(AuthContext)
    const PF = process.env.REACT_APP_PUBLIC_FOLDER
    const [user,setUser] = useState(null)
    


    useEffect(()=>{
        const friendId = conversation.members.find(m => m !== currentUser._id)
        const getUser = async()=>{
            try {
                const res = await axios.get("/user?userId="+friendId)
                setUser(res.data)
            } catch (error) {
                console.log(error)
            }  
        }
        getUser()
        
    },[conversation,currentUser])
    
    //need trigger to notice coming message 
    return (
        <div  className= {unread?"conversation  unread":"conversation"}>
            <img src={user?.profilePicture?`${PF}${user.profilePicture}`:`${PF}person/noAvatar.png`} alt="" className="conversationImg" />
            <span className="conversationName">
                {user?.username}
            </span>
             {unread && <span className= "unreadAlert"></span>}
        </div>
    )
}
