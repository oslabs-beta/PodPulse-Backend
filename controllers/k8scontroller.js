const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
// const delay = (num) => new Promise((resolve) => setTimeout(resolve, num));
// kc.makeApiClient();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// const watch = new k8s.Watch(kc);

console.log('basePath', k8sApi.basePath);

// const main = async () => {
//   try {
//     const req = await watch.watch(
//       '/api/v1/default',
//       // optional query parameters can go here.
//       {
//         allowWatchBookmarks: true,
//       },
//       // callback is called for each received object.
//       (type, apiObj, watchObj) => {
//         if (type === 'ADDED') {
//           console.log('new object:');
//         } else if (type === 'MODIFIED') {
//           console.log('changed object:');
//         } else if (type === 'DELETED') {
//           console.log('deleted object:');
//         } else if (type === 'BOOKMARK') {
//           console.log(`bookmark: ${watchObj.metadata.resourceVersion}`);
//         } else {
//           console.log('unknown type: ' + type);
//         }
//         console.log(apiObj);
//       },
//       // done callback is called if the watch terminates normally
//       (err) => console.error(err)
//     );
//     await delay(5000);

//     // watch returns a request object which you can use to abort the watch.
//     req.abort();
//   } catch (err) {
//     console.error(err);
//   }
// };

// main();

const k8scontroller = {};

k8scontroller.getPods = (req, res, next) => {
  k8sApi
    .listNamespacedPod(
      'default',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      100000,
      true,
      undefined
    )
    .then((result) => {
      // console.log('RESULT: ', result);
      res.locals.result = result.body.items;
      next();
    })
    .catch((err) => {
      next(err);
    });
};
k8scontroller.getPodName = (req, res, next) => {
  k8sApi
    .listNamespacedPod('default')
    .then((result) => {
      // console.log('RESULT: ', result);
      res.locals.result = result.body.items[0].metadata.name;
      next();
    })
    .catch((err) => {
      next(err);
    });
};

k8scontroller.getlog = (req, res, next) => {
  console.log('test for metadata name', res.locals.result);
  k8sApi
    .readNamespacedPodLog(res.locals.result, 'default')
    .then((result) => {
      console.log('LOG: ', result.body);
      res.locals.PodLog = result.body;
      return next();
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = k8scontroller;
