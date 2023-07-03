import { IncomingMessage, ServerResponse } from "http";
import { API_METHODS } from "../apidata";
import User from "./user";
import { requestBodyExtractor, urlValidator } from './utils'

export default async function singleMode(userDb: User, request: IncomingMessage, response: ServerResponse) {
    const { headers, method, url } = request;

    const {
        urlIsValid,
        urlHasId,
        idIsValid,
        id } = urlValidator(url as string);

    if (!urlIsValid) {
        response.writeHead(404);
        response.end(`Page ${url} not found`);
        return console.error(`Page ${url} not found`);
    }
    if (urlHasId && !idIsValid) {
        response.writeHead(404);
        response.end('Invalid ID');
        return console.error(`Invalid ${id}`);
    }

    switch (method) {
        case (API_METHODS.GET): {
            if (idIsValid) {
                try {
                    const userById = await userDb.getUserById(id);
                    response.writeHead(200);
                    response.end(`${JSON.stringify(userById)}`);
                    break;
                } catch {
                    response.writeHead(404);
                    response.end(`User ${id} not found`);
                    break;
                }
            }
            const allUsers = await userDb.getAllUsers();
            response.writeHead(200);
            response.end(`${JSON.stringify(allUsers)}`);
            break;
        }
        case (API_METHODS.POST): {
            try {
                const newUserData = await requestBodyExtractor(request);
                const newUser = await userDb.createUser(newUserData);
                response.writeHead(200);
                response.end(`${JSON.stringify(newUser)}`);
                break;
            } catch {
                response.writeHead(400);
                response.end(`Incorrect user data`);
                break;
            }
        }
        case (API_METHODS.PUT): {
            if (idIsValid) {
                try {
                    const userDataToUpdate = await requestBodyExtractor(request);
                    const updatedUser = await userDb.updateUserById(id, userDataToUpdate)
                    response.writeHead(200);
                    response.end(`${JSON.stringify(updatedUser)}`);
                    break;
                } catch {
                    response.writeHead(400);
                    response.end(`Incorrect user data`);
                    break;
                }
            }
        }
        case (API_METHODS.DELETE): {
            if (idIsValid) {
                try {
                    const deletedUser = await userDb.deleteUser(id);
                    response.writeHead(204);
                    response.end(`User ${id} removed`);
                    break;
                } catch {
                    response.writeHead(400);
                    response.end(`Incorrect user data`);
                    break;
                }
            }
        }
        default: {
            response.writeHead(500);
            response.end(`Server error: unknown method`);
            return console.error(`Server error: unknown method`);
        }
    }
    // if (process.env.MODE === 'multi') {
    //     process.send?.({ response });
    // }
}
