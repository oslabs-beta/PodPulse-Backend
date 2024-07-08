const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
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
      console.log('Name is: ', result.body.items[0].status.containerStatuses[0].name, 'Restart is: ', result.body.items[0].status.containerStatuses[0].restartCount, "Timestamp start, ", result.body.items[0].status.containerStatuses[0].lastState.terminated.startedAt, "Timestamp finish, ", result.body.items[0].status.containerStatuses[0].lastState.terminated.finishedAt );
      res.locals.result = [];
      for (const el of result.body.items){res.locals.result.push('Name: ', el.status.containerStatuses[0].name, 'Restarts: ', el.status.containerStatuses[0].restartCount, "Timestamp start, ", el.status.containerStatuses[0].lastState.terminated.startedAt, "Timestamp Finish, ", el.status.containerStatuses[0].lastState.terminated.finishedAt, "Reason, ", el.status.containerStatuses[0].lastState.terminated.reason, "Exit code, ", el.status.containerStatuses[0].lastState.terminated.exitCode)}
      next();
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = k8scontroller;
