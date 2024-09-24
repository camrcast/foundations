const {createNewUser, validateLogin, authenticateToken, authenticateManagerToken, createToken, processTicket, validateStatus, checkRole} = require("./foundationLogic");
const {registerUser, queryUser, scanTicketsE, scanTicketsM, sendTicket, changeTicketStatus} = require('./foundationDatabase');
const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// secret key for JWT signing (make sure to make this more secure in some way)

app.post("/register", async (req, res) => {
    const {username, password, role} = req.body;
    let data = await createNewUser(username, password, role);
    if (!data){
        res.status(401).json({message: "Invalid username or password"});
    }
    else if (await queryUser(username)){
        res.status(409).json({message: "That username is taken"});
    }
    else if (await registerUser(newUser)){
        res.status(201).json({message: "User successfully registered"});
    }
    else{
        res.status(500).json({message: "Failed to register user"});
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    // find the user in the database
    const user = await queryUser(username.toLowerCase());
    const data = await validateLogin(username.toLowerCase(), password, user.password);
    if (data){
        res.status(401).json({message: "Invalid username or password"});
    }
    else{
        // generate the JWT token
        const token = await createToken(user);
        res.status(200).json({token});
    }
});

app.post("/sendticket", authenticateToken, async (req, res) => {
    const { desc } = req.body;
    const by = req.user.username.toLowerCase();
    const ticket = await processTicket(desc, by);
    if (!ticket){
        res.status(401).json({message: "Invalid ticket"});
    }
    const data = await sendTicket(ticket);
    if (data){
        res.status(201).json({message: "Ticket created"});
    }
    else{
        res.status(500).json({message:"Error processing ticket"});
    }
});

app.get("/checktickets", authenticateToken, async (req, res) => {
    const tickets = (req.user.role === "Manager") ? await scanTicketsM() : await scanTicketsE(req.user.username);
    res.status(200).json({Tickets: tickets});
});

app.post("/decideticket", authenticateManagerToken, async (req, res) => {
    const {id, status} = req.body;
    const data = await validateStatus(status);
    if (data){
        res.status(401).json({message: "Status must be Approved or Denied"});
    }
    else{
        const upd = await changeTicketStatus(id, status);
        if (!upd){
            res.status(404).json({message: "That ticket does not exist"});
        }
        else{
            res.status(200).json({message: "Ticket successfully updated to "+status});
        }
    }
});

app.listen(PORT, () => {
    console.log("Server is listening on http://localhost:3000");
})