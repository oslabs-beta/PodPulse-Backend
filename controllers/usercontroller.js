const db = require('../db');
const oracledb = require('oracledb');
const { query } = require('../db.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

userController = {};

userController.hashing = async (req, res, next) => {
    const { password } = req.body;
    console.log("from hashing", password)
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashWord = await bcrypt.hash(password, salt);
        console.log('hased word is: ', hashWord)
        res.locals.pw = hashWord;
        return next()
    } catch (err) {
        return next({
            log: err,
            message: {err: 'big error in hashing'}
        })
    }
}

userController.createUser =  async (req, res, next) => {
    const { userName } = req.body
    console.log('goin to the database!')

    // const sql =  `INSERT INTO USER_TABLE (USERNAME, PASSWORD) VALUES (doh, greg)`
    const useris = await query(`INSERT INTO USER_TABLE (USERNAME, PASSWORD) VALUES ('${userName}', '${res.locals.pw}')`, 'INSERT')
    console.log('the user is,', useris)
    res.local.createdUser = "success adding data"
    return next();
    // query(`INSERT INTO user_table (username, password) VALUES (${userName}, ${pw})`,'INSERT')
}

userController.login = (req, res, next) => {;
    return
}

module.exports = userController;