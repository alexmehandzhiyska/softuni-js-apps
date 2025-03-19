import { html, render } from 'lit-html';
import page from 'page';

import showsService from '../api/showsService.js';

const mainEl = document.querySelector('main');

export default async function showEditPage(ctx) {
    const showId = ctx.params.id;
    const show = await showsService.getById(showId);
    render(editTemplate(show), mainEl);
}

function editTemplate(show) {
    return html`
        <section id="edit">
          <div class="form">
            <h2>Edit Show</h2>
            <form @submit=${(e) => editShow(e, show._id)} class="edit-form">
              <input
                type="text"
                name="title"
                id="title"
                placeholder="TV Show title"
                value=${show.title}
              />
              <input
                type="text"
                name="image-url"
                id="image-url"
                placeholder="Image URL"
                value=${show.imageUrl}
              />
              <input
              type="text"
              name="genre"
              id="genre"
              placeholder="Genre"
              value=${show.genre}
            />
            <input
            type="text"
            name="country"
            id="country"
            placeholder="Country"
            value=${show.country}
          />
              <textarea
                id="details"
                name="details"
                placeholder="Details"
                rows="2"
                cols="10"
              >${show.details}</textarea>
              <button type="submit">Edit Show</button>
            </form>
          </div>
        </section>
    `;
}

async function editShow(e, showId) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const showData = Object.fromEntries(formData);

    if (Object.values(showData).some(val => val === '')) {
        return alert('All fields are required!');
    }

    try {
        const result = await showsService.update(showId, showData);
        console.log(result);
        page.redirect(`/details/${showId}`);
    } catch (err) {
        alert(err.message);
    }
}