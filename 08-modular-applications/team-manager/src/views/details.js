import { html, render } from 'lit-html';
import page from 'page';
import memberService from '../api/memberService.js';
import teamService from '../api/teamService.js';
import { getUserId } from '../utils.js';
import showModal from '../modal.js';

const mainEl = document.querySelector('main');

export default async function showDetailsPage(ctx) {
    const teamId = ctx.params.id;
    const team = await teamService.getById(teamId);
    const memberships = await memberService.getMemberships(teamId);

    const approvedMembers = memberships.filter(m => m.status === 'member');
    const pendingMembers = memberships.filter(m => m.status === 'pending');

    team.memberCount = approvedMembers.length;

    const userAuthorship = determineAuthorship(team, memberships, approvedMembers, pendingMembers);

    render(detailsTemplate(team, approvedMembers, pendingMembers, userAuthorship), mainEl);
}

function determineAuthorship(team, memberships, approvedMembers, pendingMembers) {
    const userId = getUserId();
    const isLogged = userId ? true : false;
    const isOwner = userId === team._ownerId;
    const ownMembership = memberships.find(m => m._ownerId === userId);

    const isPending = pendingMembers.find(m => m._ownerId === userId) ? true : false;
    const isMember = approvedMembers.find(m => m._ownerId === userId) ? true : false;
    return { isLogged, isOwner, isPending, isMember, ownMembership };
}

function detailsTemplate(team, approvedMembers, pendingMembers, userAuthorship) {
    return html`
        <section id="team-home">
            <article class="layout">
                <img src=${team.logoUrl} class="team-logo left-col">
                <div class="tm-preview">
                    <h2>${team.name}</h2>
                    <p>${team.description}</p>
                    <span class="details">${team.memberCount} Members</span>
                    <div>
                        ${buttonsTemplate(team, userAuthorship)}
                    </div>
                </div>
                <div class="pad-large">
                    <h3>Members</h3>
                    <ul class="tm-members">
                        <li>My Username</li>
                        ${approvedMembers.map(m => approvedMemberTemplate(m, team._id, userAuthorship.isOwner))}
                    </ul>
                </div>
                <div class="pad-large">
                    <h3>Membership Requests</h3>
                    <ul class="tm-members">
                       ${pendingMembers.map(m => pendingMemberTemplate(m, team._id, userAuthorship.isOwner))}
                    </ul>
                </div>
            </article>
        </section>
    `;
}

function approvedMemberTemplate(member, teamId, isOwner) {
    return html`
        <li>${member.user.username}
            ${isOwner ? html`<a @click=${() => removeMembership(member._id, teamId)} class="tm-control action">Remove from team</a>` : ''}
        </li>
    `;
}

function pendingMemberTemplate(member, teamId, isOwner) {
    return html`
         <li>${member.user.username}
            ${isOwner ? html`
                <a @click=${() => approveMembership(member, teamId)} class="tm-control action">Approve</a>
                <a @click=${() => removeMembership(member._id, teamId)} class="tm-control action">Decline</a>
            ` : ''}
        </li>
    `;
}

function buttonsTemplate(team, userAuthorship) {
    if (userAuthorship.isOwner) {
        return html`<a href="/edit/${team._id}" class="action">Edit team</a>`;
    }

    if (userAuthorship.isMember) {
        return html`<a @click=${() => removeMembership(userAuthorship.ownMembership._id, team._id)} class="action invert">Leave team</a>`;
    }

    if (userAuthorship.isPending) {
        return html`Membership pending. <a @click=${() => removeMembership(userAuthorship.ownMembership._id, team._id)}>Cancel request</a>`
    }

    return html`<a @click=${() => requestMembership(team._id)} class="action">Join team</a>`;
}

async function requestMembership(teamId) {
    const result = await memberService.requestMembership(teamId);
    console.log(result);
    page.redirect(`/details/${teamId}`);
}

async function approveMembership(membership, teamId) {
    const result = await memberService.approveMembership(membership);
    console.log(result);
    page.redirect(`/details/${teamId}`);
}

async function removeMembership(membershipId, teamId) {
    showModal('Are you sure you want to remove this membership?', async () => {
        await memberService.deleteMembership(membershipId);
        page.redirect(`/details/${teamId}`);
    }, () => console.log('Deletion canceled'));
}