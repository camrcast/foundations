const { DynamoDBClient, QueryCommand, ScanCommand} = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    PutCommand
} = require("@aws-sdk/lib-dynamodb")

const client = new DynamoDBClient({region: "us-west-1"});

const documentClient = DynamoDBDocumentClient.from(client);

const userTable = "foundationUsers";
const ticketTable = "foundationTickets";

async function queryUser(username){
    const command = new QueryCommand({
        userTable,
        KeyConditionExpression: "#username = :username",
        ExpressionAttributeNames: { "#username": "username"},
        ExpressionAttributeValues: { ":username": {S: username}}
    });
    try{
        const data = await documentClient.send(command);
        return data.Items[0];
    }catch(err){
        console.error(err);
        return false;
    }
}

async function sendTicket(ticket){
    const command = new PutCommand({
        ticketTable,
        ticket
    });
    try{
        const data = await documentClient.send(command);
        console.log(data);
        return;
    }catch(err){
        console.error(err);
    }
}

async function scanTickets(user){
    if (user.role === "Employee"){
        const command = new ScanCommand({
            ticketTable,
            FilterExpression: "#by = :by",
            ExpressionAttributeNames: {
                "#by": "by"
            },
            ExpressionAttributeValues: {
                ":by": {S: user.username}
            }
        })
    }
    else{
        const command = new ScanCommand({
            ticketTable,
            FilterExpression: "#status = :status",
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ":status": {S: "Pending"}
            }
        })
    }
    try{
        const data = await documentClient.send(command);
        return data.Items;
    }catch(err){
        console.error(err);
    }
}

async function checkUser(user){
    if (!user.name || !user.password){
        console.log("Invalid username or password");
        return;
    }
    const command = new PutCommand({
        userTable,
        user
    });
    try{
        let u = queryUser(user.name);
        if (u){
            if (u.password === user.password){
                console.log(`Logged in as ${u.username}`);
                return u;
            }
            console.log(`Incorrect password for ${u.username}`)
            return;
        }
        const data = await documentClient.send(command);
        console.log(data);
        return user;
    }
    catch(err){
        console.error(err);
    }
}

module.exports = {
    checkUser,
    queryUser,
    scanTickets,
    sendTicket
}