const fs = require('fs');

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
        let key = "";
        fs.readFile('./key.txt', (err, data) => {
            if (err) throw err;
            key = data.toString();
        });
        const user = await jwt.verify(token, key)
        return user;
    }catch(err){
        console.error(err);
    }
}

module.exports = {
    authenticateManagerToken,
    authenticateToken
}