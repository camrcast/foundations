const bcrypt = require("bcrypt");
const fs = require('fs');
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

let key = "";
fs.readFile('./key.txt', (err, data) => {
    if (err) throw err;
    key = data.toString();
});


async function createNewUser(username, password, role){
    role = (role !== "Manager") ? "Employee" : "Manager";
    if (!username || !password){
        return false;
    }
    const saltRounds = 10;
    password = await bcrypt.hash(password, saltRounds);
    return { username: username.toLowerCase(), password, role};
}

//Most of the following are here for testing sake
async function validateLogin(username, password, password2){
    return (!username || !(await bcrypt.compare(password, password2)));
}

async function processTicket(desc, by, price){
    return (!desc || price <= 0) ? false : {id: uuid.v4(), by, desc, status: "Pending"};
}

async function validateStatus(status){
    return (status !== "Approved" && status !== "Denied");
}

async function checkRole(role){
    return (role === "Manager");
}

async function createToken(user){
    const token = jwt.sign({
            id: user.id,
            username: user.username,
            role: user.role
        },
        key,
        {
            expiresIn: "50m",
        }
    );
    return token;
}

async function authenticateToken(req, res, next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token){
        res.status(401).json({message: "You must sign in first"});
    }
    else{
        req.user = await decodeJWT(token);
        next();
    }
}

async function authenticateManagerToken(req, res, next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token){
        res.status(401).json({message: "You must sign in first"});
    }
    else{
        const user = await decodeJWT(token);
        if (!user || user.role !== "Manager"){
            res.status(403).json({message: "Manager only access"});
            return;
        }
        req.user = user;
        next();
    }
}

async function authenticateTokenEmployee(req, res, next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token){
        res.status(401).json({message: "You must sign in first"});
    }
    else{
        const user = await decodeJWT(token);
        if (!user || user.role === "Manager"){
            res.status(403).json({message: "Employee only access"});
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
    createNewUser,
    validateLogin,
    authenticateManagerToken,
    authenticateToken,
    createToken,
    processTicket,
    validateStatus,
    checkRole,
    authenticateTokenEmployee
}