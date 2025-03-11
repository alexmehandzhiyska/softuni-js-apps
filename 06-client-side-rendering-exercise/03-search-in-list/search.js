import { html, render } from './node_modules/lit-html/lit-html.js';

import { towns } from './towns.js';
console.log(towns);

const townsDivEl = document.getElementById('towns');
const searchInputEl = document.getElementById('searchText');
const searchBtnEl = document.getElementById('searchBtn');
const resultDivEl = document.getElementById('result');

searchBtnEl.addEventListener('click', search);

function showTowns() {
    render(townsTemplate(), townsDivEl);
}

showTowns();

function townsTemplate() {
    return html`
        <ul>
            ${towns.map(town => html`<li>${town}</li>`)}
        </ul>
    `;
}

function search() {
    const searchedValue = searchInputEl.value;
    console.log(searchedValue);

    const allLiEls = Array.from(document.querySelectorAll('li'));
    let matchCount = 0;

    allLiEls.forEach(liEl => {
        if (liEl.textContent.includes(searchedValue)) {
            liEl.className = 'active';
            matchCount++;
        } else {
            liEl.className = '';
        }
    });

    resultDivEl.textContent = `${matchCount} matches found`;
}
