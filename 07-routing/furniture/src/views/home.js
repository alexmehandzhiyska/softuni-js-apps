import { html, render } from '../../node_modules/lit-html/lit-html.js';
import page from '../../node_modules/page/page.mjs';
import { baseFurnitureUrl } from '../constants.js';

const mainEl = document.querySelector('main');

export default async function showHomePage() {
    const furnitures = await getFurnitures();
    render(homeTemplate(furnitures), mainEl);
}

async function getFurnitures() {
    try {
        const res = await fetch(baseFurnitureUrl);
        const data = await res.json();
        return data;
    } catch (err) {
        alert(err.message);
    }
}

function homeTemplate(furnitures) {
    return html`
        <div class="container">
            <div class="row space-top">
                <div class="col-md-12">
                    <h1>Welcome to Furniture System</h1>
                    <p>Select furniture from the catalog to view details.</p>
                </div>
            </div>
            <div class="row space-top">
                ${furnitures.map(furniture => singleFurnitureTemplate(furniture))}
            </div>
        </div>
    `;
}

function singleFurnitureTemplate(furniture) {
    return html`
        <div class="col-md-4">
            <div class="card text-white bg-primary">
                <div class="card-body">
                        <img src=${furniture.img} />
                        <p>${furniture.description}</p>
                        <footer>
                            <p>Price: <span>${furniture.price} $</span></p>
                        </footer>
                        <div>
                            <a href="/details/${furniture._id}" class="btn btn-info">Details</a>
                        </div>
                </div>
            </div>
        </div>
    `;
}