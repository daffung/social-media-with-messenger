
import Home from './pages/Home/Home'
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile'
import Register from './pages/Register/Register';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { useContext,useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
 import { getUserWhenStillTokenValid } from './apiCalls'
import Messenger from './pages/messenger/Messenger';


function App() {
  //const socket = useRef()
  const {user,error,dispatch} = useContext(AuthContext)
  //Reload page
  useEffect(() => {
    getUserWhenStillTokenValid(user,error,dispatch)
    console.log('error',user,error)
  }, [user,error,dispatch])
  //  console.log('error',user,error,isLogOut)
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          {user ? <Home /> : <Register />}
        </Route>
        <Route path="/login">
          {user ? <Redirect to="/" /> : <Login />}
        </Route>
        <Route path="/register">
          {user ? <Redirect to="/" /> : <Register />}
        </Route>
        <Route path="/messenger">
          {!user ? <Redirect to="/" /> : <Messenger />}
        </Route>
        <Route path="/profile/:username">
          {!user ? <Redirect to="/" /> : <Profile />}
        </Route>

      </Switch>
    </Router>

  );
}

export default App;
