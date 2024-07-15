const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
//const CronJob = require('cron').CronJob;
//const exec = require('child_process').exec;
const db = require('../db');
const oracledb = require('oracledb');

// kc.makeApiClient();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
console.log(k8sApi.basePath);

const namespaceController = {};

//Namespace initialization
namespaceController.initializeNamespace = (req, res, next) => {
  //we'll need to retrieve namespace names from cluster as opposed to from client
  const { namespace_name } = req.params;
  console.log('LOAD POD DATA');

  const query = [
    `
    BEGIN
      ADD_NAMESPACE(:name, :user, :id);
    END;
    `,
    {
      name: 'default', //would take from user input field, defaults to 'default'
      user: 'test', //should come from url parameter
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    },
  ];

  db.query(query, 'PROC')
    .then((result) => {
      console.log('NAMESPACE RESULT: ', result);
      k8sApi.listNamespacedPod(namespace_name).then((result) => {
        const pods = result.body.items;

        pods.forEach((pod) => {
          const container = pod.status.containerStatuses[0];
          // console.log('CONTAINER: ', container);

          const pod_name_split = pod.metadata.name.split('-');
          let pod_name = '';
          for (let i = 0; i < pod_name_split.length - 2; i++)
            pod_name += pod_name_split[i];

          const podQuery = [
            `
    BEGIN
      INIT_CONTAINER(:container_name, :log_time, :pod_id_name, :pod_name, :pod_var, :name_var, :con_var);
    END;
    `,
            {
              container_name: container.name,
              log_time: Date.parse(
                container.state.waiting
                  ? 0
                  : container.state.running
                  ? container.state.running.startedAt //should probably use terminatedAt
                  : container.state.terminated.startedAt
              ),
              pod_id_name: pod.metadata.name,
              pod_name: pod_name,
              pod_var: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
              name_var: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
              con_var: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            },
          ];

          db.query(podQuery, (type = 'PROC')).then((result) => {
            console.log('INIT RESULT: ', result);
          }); //probably add to res.locals here
        });
      });
    })
    .then(() => {
      return next();
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = namespaceController;
