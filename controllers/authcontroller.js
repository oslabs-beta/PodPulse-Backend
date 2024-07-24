const jwt = require('jsonwebtoken');
const db = require('../server/db');

authcontroller = {};

authcontroller.verify = async (req, res, next) => {
  if (!req.cookies.secretCookie) {
    res.locals.verification = {
      login: false,
      data: 'error',
    };
    console.log(res.locals.verification, 'is');
    return next();
  }
  const { token, status } = req.cookies.secretCookie; //req.cookies = {cookie: options: { } , cookie:' '}
  const userName = req.cookies.secretCookie.data.userName
  const userQuery = await db.query(
    `SELECT username from USER_TABLE WHERE USERNAME = '${userName}'`
  );
  try {
    if (token && status === 'success' && userQuery.length !== 0) {
      console.log('token exists');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.verification = {
        login: true,
        data: decoded,
        userQuery: userQuery,
      };
      console.log('decoded');

      return next();
    } else {
      console.log('no token, invalid user');
      res.locals.verification = {
        login: false,
        data: 'error',
      };

      return res.status(406).json({ message: 'invalid credentials' });
    }
  } catch (err) {
    return res.redirect('/login');
  }
};

module.exports = authcontroller;
