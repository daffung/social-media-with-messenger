import React, { useContext, useEffect, useRef, useState } from 'react'
import './messenger.css'
import Topbar from '../../components/topbar/Topbar'
import Conversation from '../../components/conversations/Conversation'
import Message from '../../components/message/Message'
import ChatOnline from '../../components/chatOnline/ChatOnline'
import { AuthContext } from '../../context/AuthContext'
import axios from 'axios'

import { getUserWhenStillTokenValid } from '../../apiCalls'
import {interceptor} from '../../refreshToken'
import { AddSharp } from '@material-ui/icons'
import CreateNewConv from '../../components/createNewConv/CreateNewConv'
import {socket} from '../../socket-config'

export default function Messenger() {
    const [modalShow, setModalShow] = useState(false);
    const [conversations, setConversations] = useState([])
    const [currentChat,setCurrentChat] = useState(null)
    const [messages,setMessages] = useState([])
    const [newMessage,setNewMessage] = useState("")
    const [unreadConversations,setUnreadConversations] = useState(0)
    const { user:currentUser,error,isLogOut,dispatch} = useContext(AuthContext)
    const [messageImgArray,setMessageImgArray] = useState([])
    const scrollRef = useRef()


    getUserWhenStillTokenValid(currentUser,error,isLogOut,dispatch)
    //alert new conv
    useEffect(()=>{
        const listener = (data)=>{
            if(data.members.includes(currentUser._id)&&!conversations.includes(data)){
                setConversations(prev => ([...prev,data]))
            }           
        }
        socket.on('NewConvNotify',newConv=>listener(newConv))
        return ()=>{
            socket.off('NewConvNotify')
        }
        },[currentUser._id,conversations])
    //config axios and room message
    useEffect(()=>{
        const listener = message=>{
            console.log(message)
        }
        socket.on('newJoin',message => listener(message))

        axios.interceptors.response.use((res)=>(res),interceptor(axios))
        return ()=>{
            socket.off('newJoin')
        }
    },[])
    //receive mess and leave a room
    useEffect(()=>{
        const leaveMsgListener = message=>{
            console.log(message)
        }
        const getMessageListener = data=>{
            const arrivalMessage = {
                sender: data.senderId,
                text:data.text,
                conversationId:data.conversationId,
                createdAt:Date.now()
            }           
            setMessages(prev=>[...prev,arrivalMessage])
            
        }
        socket.on('getMessage',data=>getMessageListener(data))
        
        socket.on("leaveMsg",message=>leaveMsgListener(message))
        return ()=>{
            socket.off('getMessage')
        
        socket.off("leaveMsg")
        }
    },[])
    //setUnreader
        useEffect(()=>{
            const listener = (conversationId)=>{
                if(conversations.some(c => c._id === conversationId)){
                    setConversations(prevConvs=>(
                        prevConvs.map(prevConv => {
                            if(prevConv._id === conversationId &&  !prevConv.unreader.includes(currentUser._id))
                            {   
                             
                                prevConv.unreader.push(currentUser._id)
                                return prevConv
                            }
                            else return prevConv   
                        })
                    ))
                }
            }
            socket.on("MsgNortify",({conversationId})=>listener(conversationId))
            return ()=>{socket.off("MsgNortify")}
        },[conversations,currentUser])
       
    //join a room    
    useEffect(()=>{
          socket.emit("addRoom",currentChat?._id)
        
    },[currentChat])
    //get conversations
    useEffect(() => {
        const getConversations = async () => {
            try {
                const res = await axios.get("/conversation/")
                setConversations(res.data)
            } catch (error) {
                console.log(error)
            }
        }
        getConversations()
        
    },[])
    //get  messages
    useEffect(()=>{
        const getMessages = async()=>{
            try {
                const res = await axios.get("/message/"+currentChat?._id)
                setMessages(res.data)
            } catch (error) {
                console.log(error)
            }
        }   
        if(currentChat?._id !== undefined) return getMessages()
    },[currentChat?._id])
    const handleSubmit = async (e)=>{
        e.preventDefault()
        const message = {
            sender:currentUser._id,
            text:newMessage,
            conversationId: currentChat
        }
         socket.emit("sendMessage",{
            senderId:currentUser._id,
            conversationId:currentChat._id,
            text:newMessage
         })
        try {
             const res = await axios.post("/message/",message)
             setMessages([...messages,res.data])
            await axios.put("/conversation/"+currentChat._id+"/unread",{senderId:currentUser._id})
             setNewMessage("")
        } catch (error) {
            console.log(error)
        }
    }
    //set number of unread conv
    useEffect(()=>{
        const unreadConv = conversations.filter(conv => conv.unreader.includes(currentUser._id)).length
        setUnreadConversations(unreadConv)
    },[conversations,currentUser])
    //Scrolling
    useEffect(()=>{
        scrollRef.current?.scrollIntoView({behavior:"smooth"})
    },[messages])
    //Online
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
    const Seen = async ()=>{
        try {
            if(currentChat !== null)
            {setConversations(prevConvs=>(
                prevConvs.map(prevConv => {
                    if(prevConv._id === currentChat?._id)
                    {   
                        const unreader = prevConv.unreader.filter(m => m !== currentUser._id)
                        return {...prevConv,unreader}
                    }
                    else return prevConv   
                })
            ))
            //console.log(currentChat?._id)
            await axios.put("/conversation/"+currentChat._id+"/seen",{readerId:currentUser._id})}
        } catch (error) {
            console.log(error)
        }
    }
    
    useEffect(()=>{
        Seen()
        if(currentChat !== null){
            const getImg = async(m)=>{
                    try {
                        const member = await axios.get("/user?userId="+m)
                        setMessageImgArray(prev => {
                            if(!!prev)
                            {if(!prev.some(u => u.userId === m))
                            {
                                return [...prev,{userId:m,profilePicture:member.data.profilePicture}]
                            }
                            else return prev    
                        }
                        })
                    } catch (error) {
                        console.log(error)
                    }  
                }
            currentChat.members.forEach(m => getImg(m))
            console.log("currentChatChange")
        }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[currentChat])
    return (
        <>
            <Topbar messenger unreadConvNumber={unreadConversations}/>
            <CreateNewConv show={modalShow} onHide={() => setModalShow(false)} setconversations={(data)=>{setConversations(prev => ([...prev,data]))}}/>
            <div className="messenger">
                <div className="chatMenu">
                    <div className="chatMenuWrapper">
                        <div className="chatMenuInput">
                        <input type="text" placeholder="Search for friends" className="chatMenuSearch"/>
                        <AddSharp  className="chatMenuCreate" onClick={() => setModalShow(true)}/>
                        
                        </div>
                        
                        {conversations.map((c,index)=>(
                            <div key={index} onClick={()=>{
                                //console.log("currentChat",currentChat._id)
                                socket.emit('leaveRoom',currentChat?._id)
                            
                                setCurrentChat(c)
                            }} >
                                <Conversation  index={index} unread={c.unreader.includes(currentUser._id)} conversation={c} currentChat={currentChat}/>
                            </div>                            
                        ))}
                        
                    </div>
                </div>
                <div className="chatBox">
                    {currentChat?
                        (<div className="chatBoxWrapper">
                        <div className="chatBoxTop">
                            {messages.map((m,index)=>(
                                <div key={index} ref={scrollRef}>
                                <Message  message={m} messageImgArray={messageImgArray} own={m.sender === currentUser._id }/>
                                </div>
                        ))}
                            

                        </div>
                        <div className="chatBoxBottom">
                            <textarea onClick={Seen} className="chatMessageInput" placeholder="write something..." 
                                onChange={(e)=>setNewMessage(e.target.value)}
                                value={newMessage}
                            ></textarea>
                            <button className="chatSubmitButton" onClick={handleSubmit}>Send</button>
                        </div>
                    </div>):(<span className="noConversationText">Open a new conversation to chat</span>)
                    }
                    
                </div>
                <div className="chatOnline">
                    <div className="chatOnlineWrapper">
                        <ChatOnline currentId={currentUser._id}/>
                    </div>

                </div>
            </div>
        </>
    )
}
