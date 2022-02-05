const AuthReducer = (state,action) => {
    switch(action.type){
        case "LOGIN_START":
            return {
                user:null,
                isFetching:true,
                error:false,
                isLogOut:false,
                onlineFriends:null
            }
        case "LOGIN_SUCCESS":
            return {
                user:action.payload,
                isFetching:false,
                error:false,
                isLogOut:false,
                onlineFriends:null
            }
        case "LOGIN_FAILURE":
            return {
                user:null,
                isFetching:false,
                error:action.payload,
                isLogOut:false,
                onlineFriends:null
            }
        case "FETCH_ONLINE_FRIENDS":
            return{
                ...state,
                onlineFriends:action.payload
            }
        case "GET_USER":
            console.log('getuser')
            return {
                user:action.payload,
                isFetching:false,
                error:false,
                isLogOut:false,
                onlineFriends:null
            }
        case "GET_USER_FAILURE":
                return {
                    ...state,
                    error:action.payload,
                    
                }
        case "LOGOUT":
            return {
                user:null,
                isFetching:false,
                error:false,
                isLogOut:true,
                onlineFriends:null
            }
        case "FOLLOW":
            return {
                ...state,
                user:{
                    ...state.user,
                    following:[...state.user.following,action.payload]
                }
            }
        case "UNFOLLOW":
            return {
                ...state,
                user:{
                    ...state.user,
                    following:state.user.following.filter(
                        following => following !== action.payload
                    )
                }
            }
            default:
                return state
    }
}
export default AuthReducer