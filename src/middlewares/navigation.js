import { html, render } from 'lit-html';
import page from 'page';
import { getToken } from '../utils.js';
import usersService from '../api/usersService.js';

const headerEl = document.querySelector('header');

export default function showNavigation(ctx, next) {
    const token = getToken();
    render(navigationTemplate(token), headerEl);
    next();
}

function navigationTemplate(token) {
    return html`
         <a id="logo" href="/"
          ><img id="logo-img" src="./images/show_logo.png" alt="logo" />
        </a>
        <nav>
          <div>
            <a href="/dashboard">TV Shows</a>
            <a href="/search">Search</a>
          </div>

          ${token ? html`
            <div class="user">
                <a href="/create">Add Show</a>
                <a @click=${logoutUser}>Logout</a>
            </div>
          ` : html`
            <div class="guest">
                <a href="/login">Login</a>
                <a href="/register">Register</a>
            </div>
          `}
        </nav>
    `;
}

async function logoutUser() {
    try {
        await usersService.logout();
        page.redirect('/');
    } catch (err) {
        alert(err.message);
    }
}