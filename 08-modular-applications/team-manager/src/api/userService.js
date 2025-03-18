import { baseUserUrl } from '../constants.js';
import { removeUserData, setUserData } from '../utils.js';
import { get, post } from './requester.js';

async function register(userData) {
    const result = await post(`${baseUserUrl}/register`, userData);
    setUserData(result);
    return result;
}

async function login(userData) {
    const result = await post(`${baseUserUrl}/login`, userData);
    setUserData(result);
    return result;
}

async function logout() {
    await get(`${baseUserUrl}/logout`);
    removeUserData();
}

const userService = { register, login, logout };
export default userService;