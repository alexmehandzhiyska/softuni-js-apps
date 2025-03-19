import { html, render } from 'lit-html';
import page from 'page';
import showsService from '../api/showsService.js';

const mainEl = document.querySelector('main');

export default async function showSearchPage(ctx, next, matches = null) {
    render(searchTemplate(matches), mainEl);
}

function searchTemplate(matches) {
    return html`
        <section id="search">
            <div class="form">
                <h2>Search</h2>
                <form @submit=${searchShows} class="search-form">
                    <input
                    type="text"
                    name="search"
                    id="search-input"
                    />
                    <button class="button-list">Search</button>
                </form>
            </div>
            
            ${resultTemplate(matches)}
        </section>
    `;
}

function resultTemplate(matches) {
    if (matches === null) {
        return '';
    }

    if (matches.length === 0) {
        return html`<p class="no-result">There is no TV show with this title</p>`;
    }


    return html`
            <h4>Results:</h4>
            <div class="search-result">
                ${matches.map(m => showTemplate(m))}
            </div>
        `;

}

function showTemplate(show) {
    return html`
        <div class="show">
            <img src=${show.imageUrl} alt="example1" />
            <div class="show">
                <h3 class="title">${show.title}</h3>
                <p class="genre">Genre: ${show.genre}</p>
                <p class="country-of-origin">Country of Origin: ${show.country}</p>
                <a class="details-btn" href="/details/${show._id}">Details</a>
            </div>
        </div>
    `;
}

async function searchShows(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const titleSearched = formData.get('search');
    console.log(titleSearched);

    try {
        const result = await showsService.getByTitle(titleSearched);
        console.log(result);
        showSearchPage(null, null, result);
    } catch (err) {
        alert(err.message);
    }
}

