import { html, render } from '../../node_modules/lit-html/lit-html.js';
import page from '../../node_modules/page/page.mjs';
import { baseFurnitureUrl } from '../constants.js';
import { getToken } from '../utils.js';

const mainEl = document.querySelector('main');

export default async function showEditPage(ctx) {
    const furnitureId = ctx.params.id;
    const furniture = await getDetails(furnitureId);
    console.log(furniture);
    render(editTemplate(furniture), mainEl);
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

function editTemplate(furniture) {
    return html`
        <div class="container">
            <div class="row space-top">
                <div class="col-md-12">
                    <h1>Edit Furniture</h1>
                    <p>Please fill all fields.</p>
                </div>
            </div>
            <form @submit=${(e) => editFurniture(e, furniture)}>
                <div class="row space-top">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-control-label" for="new-make">Make</label>
                            <input class="form-control" id="new-make" type="text" name="make" value=${furniture.make}>
                        </div>
                        <div class="form-group has-success">
                            <label class="form-control-label" for="new-model">Model</label>
                            <input class="form-control is-valid" id="new-model" type="text" name="model" value=${furniture.model}>
                        </div>
                        <div class="form-group has-danger">
                            <label class="form-control-label" for="new-year">Year</label>
                            <input class="form-control is-invalid" id="new-year" type="number" name="year" value=${furniture.year}>
                        </div>
                        <div class="form-group">
                            <label class="form-control-label" for="new-description">Description</label>
                            <input class="form-control" id="new-description" type="text" name="description" value=${furniture.description}>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-control-label" for="new-price">Price</label>
                            <input class="form-control" id="new-price" type="number" name="price" value=${furniture.price}>
                        </div>
                        <div class="form-group">
                            <label class="form-control-label" for="new-image">Image</label>
                            <input class="form-control" id="new-image" type="text" name="img" value=${furniture.img}>
                        </div>
                        <div class="form-group">
                            <label class="form-control-label" for="new-material">Material (optional)</label>
                            <input class="form-control" id="new-material" type="text" name="material" value=${furniture.material}>
                        </div>
                        <input type="submit" class="btn btn-info" value="Edit" />
                    </div>
                </div>
            </form>
        </div>
    `;
}

async function editFurniture(e, furniture) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const furnitureData = Object.fromEntries(formData);
    console.log(furnitureData);

    const areEmptyValues = Object.values(furnitureData).some(val => val === '');

    if (areEmptyValues) {
        alert('Invalid data!');
        return;
    }

    try {
        const res = await fetch(`${baseFurnitureUrl}/${furniture._id}`, {
            method: 'PUT',
            headers: {
                'X-Authorization': getToken(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(furnitureData)
        });

        const data = await res.json();
        console.log(data);

        page.redirect(`/details/${furniture._id}`);
    } catch (err) {
        alert(err.message);
    }
}