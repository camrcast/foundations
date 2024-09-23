const { DynamoDBClient, QueryCommand, UpdateItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand
} = require("@aws-sdk/lib-dynamodb")

const client = new DynamoDBClient({region: "us-west-1"});

const documentClient = DynamoDBDocumentClient.from(client);

const userTable = "foundationUsers";
const ticketTable = "foundationTickets";

async function queryUser(username){
    const command = new GetCommand({
        TableName: userTable,
        Key: {"username": username}
    });
    try{
        const data = await documentClient.send(command);
        return data.Item;
    }
    catch(err){
        console.error(err);
        return false;
    }
}

async function sendTicket(ticket){
    const command = new PutCommand({
        TableName: ticketTable,
        Item: {id: ticket.id, by: ticket.by, desc: ticket.desc, status: ticket.status}
    });
    try{
        const data = await documentClient.send(command);
        return data;
    }
    catch(err){
        console.error(err);
        return false;
    }
}

async function scanTickets(user){
    let command;
    if (user.role === "Manager"){
        command = new ScanCommand({
            TableName: ticketTable,
            FilterExpression: "#status = :status",
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ":status": {S: "Pending"}
            }
        })
    }
    else{
        command = new ScanCommand({
            TableName: ticketTable,
            FilterExpression: "#by = :by",
            ExpressionAttributeNames: {
                "#by": "by"
            },
            ExpressionAttributeValues: {
                ":by": {S: user.username}
            }
        })
    }
    try{
        const data = await documentClient.send(command);
        return data.Items;
    }
    catch(err){
        console.error(err);
        return false;
    }
}

async function changeTicketStatus(id, status){
    const command = new UpdateItemCommand({
        TableName: ticketTable,
        KeyConditionExpression: "#id = :id",
        UpdateExpression: "set #status = :status",
        ExpressionAttributeNames: { "#id": "id"},
        ExpressionAttributeValues: { ":id": {S: id}, ":status": {S: status}}
    });
    try{
        const data = await documentClient.send(command);
        return data.Items[0];
    }
    catch(err){
        console.error(err);
        return false;
    }
}

async function registerUser(user){
    const command = new PutCommand({
        TableName: userTable,
        Item: {username: user.username, password: user.password, role: user.role}
    });
    try{
        if (await queryUser(user.username)){
            return false;
        }
        const data = await documentClient.send(command);
        return data;
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
    changeTicketStatus
}