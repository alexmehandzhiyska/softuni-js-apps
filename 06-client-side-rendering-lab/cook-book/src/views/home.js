import { html, render } from '../../../node_modules/lit-html/lit-html.js';

const baseUrl = "http://localhost:3030/data/recipes";

const mainEl = document.querySelector('main');

export default async function homePage() {
    const recipes = await getRecipes();
    render(allRecipesTemplate(recipes), mainEl);
}

async function getRecipes() {
    const res = await fetch(baseUrl);
    const data = await res.json();

    return data;
}

function allRecipesTemplate(recipes) {
    return html`
        ${recipes.map(recipe => singleRecipeTemplate(recipe))}
    `
}

function singleRecipeTemplate(recipe) {
    return html`
        <article class="preview" @click=${() => showDetails(recipe)}>
            <div class="title">
                <h2>${recipe.name}</h2>
            </div>

            <div class="small">
                <img src=${recipe.img} alt="Recipe image">
            </div>
        </article>
    `;
}

function showDetails(recipe) {
    const userId = localStorage.getItem('_id');
    const isOwner = recipe._ownerId === userId;
    render(detailsTemplate(recipe, isOwner), mainEl);
}

function detailsTemplate(recipe, isOwner) {
    return html`
        <article>
            <h2>${recipe.name}</h2>
            <div class="band">
                <div class="thumb">
                    <img src="${recipe.img}">
                </div>
                <div class="ingredients">
                    <h3>Ingredients:</h3>
                    <ul>
                        ${recipe.ingredients.map((i) => html`<li>${i}</li>`)}
                    </ul>
                </div>
            </div>
            <div class="description">
                <h3>Preparation:</h3>
                ${recipe.steps.map((step) => html`<p>${step}</p>`)}
            </div>

            ${isOwner ? html`<div><button>Edit</button><button>Delete</button></div>` : ""}
        </article>
    `;
}