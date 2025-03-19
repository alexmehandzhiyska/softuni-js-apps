import { html, render } from 'lit-html';
import page from 'page';
import showsService from '../api/showsService.js';

const mainEl = document.querySelector('main');

export default async function showDashboardPage() {
    const shows = await showsService.getAll();
    console.log(shows);
    render(dashboardTemplate(shows), mainEl);
}

function dashboardTemplate(shows) {
    return html`
        <h2>Users Recommendations</h2>

        ${shows.length > 0 ? html`
            <section id="shows">
                ${shows.map(s => showTemplate(s))}         
            </section>
        ` : html`<h2 id="no-show">No shows Added.</h2>`}
    `;
}

function showTemplate(show) {
    return html`
        <div class="show">
            <img src=${show.imageUrl} alt="example1" />
            <div class="show-info">
              <h3 class="title">${show.title}</h3>
              <p class="genre">Genre: ${show.genre}</p>
              <p class="country-of-origin">Country of Origin: ${show.country}</p>
              <a class="details-btn" href="/details/${show._id}">Details</a>
            </div>
        </div>   
    `;
}