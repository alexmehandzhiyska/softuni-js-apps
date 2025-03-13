import { html, render } from '../../node_modules/lit-html/lit-html.js';
import page from '../../node_modules/page/page.mjs';
import { baseFurnitureUrl } from '../constants.js';
import { getToken, getUserId } from '../utils.js';

const mainEl = document.querySelector('main');

export default async function showDetailsPage(ctx) {
    const furnitureId = ctx.params.id;
    const furnitureItem = await getDetails(furnitureId);

    const userId = getUserId();
    const isOwner = userId === furnitureItem._ownerId;
    render(detailsTemplate(furnitureItem, isOwner), mainEl);
}

async function getDetails(furnitureId) {
    try {
        const res = await fetch(`${baseFurnitureUrl}/${furnitureId}`);
        const data = await res.json();
        return data;
    } catch (err) {
        alert(err.message);
    }
}

function detailsTemplate(furnitureItem, isOwner) {
    return html`
        <div class="container">
            <div class="row space-top">
                <div class="col-md-12">
                    <h1>Furniture Details</h1>
                </div>
            </div>
            <div class="row space-top">
                <div class="col-md-4">
                    <div class="card text-white bg-primary">
                        <div class="card-body">
                            <img src=${furnitureItem.img} />
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <p>Make: <span>${furnitureItem.make}</span></p>
                    <p>Model: <span>${furnitureItem.model}</span></p>
                    <p>Year: <span>${furnitureItem.year}</span></p>
                    <p>Description: <span>${furnitureItem.description}</span></p>
                    <p>Price: <span>${furnitureItem.price}</span></p>
                    <p>Material: <span>${furnitureItem.material}</span></p>
                    ${isOwner ? html`
                        <div>
                            <a href="/edit/${furnitureItem._id}" class="btn btn-info">Edit</a>
                            <a class="btn btn-red" id=${furnitureItem._id} @click=${deleteFurniture}>Delete</a>
                        </div>
                    ` : ''}
                   
                </div>
            </div>
        </div>
    `;
}

async function deleteFurniture(e) {
    const furnitureId = e.target.id;

    const confirmDelete = confirm('Are you sure you would like to delete this item?');

    if (confirmDelete) {
        try {
            await fetch(`${baseFurnitureUrl}/${furnitureId}`, {
                method: 'DELETE',
                headers: {
                    'X-Authorization': getToken()
                }
            });

            page.redirect('/');
        } catch (err) {
            alert(err.message);
        }
    }
}