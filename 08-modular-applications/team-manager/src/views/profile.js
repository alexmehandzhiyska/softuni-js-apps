import { html, render } from 'lit-html';
import page from 'page';

const mainEl = document.querySelector('main');

export default async function showProfilePage() {
    render(profileTemplate(), mainEl);
}

function profileTemplate() {
    return html`
        <section id="my-teams">
            <article class="pad-med">
                <h1>My Teams</h1>
            </article>

            <article class="layout narrow">
                <div class="pad-med">
                    <p>You are not a member of any team yet.</p>
                    <p><a href="#">Browse all teams</a> to join one, or use the button bellow to cerate your own
                        team.</p>
                </div>
                <div class=""><a href="#" class="action cta">Create Team</a></div>
            </article>

            <article class="layout">
                <img src="./assets/rocket.png" class="team-logo left-col">
                <div class="tm-preview">
                    <h2>Team Rocket</h2>
                    <p>Gotta catch 'em all!</p>
                    <span class="details">3 Members</span>
                    <div><a href="#" class="action">See details</a></div>
                </div>
            </article>
        </section>
    `;
}