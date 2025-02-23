import React, { useState } from 'react'; 



function Register({setToken, setIsRegistering}) {

    const [username,setUsername] = useState("");
    const [password,setPassword] = useState(""); 
    const [error,setError] = useState(""); 

    const handleRegister = async(e)=>{
        
        e.preventDefault(); // prevent page from reloading

        try{

            const response = await fetch('http://localhost:5000/register', {

                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({ username, password }),
            }).then((response)=>response.json()).then((data)=>setToken(data.token)).catch((err)=>console.log("Error:",err)) // as soon as the token is set, App component re renders and task shows up. 


            
        }
        catch(err) {
            console.log(`${err} occurred during registeration.`); 
        }
    }


    const formpart = <form onSubmit = {handleRegister}>

        <div>
            <label>Username:</label>
            <input type = "text" value = {username} onChange = {(e)=>{setUsername(e.target.value)}} required></input>

        </div>
        <div>
            <label>Password:</label>
            <input type = "password" value = {password} onChange = {(e)=>{setPassword(e.target.value);}} required></input>
        </div>
        <button type = "submit">Register</button>
    </form>

    const errorMessage = error && <p style={{ color: 'red' }}>{error}</p>;

    const alreadyhasaccount = <div>
        <p>
        Already Have an Account?{' '}
        <button onClick = {()=>{setIsRegistering(false);}}>Login</button>
    </p>
        </div>

    return(
        <div>
            {formpart}
            {errorMessage}
            {alreadyhasaccount}
        </div>
    ); 

}

export default Register;
