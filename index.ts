import http, { METHODS } from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import "dotenv/config";
import { validate } from 'uuid';
import { API_METHODS, API_LINK, API_LINK_ID } from './apidata';
import User from './user/user';
import IUser from './user/user-inreface';

const PORT = Number(process.env.PORT || 4000);
const HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const userDb = new User();

async function requestBodyExtractor(request: IncomingMessage): Promise<IUser> {
    return new Promise((resolve, reject) => {
        let body: Buffer[] = [];
        let requestBody: string;
        request.on('data', (chunk: Buffer) => {
            body.push(chunk);
        }).on('end', () => {
            requestBody = Buffer.concat(body).toString();
            try {
                const userData = JSON.parse(requestBody);
                resolve(userData);
            } catch {
                reject('Wrong JSON');
            }
        });
    });
}

function urlValidator(url: string) {
    if (url === API_LINK) return { urlIsValid: true, urlHasId: false, idIsValid: undefined, id: undefined };
    else {
        const urlHasId = (url.indexOf(API_LINK_ID) === 0) &&
            (url.length > API_LINK_ID.length);
        if (urlHasId) {
            const id = url.replace(API_LINK_ID, '');
            if (validate(id)) {
                return { urlIsValid: true, urlHasId, idIsValid: true, id };
            } else {
                return { urlIsValid: true, urlHasId, idIsValid: false, id };
            }
        }
        return { urlIsValid: false, urlHasId, idIsValid: undefined, id: undefined };
    }
}


async function eventListener(request: IncomingMessage, response: ServerResponse) {
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
        response.writeHead(400);
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

}

const server = http.createServer(eventListener);



try {
    server.listen(PORT, HOSTNAME, () => {
        console.log(`Process ${process.pid} runs server on http://${HOSTNAME}:${PORT}`);
    })
} catch {
    console.log('WOW server listener eror');
}
