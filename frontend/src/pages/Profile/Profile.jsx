import React,{useState,useEffect} from 'react'
import axios from 'axios'
import './profile.css'
import Feed from '../../components/feed/Feed'
import Rightbar from '../../components/rightbar/Rightbar'
import Sidebar from '../../components/sidebar/Sidebar'
import Topbar from '../../components/topbar/Topbar'
import {useParams} from 'react-router'




export default function Profile() {
  //Reload page



    const [user,setUser]=useState({})
    const PF = process.env.REACT_APP_PUBLIC_FOLDER
    const username  = useParams().username
    useEffect(()=>{
        const fetchUser= async()=>{
            try {
                const res = await axios.get(`/user?username=${username}`)
                setUser(res.data)
            } catch (error) {
                console.log(error)
            }
        }
       fetchUser();
    },[username])
    return (
        <div>
            <Topbar />
            <div className="profile">
                <Sidebar />

                <div className="profileRight">
                    <div className="profileRightTop">
                        <div className="profileCover">
                            <img src={user.coverPicture?`${PF}${user.coverPicture}`:`${PF}/noCover.png`} alt="" className="profileCoverImg" />
                            <img src={user.profilePicture?`${PF}${user.profilePicture}`:`${PF}person/noAvatar.png`} alt="" className="profileUserImg" />
                        </div>
                        <div className="profileInfo">
                            <h4 className="profileInfoName">{user.username}</h4>
                            <span className="profileInfoDesc">{user.desc}</span>
                        </div>

                    </div>
                    <div className="profileRightBottom">
                        <Feed username={username}/>
                        <Rightbar user={user}/>
                    </div>
                </div>
            </div>
        </div>
    )
}
