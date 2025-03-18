import { html, render } from 'lit-html';
import page from 'page';

import userService from '../api/userService.js';
import { showNavigation } from '../app.js';

const mainEl = document.querySelector('main');

export default async function showLoginPage() {
    render(loginTemplate(), mainEl);
}

function loginTemplate() {
    return html`
        <section id="login">
            <article class="narrow">
                <header class="pad-med">
                    <h1>Login</h1>
                </header>
                <form @submit=${loginUser} id="login-form" class="main-form pad-large">
                    <div class="error">Error message.</div>
                    <label>E-mail: <input type="text" name="email"></label>
                    <label>Password: <input type="password" name="password"></label>
                    <input class="action cta" type="submit" value="Sign In">
                </form>
                <footer class="pad-small">Don't have an account? <a href="#" class="invert">Sign up here</a>
                </footer>
            </article>
        </section>
    `;
}

async function loginUser(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const userData = Object.fromEntries(formData);

    const result = await userService.login(userData);
    console.log(result);

    showNavigation();
    page.redirect('/');
}