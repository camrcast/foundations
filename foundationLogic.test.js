const {validateReg, validateLogin, authenticateToken, authenticateManagerToken, createToken, processTicket, validateStatus, getTickets} = require("./foundationLogic");

describe('Logic Tests', () => {
  beforeEach(() => {
    validateReg.mockClear();
  });

  test('should add to database', () => {
    const username = "Hello";
    const password = "world";
    const role = "Employee";
    
    validateReg(username, password, role);

    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, JSON.stringify(shoppingList, null, 2));
  });
});