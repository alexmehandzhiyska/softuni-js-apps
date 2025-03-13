import { html, render } from '../../node_modules/lit-html/lit-html.js';
import page from '../../node_modules/page/page.mjs';

import { showNavigation } from '../app.js';

import { baseUserUrl } from '../constants.js';

const mainEl = document.querySelector('main');

export default function showRegisterPage() {
    render(registerTemplate(), mainEl);
}

function registerTemplate() {
    return html`
        <div class="container">
            <div class="row space-top">
                <div class="col-md-12">
                    <h1>Register New User</h1>
                    <p>Please fill all fields.</p>
                </div>
            </div>
            <form @submit=${registerUser}>
                <div class="row space-top">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-control-label" for="email">Email</label>
                            <input class="form-control" id="email" type="text" name="email">
                        </div>
                        <div class="form-group">
                            <label class="form-control-label" for="password">Password</label>
                            <input class="form-control" id="password" type="password" name="password">
                        </div>
                        <div class="form-group">
                            <label class="form-control-label" for="rePass">Repeat</label>
                            <input class="form-control" id="rePass" type="password" name="rePass">
                        </div>
                        <input type="submit" class="btn btn-primary" value="Register" />
                    </div>
                </div>
            </form>
        </div>
    `;
}

async function registerUser(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const userData = Object.fromEntries(formData);

    if (userData.password !== userData.rePass) {
        alert('Passwords should match!');
        return;
    }

    try {
        const res = await fetch(`${baseUserUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await res.json();
        console.log(data);

        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('email', data.email);
        localStorage.setItem('userId', data._id);

        showNavigation();
        page.redirect('/');
    } catch (err) {
        alert(err.message);
    }
}