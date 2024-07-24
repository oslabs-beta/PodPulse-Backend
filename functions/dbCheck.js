const db = require('../server/db');
const oracledb = require('oracledb');
const k8sApi = require('../server/k8sApi');
const { get } = require('../server/server');
const fs = require('fs');
const path = require('path');

const updateTestController = {};

updateTestController.testUpdate = (req, res, next) => {
  function getPodRestartCountFromKube() {
    k8sApi.listNamespacedPod('default').then((result) => {
      console.log(JSON.stringify(result.body.items, null, 2));

      fs.writeFile(
        path.resolve(__dirname, 'namespace.json'),
        JSON.stringify(result.body.items, null, 2),
        'utf8',
        (error) => {
          if (error) {
            console.error(
              'An error occurred while writing to the file:',
              error
            );
            return;
          }
          console.log('File has been written successfully.');
        }
      );

      const pods = result.body.items;
      const podRestartCount = {};
    });
  }

  try {
    getPodRestartCountFromKube();
  } catch (err) {
    console.log(err);
  }
};

module.exports = updateTestController;
