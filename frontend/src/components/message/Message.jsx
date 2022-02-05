import React from 'react'
import './message.css'
import {format} from 'timeago.js'

export default function Message({message,own,messageImgArray}) {
    const profilePicture = messageImgArray.find(m => m.userId === message.sender)?.profilePicture 
    const PF = process.env.REACT_APP_PUBLIC_FOLDER
    return (
        <div className={own?"message own":"message"}>
            <div className="messageTop">
                <img src={profilePicture?`${PF}${profilePicture}`:`${PF}person/noAvatar.png`} alt="" className="messageImg" />
                <p className="messageText">{message?.text}</p>
            </div>

            <div className="messageBottom">{format(message?.createdAt)}</div>
            
        </div>
    )
}
