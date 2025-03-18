import { html, render } from 'lit-html';
import page from 'page';
import userService from '../api/userService.js';
import { getToken } from '../utils.js';

const mainEl = document.querySelector('main');

export default async function showHomePage() {
    const token = getToken();
    render(homeTemplate(token), mainEl);
}

function homeTemplate(token) {
    return html` 
        <section id="home">
            <article class="hero layout">
                <img src="./assets/team.png" class="left-col pad-med">
                <div class="pad-med tm-hero-col">
                    <h2>Welcome to Team Manager!</h2>
                    <p>Want to organize your peers? Create and manage a team for free.</p>
                    <p>Looking for a team to join? Browse our communities and find like-minded people!</p>
                    ${token ? html`<a href="/dashboard" class="action cta">Browse Teams</a>` : html`<a href="/register" class="action cta">Sign Up Now</a>`}
                </div>
            </article>
        </section>
    `;
}
