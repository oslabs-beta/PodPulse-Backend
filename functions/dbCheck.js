const db = require('../server/db');
const oracledb = require('oracledb');
const k8sApi = require('../server/k8sApi');
const { get } = require('../server/server');

const updateTestcontroller = {};

updateTestcontroller.testUpdate = (req, res, next) => {
  function getPodRestartCountFromKube() {
    k8sApi.listNamespacedPod(namespace).then((result) => {
      //console.log(result);
      const pods = result.body.items;
      const podRestartCount = {};

      k8sApi.listNode.then((result) => {
        console.log(result);
      });
      pods.forEach((pod) => {
        // podRestartCount[pod.metadata.name] = pod.
      });
    });
  }

  getPodRestartCountFromKube();
};

module.export = updateTestcontroller;
