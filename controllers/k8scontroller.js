const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
// let CronJob = require('cron').CronJob;
// let exec = require('child_process').exec

// kc.makeApiClient();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
console.log(k8sApi.basePath);

const k8scontroller = {};

k8scontroller.getPods = (req, res, next) => {
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
      // console.log('Name is: ', result.body.items[0].status.containerStatuses[0].name, 'Restart is: ', result.body.items[0].status.containerStatuses[0].restartCount, "Timestamp start, ", result.body.items[0].status.containerStatuses[0].lastState.terminated.startedAt, "Timestamp finish, ", result.body.items[0].status.containerStatuses[0].lastState.terminated.finishedAt );
      res.locals.result = [];
      for (
        let i = 0;
        i < result.body.items.length;
        i++ /*el of result.body.items*/
      ) {
        const timeNow =
          result.body.items[
            i
          ].status.containerStatuses[0].lastState.terminated.startedAt.toString();
        res.locals.result.push({
          container_db_id: i,
          container_name: result.body.items[i].status.containerStatuses[0].name,
          Restarts:
            result.body.items[i].status.containerStatuses[0].restartCount,
          restart_logs: [
            { restart_log_db_id: i, log_time: timeNow, restart_person: '' },
          ],
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
      next();
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = k8scontroller;
