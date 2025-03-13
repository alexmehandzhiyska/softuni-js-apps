import { html, render } from '../../node_modules/lit-html/lit-html.js';
import page from '../../node_modules/page/page.mjs';
import { baseFurnitureUrl } from '../constants.js';
import { getUserId } from '../utils.js';

const mainEl = document.querySelector('main');

export default async function showProfilePage() {
    const userId = getUserId();

    const ownFurnitures = await getUserFurnitures(userId);
    render(profileTemplate(ownFurnitures), mainEl);
}

async function getUserFurnitures(userId) {
    try {
        const res = await fetch(`${baseFurnitureUrl}?where=_ownerId%3D%22${userId}%22`);
        const data = await res.json();
        return data;
    } catch (err) {
        alert(err.message);
    }
}

function profileTemplate(ownFurnitures) {
    return html`
        <div class="container">
            <div class="row space-top">
                <div class="col-md-12">
                    <h1>My Furniture</h1>
                    <p>This is a list of your publications.</p>
                </div>
            </div>
            <div class="row space-top">
                ${ownFurnitures.map(furniture => furnitureItemTemplate(furniture))}
            </div>
        </div>
    `;
}

function furnitureItemTemplate(furniture) {
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