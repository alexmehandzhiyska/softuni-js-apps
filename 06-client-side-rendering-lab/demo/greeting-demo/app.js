import { html, render } from '../../node_modules/lit-html/lit-html.js';

const mainEl = document.querySelector('main');

const person = {
    name: 'Pen4o',
    age: 35
};

render(greetingTemplate(person), mainEl);

function greetingTemplate(person) {
    const isLogged = true;

    return html`
        <section>
            <h1>Hi, I am ${person.name}</h1>
            <p>I am ${person.age} years old</p>

            <form @submit=${registerUser}>
                <input type="email" name="email" placeholder="Email:" ?disabled=${isLogged}>
                <input type="submit" value="Register">
            </form>
        </section>
    `;
}

function registerUser(e) {
    e.preventDefault();
    console.log('successully registered');
}