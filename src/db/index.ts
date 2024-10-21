import { code, IUser } from 'src/model';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

class Users {
  private users: IUser[] = [];

  async getUsers(): Promise<IUser[]> {
    return this.users;
  }

  async getUserById(id: string): Promise<IUser | code> {
    if (!uuidValidate(id)) {
      return '400';
    }

    const user = this.users.find((el) => el.id === id);

    if (user) {
      return user;
    }
    return '404';
  }

  async addUser(user: Omit<IUser, 'id'>): Promise<IUser | code> {
    if (await this.checkData(user)) {
      const newUser = {
        username: user.username.trim(),
        age: user.age,
        hobbies: user.hobbies.map((el) => el.trim()),
        id: uuidv4(),
      };

      this.users.push(newUser);

      return newUser;
    } else {
      return '400';
    }
  }

  async updateUser(id: string, data: Omit<IUser, 'id'>): Promise<IUser | code> {
    const userIndex = this.users.findIndex((el) => el.id === id);

    if (userIndex === -1) {
      return '404';
    }

    if (await this.checkData(data)) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        username: data.username.trim(),
        age: data.age,
        hobbies: data.hobbies.map((el) => el.trim()),
      };

      return this.users[userIndex];
    } else {
      return '400';
    }
  }

  async deleteUser(id: string): Promise<string | undefined> {
    const index = this.users.findIndex((el) => el.id === id);
    const userId = this.users[index].id;

    if (index !== -1) {
      this.users.splice(index, 1);

      return userId;
    }

    return;
  }

  private async checkData(data: Omit<IUser, 'id'>): Promise<boolean> {
    return !!(
      'username' in data &&
      'age' in data &&
      'hobbies' in data &&
      typeof data.username === 'string' &&
      typeof data.age === 'number' &&
      !isNaN(data.age) &&
      Number(data.age) > 0 &&
      Array.isArray(data.hobbies) &&
      data.hobbies.every((el) => typeof el === 'string')
    );
  }

  async fillUsers(data: string): Promise<void> {
    this.users = JSON.parse(data);
  }
}

export const users = new Users();
