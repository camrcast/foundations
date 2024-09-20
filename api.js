const {registerUser, queryUser, scanTickets, sendTicket, changeTicketStatus} = require('./foundationDatabase');
const {authenticateToken, authenticateManagerToken} = require("./foundationAuth");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const uuid = require("uuid");

const app = express();
const PORT = 3000;

app.use(express.json());

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
        console.log(password);
        const newUser = { id: uuid.v4(), username, password, role};
        if (registerUser(newUser)){
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
    const user = queryUser(username);
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
                expiresIn: "60m", // token expiration time (adjust as needed)
            }
        );
        res.json({token});
    }
});

app.get("/sendticket", authenticateToken, (req, res) => {
    const { by, desc } = req.body;
    by = req.user.username;
    if (!desc){
        res.status(401).json({message: "Invalid ticket"});
    }
    const ticket = {id: uuid.v4(), by, desc, "Pending"};
    sendTicket(ticket);
    res.status(201).json({message: "Ticket created"});
});

app.get("/checktickets", authenticateToken, (req, res) => {
    const data = scanTickets(req.user);
    if (!data){
        res.status(401).json({message: "No tickets to display"});
    }
    else{
        res.json({Tickets: JSON.parse(data)})
    }
});

app.get("/decideticket", authenticateManagerToken, (req, res) => {
    const {id, status} = req.body;
    if (status !== "Approved" || status !== "Denied"){
        res.status(401).json({message: "Status must be Approved or Denied"});
    }
    else{
        const data = changeTicketStatus(id, status);
        if (!data){
            res.status(401).json({message: "That ticket does not exist"});
        }
        else{
            res.json({Tickets: JSON.parse(data)})
        }
    }
});

app.listen(PORT, () => {
    console.log("Server is listening on http://localhost:3000");
})