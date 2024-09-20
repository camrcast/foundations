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
    }catch(err){
        console.error(err);
    }
}

async function scanTickets(username){
    const command = new ScanCommand({
        ticketTable,
        FilterExpression: "#by = :by",
        ExpressionAttributeNames: {
            "#by": "by"
        },
        ExpressionAttributeValues: {
            ":by": {S: username}
        }
    })
    try{
        const data = await documentClient.send(command);
        return data.Items;
    }catch(err){
        console.error(err);
    }
}

async function scanPendingTickets(){
    command = new ScanCommand({
        ticketTable,
        FilterExpression: "#status = :status",
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":status": {S: "Pending"}
        }
    })
    try{
        const data = await documentClient.send(command);
        return data.Items;
    }catch(err){
        console.error(err);
    }
}

async function registerUser(user){
    const command = new PutCommand({
        userTable,
        user
    });
    try{
        if (queryUser(user.username)){
            return false;
        }
        const data = await documentClient.send(command);
        console.log(data);
        return true;
    }
    catch(err){
        console.error(err);
        return false;
    }
}

module.exports = {
    registerUser,
    queryUser,
    scanTickets,
    sendTicket,
    scanPendingTickets
}