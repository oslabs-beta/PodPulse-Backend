const db = require('../server/db');
const oracledb = require('oracledb');
const k8sApi = require('../server/k8sApi');

const dbController = {};

dbController.getNamespaceState = async (req, res, next) => {
  let { username, namespace } = req.params;
  // username = 'test';
  // namespace = 'default';

  function retrieveNamespace(username, namespace) {
    const namespaceQuery = `Select json_object ( 'NAMESPACE_NAME' value ns.namespace_name, 'NAMESPACE_DB_ID' value ns.db_id, 'PODS' value json_arrayagg(pods_join.pods) ) from namespace ns join
(Select pod.namespace_db_id, json_object( * ) pods from pod join
(Select c.pod_db_id, json_arrayagg(json_object ( * )) containers from container c join
(Select res.container_db_id, json_arrayagg( json_object ( * ) ) restart_logs  from restart_log res group by res.container_db_id) res_join
on c.db_id = res_join.container_db_id group by c.pod_db_id) con_join
on pod.db_id = con_join.pod_db_id) pods_join
on ns.db_id = pods_join.namespace_db_id
where ns.namespace_name = '${namespace}' and ns.user_db_id = (Select u.db_id from user_table u where u.username = '${username}')
 group by ns.namespace_name, ns.db_id`;
    return db.query(namespaceQuery);
  }

  retrieveNamespace(username, namespace)
    .then((results) => {
      console.log(results);
      const resultObj = JSON.parse(Object.values(results[0])[0]);
      res.locals.namespaceData = resultObj;
      return next();
    })
    .catch((err) => next(err));
};

//Namespace initialization
dbController.initializeNamespace = (req, res, next) => {
  //we'll need to retrieve namespace names from cluster as opposed to from client
  const { username, namespace } = req.params;
  console.log('LOAD POD DATA');
  console.log(username + ' ' + namespace);

  const query = `
    BEGIN
      ADD_NAMESPACE(:name, :user);
    END;
    `;

  const binds = {
    name: namespace, //would take from user input field, defaults to 'default'
    user: username, //should come from url parameter
  };

  db.query(query, binds, true)
    .then((result) => {
      console.log('NAMESPACE RESULT: ', result);
      k8sApi.listNamespacedPod(namespace).then((result) => {
        const pods = result.body.items;

        pods.forEach((pod) => {
          const container = pod.status.containerStatuses[0];
          // console.log('CONTAINER: ', container);

          const pod_name_split = pod.metadata.name.split('-');
          let pod_name = '';
          for (let i = 0; i < pod_name_split.length - 2; i++)
            pod_name += pod_name_split[i];

          const podQuery = `
    BEGIN
      INIT_CONTAINER(:namespace_name, :username, :container_name, :container_restart_count, :log_time, :pod_id_name, :pod_name, :pod_var, :name_var, :con_var);
    END;
    `;
          const podBinds = {
            namespace_name: namespace,
            username: username,
            container_name: container.name,
            container_restart_count: container.restartCount,
            log_time: Date.parse(
              container.state.waiting
                ? 0
                : container.state.running
                ? container.state.running.terminated //should probably use terminatedAt
                : container.state.terminated.finishedAt
            ),
            pod_id_name: pod.metadata.name,
            pod_name: pod_name,
            pod_var: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            name_var: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            con_var: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          };

          db.query(podQuery, podBinds, true).then((result) => {
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

module.exports = dbController;
