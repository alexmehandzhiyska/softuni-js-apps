import page from '../node_modules/page/page.mjs';
import userService from './api/userService.js';
import { getToken } from './utils.js';

import showCreatePage from './views/create.js';
import showDashboardPage from './views/dashboard.js';
import showDetailsPage from './views/details.js';
import showEditPage from './views/edit.js';
import showHomePage from './views/home.js';
import showLoginPage from './views/login.js';
import showProfilePage from './views/profile.js';
import showRegisterPage from './views/register.js';

page('/', showHomePage);
page('/register', showRegisterPage);
page('/login', showLoginPage);

page('/dashboard', showDashboardPage);
page('/create', showCreatePage);
page('/details/:id', showDetailsPage);
page('/edit/:id', showEditPage);
page('/profile', showProfilePage);

page.start();

export function showNavigation() {
    const userAEls = document.querySelectorAll('.user-link');
    const guestAEls = document.querySelectorAll('.guest-link');

    const token = getToken();

    if (token) {
        userAEls.forEach(aEl => aEl.style.display = 'block');
        guestAEls.forEach(aEl => aEl.style.display = 'none');
    } else {
        userAEls.forEach(aEl => aEl.style.display = 'none');
        guestAEls.forEach(aEl => aEl.style.display = 'block');
    }
}

showNavigation();

const logoutBtnEl = document.getElementById('logout-btn');

logoutBtnEl.addEventListener('click', logoutUser);

async function logoutUser() {
    await userService.logout();
    showNavigation();
    page.redirect('/');
}