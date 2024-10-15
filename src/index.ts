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
  }
  if (req.method === 'GET' && req.url?.startsWith('/api/users/')) {
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
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  return res.end('Bad URI');
});

server.listen(PORT, () => {
  console.log(`Server was launched on port ${PORT}`);
});
