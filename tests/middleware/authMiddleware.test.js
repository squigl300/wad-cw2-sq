// tests/middleware/authMiddleware.test.js

const { isAuthenticated, isAdmin, isDonor, isPantry } = require('../../middleware/authMiddleware');

describe('Authentication Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      session: {},
    };
    res = {
      redirect: jest.fn(),
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('isAuthenticated should call next if user is authenticated', () => {
    req.session.userId = 'user123';

    isAuthenticated(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('isAuthenticated should redirect to login if user is not authenticated', () => {
    isAuthenticated(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith('/login');
  });

  test('isAdmin should call next if user is an admin', () => {
    req.session.role = 'admin';

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('isAdmin should send 403 status if user is not an admin', () => {
    req.session.role = 'donor';

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. Admin privileges required.' });
  });

  // Add more test cases for isDonor and isPantry middleware
});