import React from 'react'
import './createNewConv.css'
import {Modal,Button, Form} from 'react-bootstrap'
import { useContext,useEffect,useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import axios from 'axios'
import {socket} from '../../socket-config'

export default function CreateNewConv(props) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER
  const {user} = useContext(AuthContext)
  const [friends,setFriends] = useState([])
  const [selectedFriends,setSelectedFriends]= useState([])
  useEffect(()=>{
    const getFriend = async ()=>{
        try {
            const res = await axios.get(`/user/friends/${user?._id}`)
            setFriends(res.data)
        } catch (error) {
            console.log(error)
        }
        
    }
    if(!!user) return getFriend()
},[user])
const handleSubmit = async (e) =>{
    e.preventDefault()
    try {
      const res = await axios.post('/conversation/',{members:[...selectedFriends,user._id.toString()]})
      props.setconversations(res.data)
      socket.emit('CreateNewConv',res.data)
    } catch (error) {
      console.log(error)
    }
    props.onHide()
}
  const handleCheckboxChange = (id) =>{
    const friendId = id.toString()
    setSelectedFriends(prev =>{
      if(prev.includes(friendId)){
        return prev.filter(f => f !== friendId)
      }else{
        return [...prev,friendId]
      }
    })
  }
  console.log(selectedFriends)
    return (
        <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    > <Form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Create new conversation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        
        <div className="friendList">
          <div className="friendListContainer">
          {friends.map((friend,i)=>(
            <Form.Group controlId={friend._id} key={friend._id}>
              <Form.Check type='checkbox' id={i} 
              defaultChecked={selectedFriends.includes(friend._id.toString())}
              label={
                  <div className="friendListItem">
                  <img src={friend.profilePicture?PF+friend.profilePicture:`${PF}person/noAvatar.png`} alt="" className="friendListItemImg" /> 
                  <span className="friendListItemName">{friend.username}</span>  
              </div>
                }
              onChange={()=>handleCheckboxChange(friend._id)}></Form.Check>
            </Form.Group>
                
                
            ))}
          </div>
        </div>
        
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Cancel</Button>
        <Button type='submit'>Create</Button>
      </Modal.Footer>
      
        </Form>
    </Modal>
    )
}
