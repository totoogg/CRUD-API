import cluster, { Worker } from 'cluster';
import http from 'http';
import { availableParallelism } from 'os';
import { Buffer } from 'buffer';
import { createUser, deleteUser, getUserById, getUsers, serverError, updateUser } from './controllers/handlers.ts';
import 'dotenv/config';
import { users } from './db/index.ts';

const PORT = Number(process.env.PORT) || 4000;

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
  let arrClusters: Worker[] = [];

  Promise.all(
    Array(numCPUs - 1)
      .fill(0)
      .map((_, i): Promise<Worker> => {
        return new Promise((resolve) => {
          const worker = cluster.fork({ idCluster: i + 1 });
          worker
            .on('online', () => resolve(worker))
            .on('message', ({ message, action }) => {
              if (message) {
                console.log(message);
              }
              if (action) {
                arrClusters.forEach((otherWorker, index) => {
                  if (index !== i) otherWorker?.send(action);
                });
              }
            })
            .on('exit', () => {
              console.log(`Worker on port ${PORT + i + 1} is dead`);
            });
        });
      }),
  ).then((workers) => {
    arrClusters = workers;
    let currentWorker = 1;
    const server = http.createServer((req, res) => {
      const request = http.request(
        {
          host: '127.0.0.1',
          port: PORT + currentWorker,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (response) => {
          let chunks = '';
          response.on('data', (data) => (chunks += data));
          response.on('end', () => {
            res.writeHead(response.statusCode!, response.headers);
            res.write(chunks);
            res.end();
          });
        },
      );
      const chunks: Buffer[] = [];
      req.on('data', (data) => chunks.push(data));
      req.on('end', () => {
        const resBody = Buffer.concat(chunks);
        request.write(resBody);
        request.end();
      });
      currentWorker = (currentWorker + 1) % numCPUs;
    });

    server.listen(PORT, () => {
      console.log(`Main server start on port ${PORT}`);
    });
  });
} else {
  const port = Number(process.env.idCluster);
  process.on('message', (message: string) => {
    users.fillUsers(message);
  });
  const server = http.createServer((req, res) => {
    try {
      process.send?.({
        message: `Worker on port ${PORT + port} processes request to URL ${req.url} with method ${req.method}`,
      });
      if (req.method === 'GET' && req.url === '/api/users') {
        return getUsers(req, res);
      }
      if (req.method === 'GET' && req.url?.startsWith('/api/users/')) {
        return getUserById(req, res);
      }
      if (req.method === 'POST' && req.url === '/api/users') {
        return createUser(req, res);
      }
      if (req.method === 'PUT' && req.url?.startsWith('/api/users/')) {
        return updateUser(req, res);
      }
      if (req.method === 'DELETE' && req.url?.startsWith('/api/users/')) {
        return deleteUser(req, res);
      } else {
        return serverError(res, '404', 'Such url does not exist');
      }
    } catch {
      serverError(res, '500', 'Server error');
    }
  });
  server.listen(PORT + port, () => {
    console.log(`Worker started port ${PORT + port}`);
  });
}
