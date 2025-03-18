import { html, render } from 'lit-html';
import page from 'page';

import teamService from '../api/teamService.js';
import memberService from '../api/memberService.js';
import { getToken } from '../utils.js';

const mainEl = document.querySelector('main');

export default async function showDashboardPage() {
    const teams = await teamService.getAll();
    const members = await memberService.getAll();

    teams.forEach(team => {
        team.memberCount = members.filter(m => m.teamId === team._id).length;
    });

    const token = getToken();

    render(dashboardTemplate(teams, token), mainEl);
}

function dashboardTemplate(teams, token) {
    return html`
        <section id="browse">
            <article class="pad-med">
                <h1>Team Browser</h1>
            </article>

            ${token ? html`
                <article class="layout narrow">
                    <div class="pad-small"><a href="/create" class="action cta">Create Team</a></div>
                </article>` : ''}
            
      
            ${teams.map(t => teamTemplate(t))}
        </section>
    `;
}

function teamTemplate(team) {
    return html`
        <article class="layout">
            <img src=${team.logoUrl} class="team-logo left-col">
            <div class="tm-preview">
                <h2>${team.name}</h2>
                <p>${team.description}</p>
                <span class="details">${team.memberCount} Members</span>
                <div><a href="/details/${team._id}" class="action">See details</a></div>
            </div>
        </article>

    `;
}