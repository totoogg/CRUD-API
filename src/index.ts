import { createServer } from 'http';
import { users } from './db/index.ts';

const PORT = 5000;

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/users') {
    const response = users.getUsers();

    if (response) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');

      return res.end(JSON.stringify(response));
    } else {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');

      return res.end('Server error');
    }
  } else if (req.method === 'GET' && req.url?.startsWith('/api/users/')) {
    const userId = req.url.slice(11);
    const user = users.getUserById(userId);

    if (user === '400') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');

      return res.end('Invalid user id');
    }

    if (user === '404') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');

      return res.end(`User with id ${userId} does not exist`);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');

    return res.end(JSON.stringify(user));
  } else if (req.method === 'POST' && req.url === '/api/users') {
    if (req.headers['content-type'] === 'application/json') {
      let data = '';

      req.on('data', (chunk: string) => {
        data += chunk;
      });

      req.on('end', () => {
        const user = users.addUser(JSON.parse(data));

        if (user === '400') {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/plain');

          return res.end('Incorrect data for user creation');
        }

        res.setHeader('Content-Type', 'application/json');

        return res.end(JSON.stringify(user));
      });
    }

    return;
  } else if (req.method === 'PUT' && req.url?.startsWith('/api/users/')) {
    const userId = req.url.slice(11);
    const user = users.getUserById(userId);

    if (user === '400') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');

      return res.end('Invalid user id');
    }

    if (user === '404') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');

      return res.end(`User with id ${userId} does not exist`);
    }

    let data = '';

    req.on('data', (chunk: string) => {
      data += chunk;
    });

    req.on('end', () => {
      const user = users.updateUser(userId, JSON.parse(data));

      if (user === '400') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');

        return res.end('Incorrect data for user creation');
      }

      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(user));
    });

    return;
  } else if (req.method === 'DELETE' && req.url?.startsWith('/api/users/')) {
    const userId = req.url.slice(11);
    const user = users.getUserById(userId);

    if (user === '400') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');

      return res.end('Invalid user id');
    }

    if (user === '404') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');

      return res.end(`User with id ${userId} does not exist`);
    }

    users.deleteUser(userId);

    res.statusCode = 204;
    res.setHeader('Content-Type', 'text/plain');

    return res.end('Successful removal');
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');

    return res.end('Such url does not exist');
  }
});

server.listen(PORT, () => {
  console.log(`Server was launched on port ${PORT}`);
});
