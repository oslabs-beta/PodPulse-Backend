const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// const demoData = require('./demo-data');

const PORT = 3000;
const app = express();

const authcontroller = require('./controllers/authcontroller');
const k8scontroller = require('./controllers/k8scontroller'); //temporarily out of commission
const dbController = require('./controllers/dbController');
const usercontroller = require('./controllers/usercontroller');
const { addOrUpdateObject } = require('@kubernetes/client-node');

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(cookieParser());

app.get('/getNamespaceList', dbController.getNamespaceList, (req, res) => {
  return res.status(200).json(res.locals.namespaceList);
});

app.get('/getPods', k8scontroller.getPods, (req, res) => {
  return res.status(200).json(res.locals.result);
});

app.get(
  '/initializeNamespace/:namespace',
  dbController.checkNamespaceExists,
  dbController.checkNamespaceNotInDB,
  dbController.initializeNamespace,
  (req, res) => {
    return res.status(200).json(res.locals.result);
  }
);

app.get(
  '/testing/:namespace',
  dbController.checkNamespaceExists,
  dbController.checkNamespaceNotInDB,
  (req, res) => {
    return res.sendStatus(200);
  }
);

app.get('/auth', authcontroller.verify, (req, res) => {
  console.log('made it out');
  return res.status(200).json(res.locals.verification);
});

app.get(
  '/getNamespaceState/:username/:namespace/',
  dbController.getNamespaceState,
  (req, res) => {
    return res.status(200).json(res.locals.namespaceData);
  }
);

app.post(
  '/createUser',
  usercontroller.hashing,
  usercontroller.createUser,
  (req, res) => {
    return res.status(200).json(res.locals.createdUser);
  }
);

app.post('/login', usercontroller.login, (req, res) => {
  return res
    .status(200)
    .cookie('secretCookie', res.locals.jwt, { httpOnly: true })
    .json(res.locals.jwt);
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
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

module.exports = app;
