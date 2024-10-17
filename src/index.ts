import { createServer } from 'http';
import { createUser, deleteUser, getUserById, getUsers, serverError, updateUser } from './controllers/handlers.ts';
import 'dotenv/config';

const PORT = process.env.PORT;

const server = createServer((req, res) => {
  try {
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

server.listen(PORT, () => {
  console.log(`Server was launched on port ${PORT}`);
});
