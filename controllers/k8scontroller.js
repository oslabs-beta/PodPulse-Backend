const k8sApi = require('../server/k8sApi');
console.log(k8sApi.basePath);

const k8scontroller = {};

k8scontroller.getPods = (req, res, next) => {
  // k8sApi.listNamespace().then((data) => {const nameSpaces = data.body.items
  //   nameSpaces.forEach((el) => console.log('name:', el.metadata.name))
  // }) -> List namespaces
  // k8sApi
  //   .readNamespacedPodLog('ecs-test-6845b4b944-hbcjk', 'default')
  //   .then((result) => {
  //     console.log('LOG: ', result.body);
  //   });
  // new CronJob('01 * * * * ', function() {
  //   console.log('runs every 5 seconds');
  // }, null, true);

  k8sApi
    .listNamespacedPod(
      //Getting pods from the namespaces listed below
      'default'
      // undefined,
      // undefined,
      // undefined,
      // undefined,
      // undefined,
      // undefined,
      // undefined,
      // undefined,
      // undefined,
      // 1000,
      // true,
      // undefined
    )
    .then((result) => {
      res.locals.result = [];
      for (let i = 0; i < result.body.items.length; i++) {
        const timeNow =
          result.body.items[
            i
          ].status.containerStatuses[0].lastState.terminated.startedAt.toString(); //container log_time as a string
        res.locals.result.push({
          container_db_id: i,
          container_name: result.body.items[i].status.containerStatuses[0].name, //Pulling container information logs
          Restarts:
            result.body.items[i].status.containerStatuses[0].restartCount,
          restart_logs: { restart_log_db_id: i, log_time: timeNow },
          Timestamp_Finish:
            result.body.items[i].status.containerStatuses[0].lastState
              .terminated.finishedAt,
          Reason:
            result.body.items[i].status.containerStatuses[0].lastState
              .terminated.reason,
          Exit_code:
            result.body.items[i].status.containerStatuses[0].lastState
              .terminated.exitCode,
        });
      }
      return next();
    })
    .catch((err) => {
      console.log('error');
      next(err);
    });
};

module.exports = k8scontroller;
