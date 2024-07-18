const express = require('express');
const path = require('path');
const cors = require('cors');

// const demoData = require('./demo-data');

const PORT = 3000;
const app = express();

const k8scontroller = require('./controllers/k8scontroller');
const podcontroller = require('./controllers/podcontroller');
const usercontroller = require('./controllers/usercontroller')

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

// app.get('/test-data', (req, res) => {
//   res.json(demoData);
// });

app.get('/getPods', k8scontroller.getPods, (req, res) => {
  // res.locals.result.forEach((element) => console.log('results: ', JSON.stringify(element)))
  // console.log('RESULT 1: ', JSON.stringify(res.locals.result));
  return res.status(200).json(res.locals.result);
});

app.get('/pods/:namespace_name', podcontroller.loadPodData, (req, res) => {
  // res.locals.result.forEach((element) => console.log('results: ', JSON.stringify(element)))
  // console.log('RESULT 1: ', JSON.stringify(res.locals.result));
  return res.status(200).json(res.locals.result);
});

app.post('/createUser', usercontroller.hashing, usercontroller.createUser, (req,res) => {
  return res.status(200).json(res.local.createdUser);
})

app.get('/login', usercontroller.login , (req, res) => {
  return res.status(200).json('placeholder')
} )

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
