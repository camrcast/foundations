const {
    readUserList,
    writeUserList
} = require("./foundationDatabase");

let userList = readUserList();

function checkUser(name, pass){
    for (const c of userList){
        if (c.name === name){
            if (pass === c.password){
                return `${name} has logged in`;
            }
            else{
                return `Incorrect password for ${name}`;
            }
        }
    }
    const newUser = {
        name,
        password: pass,
        role: "E"
    };
    userList.push(newUser);
    writeUserList(userList);
    console.log(`Added User: ${newUser.name}`);
    return `${name} has been registered as Employee`;
}

module.exports = {
    userList,
    checkUser
}