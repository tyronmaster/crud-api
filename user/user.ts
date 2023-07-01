import IUser from "./user-inreface";
import IUserDot from "./userdot-interface";
import { v4 as uuidv4 } from 'uuid';

export default class User {
    users: IUser[];
    constructor(users: IUser[] = []) {
        this.users = users;
    }

    async getAllUsers() {
        return this.users;
    }

    async getUserById(id: string) {
        return this.users.find((user) => user.id === id);
    }

    async createUser(user: IUserDot) {
        const newUser = { id: uuidv4(), ...user }
        this.users.push(newUser);
        return newUser;
    }

    async updateUserById(id: string, user: Partial<IUser>) {
        const currentUser = this.users.find((user) => {
            user.id === id;
        });
        if (currentUser) {
            const index: number = this.users.indexOf(currentUser);
            const updatedUser = { ...currentUser, ...user };
            this.users[index] = updatedUser;
            return updatedUser;
        }
        throw console.error(`Unknown user: ${id}`);
    }

    async deleteUser(id: string) {
        const currentUser = this.users.find((user) => {
            user.id === id;
        });
        if (currentUser) {
            const index: number = this.users.indexOf(currentUser);
            this.users.slice(index, index + 1);
            return currentUser;
        }
        throw console.error(`Unknown user: ${id}`);
    }
}
