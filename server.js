const express = require('express');
const path = require('path');
const cors = require('cors');
const demoData = require('./demo-data');

const PORT = 3000;
const app = express();

const k8scontroller = require('./controllers/k8scontroller');

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.get('/test-data', (req, res) => {
  res.json(demoData);
});

app.get('/getPods', k8scontroller.getPods, (req, res) => {
  console.log('RESULT: ', JSON.stringify(res.locals.result));
  return res.status(200).json(res.locals.result);
});

app.use((err, req, res, next) => {
  console.log('ERROR: ', err);
  return res.status(500).json(err);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

module.exports = app;
