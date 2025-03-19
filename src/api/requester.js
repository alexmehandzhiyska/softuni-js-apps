import { getToken } from '../utils.js';

async function request(method, url, data) {
    const options = {
        method,
        headers: {}
    };

    const token = getToken();

    if (token) {
        options.headers['X-Authorization'] = token;
    }

    if (data) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        if (response.status === 204) {
            return response;
        }

        const result = await response.json();
        return result;

    } catch (err) {
        throw err;
    }
}

export const post = (url, data) => request('POST', url, data);
export const get = (url) => request('GET', url);
export const put = (url, data) => request('PUT', url, data);
export const del = (url) => request('DELETE', url);