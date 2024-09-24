const bcrypt = require("bcrypt");
const {registerUser, queryUser, scanTicketsE, scanTicketsM, sendTicket, changeTicketStatus} = require('./foundationDatabase');
const fs = require('fs');
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

let key = "";
fs.readFile('./key.txt', (err, data) => {
    if (err) throw err;
    key = data.toString();
});


async function validateReg(username, password, role){
    role = (role !== "Manager") ? "Employee" : "Manager";
    if (!username || !password){
        return 0;
    }
    if (await queryUser(username)){
        return 1;
    }
    const saltRounds = 10;
    password = await bcrypt.hash(password, saltRounds);
    const newUser = { username: username.toLowerCase(), password, role};
    if (await registerUser(newUser)){
        return 2;
    }
    return 3;
}

async function validateLogin(username, password){
    const user = await queryUser(username);
    if (!username || !(await bcrypt.compare(password, user.password))){
        return 0;
    }
    return user;
}

async function processTicket(desc, by){
    if (!desc){
        return 0;
    }
    const ticket = {id: uuid.v4(), by, desc, status: "Pending"};
    if (await sendTicket(ticket)){
        return 1;
    }
    else{
        return 2;
    }
}

async function getTickets(user){
    let data = "";
    if (user.role === "Manager"){
        data = await scanTicketsM();
    }
    else{
        data = await scanTicketsE(user.username);
    }
    return (data.keys.size < 1) ? false : data;
}

async function validateStatus(id, status){
    if (status !== "Approved" && status !== "Denied"){
        return 0;
    }
    const data = await changeTicketStatus(id, status);
    if (!data){
        return 1;
    }
    return 2;
}

async function createToken(user){
    const token = jwt.sign({
            id: user.id,
            username: user.username,
            role: user.role
        },
        key,
        {
            expiresIn: "20m",
        }
    );
    return token;
}

async function authenticateToken(req, res, next){
    // authorization: "Bearer tokenstring"
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token){
        res.status(401).json({message: "Unauthorized access"});
    }
    else{
        const user = await decodeJWT(token);
        req.user = user;
        next();
    }
}

async function authenticateManagerToken(req, res, next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token){
        res.status(401).json({message: "Unauthorized access"});
    }
    else{
        const user = await decodeJWT(token);
        if (user.role !== "Manager"){
            res.status(403).json({message: "Manager only access"});
            return;
        }
        req.user = user;
        next();
    }
}

async function decodeJWT(token){
    try{
        const user = jwt.verify(token, key)
        return user;
    }catch(err){
        console.error(err);
    }
}

module.exports = {
    validateReg,
    validateLogin,
    authenticateManagerToken,
    authenticateToken,
    createToken,
    processTicket,
    validateStatus,
    getTickets
}