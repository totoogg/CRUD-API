import { code, IUser } from 'src/model';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

class Users {
  private users: IUser[] = [];

  getUsers(): IUser[] {
    return this.users;
  }

  getUserById(id: string): IUser | undefined | code {
    if (!uuidValidate(id)) {
      return '400';
    }
    const user = this.users.find((el) => el.id === id);
    if (user) {
      return user;
    }
    return '404';
  }

  addUser(user: IUser): void {
    this.users.push({ ...user, id: uuidv4() });
  }

  deleteUser(id: string): void {
    const index = this.users.findIndex((el) => el.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}

export const users = new Users();
