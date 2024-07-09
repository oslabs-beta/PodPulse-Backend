const oracledb = require('oracledb');
require('dotenv').config();

async function runApp() {
  let connection;
  let dbConfig = {
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    connectString: process.env.SVC_NAME,
    // wallet_location: process.env.WALLET_LOC, //not yet working
    // wallet_password: process.env.WALLET_PW,
  };

  try {
    // Get a standalone Oracle Database connection
    connection = await oracledb.getConnection(dbConfig);
    console.log('Connection was successful!');

    // WORKING INSERT QUERIES (use spread to handle second empty arg and third options arg)
    // (don't need to use "result" label below for INSERT queries)

    // for USER_TABLE
    // const sql = [
    //   `INSERT INTO user_table (username, password) VALUES ('charles', 'test456')`,
    //   {}, //bindParams object
    //   { autoCommit: true },
    // ];

    // for POD
    // const sql = [
    //   `INSERT INTO pod (user_db_id, pod_id, pod_name, restart_count) VALUES (3, 'test_pod_1_id', 'test_pod_1_name', 0)`,
    //   {}, //bindParams object
    //   { autoCommit: true },
    // ];

    // for CONTAINER
    // const sql = [
    //   `INSERT INTO container (pod_db_id, container_name, cleared_at, restart_count) VALUES (1, 'test_container_1_name', 1720485145, 5)`,
    //   {}, //bindParams object
    //   { autoCommit: true },
    // ];

    // for RESTART_LOG
    // const sql = [
    //   `INSERT INTO restart_log (container_db_id, log_time, log_data, restart_person, notes) VALUES (2, 1720485345, 'test restart_log1 log_data text', 'Jeremy', 'test restart_log1 notes text')`,
    //   {}, //bindParams object
    //   { autoCommit: true },
    // ];

    // WORKING SELECT QUERY (don't use spread for this)

    const sql = `SELECT username FROM USER_TABLE`;

    const result = await connection.execute(sql);
    console.log(`Existing Users: ${result.rows}`); // <--- this is how you access results after .execute(SELECT QUERY)
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
