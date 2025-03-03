const baseUserUrl = 'http://localhost:3030/users';
const baseCatchUrl = 'http://localhost:3030/data/catches';

const viewsSectionEl = document.getElementById('views');

function loadNavbar() {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const navEl = document.querySelector('nav');

    if (token) {
        navEl.innerHTML = `
            <a id="home" class="active">Home</a>
            <div id="user">
                <a id="logout" href="javascript:void(0)">Logout</a>
            </div>
             <p class="email">Welcome, <span>${email}</span></p>
        `;
    } else {
        navEl.innerHTML = `
            <a id="home" class="active">Home</a>

            <div id="guest">
                <a id="login" href="#">Login</a>
                <a id="register" href="#">Register</a>
            </div>
            <p class="email">Welcome, <span>guest</span></p>
        `;
    }

    const loginAEl = document.getElementById('login');
    const registerAEl = document.getElementById('register');
    const logoutAEl = document.getElementById('logout');
    const homeAEl = document.getElementById('home');

    loginAEl?.addEventListener('click', loadLoginPage);
    registerAEl?.addEventListener('click', loadRegisterPage);
    homeAEl?.addEventListener('click', loadHomePage);
    logoutAEl?.addEventListener('click', logout);
}

function loadLoginPage() {
    viewsSectionEl.innerHTML = '';

    const loginViewSectionEl = document.createElement('section');
    loginViewSectionEl.id = 'login-view';

    const loginH2El = document.createElement('h2');
    loginH2El.textContent = 'Login';

    const loginFormEl = document.createElement('form');
    loginFormEl.id = 'login';

    loginFormEl.innerHTML = `
        <label>Email: <input type="text" name="email"></label>
        <label>Password: <input type="password" name="password"></label>
        <p class="notification"></p>
        <button>Login</button>
    `;

    loginViewSectionEl.appendChild(loginH2El);
    loginViewSectionEl.appendChild(loginFormEl);

    viewsSectionEl.appendChild(loginViewSectionEl);

    loginFormEl.addEventListener('submit', loginUser);

    async function loginUser(event) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const userData = Object.fromEntries(formData);

        try {
            const response = await fetch(`${baseUserUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Incorrect password!');
            }

            const data = await response.json();
            console.log(data);

            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('userId', data._id);
            localStorage.setItem('email', data.email);

            loadNavbar();
            loadHomePage();
        } catch (err) {
            const notificationPEl = document.querySelector('.notification');
            notificationPEl.textContent = err;
        }
    }
}

function loadRegisterPage() {
    viewsSectionEl.innerHTML = '';

    const registerSectionViewEl = document.createElement('section');
    registerSectionViewEl.id = 'register-view';

    const registerH2El = document.createElement('h2');
    registerH2El.textContent = 'Register';

    const registerFormEl = document.createElement('form');
    registerFormEl.id = 'register';

    registerFormEl.innerHTML = `
        <label>Email: <input type="text" name="email"></label>
        <label>Password: <input type="password" name="password"></label>
        <label>Repeat: <input type="password" name="rePass"></label>
        <p class="notification"></p>
        <button>Register</button>
    `;

    registerSectionViewEl.appendChild(registerH2El);
    registerSectionViewEl.appendChild(registerFormEl);

    viewsSectionEl.appendChild(registerSectionViewEl);

    registerFormEl.addEventListener('submit', registerUser);

    async function registerUser(event) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const userData = Object.fromEntries(formData);

        try {
            if (userData.password !== userData.rePass) {
                throw new Error('Passwords don\'t match');
            }

            const response = await fetch(`${baseUserUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Invalid data');
            }

            const data = await response.json();
            console.log(data);

            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('userId', data._id);
            localStorage.setItem('email', data.email);

            loadNavbar();
            loadHomePage();
        } catch (err) {
            const notificationPEl = document.querySelector('.notification');
            notificationPEl.textContent = err;
        }

    }
}

function loadHomePage() {
    viewsSectionEl.innerHTML = '';

    const homeViewSectionEl = document.createElement('section');
    homeViewSectionEl.id = 'home-view';

    const token = localStorage.getItem('token');

    homeViewSectionEl.innerHTML = `
        <fieldset id="main">
            <legend>Catches</legend>
            <div id="catches">
                
               
            </div>
        </fieldset>
        <aside>
            <button class="load">Load</button>
            <form id="addForm">
                <fieldset>
                    <legend>Add Catch</legend>
                    <label>Angler</label>
                    <input type="text" name="angler" class="angler" ${token ? '' : 'disabled'} />
                    <label>Weight</label>
                    <input type="number" name="weight" class="weight" ${token ? '' : 'disabled'} />
                    <label>Species</label>
                    <input type="text" name="species" class="species" ${token ? '' : 'disabled'} />
                    <label>Location</label>
                    <input type="text" name="location" class="location" ${token ? '' : 'disabled'} />
                    <label>Bait</label>
                    <input type="text" name="bait" class="bait" ${token ? '' : 'disabled'} />
                    <label>Capture Time</label>
                    <input type="number" name="captureTime" class="captureTime" ${token ? '' : 'disabled'}/>
                    <button class="add" ${token ? '' : 'disabled'}>Add</button>
                </fieldset>
            </form>
        </aside>
    `;

    viewsSectionEl.appendChild(homeViewSectionEl);

    const addFormEl = document.getElementById('addForm');
    addFormEl.addEventListener('submit', addCatch);

    async function addCatch(event) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const catchData = Object.fromEntries(formData);

        const response = await fetch(baseCatchUrl, {
            method: 'POST',
            headers: {
                'X-Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(catchData)
        });

        const data = await response.json();
        console.log(data);
    }

    const loadBtnEl = document.querySelector('.load');
    loadBtnEl.addEventListener('click', loadCatches);

    async function loadCatches() {

        try {
            const response = await fetch(baseCatchUrl);
            const data = await response.json();
            // [
            //     {_ownerId: '35a', angler: 'Paulo Admorim', weight: 636, species: 'Atlantic Blue Marlin', location: 'Vitoria, Brazil', …},
            //     {_ownerId: '35a', angler: 'asdf', weight: 123, species: 'Atlantic Blue Marlin', location: 'Vitoria, Brazil', …},
            // ]

            const allCatchesDivEl = document.getElementById('catches');
            allCatchesDivEl.innerHTML = '';

            const userId = localStorage.getItem('userId');

            for (const catchObj of data) {
                const isOwner = userId === catchObj._ownerId;

                const catchDivEl = document.createElement('div');
                catchDivEl.className = 'catch';

                catchDivEl.innerHTML = `
                    <label>Angler</label>
                    <input type="text" class="angler" value="${catchObj.angler}" ${isOwner ? '' : 'disabled'}>
                    <label>Weight</label>
                    <input type="text" class="weight" value="${catchObj.weight}" ${isOwner ? '' : 'disabled'}>
                    <label>Species</label>
                    <input type="text" class="species" value="${catchObj.species}" ${isOwner ? '' : 'disabled'}>
                    <label>Location</label>
                    <input type="text" class="location" value="${catchObj.location}" ${isOwner ? '' : 'disabled'}>
                    <label>Bait</label>
                    <input type="text" class="bait" value="${catchObj.bait}" ${isOwner ? '' : 'disabled'}>
                    <label>Capture Time</label>
                    <input type="number" class="captureTime" value="${catchObj.captureTime}" ${isOwner ? '' : 'disabled'}>
                    <button class="update" data-id="${catchObj._id}" ${isOwner ? '' : 'disabled'}>Update</button>
                    <button class="delete" data-id="${catchObj._id}" ${isOwner ? '' : 'disabled'}>Delete</button>
                `;

                allCatchesDivEl.appendChild(catchDivEl);

                const updateBtnEl = catchDivEl.querySelector('.update');
                const deleteBtnEl = catchDivEl.querySelector('.delete');

                updateBtnEl.addEventListener('click', updateCatch);
                deleteBtnEl.addEventListener('click', deleteCatch);

                async function updateCatch() {
                    const token = localStorage.getItem('token');

                    const angler = catchDivEl.querySelector('.angler').value;
                    const weight = catchDivEl.querySelector('.weight').value;
                    const species = catchDivEl.querySelector('.species').value;
                    const location = catchDivEl.querySelector('.location').value;
                    const bait = catchDivEl.querySelector('.bait').value;
                    const captureTime = catchDivEl.querySelector('.captureTime').value;

                    const response = await fetch(`${baseCatchUrl}/${catchObj._id}`, {
                        method: 'PUT',
                        headers: {
                            'X-Authorization': token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ angler, weight, species, location, bait, captureTime })
                    });

                    const data = await response.json();
                    console.log(data);
                }

                async function deleteCatch() {
                    const token = localStorage.getItem('token');

                    try {
                        await fetch(`${baseCatchUrl}/${catchObj._id}`, {
                            method: 'DELETE',
                            headers: {
                                'X-Authorization': token
                            }
                        });
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }

    }
}

async function logout() {
    const token = localStorage.getItem('token');

    try {
        await fetch(`${baseUserUrl}/logout`, {
            headers: {
                'X-Authorization': token
            }
        });

        localStorage.removeItem('token');
        localStorage.removeItem('userId');

        loadNavbar();
        loadHomePage();
    } catch (err) {
        console.log(err);
    }

}


loadNavbar();
loadHomePage();