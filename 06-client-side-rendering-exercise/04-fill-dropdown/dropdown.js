import { html, render } from './node_modules/lit-html/lit-html.js';

const menuSelectEl = document.getElementById('menu');
const textInputEl = document.getElementById('itemText');
const submitBtnEl = document.getElementById('submitBtn');

submitBtnEl.addEventListener('click', addItem);

async function showOptions() {
    const options = await getOptions();
    console.log(options);

    render(optionsTemplate(options), menuSelectEl);
}

showOptions();

function optionsTemplate(options) {
    return html`
        ${options.map(option => html`<option value=${option._id}>${option.text}</option>`)}
    `;
}

async function getOptions() {
    try {
        const res = await fetch('http://localhost:3030/jsonstore/advanced/dropdown');
        const data = await res.json();
        return Object.values(data);
    } catch (err) {
        alert(err.message);
    }
}

async function addItem(e) {
    e.preventDefault();

    const text = textInputEl.value;

    try {
        const res = await fetch('http://localhost:3030/jsonstore/advanced/dropdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        const data = await res.json();
        console.log(data);
        await showOptions();
    } catch (err) {
        alert(err.message);
    }
}