const db = require('../server/db');
const oracledb = require('oracledb');
const k8sApi = require('../server/k8sApi');

function getPodRestartCountFromKube(){
  k8sApi.listNamespacedPod(namespace).then((result) => {
    console.log(result);
    const pods = result.body.items;
    const podRestartCount = {};
    pods.forEach((pod) => {
      // podRestartCount[pod.metadata.name] = pod.

    }

  }

}

module.export = getPodRestartCountFromKube;