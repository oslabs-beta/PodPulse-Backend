const db = require('../db');
const oracledb = require('oracledb');

const dbController = {};

dbController.retrieveAll = (req, res, next) => {
  const namespace_db_id = 66;

  function selectPodsByNamespace(namespace_db_id) {
    const podQuery = `SELECT pod_name, db_id FROM POD where namespace_db_id=${namespace_db_id}`;
    db.query(podQuery, 'SELECT')
      .then((results) => new Promise(() => results))
      .catch((err) => next(err));
  }

  function selectContainersByPod(pod_db_id) {
    const containerQuery = `SELECT container_name, db_id, cleared_at FROM CONTAINER where pod_db_id=${pod_db_id}`;
    db.query(containerQuery, 'SELECT')
      .then((results) => results)
      .catch((err) => next(err));
  }

  // console.log('container info for pod at 68 = ', selectContainerByPod(68));

  function selectRestartLogsByContainer(container_db_id) {
    const restartLogQuery = `SELECT db_id, log_time, restart_person FROM RESTART_LOG where container_db_id=${container_db_id}`;
    db.query(restartLogQuery, 'SELECT')
      .then((results) => results)
      .catch((err) => next(err));
  }

  selectPodsByNamespace(namespace_db_id) //should output array of pods
    .then((pods) => {
      const podsArray = pods.map((pod) => {
        selectContainersByPod(pod[0]) //access pod's db_id
          .then((containers) => {
            const containersArray = containers.map((container) => {
              selectRestartLogsByContainer(container[0]) //access container's db_id
                .then((logs) => {
                  const logsArray = logs.map((log) => {
                    return {
                      restart_log_db_id: log[0],
                      log_time: log[1],
                      restart_person: log[2],
                    };
                  });
                  return {
                    container_name: container[0],
                    container_db_id: container[1],
                    cleared_at: container[2],
                    restart_logs: logsArray,
                  };
                });
            });
            return {
              pod_name: pod[0],
              pod_db_id: pod[1],
              containers: containersArray,
            };
          });
      });
      res.locals.namespaceData = {
        namespace_name: 'default',
        namespace_db_id: namespace_db_id,
        pods: podsArray,
      };
      return next();
    })
    .catch((err) => next(err));
};

// res.locals.result = {
//   namespace_name: 'default',
//   namespace_db_id: 66,
//   pods [
//     {
//     pod_name,
//     pod_db_id,
//       containers: [            -> query containers table for every pod
//         {  container_name,
//         container_db_id,
//         cleared_at,
//         restart_logs: [
//           {
//           restart_log_db_id,
//           log_time,
//           restart_person
//                }
//         ]
//            }
//       ]
//     }
//   ]
// }
// };

module.exports = dbController;
