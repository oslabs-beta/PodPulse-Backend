const oracledb = require('oracledb');
require('dotenv').config();

async function runApp() {
  let connection;
  let dbConfig = {
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    connectString: process.env.SVC_NAME,
    wallet_location: process.env.WALLET_LOC,
    wallet_password: process.env.WALLET_PW,
  };

  try {
    // Get a standalone Oracle Database connection
    connection = await oracledb.getConnection(dbConfig);
    console.log('Connection was successful!');

    // const sql = `SELECT username FROM USER_TABLE`;     <--- working query
    // console.log(`Existing Users: ${result.rows}`);

    const sql = `SELECT * FROM CONTAINER`;
    const result = await connection.execute(sql);
    console.log(`Existing Pods: ${result.rows}`);
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

runApp();
