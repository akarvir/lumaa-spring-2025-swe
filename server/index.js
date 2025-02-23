const express  = require("express"); 
const jwt = require("jsonwebtoken"); 
const bodyparser = require("body-parser"); 
const bcrypt = require("bcryptjs"); 
const cors = require("cors"); 
const pool = require("./db"); 



require('dotenv').config();  // access to some constant environmental variables. 


const app = express(); 

const saltrounds = 10; // Number of times password is rehashed. 10-12 is sweet spot. 

// middleware 

app.use(bodyparser.json()); 
app.use(cors()); 

const jwtsecret = process.env.JWT_SECRET; 



// ROUTES



// REGISTER

app.post("/register",async (req,res)=>{ 

    const{ username, password } = req.body; 


    

    bcrypt.hash(password, saltrounds, async(err,hash) => {

        if(err) {
            return res.status(401).json({message:err}); 
        }

        try {
            
            const result = await pool.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",[username,hash]); // if this happened successfully, it means user is registered

            const payload = {id:result.rows[0].id, username: username}; 

            const token = jwt.sign(payload, jwtsecret, { expiresIn: '1h' }); 

            res.json({ token });  // as soon as this is received and set at the other end, tasks will show up. 

        }
        catch(error) {
            return res.status(401).json({message:error}); 
        }


    })




})

// LOGIN 


app.post("/login", async (req,res)=>{

    try {

        const { username, password } = req.body; 
        
        const is_user = await pool.query("SELECT EXISTS(SELECT 1 FROM users WHERE username = $1) AS exists",[username]);

        if(!is_user.rows[0].exists) return res.status(401).json({message:"User does not exist. Please create an account!"}); // checking if user with this username exists. 

        const hashedpasswordobject = await pool.query("SELECT password FROM users WHERE username = $1",[username]); 

        const hashedpassword = hashedpasswordobject.rows[0].password; 
        
        const findinguserid = await pool.query("SELECT id FROM users WHERE username = $1",[username]);

        const userid = findinguserid.rows[0].id; 

        console.log("The userid of the person is ",userid); 


        const ispasswordvalid = bcrypt.compareSync(password, hashedpassword); // comparing the password claim, with the actual password that has been hashed. 

        if(!ispasswordvalid) return res.status(401).json({message: `${username}'s password is incorrect`}); 

        const payload = {id:userid, username:username}; 

        const token = jwt.sign(payload, jwtsecret, { expiresIn: '1h' }); 

        return res.json({ token }); 




    }
    catch(err) {
        console.log("Error: ",err); 
    }

})


// MIDDLEWARE FOR ALL CRUD FUNCTIONS

function verifytoken(req,res,next) {

    const authheader= req.headers['authorization']; // if doesn't work change it back to authorization. 

    if(!authheader) return res.status(401).json({message:"No token was sent."}); 

    const token = authheader.split(' ')[1]; // have defined `Bearer $token` when sending fetch request. 

    if(!token) return res.status(401).json({message:"No token was provided."}); 

    jwt.verify(token,jwtsecret,(err,decoded)=>{
        
        if(err) return res.status(500).json({message:"Failed to authenticate token."}); 
        
        req.user = decoded; // 
        next(); 
    })

}

// ADD TASK

app.post('/addtask',verifytoken, async (req,res)=>{

    const userid = req.user.id; 
    
    const {description} = req.body; // iscomplete always false, form consisted of just the description. 
    iscomplete = false; 
    console.log("got a request to add task: ",description); 

    try {

        await pool.query("INSERT INTO tasks (description, iscomplete, userid) VALUES ($1, $2, $3)",[description,iscomplete,userid]);
        const result = await pool.query("SELECT * FROM tasks WHERE userid = $1",[userid]);
        const tasks = result.rows;
        return res.status(200).json({tasks:tasks}); 
    }
    catch(err) {
        console.log("Error",err);
        return res.status(401).json({message:"Unable to insert task"}); 
    }
})


app.get('/getalltasks',verifytoken, async (req,res)=>{

    const userid = req.user.id; // got sent the token, which is the App component's state. 
    const username =  req.user.username; // nothing in the request body. otherwise it would be a post request. 

    console.log("Did get a request with userid",userid); 

    try {

        const result = await pool.query("SELECT * FROM tasks WHERE userid = $1",[userid]); 
        const tasks  = result.rows; // array of task objects !! POINT TO START FROM
        console.log(tasks);
        return res.status(200).json({tasks:tasks,username: username}); 

    }
    catch(err) {
        
        console.log(err); 
        res.status(401).json({error:err}); 
    }
})


// UPDATE TASK (GIVEN TASK ID)

app.put('/updatetask/:taskid',verifytoken, async (req, res)=>{ // no request body needed. still return the tasks though. 

     
    let { taskid } = req.params; 
    taskid = Number(taskid); 
    console.log("This is the id i am receiving ",taskid);

    try {

        
        await pool.query("UPDATE tasks SET iscomplete = NOT iscomplete WHERE id = $1",[taskid]); 

    }
    catch(err){
        console.log("Error:",err); 
        return res.status(401).json({message:"Trouble updating the task in the table"}); 
    }

    try{

        const result = await pool.query("SELECT * FROM tasks where id = $1",[taskid]); 
        const task = result.rows[0]; 

        return res.status(200).json({tasks:task}); 

    }
    catch(err) {
        console.log("Error:",err); 
        return res.status(401).json({message:"Trouble getting task from database"}); 
    }
})


// DELETING TASK

app.delete('/deletetask',verifytoken, async (req,res)=>{ // not returning anything. 

    let { taskid } = req.body; 
    console.log(taskid);
    taskid = Number(taskid);
    try{
         
        console.log("This is a delete attempt, and the taskid i have received is ",taskid)
        await pool.query("DELETE FROM tasks WHERE id = $1",[taskid]);
        return res.status(200).send();
    }
    catch(err) {
        console.log("Error: ",err); 
        return res.status(401).json({message:err}); 
    }
})




app.listen(5000,()=>{
    console.log("The server is listening on port 5000, we are good"); 
});
