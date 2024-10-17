import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import process from 'node:process';
import { users } from './bd.js';

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Форк рабочих.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({ idCluster: i });
  }

  cluster.on('message', (worker, message) => {
    console.log('worker', worker);
    console.log('message', message);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`рабочий ${worker.process.pid} умер`);
  });
} else {
  // Рабочие могут совместно использовать любое TCP-соединение.
  // В данном случае это HTTP-сервер
  const port = Number(process.env.idCluster);
  process.on('message', (message) => {
    console.log(`message ${port}`, message);
  });
  http
    .createServer((req, res) => {
      if (req.method === 'GET' && req.url === '/api/users') {
        console.log(port);
        const response = users.getUsers();

        if (response) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');

          res.end(JSON.stringify(response));
        } else {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');

          res.end('Server error');
        }
        process.send({ cmd: 'notifyRequest' });
      } else if (req.method === 'GET' && req.url?.startsWith('/api/users/')) {
        const userId = req.url.slice(11);
        const user = users.getUserById(userId);

        if (user === '400') {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/plain');

          res.end('Invalid user id');
        }

        if (user === '404') {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');

          res.end(`User with id ${userId} does not exist`);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');

        res.end(JSON.stringify(user));
      } else if (req.method === 'POST' && req.url === '/api/users') {
        if (req.headers['content-type'] === 'application/json') {
          let data = '';

          req.on('data', (chunk) => {
            data += chunk;
          });

          req.on('end', () => {
            const user = users.addUser(JSON.parse(data));

            if (user === '400') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'text/plain');

              res.end('Incorrect data for user creation');
            }

            res.setHeader('Content-Type', 'application/json');

            res.end(JSON.stringify(user));
          });
        }
      }
    })
    .listen(8000 + port, () => {
      console.log(8000 + port);
    });

  console.log(`Worker ${process.pid} started`);
}
