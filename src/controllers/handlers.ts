import { IncomingMessage, ServerResponse } from 'http';
import { users } from '../db/index.ts';
import { code } from '../model/index.ts';

const isValidJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export async function getUsers(_: IncomingMessage, res: ServerResponse) {
  try {
    const response = await users.getUsers();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
    process.send?.({ action: JSON.stringify(await users.getUsers()) });
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
      process.send?.({ action: JSON.stringify(await users.getUsers()) });
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
        let user = {};
        if (isValidJSON(data)) {
          user = await users.addUser(JSON.parse(data));
        } else {
          user = '400';
        }

        if (user === '400') {
          serverError(res, user, 'Incorrect data for user creation');
        } else {
          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(user));
          process.send?.({ action: JSON.stringify(await users.getUsers()) });
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
        let user = {};
        if (isValidJSON(data)) {
          user = await users.updateUser(userId, JSON.parse(data));
        } else {
          user = '400';
        }

        if (user === '400') {
          serverError(res, user, 'Incorrect data for user update');
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(user));
          process.send?.({ action: JSON.stringify(await users.getUsers()) });
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
      process.send?.({ action: JSON.stringify(await users.getUsers()) });
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
