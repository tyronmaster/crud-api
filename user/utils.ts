import { IncomingMessage } from "http";
import { validate } from "uuid";
import { API_LINK, API_LINK_ID } from "../apidata";
import IUser from "./user-inreface";

export async function requestBodyExtractor(request: IncomingMessage): Promise<IUser> {
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
        }).on('error', () => { reject() });
    });
}

export function urlValidator(url: string) {
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