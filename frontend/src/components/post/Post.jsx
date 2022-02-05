import { Cancel, Image, MoreVert, Send } from '@material-ui/icons'
import { format } from 'timeago.js'
import './post.css'
import { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { interceptor } from '../../refreshToken'
import Comment from '../comment/Comment'
export default function Post({ post }) {
    //axios.interceptors.response.use((res)=>(res),interceptor(axios))
    const [like, setLike] = useState(post.likes.length)
    const [isLiked, setIsLiked] = useState(false)
    const [user, setUser] = useState({})
    const PF = process.env.REACT_APP_PUBLIC_FOLDER
    const { user: currentUser } = useContext(AuthContext)
    const commentDesc = useRef()
    const [file, setFile] = useState(null)
    const [notChildrenComments, setNotChildrenComments] = useState([])
    const [numberOfComments, setNumberOfComments] = useState(0)
    const [parentId,setParentId] = useState(null)
    const [repliedComment,setRepliedComment] = useState({})

    const fillParentId = (id) =>{
        setParentId(id)
        commentDesc.current.value = "Replying: "
    }
    const focusTextbox = ()=>{
        commentDesc.current.focus()
    }
    useEffect(() => {
        axios.interceptors.response.use(undefined, interceptor(axios))
    }, [])
    useEffect(() => {
        const getNotChildrenComments = async () => {

            try {
                const res = await axios.get('/comment/all/' + post._id)
                setNotChildrenComments(res.data.notChildrenComments)
                setNumberOfComments(res.data.numberOfComments)
            } catch (error) {
                console.log(error)
            }
        }
        getNotChildrenComments()
    }, [post._id])

    const likeHandle = () => {
        try {
            axios.put("/post/" + post._id + "/like")
        } catch (e) {
            console.log(e)
        }
        setLike(isLiked ? like - 1 : like + 1)
        setIsLiked(!isLiked)
    }
    const setParentIdNull = () =>{
        if(commentDesc.current.value.indexOf("Replying:") !== 0) {
            setParentId(null)
       } 
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
   
        const newComment = {
            desc: commentDesc.current.value,
            postId: post._id
        }      
        if(parentId !== null) {
            newComment.parentId = parentId
        }
        if (file) {
            const data = new FormData()
            const filename = Date.now() + file.name
            data.append("name", filename)
            data.append("file", file)

            newComment.img = filename
            console.log(newComment)
            try {
                //console.log(newComment)
                await axios.post("/upload", data)
            } catch (err) {
                console.log(err)
            }
        }
        try {
            
            const res = await axios.post("/comment", newComment)
            
            commentDesc.current.value = ''
            setFile(null)
            //need a notification here
            if(newComment.parentId === undefined) { setNotChildrenComments([...notChildrenComments,res.data])}
            setRepliedComment(res.data)
            setParentId(null)
            setNumberOfComments(prev => (prev + 1))
        }
        catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        setIsLiked(post.likes.includes(currentUser._id))
    }, [currentUser._id, post.likes])
    useEffect(() => {
        const fetchUser = async () => {
            const res = await axios.get(`/user?userId=${post.userId}`)
            setUser(res.data)
        }
        fetchUser();
    }, [post.userId])
    return (
        <div className='post'>
            <div className="postWrapper">
                <div className="postTop">
                    <div className="postTopLeft">
                        <Link to={`/profile/${user.username}`}>
                            <img src={user.profilePicture ? `${PF}${user.profilePicture}` : `${PF}person/noAvatar.png`} alt="" className="postProfileImg" />
                        </Link>
                        <span className="postUsername">{user.username}</span>
                        <span className="postDate">{format(post.createdAt)}</span>
                    </div>
                    <div className="postTopRigt">
                        <MoreVert className="MoreVert" />
                    </div>
                </div>
                <div className="postCenter">
                    <span className="postText">{post?.desc}</span>
                    {post.img && <img src={PF + post.img} alt="" className="postImg" />}
                </div>
                <div className="postBottom">
                    <div className="postBottomLeft">
                        <img src={PF + "like1.png"} alt="" onClick={likeHandle} className="likeIcon" />
                        <img src={PF + "heart1.png"} alt="" onClick={likeHandle} className="likeIcon" />
                        <span className="postLikeCounter">{like} people liked</span>
                    </div>
                    <div className="postBottomRight">
                        <span className="postCommentText">{numberOfComments} comments</span>
                    </div>


                </div>
                <div className="postCommentContainer">
                    {/* notChildrenComments array here */}
                    {notChildrenComments.map((comment, i) => (
                        <Comment key={i} comment={comment} repliedComment={repliedComment} fillParentId={fillParentId} focusTextbox={focusTextbox}/>
                    ))}
                    <div className="postCommentInputContainer">
                        <div className="postCommentInputContainerLeft">
                            <input placeholder="Write a comment" className="postCommentInput" ref={commentDesc} onChange={()=>{setParentIdNull()}} />
                            {file && (
                                <div className="postCommentInputImgContainer">
                                    <img src={URL.createObjectURL(file)} alt="" className="postCommentInputImg" />
                                    <Cancel className="postCommentInputImgCancel" onClick={() => { setFile(null) }} />
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="postCommentInputMedia">
                            <label htmlFor={post._id} className="postCommentInputOption">
                                <Image className="postCommentInputIcon" />
                                <input style={{ display: "none" }} type="file" name="file" id={post._id} accept=".png,.jpeg,.jpg" onChange={(e) =>
                                    setFile(e.target.files[0])} />
                                <button type='submit' className="postCommentInputSubmitButton"><Send /></button>
                            </label>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    )
}
