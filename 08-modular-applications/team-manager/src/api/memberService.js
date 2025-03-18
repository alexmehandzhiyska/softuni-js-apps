import { get, post, put, del } from './requester.js';
import { baseMembersUrl } from '../constants.js';

async function getAll() {
    const result = await get(`${baseMembersUrl}?where=status%3D%22member%22`);
    return result;
}

async function getMemberships(teamId) {
    const result = await get(`${baseMembersUrl}/?where=teamId%3D%22${teamId}%22&load=user%3D_ownerId%3Ausers`);
    return result;
}

async function requestMembership(teamId) {
    const result = await post(baseMembersUrl, { teamId });
    return result;
}

async function approveMembership(membership) {
    membership.status = 'member';
    const result = await put(`${baseMembersUrl}/${membership._id}`, membership);
    return result;
}

async function deleteMembership(membershipId) {
    await del(`${baseMembersUrl}/${membershipId}`);
}

const memberService = { getAll, getMemberships, requestMembership, approveMembership, deleteMembership };
export default memberService;