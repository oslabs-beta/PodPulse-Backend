
const jwt = require("jsonwebtoken");

authcontroller = {}

authcontroller.verify = (req, res, next) => {
    const { token } = req.cookies.secretCookie; //req.cookies = {cookie: options: { } , cookie:' '}
    console.log(token)
    try{
        if (token){
        console.log('token exists')
      const decoded =  jwt.verify(token, process.env.JWT_SECRET);
      res.locals.verification = {
        login: true,
        data: decoded,
      }
      console.log('decoded')
      return next();
    } else {
      res.locals.verification ={
        login: false,
        data: 'error'
      }

      res.clearCookie('secretCookie').redirect('/login') 
    } 
    } catch (err) {
        return next({
            log: err,
            message: {err: 'big error in jwt verification'}
        })
    }
 
}


module.exports = authcontroller


