import React, { useState } from 'react'; 
import Login from './Login'; 
import Register from './Register'; 
import Tasks from './Tasks'; 


function App() {

    const [token,setToken] = useState(null); 
    const [isRegistering,setIsRegistering] = useState(false); 

    if(!token) {

        return(
            <div>
                {isRegistering? (<Register setToken = {setToken} setIsRegistering = {setIsRegistering}/>) : (
                    <Login setToken = {setToken} setIsRegistering = {setIsRegistering}/>
                )}
            </div>
        );
    }

    return(
        <div>
            <Tasks token = {token}/>

        </div>
    );
}

export default App; 