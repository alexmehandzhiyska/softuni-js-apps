import { html, render } from 'lit-html';

const mainEl = document.querySelector('main');

export default async function showHomePage() {
    render(homeTemplate(), mainEl);
}

function homeTemplate() {
    return html`
        <section id="home">
          <img id="home-img" src="./images/show_logo.png" alt="home-img" />
          <h1>
            Welcome to ShowShare, the ultimate platform for TV enthusiasts!
            Discover, discuss, and share your favorite TV shows with a community
            that loves great content just as much as you do. Find hidden gems.
            Your next binge-worthy series is just a click away!
          </h1>
        </section>
    `;
}