const { query } = require('../server/db.js');

//input query string as argument, optional second argument for type (defaults to select)

//****** SAMPLES OF FUNCTIONAL QUERIES ******//

// SELECT QUERY
// query(`SELECT username FROM USER_TABLE`);

// INSERT QUERIES

// for USER_TABLE
// query(
//   `INSERT INTO user_table (username, password) VALUES ('jeremy', 'test123')`,
//   'INSERT'
// );

// for NAMESPACE
// query(
//   `INSERT INTO namespace (user_db_id, namespace_name) VALUES (1, 'test_namespace1_id')`,
//   'INSERT'
// );

// for POD
// query(
//   `INSERT INTO pod (namespace_db_id, pod_id, pod_name, restart_count) VALUES (1, 'test_pod_1_id', 'test_pod_1_name', 0)`,
//   'INSERT'
// );

// for CONTAINER
// query(
//   `INSERT INTO container (pod_db_id, container_name, cleared_at, restart_count) VALUES (1, 'test_container_1_name', 1720485145, 5)`,
//   'INSERT'
// );

// for RESTART_LOG
// query(
//   `INSERT INTO restart_log (container_db_id, log_time, log_data, restart_person, notes) VALUES (1, 1720485345, 'test restart_log1 log_data text', 'Jeremy', 'test restart_log1 notes text')`,
//   'INSERT'
// );
