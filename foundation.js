const {checkUser, queryUser, scanTickets, sendTicket} = require('./foundationDAO');
const uuid = require("uuid");

async function login(username, password){
    let id = uuid.v4();
    let user = {id, username, password, role: "Employee"};
    user = await checkUser(user);
    if (!user){
        console.log("Failed to login");
        return;
    }
    console.log(user);
    processTickets(user);
    console.log("Closing...");
}

async function processTickets(user){
    let ticket = {desc: "Broken", by: user.username, status: "Pending"};
    sendTicket(ticket);
}