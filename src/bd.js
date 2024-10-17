class Users {
  users = [];

  getUsers() {
    return this.users;
  }

  getUserById(id) {
    const user = this.users.find((el) => el.id === id);

    if (user) {
      return user;
    }
    return '404';
  }

  addUser(user) {
    if (
      'username' in user &&
      'age' in user &&
      'hobbies' in user &&
      typeof user.username === 'string' &&
      typeof user.age === 'string' &&
      Number(user.age) > 0 &&
      Array.isArray(user.hobbies) &&
      user.hobbies.every((el) => typeof el === 'string')
    ) {
      const newUser = { ...user, id: Math.random() };

      this.users.push(newUser);

      return newUser;
    } else {
      return '400';
    }
  }

  updateUser(id, data) {
    const userIndex = this.users.findIndex((el) => el.id === id);

    if (userIndex === -1) {
      return '404';
    }

    if (
      'username' in data &&
      'age' in data &&
      'hobbies' in data &&
      typeof data.username === 'string' &&
      typeof data.age === 'string' &&
      Number(data.age) > 0 &&
      Array.isArray(data.hobbies) &&
      data.hobbies.every((el) => typeof el === 'string')
    ) {
      this.users[userIndex] = { ...this.users[userIndex], ...data };

      return this.users[userIndex];
    } else {
      return '400';
    }
  }

  deleteUser(id) {
    const index = this.users.findIndex((el) => el.id === id);
    const userId = this.users[index].id;

    if (index !== -1) {
      this.users.splice(index, 1);

      return userId;
    }

    return;
  }
}

export const users = new Users();
