import IUser from "./user-inreface";
import IUserDot from "./userdot-interface";
import { v4 as uuidv4 } from 'uuid';
import { userChecker } from './user-checker';

export default class User {
    users: IUser[];
    constructor(users: IUser[] = []) {
        this.users = users;
    }

    async getAllUsers() {
        return this.users;
    }

    async getUserById(id: string) {
        const currentUser = this.users.find((user) => {
            return user.id === id;
        });
        if (currentUser) {
            return currentUser;
        }
        throw console.error(`Unknown user: ${id}`);

    }

    async createUser(user: IUserDot) {
        const newUser = { ...user, id: uuidv4() }
        if (userChecker(newUser)) {
            this.users.push(newUser);
            return newUser;
        }
        throw console.error(`Incorrect user data to create`);
    }

    async updateUserById(id: string, user: Partial<IUser>) {
        const currentUser = this.users.find((user) => {
            return user.id === id;
        });
        if (currentUser) {
            const index: number = this.users.indexOf(currentUser);
            const updatedUser = { ...currentUser, ...user, id };
            if (userChecker(updatedUser)) {
                this.users[index] = updatedUser;
                return updatedUser;
            }
            throw console.error(`Incorrect user data to update`);
        }
        throw console.error(`Unknown user: ${id}`);
    }

    async deleteUser(id: string) {
        const currentUser = this.users.find((user) => {
            return user.id === id;
        });
        if (currentUser) {
            const index: number = this.users.indexOf(currentUser);
            this.users = [...this.users.slice(0, index), ...this.users.slice(index + 1)];
            return currentUser;
        }
        throw console.error(`Unknown user: ${id}`);
    }
}
