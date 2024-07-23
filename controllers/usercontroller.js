const db = require('../db');
const oracledb = require('oracledb');
const { query } = require('../db.js');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

require('dotenv').config();
const saltRounds = 10;

userController = {};

userController.hashing = async (req, res, next) => {
  const { password } = req.body;
  // console.log("from hashing", password)
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashWord = await bcrypt.hash(password, salt);
    // console.log('hased word is: ', hashWord)
    res.locals.pw = hashWord;
    return next();
  } catch (err) {
    return next({
      log: err,
      message: { err: 'big error in hashing' },
    });
  }
};

userController.createUser = async (req, res, next) => {
  const { userName } = req.body;
  // console.log('goin to the database!')

  // const sql =  `INSERT INTO USER_TABLE (USERNAME, PASSWORD) VALUES (doh, greg)`
  const useris = await db.query(
    `INSERT INTO USER_TABLE (USERNAME, PASSWORD) VALUES ('${userName}', '${res.locals.pw}')`
  );
  // console.log('the user is,', useris)
  res.locals.createdUser = useris;
  return next();
  // query(`INSERT INTO user_table (username, password) VALUES (${userName}, ${pw})`,'INSERT')
};

userController.login = async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    console.log('username is: ', userName);
    const passwordQuery = await db.query(
      `SELECT password FROM USER_TABLE WHERE USERNAME = '${userName}'`
    );
    // console.log('password is', passwordQuery, 'submitted pw is: ', password)
    console.log('pw query:', passwordQuery);
    const hashedWord = passwordQuery[0].PASSWORD;
    const queryResult = await bcrypt.compare(password, hashedWord);

    if (queryResult) {
      try {
        // console.log('is in jwt signing')
        const token = jwt.sign(
          { payload: { id: userName } },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_EXPIRES_IN,
          }
        );
        res.locals.jwt = {
          status: 'success',
          token,
          data: { userName },
        };
        // console.log('successfully stored jwt')
      } catch (err) {
        return next({
          log: err,
          message: { err: 'big login error' },
        });
      }
    }

    // console.log(queryResult)
    return next();
  } catch (err) {
    return next({
      log: err,
      message: { err: 'big login error' },
    });
  }
};

module.exports = userController;
