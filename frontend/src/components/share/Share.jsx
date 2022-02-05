import { Cancel, EmojiEmotions, Label, PermMedia, Room } from "@material-ui/icons"
import axios from "axios"
import { useContext, useRef,useEffect, useState} from "react"
import { AuthContext } from "../../context/AuthContext"
import "./share.css"
import {interceptor} from '../../refreshToken'

export default function Share() {
    //axios.interceptors.response.use((res)=>(res),interceptor(axios))
    const PF = process.env.REACT_APP_PUBLIC_FOLDER
    const {user} = useContext(AuthContext)
    const desc = useRef()
    const [file,setFile]= useState(null)
    useEffect(()=>{
        axios.interceptors.response.use(undefined,interceptor(axios))
    },[])
    const submitHandle= async(e) =>{
        e.preventDefault()
        const newPost={
            desc:desc.current.value
        }
        if(file){
            const data = new FormData()
            const filename= Date.now() + file.name
            data.append("name",filename)
            data.append("file",file)
            
            newPost.img = filename
           
            try{
               await axios.post("/upload",data)
            }catch(err){
                console.log(err)
            }
        }
        
        try {
             await axios.post("/post",newPost)
             window.location.reload()
        }
        catch(e){
            console.log(e)
        }
    }
    return (
        <div className="share">
            <div className="shareWrapper">
                <div className="shareTop">
                    <img src={user.profilePicture?PF+user.profilePicture:PF+"person/noAvatar.png"} alt="" className="shareProfileImg" />
                    <input placeholder={"What's happened "+ user.username} className="shareInput" ref={desc}/>
                </div>
                <hr className="shareHr" />
                {file && (
                    <div className="shareImgContainer">
                        <img src={URL.createObjectURL(file)} alt="" className="shareImg" />
                        <Cancel className="shareCancelImg" onClick={()=>{setFile(null)}}/>
                    </div>
                )}
                <form className="shareBottom" onSubmit={submitHandle}>
                    <div className="shareOptions">
                        <label htmlFor="shareFile" className="shareOption">
                            <PermMedia htmlColor="tomato" className="shareIcon"/>
                            <span className="shareOptionText">Photo or video</span>
                            <input style={{display:"none"}} type="file" id="shareFile" name="file" accept=".png,.jpeg,.jpg" onChange={(e)=>setFile(e.target.files[0])}/>
                        </label>
                        <div className="shareOption">
                            <Label htmlColor="blue" className="shareIcon"/>
                            <span className="shareOptionText">Tag</span>
                        </div>
                        <div className="shareOption">
                            <Room htmlColor="green" className="shareIcon"/>
                            <span className="shareOptionText">Location</span>
                        </div>
                        <div className="shareOption">
                            <EmojiEmotions htmlColor="goldenrod" className="shareIcon"/>
                            <span className="shareOptionText">Feeling</span>
                        </div>
                    </div>
                    <button className="shareButton" type="submit">Share</button>
                </form>
            </div>
        </div>
    )
}

