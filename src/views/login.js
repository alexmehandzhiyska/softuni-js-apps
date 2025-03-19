import { html, render } from 'lit-html';
import page from 'page';
import usersService from '../api/usersService.js';

const mainEl = document.querySelector('main');

export default async function showLoginPage() {
    render(loginTemplate(), mainEl);
}

function loginTemplate() {
    return html`
        <section id="login">
          <div class="form">
            <h2>Login</h2>
            <form @submit=${loginUser} class="login-form">
              <input type="text" name="email" id="email" placeholder="email" />
              <input
                type="password"
                name="password"
                id="password"
                placeholder="password"
              />
              <button type="submit">login</button>
              <p class="message">
                Not registered? <a href="/register">Create an account</a>
              </p>
            </form>
          </div>
        </section>
    `;
}

async function loginUser(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const userData = Object.fromEntries(formData);

    if (!userData.email || !userData.password) {
        return alert('All fields are required!');
    }

    try {
        const result = await usersService.login(userData);
        console.log(result);
        page.redirect('/');
    } catch (err) {
        alert(err.message);
    }
}