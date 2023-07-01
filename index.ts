import http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import "dotenv/config";
import { validate } from 'uuid';
import { API_METHODS } from './apidata';
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
            if (requestBody) {
                resolve(JSON.parse(requestBody));
            }
            reject('No data');
        });
    });
}

async function eventListener(request: IncomingMessage, response: ServerResponse) {
    const { headers, method, url } = request;

    const id = url?.replace('/api/users/', '') || '';
    const idIsValid = id === '' ? false : validate(id);
    const urlIsValid = (url === '/api/users');

    // if (idIsValid) {
    //     response.end('there should be methods with ID');
    // } else {
    //     response.end('Wrong ID');
    // }

    // if (urlIsValid) {
    //     response.end('there should be methods without ID');
    // } else {
    //     response.end('Page not found');
    // }
    switch (method) {
        case (API_METHODS.GET): {
            if (idIsValid) {
                const userById = await userDb.getUserById(id);
                response.writeHead(200);
                response.end(`${JSON.stringify(userById)}`);
                break;
            }
            const allUsers = await userDb.getAllUsers();
            response.writeHead(200);
            response.end(`${JSON.stringify(allUsers)}`);
            break;
        }
        case (API_METHODS.POST): {
            const newUserData = await requestBodyExtractor(request);
            const newUser = await userDb.createUser(newUserData);
            response.writeHead(200);
            response.end(`${JSON.stringify(newUser)}`);
            break;
        }
        // case (API_METHODS.PUT): {
        //     if (!idIsValid) response.end(`Invalid user id ${id}`);
        //     // const userDataToUpdate = await requestBodyExtractor(request);
        //     // const updatedUser = await userDb.updateUserById(id, userDataToUpdate)
        //     // response.writeHead(200);
        //     // response.end(`${JSON.stringify(updatedUser)}`);
        //     break;
        // }
        default: {
            response.writeHead(500);
            response.end(`Server error: unknown method`);
        }
    }

}

const server = http.createServer(eventListener);



try {
    server.listen(PORT, HOSTNAME, () => {
        console.log(`Process ${process.pid} runs server on http://${HOSTNAME}:${PORT}`);
    })
} catch {
    console.log('WOW Error');
}
