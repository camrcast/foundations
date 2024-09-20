const { queryUser } = require('./foundationDatabase');

describe('Shopping List Functionality Tests', () => {
  test('should add an item to the shopping list', () => {
    const response = addItem('Bread', 1.99);
    expect(response).toBe('Bread has been added to the shopping list');
  });
});