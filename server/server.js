const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// const demoData = require('./demo-data');

const PORT = 3000;
const app = express();

const authcontroller = require('../controllers/authcontroller');
const k8scontroller = require('../controllers/k8scontroller'); //temporarily out of commission
const dbController = require('../controllers/dbController');
const usercontroller = require('../controllers/usercontroller');
const { addOrUpdateObject } = require('@kubernetes/client-node');
const updateFuncController = require('../controllers/updateFuncController');

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(cookieParser());

app.get(
  '/getNamespaceList',
  authcontroller.verify,
  dbController.getNamespaceList,
  (req, res) => {
    return res.status(200).json(res.locals.namespaceList);
  }
);

app.get('/getPods', k8scontroller.getPods, (req, res) => {
  return res.status(200).json(res.locals.result);
});

app.get(
  '/initializeNamespace/:namespace',
  authcontroller.verify,
  dbController.checkNamespaceExists,
  dbController.checkNamespaceNotInDB,
  dbController.initializeNamespace,
  updateFuncController.createUpdateFunc,
  (req, res) => {
    return res.status(200).json(res.locals.result);
  }
);

app.get(
  '/startUpdate/:namespace/:userName',
  updateFuncController.createUpdateFunc,
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

app.get('/logout', (req, res) => {
  console.log('logging out', req.cookies);
  return res.status(200).clearCookie('secretCookie').send('cookies cleared');
});

app.get(
  '/getNamespaceState/:namespace/',
  authcontroller.verify,
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
    .cookie('secretCookie', res.locals.jwt, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    })
    .json(res.locals.jwt);
});

app.get('/*', function (req, res) {
  res.sendFile(
    path.join(__dirname, '../../PodPulse/dist/index.html'),
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
