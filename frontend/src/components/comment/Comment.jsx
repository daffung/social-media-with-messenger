import axios from 'axios'
import React, { useEffect, useState ,useContext} from 'react'
import './comment.css'
import { AuthContext } from '../../context/AuthContext'
import { interceptor } from '../../refreshToken'
import { format } from 'timeago.js'
import { Link } from 'react-router-dom'
import { MoreVert } from '@material-ui/icons'

export default function Comment({ comment,fillParentId,focusTextbox,repliedComment }) {
    const { user: currentUser } = useContext(AuthContext)
    const [like, setLike] = useState(comment.likes.length)
    const [isLiked, setIsLiked] = useState(false)
    const PF = process.env.REACT_APP_PUBLIC_FOLDER
    const [user, setUser] = useState({})
    const [children, setChildren] = useState([])
    const userId = comment.userId
    
    useEffect(() => {
        axios.interceptors.response.use(undefined, interceptor(axios))
    }, [])
    useEffect(() => {
        const fetchUser = async () => {
            const res = await axios.get(`/user?userId=${userId}`)
            setUser(res.data)
        }
        fetchUser();
    }, [userId])
    useEffect(() => {
        const getChildren = async () => {

            try {
                const res = await axios.get('/comment/children/' + comment._id)
                setChildren(res.data)
            } catch (error) {
                console.log(error)
            }
        }
        getChildren()

    }, [comment._id])
    useEffect(() => {
        console.log(repliedComment?.parentId)
        if(repliedComment?.parentId === comment._id)
        setChildren(prev=> ([...prev,repliedComment]))

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repliedComment,comment._id])

    useEffect(() => {
        setIsLiked(comment.likes.includes(currentUser._id))
    }, [currentUser._id,comment.likes])
    const likeHandle = () => {
        try {
            axios.put("/comment/" + comment._id + "/like")
        } catch (e) {
            console.log(e)
        }
        setLike(isLiked ? like - 1 : like + 1)
        setIsLiked(!isLiked)
    }
    return (
        <div className="comment">
            <div className="commentWrapper">
                <div className="commentTop">
                    <div className="commentTopLeft">
                        <Link to={`/profile/${user.username}`}>
                            <img src={user.profilePicture ? `${PF}${user.profilePicture}` : `${PF}person/noAvatar.png`} alt="" className="commentProfileImg" />
                        </Link>
                        <span className="commentUsername">{user.username}</span>
                        <span className="commentDate">{format(comment.createdAt)}</span>
                    </div>
                    <div className="commentTopRight">
                        <MoreVert className="MoreVert"/>
                    </div>
                </div>
                <div className="commentBottom">
                    <div className="commentDesc">
                        {comment.desc}
                    </div>
                    
                    {comment.img && <img src={PF + comment.img} alt="" className="commentImg" />}
                    <div className="commentReply">
                        <span className="commentLikeCounter">{like} people liked</span>
                        <span className="commentLike" onClick={likeHandle}>Like</span>
                        <span className="commentLike"onClick={()=>{
                            if (comment.parentId !== undefined){
                                fillParentId(comment.parentId)
                                focusTextbox()
                            }
                            else{
                                fillParentId(comment._id)
                                focusTextbox()
                            }
                        }}>Reply</span>
                    </div>
                    
                    
                    {children.length > 0 && children.map((child, i) => (
                        <div className="childComment">
                            <Comment key={i} comment={child} fillParentId={fillParentId} focusTextbox={focusTextbox}/>
                        </div>

                    ))}
                </div>

            </div>

        </div>
    )
}
