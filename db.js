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
        console.log('BINDS: ', binds);
        oracledb.fetchAsString = [oracledb.CLOB];
        con
          .execute(sqlQuery, binds, {
            autoCommit: true,
            // maxRows: 0,
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            fetchTypeHandler: function (metaData) {
              console.log(metaData);
              if (metaData.dbType == oracledb.DB_TYPE_CLOB) {
                console.log('FOUND!!!');
                return { type: oracledb.STRING };
              }
            },
            // fetchInfo: { STATE_JSON: { type: oracledb.STRING } },
          })
          .then((result) => {
            // console.log('RESULT IN TEST_QUERY',; result);
            // console.log('KEY: ', Object.keys(result.outBinds)[0]);
            // const clob = result[Object.keys(result.outBinds)[0]].getData();
            // console.log(clob);
            console.log(result.outBinds.state_json.createLobReader());
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
