const db = require('../server/db');
const oracledb = require('oracledb');
const k8sApi = require('../server/k8sApi');

const dbController = {};

dbController.getNamespaceList = async (req, res, next) => {
  const namespaceListQuery = `SELECT namespace_name FROM NAMESPACE where user_db_id = (SELECT db_id from USER_TABLE where username = :username)`;
  const binds = {
    username: req.cookies.secretCookie.data.userName,
  };

  db.query(namespaceListQuery, binds).then((results) => {
    const namespaceList = [];
    for (let db_obj of results) {
      namespaceList.push(db_obj.NAMESPACE_NAME);
    }
    res.locals.namespaceList = namespaceList;
    return next();
  });
};

dbController.getNamespaceState = async (req, res, next) => {
  let { username, namespace } = req.params;
  username = 'test';
  namespace = 'default';

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

dbController.checkNamespaceExists = async (req, res, next) => {
  //retrieve namespace names from cluster
  existingNamespaceArray = [];
  await k8sApi.listNamespace().then((res) => {
    for (let namespace of res.body.items) {
      existingNamespaceArray.push(namespace.metadata.name);
      console.log(existingNamespaceArray);
    }
  });

  const { namespace } = req.params;

  for (const name of existingNamespaceArray) {
    if (name === namespace) {
      console.log('namespace found!');
      return next();
    }
  }

  //If namespace isn't accessible by k8s api
  return next({
    log: 'Given namespace not found in list of API-accesible namespaces when calling dbController.checkNamespaceExists',
    status: 500,
    message: 'Namespace not found/accessible.',
  });
};

dbController.checkNamespaceNotInDB = async (req, res, next) => {
  const { namespace } = req.params;
  const namespaceInDBQuery = `SELECT db_id FROM NAMESPACE where user_db_id = (SELECT db_id from USER_TABLE where username = :username) and namespace_name = :namespace`;
  const binds = {
    username: 'jeremiah', //req.cookies.secretCookie.data.userName,
    namespace: namespace,
  };

  db.query(namespaceInDBQuery, binds).then((results) => {
    console.log(results);
    if (results.length === 0) {
      return next();
    } else
      return next({
        log: 'Given namespace already exists for this user',
        status: 500,
        message: "You've already initialized a namespace with this name",
      });
  });
};

dbController.initializeNamespace = async (req, res, next) => {
  // const { namespace } = req.params;
  // const { userName } = req.cookies.secretCookie.data;
  console.log('LOAD POD DATA');
  username = 'test';
  namespace = 'default';

  console.log(username + ' ' + namespace);

  const query = `
    BEGIN
      ADD_NAMESPACE(:name, :user);
    END;
    `;

  const binds = {
    name: namespace, //would take from user input field, defaults to 'default'
    user: username, //comes from cookie
  };

  db.query(query, binds, true).then((result) => {
    console.log('NAMESPACE RESULT: ', result);
    k8sApi
      .listNamespacedPod(namespace)
      .then((result) => {
        const pods = result.body.items;
        const promiseArray = [];

        pods.forEach((pod) => {
          const pod_name_split = pod.metadata.name.split('-');
          let pod_name = '';
          for (let i = 0; i < pod_name_split.length - 2; i++)
            pod_name += pod_name_split[i];

          pod.status.containerStatuses.forEach((container) => {
            const podQuery = `
    BEGIN
      INIT_CONTAINER(:namespace_name, :username, :container_name, :container_restart_count, :log_time, :pod_id_name, :pod_name);
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
                  ? container.state.running.startedAt //should probably use terminatedAt
                  : container.state.terminated.finishedAt
              ),
              pod_id_name: pod.metadata.name,
              pod_name: pod_name,
            };

            promiseArray.push(db.query(podQuery, podBinds, true));
          });
        });

        Promise.all(promiseArray).then((results) => {
          console.log(JSON.stringify(results, null, 2));
        });
      })
      .then(() => {
        return next();
      })
      .catch((err) => {
        console.log(err);
      });
  });
  // console.log('CONTAINER: ', container);
};

module.exports = dbController;
