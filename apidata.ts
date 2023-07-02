export const API_LINK = '/api/users';
export const API_LINK_ID = '/api/users/';

export enum API_METHODS {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}

export enum API_ERROR_CODES {
    E_400 = `Incorrect user data`,
    E_404 = 'Invalid ID',
}