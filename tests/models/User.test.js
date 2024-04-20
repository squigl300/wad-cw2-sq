// tests/models/User.test.js

const User = require('../../models/User');

// Mock the NeDB database
jest.mock('nedb');

describe('User model', () => {
  let userModel;

  beforeEach(() => {
    userModel = new User('database/test_users.db');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should create a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'donor',
    };

    const newUser = await userModel.create(userData);

    expect(newUser.name).toBe(userData.name);
    expect(newUser.email).toBe(userData.email);
    expect(newUser.role).toBe(userData.role);
  });

  test('should find a user by email', async () => {
    const email = 'john@example.com';
    const user = {
      _id: 'user123',
      name: 'John Doe',
      email,
      password: 'hashedpassword',
      role: 'donor',
    };

    userModel.db.findOne.mockImplementationOnce((query, callback) => {
      callback(null, user);
    });

    const foundUser = await userModel.findByEmail(email);

    expect(foundUser).toEqual(user);
    expect(userModel.db.findOne).toHaveBeenCalledWith({ email }, expect.any(Function));
  });

  // Add more test cases for other user model methods
});