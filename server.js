const express = require('express');
const path = require('path');
const cors = require('cors');
const demoData = require('./demo-data');

const PORT = 3000;
const app = express();

const k8scontroller = require('./controllers/k8scontroller');
const namespaceController = require('./controllers/namespaceController');
const dbController = require('./controllers/dbController');

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.get('/test-data', (req, res) => {
  res.json(demoData);
});

app.get('/getPods', k8scontroller.getPods, (req, res) => {
  // res.locals.result.forEach((element) => console.log('results: ', JSON.stringify(element)))
  // console.log('RESULT 1: ', JSON.stringify(res.locals.result));
  return res.status(200).json(res.locals.result);
});

app.get(
  '/pods/:namespace_name',
  namespaceController.initializeNamespace,
  (req, res) => {
    // res.locals.result.forEach((element) => console.log('results: ', JSON.stringify(element)))
    // console.log('RESULT 1: ', JSON.stringify(res.locals.result));
    return res.status(200).json(res.locals.result);
  }
);

app.get('/namespace/', dbController.retrieveAll, (req, res) => {
  return res.sendStatus(200);
});

app.get('/*', function (req, res) {
  res.sendFile(
    path.join(__dirname, '../PodPulse-1/public/index.html'),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});

app.use((err, req, res, next) => {
  console.log('ERROR: ', err);
  return res.status(500).json(err);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

module.exports = app;
