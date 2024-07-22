const demoData = {
  namespace_name: 'my-namespace',
  pods: [
    {
      pod_name: 'my-pod',
      containers: [
        {
          container_db_id: 5,
          container_name: 'react-app',
          cleared_at: 1720576971,
          restart_logs: [
            {
              restart_log_db_id: 1,
              log_time: 1720576971,
              restart_person: 'Pablo Rosillo',
            },
            {
              restart_log_db_id: 2,
              log_time: 1720577039,
              restart_person: '',
            },
            {
              restart_log_db_id: 3,
              log_time: 1720577130,
              restart_person: 'Jeremy Kay',
            },
            {
              restart_log_db_id: 4,
              log_time: 1720577168,
              restart_person: '',
            },
          ],
        },
        {
          container_db_id: 6,
          container_name: 'express-server',
          cleared_at: 1720577078,
          restart_logs: [
            {
              restart_log_db_id: 5,
              log_time: 1720577092,
              restart_person: '',
            },
          ],
        },
        {
          container_db_id: 7,
          container_name: 'redis-cache-server',
          cleared_at: 1720577217,
          restart_logs: [
            {
              restart_log_db_id: 6,
              log_time: 1720577230,
              restart_person: 'Ashe McAtee',
            },
          ],
        },
      ],
    },
  ],
};

module.exports = demoData;
