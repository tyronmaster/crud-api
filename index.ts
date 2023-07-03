import http, { METHODS } from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import "dotenv/config";
import { validate } from 'uuid';
import { API_METHODS, API_LINK, API_LINK_ID } from './apidata';
import User from './user/user';
import IUser from './user/user-inreface';
import { exit } from 'process';
import os from 'os';
import cluster from 'cluster';
import singleMode from './user/singlemode';

const PORT = Number(process.env.PORT || 4000);
const HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';

const APP_MODE = process.env.MODE || 'single';

function serverInitializer(port: number, hostname: string, database: User) {
    const eventListener =
        async (request: IncomingMessage, response: ServerResponse) => {
            await singleMode(database, request, response);
        }
    const server = http.createServer(eventListener);
    try {
        server.listen(PORT, HOSTNAME, () => {
            console.log(`${APP_MODE === 'multi' ? cluster.isPrimary ? 'Primary' : 'Worker' : 'Server'} ${process.pid} starts on http://${HOSTNAME}:${PORT}`);
        })
    } catch {
        console.log('WOW server listener eror');
    }
}

function application() {
    const userDb = new User();

    if (APP_MODE === 'single') serverInitializer(PORT, HOSTNAME, userDb);

    if (APP_MODE === 'multi') {
        const coresCount = os.availableParallelism();
        // console.log(coresCount);
        if (cluster.isPrimary) {
            // create base for primary
            // then send response from worker to primary
            serverInitializer(PORT, HOSTNAME, userDb);

            console.log(`Primary ${process.pid} is running`);
            for (let i = 0; i < coresCount; i++) {
                cluster.fork({ PORT: PORT + i + 1 });
            }
            for (const id in cluster.workers) {
                cluster.workers[id]?.on('message', (data) => console.log(data));
            }
            cluster.on('exit', (worker, code, signal) => {
                console.log(`worker ${worker.process.pid} died`);
            });
        } else {
            serverInitializer(PORT, HOSTNAME, userDb);
            // console.log(`Worker ${process.pid} started on ${PORT}`);
        }
    }
}

application();

process.on('SIGINT', () => exit());
