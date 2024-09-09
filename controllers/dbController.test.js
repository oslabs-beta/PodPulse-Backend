const dbController = require('./dbController');
const mock = jest.fn();

describe('db unit tests', () => {
  const mockRequest = () => {
    const req = {};
    req.params = {
      namespace: 266,
    };
    req.cookies = {};
    req.cookies.secretCookie = {};
    req.cookies.secretCookie.data = { userName: 'jeremiah' };
    return req;
  };

  const mockResponse = () => {
    const res = {};
    res.status = mock.mockReturnValue(res);
    res.json = mock.mockReturnValue(res);
    return res;
  };

  describe('#checkNamespaceNotInDB', () => {
    const req = mockRequest(),
      res = mockResponse();
    const next = jest.fn((arg = 'noArgGiven') => arg);
    it('checks database with known invalid namespace to confirm absence', async () => {
      const result = await dbController.checkNamespaceNotInDB(req, res, next);
      console.log('result = ', result);
      expect(result).not.toBe('noArgGiven');
    });
    it('basic check', () => {
      expect(2 + 2).toBe(4);
    });
  });
});
