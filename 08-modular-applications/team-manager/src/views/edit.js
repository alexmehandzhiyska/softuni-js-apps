import { html, render } from 'lit-html';
import page from 'page';

import teamService from '../api/teamService.js';

const mainEl = document.querySelector('main');

export default async function showEditPage(ctx) {
    const teamId = ctx.params.id;
    const team = await teamService.getById(teamId);

    render(editTemplate(team), mainEl);
}

function editTemplate(team) {
    return html`
        <section id="edit">
            <article class="narrow">
                <header class="pad-med">
                    <h1>Edit Team</h1>
                </header>
                <form @submit=${e => editTeam(e, team._id)} id="edit-form" class="main-form pad-large">
                    <div class="error">Error message.</div>
                    <label>Team name: <input type="text" name="name" value=${team.name}></label>
                    <label>Logo URL: <input type="text" name="logoUrl" value=${team.logoUrl}></label>
                    <label>Description: <textarea name="description">${team.description}</textarea></label>
                    <input class="action cta" type="submit" value="Save Changes">
                </form>
            </article>
        </section>
    `;
}

async function editTeam(e, teamId) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const teamData = Object.fromEntries(formData);

    const result = await teamService.edit(teamId, teamData);
    console.log(result);
    page.redirect(`/details/${result._id}`);
}