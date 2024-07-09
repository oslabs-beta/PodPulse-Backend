const express = require('express');
const path = require('path');
// const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = 3000;
const app = express();

const k8scontroller = require('./controllers/k8scontroller');

app.use(express.json());
app.use(express.urlencoded());
// app.use(bodyParser.json());
app.use(cors());

app.post('/setWatch', k8scontroller.setWatch, (req, res) => {
  // console.log('RESULT: ', JSON.stringify(res.locals.result));
  return res.status(200).json(res.locals.result);
});

app.get('/getPodInfo', k8scontroller.getPodInfo, (req, res) => {
  // console.log('RESULT: ', JSON.stringify(res.locals.result));
  return res.status(200).json(res.locals.result);
});
// app.get(
//   '/getPods',
//   k8scontroller.getPodName,
//   k8scontroller.getlog,
//   (req, res) => {
//     console.log('RESULT: ', JSON.stringify(res.locals.result));
//     return res.status(200).json(res.locals.PodLog);
//   }
// );

app.use((err, req, res, next) => {
  console.log('ERROR: ', err);
  return res.status(500).json(err);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

module.exports = app;
