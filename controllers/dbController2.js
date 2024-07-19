const db = require('../db');
const oracledb = require('oracledb');

const dbController = {};

dbController.retrieveAll = (req, res, next) => {
  console.log('NAMESPACE: ', req.params);
  const ns = ({ namespace } = req.params);

  const namespace_db_id = 81;

  function selectPodsByNamespace(namespace_db_id) {
    const podQuery = `SELECT pod_name, db_id, namespace_db_id FROM POD where namespace_db_id=${namespace_db_id}`;
    return db.query(podQuery);
  }

  function selectContainersByPod(pod_db_id) {
    const containerQuery = `SELECT container_name, db_id, cleared_at, pod_db_id FROM CONTAINER where pod_db_id=${pod_db_id}`;
    return db.query(containerQuery);
  }

  function selectContainersByPods(pod_db_id_array) {
    podsString = '(';
    for (let i = 0; i < pod_db_id_array.length; i++) {
      if (i == pod_db_id_array.length - 1) {
        podsString += `'${pod_db_id_array[i]}')`;
      } else {
        podsString += `'${pod_db_id_array[i]}', `;
      }
    }
    const containersQuery = `SELECT container_name, db_id, cleared_at, pod_db_id FROM CONTAINER where pod_db_id in ${podsString}`;
    return db.query(containersQuery);
  }

  // console.log('container info for pod at 68 = ', selectContainerByPod(68));

  function selectRestartLogsByContainer(container_db_id) {
    const restartLogQuery = `SELECT db_id, log_time, restart_person, container_db_id FROM RESTART_LOG where container_db_id=${container_db_id}`;
    return db.query(restartLogQuery);
  }

  function selectRestartLogsByContainers(container_db_id_array) {
    containersString = '(';
    for (let i = 0; i < container_db_id_array.length; i++) {
      if (i == container_db_id_array.length - 1) {
        containersString += `'${container_db_id_array[i]}')`;
      } else {
        containersString += `'${container_db_id_array[i]}', `;
      }
    }
    const restartLogsQuery = `SELECT db_id, log_time, restart_person, container_db_id FROM RESTART_LOG where container_db_id in ${containersString}`;
    return db.query(restartLogsQuery);
  }

  const everything = {};
  everything.pods = [];
  everything.containers = [];
  everything.restartLogs = [];
  let count = 0;

  selectPodsByNamespace(namespace_db_id) //outputs an array of pods in namespace
    .then((pods) => {
      console.log('pods = ', pods);
      const pod_db_id_array = [];
      pods.forEach((pod) => {
        //takes action for each pod in array
        everything.pods.push(pod);
        pod_db_id_array.push(pod['DB_ID']);
        // containerPromiseArray.push(selectContainersByPod(pod['DB_ID']));
      });
      console.log('pdbidA = ', pod_db_id_array);
      return selectContainersByPods(pod_db_id_array);
      // console.log(containerPromiseArray);
      //takes action for every container in every pod
    })
    .then((containers) => {
      console.log('containers = ', containers);
      container_db_id_array = [];
      containers.forEach((container) => {
        everything.containers.push(container); //pushes all db rows ('logs') returned for every container queried
        container_db_id_array.push(container['DB_ID']);
        // logPromiseArray.push(
        //   selectRestartLogsByContainer(container[0]['DB_ID'])
        // );
      });
      console.log('cdbidA = ', container_db_id_array);
      return selectRestartLogsByContainers(container_db_id_array);
    })
    .then((logs) => {
      console.log('logs = ', logs);
      logs.forEach((log) => {
        everything.restartLogs.push(log);
      });
      console.log('everything = ', everything);
      return next();
    })
    .catch((err) => next(err));

  // .then((restartLogs) => {
  //       restartLogs.forEach((logs) => {
  //         // console.log(
  //         //   // 'LOGS AT COUNT ' + count + ': ',
  //         //   JSON.stringify(logs, null, 2)
  //         // );
  //         // count++;
  //         everything.restartLogs.push(...logs);
  //       });
  //     })
  //     .finally(() => {
  //       console.log('EVERYTHING: ', JSON.stringify(everything, null, 2));
  //     });
  // });
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
