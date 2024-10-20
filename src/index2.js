import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import process from 'node:process';
import { users } from './bd.js';
import { Buffer } from 'node:buffer';

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
  let arrClusters = [];

  Promise.all(
    Array(numCPUs - 1)
      .fill(0)
      .map((_, i) => {
        return new Promise((resolve) => {
          const worker = cluster.fork({ idCluster: i + 1 });
          worker
            .on('online', () => resolve(worker))
            .on('message', (message) => {
              console.log('message', message);
              arrClusters.forEach((otherWorker, index) => {
                if (index !== i) otherWorker?.send(message);
              });
            });
        });
      }),
  ).then((workers) => {
    arrClusters = workers;
    const server = http.createServer((req, res) => {
      const request = http.request(
        {
          host: '127.0.0.1',
          port: 8001,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (response) => {
          let chunks = '';
          response.on('data', (data) => (chunks += data));
          response.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(chunks);
            res.end();
          });
        },
      );
      let chunks = [];
      req.on('data', (data) => chunks.push(data));
      req.on('end', () => {
        let resBody = Buffer.concat(chunks);
        request.write(resBody);
        request.end();
      });
    });

    server.listen(8000, () => {
      console.log(`Server start on port 8000`);
    });
  });
} else {
  const port = Number(process.env.idCluster);
  process.on('message', (message) => {
    console.log(`message ${port}`, message);
  });
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/api/users') {
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
      process.send('notifyRequest');
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
  });
  server.listen(8000 + port, () => {
    console.log(`Worker ${process.pid} started port ${8000 + port}`);
  });
}
