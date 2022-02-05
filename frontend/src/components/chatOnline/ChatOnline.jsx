import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import './chatOnline.css'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
export default function ChatOnline({currentId}) {
    const {onlineFriends:onlineUsers} = useContext(AuthContext)
    const [friends,setFriends] = useState([])
    const [onlineFriends,setOnlineFriends]= useState([])
    const PF = process.env.REACT_APP_PUBLIC_FOLDER
    
    useEffect(()=>{
        const getFriend = async ()=>{
            try {
                const res = await axios.get(`/user/friends/${currentId}`)
                setFriends(res.data)
            } catch (error) {
                console.log(error)
            }
            
        }
        if(!!currentId) return getFriend()
    },[currentId])
    console.log('onl',onlineUsers)
    useEffect(()=>{
        setOnlineFriends(friends.filter(f=>onlineUsers.includes(f._id)))
    },[friends,onlineUsers])
    return (

            <div className="chatOnline">
                {onlineFriends.map((online,i) =>(
                    <div className="chatOnlineFriend" key={i}>
                    <div className="chatOnlineImgContainer">
                        <img src={online?.profilePicture?`${PF}${online.profilePicture}`:`${PF}person/noAvatar.png`} alt="" className="chatOnlineImg" />
                        <div className="chatOnlineBadge"></div>
                    </div>
                    <span className="chatOnlineName">{online.username}</span>
                </div>
                ))}
                
            </div>
    )
}
