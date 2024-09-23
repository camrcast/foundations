const {registerUser, queryUser, scanTickets, sendTicket, changeTicketStatus} = require('./foundationDatabase');
const {authenticateToken, authenticateManagerToken} = require("./foundationAuth");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
let secretKey = "";
fs.readFile('./key.txt', (err, data) => {
    if (err) throw err;
    secretKey = data.toString();
});

// secret key for JWT signing (make sure to make this more secure in some way)

app.post("/register", async (req, res) => {
    let {username, password, role} = req.body;
    role = (role !== "Manager") ? "Employee" : "Manager";
    if (!username || !password){
        res.status(401).json({message: "Invalid username or password"});
    }
    else{
        const saltRounds = 10;
        password = await bcrypt.hash(password, saltRounds);
        const newUser = { username: username.toLowerCase(), password, role};
        if (await registerUser(newUser)){
            res.status(201).json({message: "User successfully registered"});
        }
        else{
            res.status(409).json({message: "That username is taken"});
        }
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    // find the user in the database
    const user = await queryUser(username.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password))){
        res.status(401).json({message: "Invalid username or password"});
    }
    else{
        // generate the JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            secretKey,
            {
                expiresIn: "20m", // token expiration time (adjust as needed)
            }
        );
        res.json({token});
    }
});

app.post("/sendticket", authenticateToken, async (req, res) => {
    const desc = req.body;
    const by = req.user.username.toLowerCase();
    if (!desc){
        res.status(401).json({message: "Invalid ticket"});
    }
    const ticket = {id: uuid.v4(), by, desc, status: "Pending"};
    if (await sendTicket(ticket)){
        res.status(201).json({message: "Ticket created"});
    }
    else{
        res.status(500).json({message:"Error processing ticket"});
    }
});

app.get("/checktickets", authenticateToken, async (req, res) => {
    const data = await scanTickets(req.user);
    if (!data){
        res.status(404).json({message: "No tickets to display"});
    }
    else{
        res.json({Tickets: JSON.parse(data)})
    }
});

app.post("/decideticket", authenticateManagerToken, async (req, res) => {
    const {id, status} = req.body;
    if (status !== "Approved" || status !== "Denied"){
        res.status(401).json({message: "Status must be Approved or Denied"});
    }
    else{
        const data = await changeTicketStatus(id, status);
        if (data.size < 1){
            res.status(404).json({message: "That ticket does not exist"});
        }
        else{
            res.json({Tickets: JSON.parse(data)})
        }
    }
});

app.listen(PORT, () => {
    console.log("Server is listening on http://localhost:3000");
})