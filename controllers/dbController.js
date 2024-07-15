const db = require('../db');
const oracledb = require('oracledb');

const dbController = {};

dbController.retrieveAll = (req, res, next) => {
  // namespace_name               -> hardcode
  // namespace_db_id,
  // pods [                       -> query pod table for matching namespace_db_id
  //   {
  //    pod_name,
  //    pod_db_id,
  //     containers: [            -> query containers table for every pod
  //       container_db_id,
  //       container_name,
  //       cleared_at,
  //       restart_logs: [        -> query restart_logs table for every container
  //         restart_log_db_id,
  //         log_time,
  //         restart_person
  //       ]
  //     ]
  //   }
  // ]
  // namespace -> pod -> container -> log
  // function: query for logs and hardcode container name
  // query for container names and hardcode pod name, then call log query function for each container name

  function selectPodByNamespace(namespace_db_id) {
    const podQuery = `SELECT pod_name, db_id FROM POD where namespace_db_id=${namespace_db_id}`;
    db.query(podQuery, 'SELECT')
      .then((results) => {
        console.log('results = ', results);
        return next();
      })
      .catch((err) => next(err));
  }

  function selectContainerByPod(pod_db_id) {
    const containerQuery = `SELECT container_name, db_id, cleared_at FROM CONTAINER where pod_db_id=${pod_db_id}`;
    db.query(containerQuery, 'SELECT')
      .then((results) => {
        console.log('results = ', results);
        return next();
      })
      .catch((err) => next(err));
  }

  // console.log('container info for pod at 68 = ', selectContainerByPod(68));

  function selectRestartLogByContainer(container_db_id = 55) {
    const restartLogQuery = `SELECT db_id, log_time, restart_person FROM RESTART_LOG where container_db_id=${container_db_id}`;
    db.query(restartLogQuery, 'SELECT')
      .then((results) => {
        console.log('results = ', results);
        return next();
      })
      .catch((err) => next(err));
  }

  const namespaceDbId = 66;
  let pods = selectPodByNamespace(namespaceDbId);

  pods = pods.map((pod) => {
    let containers = selectContainerByPod(pod[1]);
    containers = containers.map((container) => {});

    return {
      pod_name: pod[0],
      pod_db_id: pod[1],
      containers: [],
    };
  });

  // res.locals.result = {
  //   namespace_name: 'default',
  //   namespace_db_id: 66,
  //   pods [
  //     {
  //     pod_name,
  //     pod_db_id,
  //       containers: [            -> query containers table for every pod
  //         container_db_id,
  //         container_name,
  //         cleared_at,
  //         restart_logs: [        -> query restart_logs table for every container
  //           restart_log_db_id,
  //           log_time,
  //           restart_person
  //         ]
  //       ]
  //     }
  //   ]
  // }
};

module.exports = dbController;
