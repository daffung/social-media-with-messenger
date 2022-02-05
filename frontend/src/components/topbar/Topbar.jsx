import './topbar.css'
import {Search,Person,Notifications, Chat} from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { useContext,useState,useRef ,useEffect} from 'react';
import { AuthContext } from '../../context/AuthContext';
import {socket} from '../../socket-config'
import axios from 'axios'
import {interceptor} from '../../refreshToken'
export default function Topbar({messenger,unreadConvNumber}) {
    //axios.interceptors.response.use(undefined,interceptor(axios))
    const {user,dispatch} = useContext(AuthContext)
    const PF = process.env.REACT_APP_PUBLIC_FOLDER
    const searchInput = useRef()
    useEffect(()=>{
        axios.interceptors.response.use(undefined,interceptor(axios))
    },[])
    
    const handleLogOut = async (e) =>{
        
        await axios.get("/auth/logout")
        dispatch({type:'LOGOUT'})
        window.location.href='/'
        console.log(user)
    }
    const RegularTopbar = ()=>
    {  
        const [conversations, setConversations] = useState([])
        const [unreadConversations,setUnreadConversations] = useState(0)
        const [searchResponse,setSearchResponse] = useState([])
        const [isEmpty,setIsEmpty] = useState(true)
        const handleSearch = async (e) =>{
            e.preventDefault()
            const inputSplitArr = searchInput.current.value.split(' ').filter(e => e !== '')
            console.log(inputSplitArr) 
            if(inputSplitArr.length > 0)
            {
                setIsEmpty(false)
                const res = await axios.get(`/user/search?username=${searchInput.current.value}`)
                setSearchResponse(res.data)
            }else{
                if(isEmpty === false) return setIsEmpty(true)
            }
            
        }
        useEffect(()=>{
            console.log(searchResponse)
        },[searchResponse])
        useEffect(()=>{
            const listener = (data)=>{
                if(data.members.includes(user._id)&&!conversations.includes(data)){
                    setConversations(prev => ([...prev,data]))
                } 
            }
            socket.on('NewConvNotify',newConv=>listener(newConv))
            return ()=>{
                socket.off('NewConvNotify')
            }
            },[conversations])
        useEffect(()=>{
            
            const getConversations = async () => {
                try {
                    const res = await axios.get("/conversation")
                    setConversations(res.data)
                    setUnreadConversations(res.data.filter(c=>c.unreader.includes(user._id)).length)
                } catch (error) {
                    console.log(error)
                }
            }
            getConversations()
            
        },[])
        useEffect(()=>{
            const listener = (conversationId)=>{
                if(conversations.some(c => c._id === conversationId)){
                    setConversations(prevConvs=>(
                        prevConvs.map(prevConv => {
                            if(prevConv._id === conversationId &&  !prevConv.unreader.includes(user._id))
                            {   
                             
                                prevConv.unreader.push(user._id)
                                return prevConv
                            }
                            else return prevConv   
                        })
                    ))
                }
            }
            socket.on("MsgNortify",({conversationId})=>listener(conversationId))
            return ()=>{
                socket.off("MsgNortify")
            }
            
        },[conversations])
        useEffect(()=>{
            const unreadConv = conversations.filter(conv => conv.unreader.includes(user._id)).length
            setUnreadConversations(unreadConv)
        },[conversations])
        return (
        <div className="topbarContainer">
            <div className="topbarLeft">
                <Link to="/" style={{textDecoration:"none"}}>
                <span className="logo">Mysocial</span>
                </Link>
                
            </div>
            <div className="topbarCenter">
                <div className="searchBar">
                    <div className="searchBarInput">
                        <Search className="searchIcon" />
                        <input placeholder="Search" ref={searchInput} 
                        onChange={e=>handleSearch(e)} className="searchInput" />
                    </div>
                    
                    {!isEmpty &&
                        <div className="searchResponseContainer">
                            {
                                searchResponse.map((u,i)=>(
                                    <div key={i} className="searchResponseItem">
                                        <Link to={`/profile/${u.username}`} style={{textDecoration:'none'}}>
                                            <img src={u?.profilePicture?`${PF}${u.profilePicture}`:`${PF}person/noAvatar.png`} alt="" className="searchResponseItemImg" />
                                            <span className="searchResponseItemName">{u.username}</span>
                                        </Link>
                                    </div>
                                ))
                            }
                            
                        </div>
                    }
                </div>
            </div>
            <div className="topbarRight">
                <div className="topbarLinks">
                    <span className="topbarLink">Homepage</span>
                    <span className="topbarLink">Timeline</span>
                </div>
                <div className="topbarIcons">
                    <div className="topbarIconItem">
                        <Person/>
                        <span className="topbarIconBadge">1</span>
                    </div>
                    <div className="topbarIconItem">
                        
                        <Link to="/messenger" style={{color:"white"}}>
                        {unreadConversations === 0 ?<Chat style={{color:'#1c0442'}}/>:
                        <><Chat /><span className="topbarIconBadge">{unreadConversations}</span></>
                       }
                        </Link>
                    </div>
                    <div className="topbarIconItem">
                        <Notifications/>
                        <span className="topbarIconBadge">1</span>
                    </div>
                </div>
                <button onClick={handleLogOut} className="logOutButton">Log Out</button>
                <Link to={`/profile/${user.username}`}>
                    <img src={user.profilePicture?`${PF}${user.profilePicture}`:`${PF}person/noAvatar.png`} alt="" className="topbarImg"></img>
                </Link>
                
            </div>
        </div>
    )}
    const MessengerTopbar = ()=>{
        const [searchResponse,setSearchResponse] = useState([])
        const [isEmpty,setIsEmpty] = useState(true)
        const handleSearch = async (e) =>{
            e.preventDefault()
            const inputSplitArr = searchInput.current.value.split(' ').filter(e => e !== '')
            console.log(inputSplitArr) 
            if(inputSplitArr.length > 0)
            {
                setIsEmpty(false)
                const res = await axios.get(`/user/search?username=${searchInput.current.value}`)
                setSearchResponse(res.data)
            }else{
                if(isEmpty === false) return setIsEmpty(true)
            }
            
        }
        return (
        <div className="topbarContainer">
            <div className="topbarLeft">
                <Link to="/" style={{textDecoration:"none"}}>
                <span className="logo">Mysocial</span>
                </Link>
                
            </div>
            <div className="topbarCenter">
                <div className="searchBar">
                    <div className="searchBarInput">
                        <Search className="searchIcon" />
                        <input placeholder="Search" ref={searchInput} 
                        onChange={e=>handleSearch(e)} className="searchInput" />
                    </div>
                    
                    {!isEmpty &&
                        <div className="searchResponseContainer">
                            {
                                searchResponse.map((u,i)=>(
                                    <div key={i} className="searchResponseItem">
                                        <Link to={`/profile/${u.username}`} style={{textDecoration:'none'}}>
                                            <img src={u?.profilePicture?`${PF}${u.profilePicture}`:`${PF}person/noAvatar.png`} alt="" className="searchResponseItemImg" />
                                            <span className="searchResponseItemName">{u.username}</span>
                                        </Link>
                                    </div>
                                ))
                            }
                            
                        </div>
                    }
                </div>
            </div>
            <div className="topbarRight">
                <div className="topbarLinks">
                    <span className="topbarLink">Homepage</span>
                    <span className="topbarLink">Timeline</span>
                </div>
                <div className="topbarIcons">
                    <div className="topbarIconItem">
                        <Person/>
                        <span className="topbarIconBadge">1</span>
                    </div>
                    <div className="topbarIconItem">
                        
                        
                        {unreadConvNumber === 0 ?<Chat style={{color:'#1c0442'}}/>:
                        <><Chat /><span className="topbarIconBadge">{unreadConvNumber}</span></>
                       }
                        
                    </div>
                    <div className="topbarIconItem">
                        <Notifications/>
                        <span className="topbarIconBadge">1</span>
                    </div>
                </div>
                <button onClick={handleLogOut} className="logOutButton">Log Out</button>
                <Link to={`/profile/${user.username}`}>
                    <img src={user.profilePicture?`${PF}${user.profilePicture}`:`${PF}person/noAvatar.png`} alt="" className="topbarImg"></img>
                </Link>
                
            </div>
        </div>
    )

    }
    return(
        <>{!messenger?<RegularTopbar/>:<MessengerTopbar/>}</>
        
    )
}
