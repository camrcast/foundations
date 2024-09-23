const {validateReg, validateLogin, authenticateToken, authenticateManagerToken, createToken, processTicket, validateStatus, getTickets} = require("./foundationLogic");
const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// secret key for JWT signing (make sure to make this more secure in some way)

app.post("/register", async (req, res) => {
    const {username, password, role} = req.body;
    let data = await validateReg(username, password, role);
    if (data === 0){
        res.status(401).json({message: "Invalid username or password"});
    }
    else if (data === 1){
        res.status(409).json({message: "That username is taken"});
    }
    else if (data === 3){
        res.status(500).json({message: "Failed to insert user"});
    }
    else{
        res.status(201).json({message: "User successfully registered"});
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    // find the user in the database
    const user = await validateLogin(username.toLowerCase(), password);
    if (user === 0){
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
    const data = await processTicket(desc, by);
    if (data === 0){
        res.status(401).json({message: "Invalid ticket"});
    }
    else if (data === 1){
        res.status(201).json({message: "Ticket created"});
    }
    else{
        res.status(500).json({message:"Error processing ticket"});
    }
});

app.get("/checktickets", authenticateToken, async (req, res) => {
    const data = await getTickets(req.user);
    if (!data){
        res.status(204).json({message: "No tickets to display"});
    }
    else{
        res.status(200).json({Tickets: data})
    }
});

app.post("/decideticket", authenticateManagerToken, async (req, res) => {
    const {id, status} = req.body;
    const data = await validateStatus(id, status);
    if (data === 0){
        res.status(401).json({message: "Status must be Approved or Denied"});
    }
    else if (data === 1){
        res.status(404).json({message: "That ticket does not exist"});
    }
    else{
        res.status(200).json({Tickets: JSON.parse(data)});
    }
});

app.listen(PORT, () => {
    console.log("Server is listening on http://localhost:3000");
})