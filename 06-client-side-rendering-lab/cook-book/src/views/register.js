import { html, render } from '../../../node_modules/lit-html/lit-html.js';

const baseUrl = `http://localhost:3030/users`;

const mainEl = document.querySelector('main');

export default function registerPage() {
    render(registerTemplate(), mainEl);
}

function registerTemplate() {
    return html`
        <section class="view-section" id="register-section">
            <article>
                <h2>Register</h2>
                <form @submit=${registerUser}>
                    <label>E-mail: <input type="text" name="email" /></label>
                    <label>Password: <input type="password" name="password" /></label>
                    <label>Repeat: <input type="password" name="rePass" /></label>
                    <input type="submit" value="Register" />
                </form>
            </article>
        </section>
    `;
}

function registerUser(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    fetch(`${baseUrl}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password"),
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("email", data.email);
            localStorage.setItem("_id", data._id);

            location.href = "/cook-book/index.html";
        })
        .catch((err) => console.error(err.message));
};
