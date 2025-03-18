import { html, render } from 'lit-html';
import page from 'page';
import teamService from '../api/teamService.js';

const mainEl = document.querySelector('main');

export default async function showCreatePage() {
    render(createTemplate(), mainEl);
}

function createTemplate() {
    return html`
        <section id="create">
            <article class="narrow">
                <header class="pad-med">
                    <h1>New Team</h1>
                </header>
                <form @submit=${createTeam} id="create-form" class="main-form pad-large">
                    <div class="error">Error message.</div>
                    <label>Team name: <input type="text" name="name"></label>
                    <label>Logo URL: <input type="text" name="logoUrl"></label>
                    <label>Description: <textarea name="description"></textarea></label>
                    <input class="action cta" type="submit" value="Create Team">
                </form>
            </article>
        </section>
    `;
}

async function createTeam(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const teamData = Object.fromEntries(formData);

    const result = await teamService.create(teamData);
    console.log(result);
    page.redirect(`/details/${result._id}`);
}