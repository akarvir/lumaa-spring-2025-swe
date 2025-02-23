import React, { useState } from 'react'; 

function Login({setToken, setIsRegistering}) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e)=>{

        e.preventDefault();

        try{

            const response = await fetch('http://localhost:5000/login', {
            method:'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ username, password }),
             } )

            const data = await response.json(); 

            if(!response.ok) {setIsRegistering(true);}
            else setToken(data.token); 


        }
        catch(err) {
            console.log("Error ", err); 
        }

    }


    const first_div = (<div>
        <h2>Login</h2>
        <form onSubmit = {handleLogin}>
            <div>
                <label>Username:</label>
                <input type = "text" value = {username} onChange = {(e)=>{setUsername(e.target.value);}}></input>
            </div>
            <div>
                <label>Password:</label>
                <input type = "password" value = {password} onChange = {(e)=>{setPassword(e.target.value);}}></input>
            </div>
            <button type = "submit">Login</button>
        </form>
    </div>)

    return(<div>
        {first_div}
    </div>);
}

export default Login; 