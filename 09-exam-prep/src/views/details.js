import { html, render } from 'lit-html';
import page from 'page';
import showsService from '../api/showsService.js';
import { checkIsOwner } from '../utils.js';

const mainEl = document.querySelector('main');

export default async function showDetailsPage(ctx) {
    const showId = ctx.params.id;
    const show = await showsService.getById(showId);
    console.log(show);

    const isOwner = checkIsOwner(show);
    render(detailsTemplate(show, isOwner), mainEl);
}

function detailsTemplate(show, isOwner) {
    return html`
        <section id="details">
          <div id="details-wrapper">
            <img id="details-img" src=${show.imageUrl} alt="example1" />
            <div id="details-text">
              <p id="details-title">${show.title}</p>
              <div id="info-wrapper">
                <div id="description">
                  <p id="details-description">
                    ${show.details}
                  </p>
                </div>
              </div>

              ${isOwner ? html`
                <div id="action-buttons">
                    <a href="/edit/${show._id}" id="edit-btn">Edit</a>
                    <a @click=${() => deleteShow(show._id)} id="delete-btn">Delete</a>
                </div>
              ` : ''}
              
            </div>
          </div>
        </section>
    `;
}

async function deleteShow(showId) {
    const confirmDelete = confirm('Are you sure you want to delete this show?');

    if (confirmDelete) {
        try {
            await showsService.deleteById(showId);
            page.redirect('/dashboard');
        } catch (err) {
            alert(err.message);
        }
    }
}