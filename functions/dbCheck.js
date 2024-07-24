const db = require('../server/db');
const oracledb = require('oracledb');
const k8sApi = require('../server/k8sApi');
// const { get } = require('../server/server');
const fs = require('fs');
const path = require('path');
console.log('sdfgasdffserdf');

const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const updateTestController = {};

function file(obj) {
  fs.writeFile(
    path.resolve(__dirname, 'namespace.json'),
    JSON.stringify(obj, null, 2),
    'utf8',
    (error) => {
      if (error) {
        console.error('An error occurred while writing to the file:', error);
        return;
      }
      console.log('\nFile has been written successfully.\n');
    }
  );
}

updateTestController.testUpdate = (req, res, next) => {
  function createUpdateFunction(username = 'test', namespace = 'default') {
    const u = undefined;
    const apiPath = '/api/v1/pods';
    const watch = new k8s.Watch(kc);

    //const listFn = (ns = namespace) => k8sApi.listNamespacedPod(ns);
    const listFn = () => k8sApi.listPodForAllNamespaces();
    const cache = new k8s.ListWatch(apiPath, watch, listFn);
    const podCache = {};

    const getRelevantIds = () => {};

    const updateContainerForPodInNamespace = () => {
      const query = `
      
      `;
    };

    return () => {
      console.log('NAMESPACE: ', namespace);
      const list = cache.list(namespace);

      if (list) {
        // console.log('WATCH LIST: ', JSON.stringify(list, null, 2));
      }
      cache.on(k8s.CHANGE, (pod) => {
        //if (pod.kind === u) return;

        //console.log('CHANGE HAPPENED: ', JSON.stringify(pod, null, 2));
        console.log('NAME: ', JSON.stringify(pod.metadata.name, null, 2));
        console.log('KIND: ', JSON.stringify(pod.kind, null, 2));
        console.log(
          'CONTAINER_STATUSES: ',
          JSON.stringify(pod.status.containerStatuses, null, 2)
        );
        file(pod);

        pod.metadata.managedFields.forEach((field) => {
          console.log('FIELD: ');
          console.log(
            '   OPERATION: ',
            JSON.stringify(field.operation, null, 2)
          );
          console.log('   MANAGER: ', JSON.stringify(field.manager, null, 2));
          console.log('   TIME: ', JSON.stringify(field.time, null, 2));
        });
      });
    };

    try {
      const updateFunction = createUpdateFunction('test', 'default');
      updateFunction();
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = updateTestController;
