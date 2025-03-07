import { html, render } from '../../../node_modules/lit-html/lit-html.js';

const baseUrl = `http://localhost:3030/data/recipes`;

const mainEl = document.querySelector('main');

export default function createPage() {
    render(createTemplate(), mainEl);
}

function createTemplate() {
    return html`
        <section class="view-section" id="create-section">
            <article>
                <h2>New Recipe</h2>
                <form @submit=${createRecipe}>
                    <label
                        >Name: <input type="text" name="name" placeholder="Recipe name"
                    /></label>
                    <label
                        >Image: <input type="text" name="img" placeholder="Image URL"
                    /></label>
                    <label class="ml"
                        >Ingredients:
                        <textarea
                        name="ingredients"
                        placeholder="Enter ingredients on separate lines"
                        ></textarea>
                    </label>
                    <label class="ml"
                        >Preparation:
                        <textarea
                        name="steps"
                        placeholder="Enter preparation steps on separate lines"
                        ></textarea>
                    </label>
                    <input type="submit" value="Create Recipe" />
                </form>
            </article>
        </section>
    `;
}

function createRecipe(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    data.ingredients = data.ingredients.split("\n");
    data.steps = data.steps.split("\n");

    const accessToken = localStorage.getItem("accessToken");

    fetch(baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Authorization": accessToken,
        },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            location.href = "/cook-book/index.html";
        })
        .catch((err) => console.error(err.message));
};