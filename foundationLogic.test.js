const {createNewUser, validateLogin, authenticateToken, authenticateManagerToken, createToken, processTicket, validateStatus, checkRole} = require("./foundationLogic");

//createNewUser tests
describe('createNewUser test', () => {
  it('should create employee Bea with password 5050', async () => {
    const response = await createNewUser("Bea", "50505555", "Employee");
    expect(response).toEqual({ username: "bea", password: expect.not.stringMatching("50505555"), role: "Employee" });
  });
});

describe('createNewUser test', () => {
  it('should create Manager Mark with password ghert', async () => {
    const response = await createNewUser("MARK", "ghertyuiop", "Manager");
    expect(response).toEqual({ username: "mark", password: expect.not.stringMatching("ghertyuiop"), role: "Manager" });
  });
});

describe('createNewUser test', () => {
  it('Kevin signed in as an invalid role so it should default to employee', async () => {
    const response = await createNewUser("Kevin", "23456789", "Janitor");
    expect(response).toEqual({ username: "kevin", password: expect.not.stringMatching("23456789"), role: "Employee" });
  });
});

describe('createNewUser test', () => {
  it('User has no name or password', async () => {
    const response = await createNewUser("", "", "Employee");
    expect(response).toEqual(false);
  });
});

//validateLogin tests
describe('validateLogin test', () => {
  it('User John enters correct password 40404040', async () => {
    const response = await validateLogin("John", "40404040", "40404040");
    expect(response).toEqual(true);
  });
});

describe('validateLogin test', () => {
  it('User John did not enter the correct password', async () => {
    const response = await validateLogin("John", "4444", "4040");
    expect(response).toEqual(true);
  });
});

describe('validateLogin test', () => {
  it('User has no name', async () => {
    const response = await validateLogin("", "4040", "4040");
    expect(response).toEqual(true);
  });
});

//processTicket
describe('processTicket test', () => {
  it('Tom gets parking fee', async () => {
    const response = await processTicket("Parking fee", "Tom");
    expect(response).toEqual({id: expect.anything(), by: "Tom", desc: "Parking fee", status: "Pending"});
  });
});

describe('processTicket test', () => {
  it('Tom did not enter any description', async () => {
    const response = await processTicket("", "Tom");
    expect(response).toEqual(false);
  });
});

//validateStatus
describe('validateStatus test', () => {
  it('Manager wants to approve ticket', async () => {
    const response = await validateStatus("Approved");
    expect(response).toEqual(false);
  });
});

describe('validateStatus test', () => {
  it('Manager wants to deny ticket', async () => {
    const response = await validateStatus("Denied");
    expect(response).toEqual(false);
  });
});

describe('validateStatus test', () => {
  it('Manager wants to pass ticket', async () => {
    const response = await validateStatus("Pass");
    expect(response).toEqual(true);
  });
});

//checkRole
describe('checkRole test', () => {
  it('Jason is manager', async () => {
    const response = await checkRole("Manager");
    expect(response).toEqual(true);
  });
});

describe('checkRole test', () => {
  it('Jason is Employee', async () => {
    const response = await checkRole("Employee");
    expect(response).toEqual(false);
  });
});

//createToken
describe('createToken test', () => {
  it('Patty sends a cert with 303030 password as an employee', async () => {
    const response = await createToken({username: "Patty", password: "303030", role: "Employee"});
    expect(response).toEqual(expect.not.stringMatching("303030"));
  });
});
