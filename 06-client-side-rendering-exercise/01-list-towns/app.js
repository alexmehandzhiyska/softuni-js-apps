import { html, render } from './node_modules/lit-html/lit-html.js';

const inputEl = document.getElementById('towns');
const loadBtnEl = document.getElementById('btnLoadTowns');
const rootDivEl = document.getElementById('root');

loadBtnEl.addEventListener('click', showTowns);

function showTowns(e) {
    e.preventDefault();

    const towns = inputEl.value.split(', ');
    render(townsTemplate(towns), rootDivEl);
}

function townsTemplate(towns) {
    return html`
        <ul>
            ${towns.map(town => html`<li>${town}</li>`)}
        </ul>
    `;
}

