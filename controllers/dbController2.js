const db = require('../db');
const oracledb = require('oracledb');

const dbController = {};

dbController.retrieveAll = (req, res, next) => {
  console.log('NAMESPACE: ', req.params);
  const ns = ({ namespace } = req.params);

  const query = `
    BEGIN
      GET_STATE(:namespace_name, :state_json);
    END;
  `;

  const binds = {
    namespace_name: 'default',
    state_json: { dir: oracledb.BIND_OUT, type: oracledb.CLOB },
  };

  db.query(query, binds, true).then((result) => {
    //console.log(result.state_json);
  });
  return next();

  const namespace_db_id = 81;

  function selectPodsByNamespace(namespace_db_id) {
    const podQuery = `SELECT pod_name, db_id FROM POD where namespace_db_id=${namespace_db_id}`;
    return db.query(podQuery);
  }

  function selectContainersByPod(pod_db_id) {
    const containerQuery = `SELECT container_name, db_id, cleared_at FROM CONTAINER where pod_db_id=${pod_db_id}`;
    return db.query(containerQuery);
  }

  // console.log('container info for pod at 68 = ', selectContainerByPod(68));

  function selectRestartLogsByContainer(container_db_id) {
    const restartLogQuery = `SELECT db_id, log_time, restart_person FROM RESTART_LOG where container_db_id=${container_db_id}`;
    return db.query(restartLogQuery);
  }

  const everything = {};
  everything.pods = [];
  everything.containers = [];
  everything.restartLogs = [];
  let count = 0;

  selectPodsByNamespace(namespace_db_id) //should output array of pods
    .then((pods) => {
      console.log(pods);
      let promiseArray = [];
      pods.forEach((pod) => {
        everything.pods.push(pod);
        promiseArray.push(selectContainersByPod(pod['DB_ID']));
      });
      console.log(promiseArray);
      Promise.all(promiseArray).then((containers) => {
        promiseArray = [];
        containers.forEach((byPod) => {
          console.log('BYPOD: ', byPod);
          everything.containers.push(byPod[0]);
          promiseArray.push(selectRestartLogsByContainer(byPod[0]['DB_ID']));
        });
        console.log(promiseArray);
        Promise.all(promiseArray)
          .then((restartLogs) => {
            restartLogs.forEach((logs) => {
              // console.log(
              //   // 'LOGS AT COUNT ' + count + ': ',
              //   JSON.stringify(logs, null, 2)
              // );
              // count++;
              everything.restartLogs.push(logs[0]);
            });
          })
          .finally(() => {
            console.log('EVERYTHING: ', JSON.stringify(everything, null, 2));
          });
      });
    });

  // const podsArray = pods.map((pod) => {}

  // selectPodsByNamespace(namespace_db_id) //should output array of pods
  //   .then((pods) => {
  //     console.log(pods);
  //     const podsArray = pods.map((pod) => {
  //       console.log(pod);
  //       selectContainersByPod(pod['DB_ID']) //access pod's db_id
  //         .then((containers) => {
  //           console.log('CONTAINERS: ', containers);
  //           const containersArray = containers.map((container) => {
  //             console.log(container);
  //             selectRestartLogsByContainer(container['DB_ID']) //access container's db_id
  //               .then((logs) => {
  //                 const logsArray = logs.map((log) => {
  //                   return {
  //                     restart_log_db_id: log[0],
  //                     log_time: log[1],
  //                     restart_person: log[2],
  //                   };
  //                 });
  //                 return {
  //                   container_name: container[0],
  //                   container_db_id: container[1],
  //                   cleared_at: container[2],
  //                   restart_logs: logsArray,
  //                 };
  //               });
  //           });
  //           return {
  //             pod_name: pod[0],
  //             pod_db_id: pod[1],
  //             containers: containersArray,
  //           };
  //         });
  //     });
  //     res.locals.namespaceData = {
  //       namespace_name: 'default',
  //       namespace_db_id: namespace_db_id,
  //       pods: podsArray,
  //     };
  return next();
  // })
  // .catch((err) => next(err));
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
