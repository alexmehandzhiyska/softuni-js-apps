import page from '../node_modules/page/page.mjs';
import { baseUserUrl } from './constants.js';
import { getToken } from './utils.js';

import showCreatePage from './views/create.js';
import showDetailsPage from './views/details.js';
import showEditPage from './views/edit.js';
import showHomePage from './views/home.js';
import showLoginPage from './views/login.js';
import showProfilePage from './views/profile.js';
import showRegisterPage from './views/register.js';

page('/', showHomePage);
page('/register', showRegisterPage);
page('/login', showLoginPage);
page('/create', showCreatePage);
page('/details/:id', showDetailsPage);
page('/edit/:id', showEditPage);
page('/profile', showProfilePage);

page.start();

export function showNavigation() {
    const token = getToken();
    const userDivEl = document.getElementById('user');
    const guestDivEl = document.getElementById('guest');

    if (token) {
        userDivEl.style.display = 'block';
        guestDivEl.style.display = 'none';
    } else {
        userDivEl.style.display = 'none';
        guestDivEl.style.display = 'block';
    }
}

showNavigation();

const logoutBtnEl = document.getElementById('logoutBtn');
logoutBtnEl.addEventListener('click', logoutUser);

async function logoutUser() {
    try {
        await fetch(`${baseUserUrl}/logout`, {
            headers: {
                'X-Authorization': getToken()
            }
        });

        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('userId');

        // ! Delete if necessary
        showNavigation();
        page.redirect('/');
    } catch (err) {
        alert(err.message);
    }
}