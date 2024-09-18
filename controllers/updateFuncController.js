const db = require('../server/db');
const oracledb = require('oracledb');
const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const updateFuncController = {};

updateFuncController.createUpdateFunc = (req, res, next) => {
  const { namespace } = req.params;
  let { userName } = req.params;

  if (!userName) {
    userName = req.cookies.secretCookie.data.userName;
  }

  async function createUpdateFunction(
    username = 'test',
    namespace = 'default'
  ) {
    const apiPath = '/api/v1/pods';
    const watch = new k8s.Watch(kc);

    // const listFn = (ns = namespace) => k8sApi.listNamespacedPod(ns);
    const listFn = () => k8sApi.listPodForAllNamespaces();
    const cache = new k8s.ListWatch(apiPath, watch, listFn, false);
    const podCache = {};

    const getRelevantIds = async () => {
      let query = `
      Select * from namespace ns where ns.namespace_name = :namespace and ns.user_db_id =
      (Select db_id from user_table where username = :username)
      `;

      let binds = {
        namespace: namespace,
        username: username,
      };

      let res = await db.query(query, binds, false);
      console.log('IDS: ', res);
      podCache[username] = res[0].USER_DB_ID;
      podCache[namespace] = res[0].DB_ID;
      console.log(podCache);

      query = `
      Select db_id, pod_id from pod where namespace_db_id = :ns_id
      `;

      binds = { ns_id: podCache[namespace] };

      res = await db.query(query, binds, false);
      console.log('res was', res)
      // if (res.length === 0){
      //   return next(() ={
      //     err: err,
      //     message: {error: 'namespace must have at least one pod'}
      //   });
      // }
      podCache.pods = {};
      let podIdList = '(';

      res.forEach((row) => {
        podCache.pods[row.POD_ID] = { id: row.DB_ID };
        podIdList += row.DB_ID + ', ';
      });

      podIdList = podIdList.slice(0, podIdList.length - 2) + ')';

      query = `
      Select c.db_id, c.container_name, c.restart_count, p.pod_id from container c
      join pod p on c.pod_db_id = p.db_id where c.pod_db_id in `;
      query += podIdList;
      console.log(query);

      res = await db.query(query, {}, false);
      console.log(res);

      res.forEach((con) => {
        podCache.pods[con.POD_ID][con.CONTAINER_NAME] = {
          id: con.DB_ID,
          restart_count: con.RESTART_COUNT,
        };
      });

      console.log('POD_CACHE: ', JSON.stringify(podCache, null, 2));
    };

    await getRelevantIds();

    return (stop = false) => {
      console.log('NAMESPACE: ', namespace);

      cache.on(k8s.CHANGE, (pod) => {
        if (podCache.pods[pod.metadata.name]) {
          const pod_name = pod.metadata.name;

          console.log('WE CAUGHT ONE');

          pod.status.containerStatuses.forEach((container) => {
            const container_name = container.name;
            const restart_count = container.restartCount;

            if (
              podCache.pods[pod_name][container_name].restart_count <
              restart_count
            ) {
              const count =
                podCache.pods[pod_name][container_name].restart_count;
              podCache.pods[pod_name][container_name].restart_count += 1;
              const state = container.state;
              const date = state.running
                ? Date.parse(state.running.startedAt)
                : state.terminated
                ? Date.parse(state.terminated.startedAt)
                : Date.now();

              console.log(
                'TIME TO UPDATE: POD: ' +
                  pod_name +
                  ' \nCONTAINER: ' +
                  container_name +
                  ' RES: ' +
                  restart_count +
                  ' vs ' +
                  count +
                  '\n\n'
              );

              let query = `
              Insert into restart_log (container_db_id, log_time) values (:con, :time)
              `;

              let binds = {
                con: podCache.pods[pod_name][container_name].id,
                time: date,
              };

              db.query(query, binds, false).then((result) => {
                console.log('UPDATED: ');
              });

              query = `
                Update container set restart_count = :count where db_id = :con_id
                `;

              binds = {
                count: podCache.pods[pod_name][container_name].restart_count,
                con_id: podCache.pods[pod_name][container_name].id,
              };

              db.query(query, binds, false).then((result) => {
                console.log('RESTART_LOG_UPDATE');
              });
            }
          });
        }
      });

      stop ? cache.stop() : cache.start();
    };
  }
  try {
    createUpdateFunction(userName, namespace).then((updateFunction) => {
      updateFunction();
      return next();
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = updateFuncController;
