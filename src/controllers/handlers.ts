import { IncomingMessage, ServerResponse } from 'http';
import { users } from '../db/index.ts';
import { code } from '../model/index.ts';

export async function getUsers(_: IncomingMessage, res: ServerResponse) {
  try {
    const response = await users.getUsers();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
  } catch {
    serverError(res, '500', 'Server error');
  }
}

export async function getUserById(req: IncomingMessage, res: ServerResponse) {
  try {
    const userId = req.url?.slice(11);
    const user = await users.getUserById(userId || '');

    if (user === '400') {
      serverError(res, user, 'Invalid user id');
    } else if (user === '404') {
      serverError(res, user, `User with id ${userId} does not exist`);
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(user));
    }
  } catch {
    serverError(res, '500', 'Server error');
  }
}

export async function createUser(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.headers['content-type'] === 'application/json') {
      let data = '';

      req.on('data', (chunk: string) => {
        data += chunk;
      });

      req.on('end', async () => {
        const user = await users.addUser(JSON.parse(data));

        if (user === '400') {
          serverError(res, user, 'Incorrect data for user creation');
        } else {
          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(user));
        }
      });
    } else {
      serverError(res, '400', 'Incorrect data for user creation');
    }
  } catch {
    serverError(res, '500', 'Server error');
  }
}

export async function updateUser(req: IncomingMessage, res: ServerResponse) {
  try {
    const userId = req.url?.slice(11) || '';
    const user = await users.getUserById(userId);

    if (user === '400') {
      serverError(res, user, 'Invalid user id');
    } else if (user === '404') {
      serverError(res, user, `User with id ${userId} does not exist`);
    } else {
      let data = '';

      req.on('data', (chunk: string) => {
        data += chunk;
      });

      req.on('end', async () => {
        const user = await users.updateUser(userId, JSON.parse(data));

        if (user === '400') {
          serverError(res, user, 'Incorrect data for user creation');
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(user));
        }
      });
    }
  } catch {
    serverError(res, '500', 'Server error');
  }
}

export async function deleteUser(req: IncomingMessage, res: ServerResponse) {
  try {
    const userId = req.url?.slice(11) || '';
    const user = await users.getUserById(userId);

    if (user === '400') {
      serverError(res, user, 'Invalid user id');
    } else if (user === '404') {
      serverError(res, user, `User with id ${userId} does not exist`);
    } else {
      await users.deleteUser(userId);

      res.statusCode = 204;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Successful removal');
    }
  } catch {
    serverError(res, '500', 'Server error');
  }
}

export function serverError(res: ServerResponse, code: code, text: string) {
  res.statusCode = Number(code);
  res.setHeader('Content-Type', 'text/plain');
  res.end(text);
}
