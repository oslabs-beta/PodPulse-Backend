const jwt = require('jsonwebtoken');

authcontroller = {};

authcontroller.verify = (req, res, next) => {
  const { token } = req.cookies.secretCookie; //req.cookies = {cookie: options: { } , cookie:' '}
  console.log(token);
  try {
    if (token) {
      console.log('token exists');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.verification = {
        login: true,
        data: decoded,
      };
      console.log('decoded');
      return next();
    } else {
      console.log('no token');
      res.locals.verification = {
        login: false,
        data: 'error',
      };

      return res.status(406).json({ message: 'invalid credentials' });
    }
  } catch (err) {
    return next({
      log: err,
      message: { err: 'big error in jwt verification' },
    });
  }
};

module.exports = authcontroller;
