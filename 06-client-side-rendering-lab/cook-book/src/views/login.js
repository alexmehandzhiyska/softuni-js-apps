import { html, render } from '../../../node_modules/lit-html/lit-html.js';

const baseUrl = `http://localhost:3030/users`;

const mainEl = document.querySelector('main');

export default function loginPage() {
    render(loginTemplate(), mainEl);
}

function loginTemplate() {
    return html`
        <section class="view-section" id="login-section">
            <article>
                <h2>Login</h2>
                <form @submit=${loginUser}>
                    <label>E-mail: <input type="text" name="email" /></label>
                    <label>Password: <input type="password" name="password" /></label>
                    <input type="submit" value="Login" />
                </form>
            </article>
        </section>
    `;
}

function loginUser(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const { email, password } = Object.fromEntries(formData);

    fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.code >= 400) {
                return alert(data.message);
            }

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("email", data.email);
            localStorage.setItem("_id", data._id);

            location.href = "/cook-book/index.html";
        })
        .catch((err) => console.error(err.message));
};