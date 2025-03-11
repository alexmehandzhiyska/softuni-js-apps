import { html, render } from './node_modules/lit-html/lit-html.js';

import { cats } from './catSeeder.js';
console.log(cats);

const allCatsSectionEl = document.getElementById('allCats');

function showCats() {
    render(catsTemplate(), allCatsSectionEl);
}

showCats();

function catsTemplate() {
    return html`
        <ul>
            ${cats.map(cat => singleCatTemplate(cat))}
        </ul>
    `;
}

function singleCatTemplate(cat) {
    return html`
         <li>
            <img src="./images/${cat.imageLocation}.jpg" width="250" height="250" alt="Card image cap">
            <div class="info">
                <button class="showBtn" @click=${(e) => changeInfoVisibility(e, cat)}>Show status code</button>
                <div class="status" style="display: none" id=${cat.id}>
                    <h4>Status Code: ${cat.statusCode}</h4>
                    <p>${cat.statusMessage}</p>
                </div>
            </div>
        </li>
    `;
}

function changeInfoVisibility(e, cat) {
    const statusDivEl = document.getElementById(cat.id);

    if (statusDivEl.style.display === 'none') {
        statusDivEl.style.display = 'block';
        e.target.textContent = 'Hide status code';
    } else {
        statusDivEl.style.display = 'none';
        e.target.textContent = 'Show status code';
    }

}