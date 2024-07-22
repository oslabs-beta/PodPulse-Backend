const oracledb = require('oracledb');
require('dotenv').config();

// const sqlQuery = `SELECT username FROM USER_TABLE`;

// query(sqlQuery);

function query(sqlQuery, binds = {}, isProcedure = false) {
  const dbConfig = {
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    connectString: process.env.SVC_NAME,
  };

  return new Promise((res, rej) => {
    oracledb
      .getConnection(dbConfig)
      .then((con) => {
        con
          .execute(sqlQuery, binds, {
            autoCommit: true,
            maxRows: 0,
            outFormat: oracledb.OUT_FORMAT_OBJECT,
          })
          .then((result) => {
            console.log('Success, closing connection')
            // console.log('RESULT IN TEST_QUERY', result);
            con.close();
            res(isProcedure ? result.outBinds : result.rows);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

const oldQuery = async function (sqlQuery, type = 'SELECT') {
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
    console.log('CONNECTION: ', connection.dbDomain);

    switch (type) {
      case 'SELECT': {
        const result = await connection.execute(sqlQuery);
        console.log(`Output: ${result.rows}`); // <--- this is how you access results after .execute(SELECT QUERY)
        output = result.rows;
        break;
      }
      case 'INSERT': {
        const result = await connection.execute(
          sqlQuery,
          {} /*bindParams object*/,
          { autoCommit: true }
        );
        output = 'Data added successfully!';
        break;
      }
      case 'PROC': {
        console.log('QUERY: ', sqlQuery[1]);

        return new Promise(async (resolve, reject) => {
          const result = await connection.execute(sqlQuery[0], sqlQuery[1], {
            autoCommit: true,
          });
          console.log(result.outBinds);
          resolve = result.outBinds;
        });
        break;
      }
    }
  } catch (err) {
    console.error('there is error', err);
  } finally {
    if (connection) {
      try {
        console.log('connection closing')
        await connection.close()
      } catch (err) {
        console.error(err);
      }
    }

    return output;
  }
};

module.exports = { query };
