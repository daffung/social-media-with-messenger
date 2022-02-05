import { Users } from '../../dummyData'
import './rightbar.css'
import Online from '../Online/Online'
import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { Add, Remove } from '@material-ui/icons'
import {interceptor} from '../../refreshToken'

export default function Rightbar({user}) {
    //axios.interceptors.response.use((res)=>(res),interceptor(axios))
    const PF = process.env.REACT_APP_PUBLIC_FOLDER
    const [friends,setFriends] = useState([])
    const {user:currentUser,dispatch} = useContext(AuthContext)
    const included = currentUser.following.includes(user?._id)
    const [followed,setFollowed] =  useState(included)
    useEffect(()=>{
        setFollowed(included)
    },[included])
    useEffect(()=>{
        axios.interceptors.response.use(undefined,interceptor(axios))
    },[])
    useEffect(()=>{
        const getFriends = async ()=>{
            try{
                if(!!user){
                    const friendList = await axios.get(`/user/friends/${user._id}`)
                    setFriends(friendList.data)
                }         
            }
            catch(e){
                console.log(e)
            }
        }
         getFriends()
         
    },[user])
    // useEffect(()=>{
    //     console.log(followed,currentUser.following)
    // },[followed,currentUser.following])

    const handleClick = async() =>{
        try {
            if(followed){
                await axios.put("/user/"+user._id+"/unfollow",{userId:currentUser._id})
                dispatch({type:"UNFOLLOW",payload:user._id})
            }else{
                await axios.put("/user/"+user._id+"/follow",{userId:currentUser._id})
                dispatch({type:"FOLLOW",payload:user._id})
            }
        } catch (error) {
            console.log(error)
        }
        setFollowed(!followed)
    }
    const HomeRightBar = () =>{
        return(
            <>
            
            <div className="birthdayContainer">
                    <img src={PF+"birthday.png"} alt="" className="birthdayImg" />
                    <span className="birthdayText">
                        <b>Minh</b> and <b>3 more friends</b> have a birthday today
                    </span>
                </div>
                <img src={PF+"banner.jpg"} alt="" className="rightbarAd" />
                <h4 className="rightbarTitle">Online Friends</h4>
                <ul className="rightbarFriendList">
                    {Users.map(u=>(
                        <Online key={u.id} user={u}/>
                    ))}

                </ul>
            </>
        )
    }
    const ProfileRightBar = () =>{
        return(
        <>{
            user.username !== currentUser.username && (
                <button className="rightbarFollowButton" onClick={handleClick}>
                   {followed?"Unfollow":"Follow"}
                   {followed?<Remove/>:<Add/>}
                </button>
            )
        }
            <h4 className="rightbarTitle">User Information</h4>
            <div className="rightbarInfo">
                <div className="rightbarInfoItem">
                    <span className="rightbarInfoKey">City:</span>
                    <span className="rightbarInfoValue">{user.city}</span>
                </div>
                <div className="rightbarInfoItem">
                    <span className="rightbarInfoKey">From:</span>
                    <span className="rightbarInfoValue">{user.from}</span>
                </div>
                <div className="rightbarInfoItem">
                    <span className="rightbarInfoKey">Relationship:</span>
                    <span className="rightbarInfoValue">{user.relationship === 1 ?"Single":user.relationship === 2 ?"Married":"None"}</span>
                </div>
            </div>
            <h4 className="rightbarTitle">User's followings</h4>
            <div className="rightbarFollowings">
                {friends.map(friend=>(
                <Link key ={friend._id} style={{textDecoration:"none"}}to={"/profile/"+friend.username}>
                    <div className="rightbarFollowing">
                        <img src={friend.profilePicture?PF+friend.profilePicture:`${PF}person/noAvatar.png`} alt="" className="rightbarFollowingImg" /> 
                        <span className="rightbarFollowingName">{friend.username}</span>  
                    </div>
                </Link>
                ))}
                
            </div>
        </>)
    }
    return (
        <div className="rightbar">
            <div className="rightbarWrapper">
                {user ? <ProfileRightBar/>:<HomeRightBar/>}
            </div>
        </div>
    )
}
