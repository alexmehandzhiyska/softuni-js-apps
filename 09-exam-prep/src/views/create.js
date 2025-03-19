import { html, render } from 'lit-html';
import page from 'page';

import showsService from '../api/showsService.js';

const mainEl = document.querySelector('main');

export default async function showCreatePage() {
    render(createTemplate(), mainEl);
}

function createTemplate() {
    return html`
        <section id="create">
          <div class="form">
            <h2>Add Show</h2>
            <form @submit=${createShow} class="create-form">
              <input
              type="text"
              name="title"
              id="title"
              placeholder="TV Show title"
            />
            <input
              type="text"
              name="image-url"
              id="image-url"
              placeholder="Image URL"
            />
            <input
            type="text"
            name="genre"
            id="genre"
            placeholder="Genre"
          />
          <input
          type="text"
          name="country"
          id="country"
          placeholder="Country"
        />
            <textarea
              id="details"
              name="details"
              placeholder="Details"
              rows="2"
              cols="10"
            ></textarea>
              <button type="submit">Add Show</button>
            </form>
          </div>
        </section>
    `;
}

async function createShow(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const showData = Object.fromEntries(formData);

    if (Object.values(showData).some(val => val === '')) {
        return alert('All fields are required!');
    }

    try {
        const result = await showsService.create(showData);
        console.log(result);
        page.redirect('/dashboard');
    } catch (err) {
        alert(err.message);
    }
}