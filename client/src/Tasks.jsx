import React, {useEffect, useState } from 'react'; 

function Tasks({token}) {

    const [tasks, setTasks] = useState([]); 
    const [newtaskdescription, setNewtaskdescription] = useState(''); 
    const [username, setUsername] = useState(''); 

    

    useEffect(()=>{



        const fetchtasks = async()=>{

            try {
                const response = await fetch('http://localhost:5000/getalltasks', {
                    
                   headers: {
                        'Content-Type':'Application/json', 'Authorization': `Bearer ${token}`
                    },
                })
                const data = await response.json(); // converted string to javascript object. this returns a javascript object of form {tasks: [all tasks]};
                setTasks(data.tasks); 
                setUsername(data.username || "noname"); 

            }catch(err) {
                console.log("Error fetching user tasks",err); 
            }
        }

        if(token) fetchtasks(); 
    },[token]) 


    // defining the add task function

    const addTask = async(e)=>{
        
        
        e.preventDefault(); // do not reload page

        try{

            const response = await fetch('http://localhost:5000/addtask',{
                    method:'POST',
                
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${token}`,
                },
                body:JSON.stringify({description:newtaskdescription,iscomplete: false,})

            })

            const data = await response.json(); 
            console.log(data.tasks);
            setTasks(data.tasks); 


        }
        catch(err) {
            console.log("Error adding task",err); 
        }


    };

    // defining the update task function


    const updateTask = async(taskid)=>{



        try{

            const response = await fetch(`http://localhost:5000/updatetask/${taskid}`,{
                method:'PUT',
                headers:{
                    'Content-Type':'application/json', 'Authorization':`Bearer ${token}`,
                }

            });

            if(!response.ok) throw new Error("Trouble updating task");

            const updatedTask = await response.json();
            const object = updatedTask.tasks; 

            setTasks(prevTasks => prevTasks.map(task => 
                task.id === taskid ? object : task
            ));

        }
        catch(err) {
            console.log("Error, ",err); 
        }
    }



    // defining the delete task function


    const deleteTask = async (taskid) => {

    

        try{

             const response = await fetch('http://localhost:5000/deletetask/', {
                method:'DELETE', headers:{
                    'Content-Type':'application/json', 'Authorization':`Bearer ${token}`,
                },
                body: JSON.stringify({taskid:taskid}), 
            })

            if(!response.ok) throw new Error("Failed to delete task");

            setTasks((prevTasks)=> prevTasks.filter(task => task.id !== taskid));

        }
        catch(err) {
            console.log("Error deleting task",err); 
        }
    }
    

    const formdiv = (
        <div>
            <h2>Your tasks, {username} </h2>
            <form onSubmit = {addTask}>
                <label>Description:</label>
                <input type = "text" value = {newtaskdescription} onChange = {(e)=>setNewtaskdescription(e.target.value)}></input>
                <button type = "Submit">Add task</button>
            </form>
        </div>
    )

    const displaytasks = (<div>

        <ul>
            {tasks.map((task)=>{

                
                     return (<li key = {task.id} style = {{marginBottom:'1rem'}}>
                <div>
                    <p>{task.description}</p>
                    <p>Status:  {task.iscomplete ? 'Complete' : 'Incomplete' } </p>
                    <button onClick = {()=>updateTask(task.id)}> {task.iscomplete? 'Mark as incomplete':'Mark as complete'}</button>
                    <button onClick = {()=>{deleteTask(task.id);}}>Delete Task</button>
                </div>
                </li>

            )
            })}
        </ul>


    </div>)

    return(<div>
        {formdiv}
        {displaytasks}
    </div>);







}

export default Tasks;
