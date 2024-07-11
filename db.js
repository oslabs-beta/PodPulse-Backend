const oracledb = require('oracledb');
require('dotenv').config();

// const sqlQuery = `SELECT username FROM USER_TABLE`;

// query(sqlQuery);

const query = async function (sqlQuery, type = 'SELECT', stuff) {
  //confirm valid queryType
  const validTypes = ['SELECT', 'INSERT', 'PROC'];
  if (!validTypes.includes(type)) {
    throw new Error('Invalid queryType given.');
  }

  let connection, output;
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
    //connection..console.log('Connection was successful!');
    console.log('CONNECTION: ', type);

    switch (type) {
      case 'SELECT': {
        const result = await connection.execute(
          sqlQuery,
          {},
          { maxRows: 0, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(`Output: ${result.rows}`); // <--- this is how you access results after .execute(SELECT QUERY)
        console.log(JSON.stringify(result.rows));

        switch (stuff) {
          case 'con': {
          }
        }
      }
      case 'INSERT': {
        const result = await connection.execute(
          sqlQuery,
          {} /*bindParams object*/,
          { autoCommit: true }
        );
        output = 'Data added successfully!';
      }
      case 'PROC': {
        console.log('QUERY: ', sqlQuery[1]);

        const result = await connection.execute(sqlQuery[0], sqlQuery[1], {
          autoCommit: true,
        });
        console.log(result.outBinds);
      }
    }
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

    return output;
  }
};

module.exports = { query };
