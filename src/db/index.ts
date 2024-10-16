import { code, IUser } from 'src/model';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

class Users {
  private users: IUser[] = [];

  getUsers(): IUser[] {
    return this.users;
  }

  getUserById(id: string): IUser | code {
    if (!uuidValidate(id)) {
      return '400';
    }

    const user = this.users.find((el) => el.id === id);

    if (user) {
      return user;
    }
    return '404';
  }

  addUser(user: Omit<IUser, 'id'>): IUser | code {
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
      const newUser = { ...user, id: uuidv4() };

      this.users.push(newUser);

      return newUser;
    } else {
      return '400';
    }
  }

  updateUser(id: string, data: Omit<IUser, 'id'>): IUser | code {
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

  deleteUser(id: string): string | undefined {
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
