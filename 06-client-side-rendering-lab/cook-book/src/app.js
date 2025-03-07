import { renderNavigation } from "./utils/navigation.js";
import createPage from "./views/create.js";
import homePage from "./views/home.js";
import loginPage from "./views/login.js";
import logoutPage from "./views/logout.js";
import registerPage from "./views/register.js";

const pathnameViews = {
    "/": homePage,
    "/login": loginPage,
    "/register": registerPage,
    "/create": createPage,
    "/logout": logoutPage,
};

function initNavigation() {
    // Initially start with home page
    pathnameViews["/"]();

    const navElement = document.querySelector("header nav");

    navElement.addEventListener("click", (e) => {
        if (e.target.tagName !== "A") {
            return;
        }

        // prevet anchor's default behaviour
        e.preventDefault();

        // get url pathname
        const url = new URL(e.target.href);
        const { pathname } = url;

        // hide all sections
        // document
        //   .querySelectorAll(".view-section")
        //   .forEach((section) => (section.style.display = "none"));

        // render view by path
        pathnameViews[pathname]();
    });

    renderNavigation();
}

initNavigation();
