
const jwt = require("jsonwebtoken");

authcontroller = {}

authcontroller.verify = (req, res, next) => {
    const { secretCookie } = req.body;
    try{
        if (secretCookie){
        console.log('token exists')
      const decoded =  jwt.verify(secretCookie, process.env.JWT_SECRET);
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
    } 
    } catch (err) {
        return next({
            log: err,
            message: {err: 'big error in jwt verification'}
        })
    }
 
}


module.exports = authcontroller


