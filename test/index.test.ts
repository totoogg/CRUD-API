import request from 'supertest';
import { server } from '../src/index.ts';

afterAll(() => {
  server.close();
});

describe('GET /api/users', () => {
  it('return status code 200', async () => {
    const res = await request(server).get('/api/users');
    expect(res.status).toBe(200);
  });

  it('return all records', async () => {
    const res = await request(server).get('/api/users');
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/users', () => {
  it('return status code 201', async () => {
    const res = await request(server)
      .post('/api/users')
      .send({
        username: ' asd1 ',
        age: ' 1 ',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    expect(res.status).toBe(201);
  });

  it('return status code 400', async () => {
    const res = await request(server)
      .post('/api/users')
      .send({
        username: ' asd1 ',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    expect(res.status).toBe(400);
  });

  it('return new user', async () => {
    const res = await request(server)
      .post('/api/users')
      .send({
        username: ' asd1 ',
        age: ' 1 ',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    expect(res.body).toMatchObject({ username: 'asd1', age: '1', hobbies: ['b', 'a'] });
  });
});

describe('GET /api/user/{userId}', () => {
  it('return status code 200', async () => {
    const res = await request(server)
      .post('/api/users')
      .send({
        username: ' asd1 ',
        age: ' 1 ',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    const getUserById = await request(server).get(`/api/users/${res.body.id}`);
    expect(getUserById.status).toBe(200);
  });

  it('return status code 400', async () => {
    const getUserById = await request(server).get(`/api/users/0q`);
    expect(getUserById.status).toBe(400);
  });

  it('return status code 404', async () => {
    const getUserById = await request(server).get(`/api/users/00000000-0000-0000-0000-000000000000`);
    expect(getUserById.status).toBe(404);
  });

  it('return user', async () => {
    const res = await request(server)
      .post('/api/users')
      .send({
        username: ' asd1 ',
        age: ' 1 ',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    const getUserById = await request(server).get(`/api/users/${res.body.id}`);
    expect(getUserById.body).toMatchObject({ username: 'asd1', age: '1', hobbies: ['b', 'a'] });
  });
});

describe('PUT /api/user/{userId}', () => {
  it('return status code 200', async () => {
    const res = await request(server)
      .post('/api/users')
      .send({
        username: ' asd1 ',
        age: ' 1 ',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    const updateById = await request(server)
      .put(`/api/users/${res.body.id}`)
      .send({
        username: ' asd1 ',
        age: '2',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    expect(updateById.status).toBe(200);
  });

  it('return status code 400', async () => {
    const updateById = await request(server)
      .put(`/api/users/q1`)
      .send({
        username: ' asd1 ',
        age: '2',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    expect(updateById.status).toBe(400);
  });

  it('return status code 404', async () => {
    const updateById = await request(server)
      .put(`/api/users/00000000-0000-0000-0000-000000000000`)
      .send({
        username: ' asd1 ',
        age: '2',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    expect(updateById.status).toBe(404);
  });

  it('return update user', async () => {
    const res = await request(server)
      .post('/api/users')
      .send({
        username: ' asd1 ',
        age: ' 1 ',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    const updateById = await request(server)
      .put(`/api/users/${res.body.id}`)
      .send({
        username: ' asd1 ',
        age: '2',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    expect(updateById.body).toMatchObject({ username: 'asd1', age: '2', hobbies: ['b', 'a'] });
    expect(updateById.body.id).toBe(res.body.id);
  });
});

describe('DELETE  /api/user/{userId}', () => {
  it('return status code 204', async () => {
    const res = await request(server)
      .post('/api/users')
      .send({
        username: ' asd1 ',
        age: ' 1 ',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    const deleteById = await request(server).delete(`/api/users/${res.body.id}`);
    expect(deleteById.status).toBe(204);
  });

  it('return status code 400', async () => {
    const deleteById = await request(server).delete(`/api/users/q1`);
    expect(deleteById.status).toBe(400);
  });

  it('return status code 404', async () => {
    const deleteById = await request(server).delete(`/api/users/00000000-0000-0000-0000-000000000000`);
    expect(deleteById.status).toBe(404);
  });

  it('attempt to get remote user, return status code 404', async () => {
    const res = await request(server)
      .post('/api/users')
      .send({
        username: ' asd1 ',
        age: ' 1 ',
        hobbies: ['b', 'a'],
      })
      .set('Accept', 'application/json');
    await request(server).delete(`/api/users/${res.body.id}`);
    const getUserById = await request(server).get(`/api/users/${res.body.id}`);
    expect(getUserById.status).toBe(404);
  });
});
