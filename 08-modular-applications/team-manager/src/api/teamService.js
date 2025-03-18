import { get, post, put } from './requester.js';
import { baseTeamsUrl } from '../constants.js';

async function getAll() {
    return await get(baseTeamsUrl);
}

async function getById(teamId) {
    const result = await get(`${baseTeamsUrl}/${teamId}`);
    return result;
}

async function create(teamData) {
    const result = await post(baseTeamsUrl, teamData);
    return result;
}

async function edit(teamId, teamData) {
    const result = await put(`${baseTeamsUrl}/${teamId}`, teamData);
    return result;
}

const teamService = { getAll, getById, create, edit };
export default teamService;