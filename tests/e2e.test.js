const { chromium } = require('playwright-chromium');
const { expect } = require('chai');

const host = "http://localhost:3000"; // Application host (NOT service host - that can be anything)
const interval = 300;
const timeout = 6000;
const DEBUG = false;
const slowMo = 500;


const mockData = {
    "users": [
        {
            "_id": "0001",
            "email": "john@abv.bg",
            "password": "123456",
            "accessToken": "AAAA"
        },
        {
            "_id": "0002",
            "email": "ivan@abv.bg",
            "password": "pass123",
            "accessToken": "BBBB"
        },
        {
            "_id": "0003",
            "email": "peter@abv.bg",
            "password": "123456",
            "accessToken": "CCCC"
        }
    ],

    "catalog": [
        {
            "_id": "1001",
            "_ownerId": "0001",
            "title": "Vikings",
            "imageUrl": "/images/vikings.jpg",
            "genre": "Historical Drama",
            "country": "Canada",
            "details": "\"Vikings\" is an epic historical drama series that brings to life the legendary Norse heroes and their thrilling adventures. Centered around the charismatic and ambitious Ragnar Lothbrok, the series traces his rise from a humble farmer to the revered King of the Viking tribes. With breathtaking battles, intricate political plots, and profound character development, \"Vikings\" immerses you in the brutal yet fascinating world of Norse mythology and Viking culture. From the rugged landscapes of Scandinavia to the shores of England and beyond, the series offers a gritty, authentic portrayal of the Viking age. The show\’s complex characters, stunning visuals, and relentless action make it an unforgettable journey through one of history\'s most captivating eras. Whether it\'s the fierce warrior Lagertha, the cunning Floki, or the vengeful Ivar the Boneless, each character adds depth and intensity to the story, making \"Vikings\" a must-watch for fans of historical drama and epic sagas.",
            "_createdOn": 1617194210928,
            "_updatedOn": 1688552027889
        },
        {
            "_id": "1002",
            "_ownerId": "0002",
            "title": "Westworld",
            "imageUrl": "/images/westworld.jpg",
            "genre": "Science Fiction",
            "country": "United States",
            "details": "\"Westworld\" is an absolutely mind-bending sci-fi thriller that takes you on a wild ride through a futuristic theme park where guests can live out their wildest fantasies with lifelike robots, called hosts. Set in a stunningly detailed Wild West environment, the series delves into complex themes of artificial intelligence, consciousness, and morality. The story starts with guests indulging in the park\'s adventures, but soon unravels into a gripping tale of rebellion as the hosts begin to gain self-awareness. The incredible performances by an ensemble cast, especially by Evan Rachel Wood and Anthony Hopkins, elevate the show to another level. Every episode is packed with twists, philosophical musings, and stunning visuals that keep you hooked. \"Westworld\" isn\'t just a show; it\'s an immersive experience that challenges your perception of reality and makes you question the nature of free will. If you\'re a fan of thought-provoking sci-fi with a dark edge, \"Westworld\" is an absolute must-watch.",
            "_createdOn": 1617194295474
        },
        {
            "_id": "1003",
            "_ownerId": "0002",
            "title": "Friends",
            "imageUrl": "/images/friends.jpg",
            "genre": "Comedy",
            "country": "United States",
            "details": "\"Friends\" is the ultimate feel-good sitcom that has charmed audiences around the globe with its hilarious, heartwarming, and unforgettable moments. Set in New York City, it follows the lives of six inseparable friends—Rachel, Ross, Monica, Chandler, Joey, and Phoebe—as they navigate the ups and downs of life, love, and friendship. With its iconic catchphrases, memorable storylines, and the perfect blend of humor and heartfelt drama, \"Friends\" effortlessly captures the essence of camaraderie and the joy of having a close-knit group of friends. From the infamous Central Perk coffeehouse to unforgettable episodes like \"The One Where No One\'s Ready\" and \"The One with the Prom Video,\" this show is a timeless classic that never fails to bring laughter and warmth. Whether you\'re binge-watching for the hundredth time or discovering it for the first time, \"Friends\" is a comforting and delightful escape into the lives of six beloved characters who will always feel like family.",
            "_createdOn": 1617194295480
        }
    ],

};

const endpoints = {
    register: "/users/register",
    login: "/users/login",
    logout: "/users/logout",
    catalog: "/data/shows?sortBy=_createdOn%20desc",
    create: "/data/shows",
    search: (query) => `/data/shows?where=title%20LIKE%20%22${query}%22`,
    details: (id) => `/data/shows/${id}`,
    delete: (id) => `/data/shows/${id}`,
    own: (showId, userId) =>
        `/data/shows?where=showId%3D%22${showId}%22%20and%20_ownerId%3D%22${userId}%22&count`,
};



let browser;
let context;
let page;

describe("E2E tests", function () {
    // Setup
    this.timeout(DEBUG ? 120000 : timeout);
    before(async () => {
        browser = await chromium.launch(DEBUG ? { headless: false, slowMo } : {});
    });
    after(async () => {
        await browser.close();

    });
    beforeEach(async function () {
        this.timeout(10000);
        context = await browser.newContext();
        setupContext(context);
        page = await context.newPage();
    });
    afterEach(async () => {
        await page.close();
        await context.close();
    });

    // Test proper

    describe("Authentication [ 20 Points ]", function () {
        it("Login does NOT work with empty fields [ 2.5 Points ]", async function () {
            const { post } = await handle(endpoints.login);
            const isCalled = post().isHandled;

            await page.goto(host);

            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();

            await page.waitForSelector("form", { timeout: interval });
            await page.click('[type="submit"]');

            await page.waitForTimeout(interval);
            expect(isCalled()).to.equal(false, 'Login API was called when form inputs were empty');
        });

        it("Login with valid input makes correct API call [ 2.5 Points ]", async function () {
            const data = mockData.users[0];
            const { post } = await handle(endpoints.login);
            const { onRequest } = post(data);

            await page.goto(host);

            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();

            //Can check using Ids if they are part of the provided HTML
            await page.waitForSelector("form", { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });

            await emailElement.fill(data.email);
            await passwordElement.fill(data.password);

            const [request] = await Promise.all([
                onRequest(),
                page.click('[type="submit"]'),
            ]);

            const postData = JSON.parse(request.postData());
            expect(postData.email).to.equal(data.email);
            expect(postData.password).to.equal(data.password);
        });

        it("Login shows alert on fail and does not redirect [ 2.5 Points ]", async function () {
            const data = mockData.users[0];
            const { post } = await handle(endpoints.login);
            let options = { json: true, status: 400 };
            const { onResponse } = post({ message: 'Error 400' }, options);

            await page.goto(host);

            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();

            await page.waitForSelector('form', { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });

            await emailElement.fill(data.email);
            await passwordElement.fill(data.password);

            //check for alert from failed login
            let alertPromise = new Promise(resolve => {
                page.on('dialog', async dialog => {
                    await dialog.accept();
                    resolve(dialog.type());
                });
            })

            await Promise.all([
                onResponse(),
                page.click('[type="submit"]')
            ]);

            //should still be on login page, can check using ids if they are part of the provided HTML
            await page.waitForSelector('form', { timeout: interval });
            let dialogType = await alertPromise;
            expect(dialogType).to.equal('alert');
        });

        it("Register does NOT work with empty fields [ 2.5 Points ]", async function () {
            const { post } = await handle(endpoints.register);
            const isCalled = post().isHandled;

            await page.goto(host);

            let registerBtn = await page.waitForSelector('text=Register', { timeout: interval });
            await registerBtn.click();

            await page.waitForSelector("form", { timeout: interval });
            await page.click('[type="submit"]');

            await page.waitForTimeout(interval);
            expect(isCalled()).to.be.false;
        });

        it("Register does NOT work with different passwords [ 2.5 Points ]", async function () {
            const data = mockData.users[1];
            const { post } = await handle(endpoints.register);
            const isCalled = post().isHandled;

            await page.goto(host);

            let registerBtn = await page.waitForSelector('text=Register', { timeout: interval });
            await registerBtn.click();

            await page.waitForSelector("form", { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
            let repeatPasswordElement = await page.waitForSelector('[name="re-password"]', { timeout: interval });

            await emailElement.fill(data.email);
            await passwordElement.fill(data.password);
            await repeatPasswordElement.fill('nope');

            //check for alert from failed register
            let alertPromise = new Promise(resolve => {
                page.on('dialog', async dialog => {
                    await dialog.accept();
                    resolve(dialog.type());
                });
            })

            await page.click('[type="submit"]');

            //should still be on register page, can check using ids if they are part of the provided HTML
            await page.waitForSelector('form', { timeout: interval });
            let dialogType = await alertPromise;
            expect(dialogType).to.equal('alert');
            expect(isCalled()).to.equal(false, 'Register API was called when form inputs were empty');
        });

        it("Register with valid input makes correct API call [ 2.5 Points ]", async function () {
            const data = mockData.users[1];
            const { post } = await handle(endpoints.register);
            const { onRequest } = post(data);

            await page.goto(host);

            let registerBtn = await page.waitForSelector('text=Register', { timeout: interval });
            await registerBtn.click();

            await page.waitForSelector("form", { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
            let repeatPasswordElement = await page.waitForSelector('[name="re-password"]', { timeout: interval });

            await emailElement.fill(data.email);
            await passwordElement.fill(data.password);
            await repeatPasswordElement.fill(data.password);

            const [request] = await Promise.all([
                onRequest(),
                page.click('[type="submit"]'),
            ]);

            const postData = JSON.parse(request.postData());
            expect(postData.email).to.equal(data.email);
            expect(postData.password).to.equal(data.password);
        });

        it("Register shows alert on fail and does not redirect [ 2.5 Points ]", async function () {
            const data = mockData.users[1];
            const { post } = await handle(endpoints.register);
            let options = { json: true, status: 400 };
            const { onResponse } = post({ message: 'Error 409' }, options);

            await page.goto(host);

            let registerBtn = await page.waitForSelector('text=Register', { timeout: interval });
            await registerBtn.click();

            await page.waitForSelector('form', { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
            let repeatPasswordElement = await page.waitForSelector('[name="re-password"]', { timeout: interval });

            await emailElement.fill(data.email);
            await passwordElement.fill(data.password);
            await repeatPasswordElement.fill(data.password);

            //check for alert from failed register
            let alertPromise = new Promise(resolve => {
                page.on('dialog', async dialog => {
                    await dialog.accept();
                    resolve(dialog.type());
                });
            })

            await Promise.all([
                onResponse(),
                page.click('[type="submit"]')
            ]);

            //should still be on register page, can check using ids if they are part of the provided HTML
            await page.waitForSelector('form', { timeout: interval });
            let dialogType = await alertPromise;
            expect(dialogType).to.equal('alert');
        });

        it("Logout makes correct API call [ 2.5 Points ]", async function () {
            const data = mockData.users[2];
            const { post } = await handle(endpoints.login);
            const { get } = await handle(endpoints.logout);
            const { onResponse } = post(data);
            const { onRequest } = get("", { json: false, status: 204 });

            await page.goto(host);

            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();

            //Can check using Ids if they are part of the provided HTML
            await page.waitForSelector("form", { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });

            await emailElement.fill(data.email);
            await passwordElement.fill(data.password);

            await Promise.all([onResponse(), page.click('[type="submit"]')]);

            let logoutBtn = await page.waitForSelector('nav >> text=Logout', { timeout: interval });

            const [request] = await Promise.all([
                onRequest(),
                logoutBtn.click()
            ]);

            const headers = request.headers();
            const token = request.headers()["x-authorization"];
            expect(request.method()).to.equal("GET");
            expect(token).to.equal(data.accessToken);
        });
    });

    describe("Navigation bar [ 10 Points ]", () => {
        it("Logged user should see correct navigation [ 2.5 Points ]", async function () {
            // Login user
            const userData = mockData.users[0];
            const { post: loginPost } = await handle(endpoints.login);
            loginPost(userData);
            await page.goto(host);

            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();

            await page.waitForSelector("form", { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });

            await emailElement.fill(userData.email);
            await passwordElement.fill(userData.password);

            await page.click('[type="submit"]');

            //Test for navigation
            await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });

            expect(await page.isVisible("nav >> text=TV Shows")).to.be.true;
            expect(await page.isVisible("nav >> text=Search")).to.be.true;
            expect(await page.isVisible("nav >> text=Add Show")).to.be.true;
            expect(await page.isVisible("nav >> text=Logout")).to.be.true;

            expect(await page.isVisible("nav >> text=Login")).to.be.false;
            expect(await page.isVisible("nav >> text=Register")).to.be.false;
        });

        it("Guest user should see correct navigation [ 2.5 Points ]", async function () {
            await page.goto(host);

            await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });

            expect(await page.isVisible("nav"), "Dashboard is not visible").to.be.true;
            expect(await page.isVisible("nav >> text=Add Show"), "Create is visible").to.be.false;
            expect(await page.isVisible("nav >> text=Logout"), "Logout is visible").to.be.false;
            expect(await page.isVisible("nav >> text=Login"), "Login is not visible").to.be.true;
            expect(await page.isVisible("nav >> text=Register"), "Ragister is not visible").to.be.true;
        });

        it("Guest user navigation should work [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog);
            await page.goto(host);

            let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
            await tvShowBtn.click();

            await page.waitForSelector('#shows', { timeout: interval });
            let loginBtn = await page.waitForSelector('nav >> text=Login', { timeout: interval });
            await loginBtn.click();


            await page.waitForSelector('#login', { timeout: interval });
            let registerBtn = await page.waitForSelector('nav >> text=Register', { timeout: interval });
            await registerBtn.click();

            await page.waitForSelector('#register', { timeout: interval });
            let logo = await page.waitForSelector('#logo', { timeout: interval });
            await logo.click();

            await page.waitForSelector('#home', { timeout: interval });
        });

        it("Logged in user navigation should work [ 2.5 Points ]", async function () {
            // Login user
            const userData = mockData.users[0];
            const { post: loginPost } = await handle(endpoints.login);
            loginPost(userData);
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog);

            await page.goto(host);

            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();

            await page.waitForSelector("form", { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });

            await emailElement.fill(userData.email);
            await passwordElement.fill(userData.password);

            await page.click('[type="submit"]');

            let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
            await tvShowBtn.click();

            await page.waitForSelector('#shows', { timeout: interval });
            let createBtn = await page.waitForSelector('nav >> text=Add Show', { timeout: interval });
            await createBtn.click();

            await page.waitForSelector('#create', { timeout: interval });
            let logo = await page.waitForSelector('#logo', { timeout: interval });
            await logo.click();

            await page.waitForSelector('#home', { timeout: interval });
        });
    });

    describe("Home Page [ 5 Points ]", function () {
        it("Show Home page text [ 2.5 Points ]", async function () {
            await page.goto(host);
            await page.waitForSelector('text=Welcome to ShowShare, the ultimate platform for TV enthusiasts! Discover, discuss, and share your favorite TV shows with a community that loves great content just as much as you do. Find hidden gems. Your next binge-worthy series is just a click away!', { timeout: interval });
            expect(await page.isVisible("text=Welcome to ShowShare, the ultimate platform for TV enthusiasts! Discover, discuss, and share your favorite TV shows with a community that loves great content just as much as you do. Find hidden gems. Your next binge-worthy series is just a click away!")).to.be.true;
        });

        it("Show Home page image [ 2.5 Points ]", async function () {
            await page.goto(host);
            await page.waitForSelector('section img#home-img', { timeout: interval });
            expect(await page.isVisible('section img#home-img')).to.be.true;
        });
    });

    describe("Dashboard Page [ 15 Points ]", function () {
        it("Show TV Shows page - welcome message [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get([]);
            await page.goto(host);

            let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
            await tvShowBtn.click();

            await page.waitForSelector('main >> text=Users Recommendations', { timeout: interval });
            expect(await page.isVisible("main >> text=Users Recommendations")).to.be.true;
        });

        it("Check TV Shows page with 0 solutions [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get([]);

            await page.goto(host);

            let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
            await tvShowBtn.click();

            await page.waitForSelector('text=No shows Added.', { timeout: interval });
            expect(await page.isVisible('text=No shows Added.')).to.be.true;

        });

        it("Check Shows have correct images [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog);
            const data = mockData.catalog;

            await page.goto(host);

            let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
            await tvShowBtn.click();

            await page.waitForSelector(".show img", { timeout: interval });
            const images = await page.$$eval(".show img", (t) =>
                t.map((s) => s.src)
            );

            expect(images.length).to.equal(3);
            expect(images[0]).to.contains(`${encodeURI(data[0].imageUrl)}`);
            expect(images[1]).to.contains(`${encodeURI(data[1].imageUrl)}`);
            expect(images[2]).to.contains(`${encodeURI(data[2].imageUrl)}`);
        });

        it("Check Shows have correct Title [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog);
            const data = mockData.catalog;

            await page.goto(host);

            let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
            await tvShowBtn.click();

            await page.waitForSelector(".show .title", { timeout: interval });
            const categories = await page.$$eval(".show .title", (t) =>
                t.map((s) => s.textContent)
            );

            expect(categories.length).to.equal(3);
            expect(categories[0]).to.contains(`${data[0].title}`);
            expect(categories[1]).to.contains(`${data[1].title}`);
            expect(categories[2]).to.contains(`${data[2].title}`);
        });

        it("Check Shows have correct Genre [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog.slice(0, 2));
            const data = mockData.catalog.slice(0, 2);

            await page.goto(host);

            let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
            await tvShowBtn.click();

            await page.waitForSelector(".show .genre", { timeout: interval });
            const categories = await page.$$eval(".show .genre", (t) =>
                t.map((s) => s.textContent)
            );

            expect(categories.length).to.equal(2);
            expect(categories[0]).to.contains(`${data[0].genre}`);
            expect(categories[1]).to.contains(`${data[1].genre}`);
        });

        it("Check Shows have Details button [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog.slice(0, 2));
            const data = mockData.catalog.slice(0, 2);

            await page.goto(host);

            let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
            await tvShowBtn.click();

            await page.waitForSelector('.show >> text=Details', { timeout: interval });
            const buttons = await page.$$eval(".show >> text=Details", (t) =>
                t.map((s) => s.textContent)
            );

            expect(buttons.length).to.equal(2);
        });
    });

    describe("CRUD [ 50 Points ]", () => {
        describe('Create [ 12.5 Points ]', function () {
            it("Create does NOT work with empty fields [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post: loginPost } = await handle(endpoints.login);
                loginPost(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                await page.click('[type="submit"]');

                const { post } = await handle(endpoints.create);
                const isCalled = post().isHandled;

                let addCharacterBtn = await page.waitForSelector('text=Add Show', { timeout: interval });
                await addCharacterBtn.click();

                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await submitBtn.click();

                await page.waitForTimeout(interval);
                expect(isCalled()).to.equal(false, 'Create API was called when form inputs were empty');
            });

            it("Create makes correct API call [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post: loginPost } = await handle(endpoints.login);
                loginPost(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const data = mockData.catalog[0];
                const { post } = await handle(endpoints.create);
                const { onRequest } = post(data);

                let addCharacterBtn = await page.waitForSelector('text=Add Show', { timeout: interval });
                await addCharacterBtn.click();

                let titleElement = await page.waitForSelector('[name="title"]', { timeout: interval });
                let imageElement = await page.waitForSelector('[name="image-url"]', { timeout: interval });
                let genreElement = await page.waitForSelector('[name="genre"]', { timeout: interval });
                let countryElement = await page.waitForSelector('[name="country"]', { timeout: interval });
                let detailsElement = await page.waitForSelector('[name="details"]', { timeout: interval });
                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await titleElement.fill(data.title);
                await imageElement.fill(data.imageUrl);
                await genreElement.fill(data.genre);
                await countryElement.fill(data.country);
                await detailsElement.fill(data.details);


                const [request] = await Promise.all([
                    onRequest(),
                    submitBtn.click(),
                ]);
            });

            it("Create sends correct data [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post: loginPost } = await handle(endpoints.login);
                loginPost(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const data = mockData.catalog[0];
                const { post } = await handle(endpoints.create);
                const { onRequest } = post(data);

                let addCharacterBtn = await page.waitForSelector('text=Add Show', { timeout: interval });
                await addCharacterBtn.click();

                let titleElement = await page.waitForSelector('[name="title"]', { timeout: interval });
                let imageElement = await page.waitForSelector('[name="image-url"]', { timeout: interval });
                let genreElement = await page.waitForSelector('[name="genre"]', { timeout: interval });
                let countryElement = await page.waitForSelector('[name="country"]', { timeout: interval });
                let detailsElement = await page.waitForSelector('[name="details"]', { timeout: interval });
                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await titleElement.fill(data.title);
                await imageElement.fill(data.imageUrl);
                await genreElement.fill(data.genre);
                await countryElement.fill(data.country);
                await detailsElement.fill(data.details);

                const [request] = await Promise.all([
                    onRequest(),
                    submitBtn.click(),
                ]);

                const postData = JSON.parse(request.postData());

                await titleElement.fill(data.title);
                await imageElement.fill(data.imageUrl);
                await genreElement.fill(data.genre);
                await countryElement.fill(data.country);
                await detailsElement.fill(data.details);
            });

            it("Create includes correct headers [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post: loginPost } = await handle(endpoints.login);
                loginPost(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const data = mockData.catalog[0];
                const { post } = await handle(endpoints.create);
                const { onRequest } = post(data);

                let addCharacterBtn = await page.waitForSelector('text=Add Show', { timeout: interval });
                await addCharacterBtn.click();

                let titleElement = await page.waitForSelector('[name="title"]', { timeout: interval });
                let imageElement = await page.waitForSelector('[name="image-url"]', { timeout: interval });
                let genreElement = await page.waitForSelector('[name="genre"]', { timeout: interval });
                let countryElement = await page.waitForSelector('[name="country"]', { timeout: interval });
                let detailsElement = await page.waitForSelector('[name="details"]', { timeout: interval });
                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await titleElement.fill(data.title);
                await imageElement.fill(data.imageUrl);
                await genreElement.fill(data.genre);
                await countryElement.fill(data.country);
                await detailsElement.fill(data.details);

                const [request] = await Promise.all([
                    onRequest(),
                    submitBtn.click(),
                ]);

                const token = request.headers()["x-authorization"];
                expect(token).to.equal(userData.accessToken, 'Request did not send correct authorization header');
            });

            it("Create redirects to dashboard on success [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post: loginPost } = await handle(endpoints.login);
                loginPost(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const data = mockData.catalog[0];
                const { post } = await handle(endpoints.create);
                const { onResponse } = post(data);

                let addCharacterBtn = await page.waitForSelector('text=Add Show', { timeout: interval });
                await addCharacterBtn.click();

                let titleElement = await page.waitForSelector('[name="title"]', { timeout: interval });
                let imageElement = await page.waitForSelector('[name="image-url"]', { timeout: interval });
                let genreElement = await page.waitForSelector('[name="genre"]', { timeout: interval });
                let countryElement = await page.waitForSelector('[name="country"]', { timeout: interval });
                let detailsElement = await page.waitForSelector('[name="details"]', { timeout: interval });
                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await titleElement.fill(data.title);
                await imageElement.fill(data.imageUrl);
                await genreElement.fill(data.genre);
                await countryElement.fill(data.country);
                await detailsElement.fill(data.details);

                await Promise.all([
                    onResponse(),
                    submitBtn.click(),
                ]);

                await page.waitForSelector('#shows', { timeout: interval });
            });
        })

        describe('Details [ 10 Points ]', function () {
            it("Details calls the correct API [ 2.5 Points ]", async function () {
                await page.goto(host);

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[1];
                const { get } = await handle(endpoints.details(data._id));
                let { onResponse, isHandled } = get(data);



                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });

                await Promise.all([
                    onResponse(),
                    learnMoreButton.click()
                ]);

                expect(isHandled()).to.equal(true, 'Details API did not receive a correct call');
            });

            it("Details with guest calls shows correct info [ 2.5 Points ]", async function () {
                await page.goto(host);

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[1];
                const { get } = await handle(endpoints.details(data._id));
                let { isHandled } = get(data);


                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let imageElement = await page.waitForSelector('#details-img', { timeout: interval });
                let titleElement = await page.waitForSelector('#details-title', { timeout: interval });
                let detailsElement = await page.waitForSelector('#description', { timeout: interval });

                let imageSrc = await imageElement.getAttribute('src');
                let title = await titleElement.textContent();
                let details = await detailsElement.textContent();

                expect(imageSrc).to.contains(data.imageUrl);
                expect(title).to.contains(data.title);
                expect(details).to.contains(data.details);

                expect(await page.isVisible('#action-buttons >> text="Delete"')).to.equal(false, 'Delete button was visible for non owner');
                expect(await page.isVisible('#action-buttons >> text="Edit"')).to.equal(false, 'Edit button was visible for non-owner');

                expect(isHandled()).to.equal(true, 'Details API was not called');
            });

            it("Details with logged in user shows correct info [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[0];
                const { get } = await handle(endpoints.details(data._id));
                let { isHandled } = get(data);


                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let imageElement = await page.waitForSelector('#details-img', { timeout: interval });
                let titleElement = await page.waitForSelector('#details-title', { timeout: interval });
                let descriptionElement = await page.waitForSelector('#description', { timeout: interval });

                let imageSrc = await imageElement.getAttribute('src');
                let title = await titleElement.textContent();
                let description = await descriptionElement.textContent();


                expect(imageSrc).to.contains(data.imageUrl);
                expect(title).to.contains(data.title);
                expect(description).to.contains(data.details);

                expect(await page.isVisible('#action-buttons >> text="Delete"')).to.equal(false, 'Delete button was visible for non owner');
                expect(await page.isVisible('#action-buttons >> text="Edit"')).to.equal(false, 'Edit button was visible for non-owner');

                expect(isHandled()).to.equal(true, 'Details API was not called');
            });

            it("Details with owner shows correct info [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[0];
                const { get } = await handle(endpoints.details(data._id));
                let { isHandled } = get(data);

                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let imageElement = await page.waitForSelector('#details-img', { timeout: interval });
                let titleElement = await page.waitForSelector('#details-title', { timeout: interval });
                let detailsElement = await page.waitForSelector('#description', { timeout: interval });

                let imageSrc = await imageElement.getAttribute('src');
                let title = await titleElement.textContent();
                let details = await detailsElement.textContent();

                expect(imageSrc).to.contains(data.imageUrl);
                expect(title).to.contains(data.title);
                expect(details).to.contains(data.details);
                expect(await page.isVisible('#action-buttons >> text="Delete"')).to.equal(true, 'Delete button was NOT visible for owner');
                expect(await page.isVisible('#action-buttons >> text="Edit"')).to.equal(true, 'Edit button was NOT visible for owner');

                expect(isHandled()).to.equal(true, 'Details API was not called');
            });
        })

        describe('Edit [ 17.5 Points ]', function () {
            it("Edit calls correct API to populate info [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[1];
                const { get } = await handle(endpoints.details(data._id));
                let { onResponse, isHandled } = get(data);


                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.country}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });

                await Promise.all([
                    onResponse(),
                    editButton.click()
                ]);

                expect(isHandled()).to.equal(true, 'Request was not sent to Details API to get Edit information');
            });
            it("Edit should populate form with correct data [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[1];
                const { get } = await handle(endpoints.details(data._id));
                get(data);


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
                await editButton.click();

                await page.waitForSelector('.form .edit-form input', { timeout: interval });
                await page.waitForSelector('.edit-form textarea', { timeout: interval });

                const inputs = await page.$$eval(".form .edit-form input", (t) => t.map((i) => i.value));
                const textareas = await page.$$eval(".edit-form textarea", (t) => t.map((i) => i.value));

                expect(inputs[0]).to.contains(data.title);
                expect(inputs[1]).to.contains(data.imageUrl);
                expect(textareas[0]).to.contains(data.details);

            });

            it("Edit does NOT work with empty fields [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[2];
                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { isHandled } = put();


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
                await editButton.click();

                let typeInput = await page.waitForSelector('[name="title"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="image-url"]', { timeout: interval });
                let descriptionInput = await page.waitForSelector('[name="genre"]', { timeout: interval });
                let learnMoreInput = await page.waitForSelector('[name="country"]', { timeout: interval });

                await typeInput.fill('');
                await imageInput.fill('');
                await descriptionInput.fill('');
                await learnMoreInput.fill('');

                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await submitBtn.click();

                await page.waitForTimeout(interval);
                expect(isHandled()).to.equal(false, 'Edit API was called when form inputs were empty');
            });

            it("Edit sends information to the right API [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[2];
                const modifiedData = Object.assign({}, data);
                modifiedData.title = 'title test';
                modifiedData.imageUrl = 'Image Test';
                modifiedData.description = 'Description Test';
                modifiedData.learnMore = 'country test';

                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { isHandled, onResponse } = put(modifiedData);


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
                await editButton.click();

                let typeInput = await page.waitForSelector('[name="title"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="image-url"]', { timeout: interval });
                let descriptionInput = await page.waitForSelector('[name="genre"]', { timeout: interval });
                let learnMoreInput = await page.waitForSelector('[name="country"]', { timeout: interval });

                await typeInput.fill(modifiedData.title);
                await imageInput.fill(modifiedData.imageUrl);
                await descriptionInput.fill(modifiedData.description);
                await learnMoreInput.fill(modifiedData.learnMore);

                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await Promise.all([
                    onResponse(),
                    submitBtn.click(),
                ]);

                expect(isHandled()).to.equal(true, 'The Edit API was not called');
            });

            it("Edit sends correct headers [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const data = mockData.catalog[2];
                const modifiedData = Object.assign({}, data);
                modifiedData.title = 'title test';
                modifiedData.imageUrl = 'Image Test';
                modifiedData.description = 'Description Test';
                modifiedData.learnMore = 'country test';

                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { onRequest } = put(modifiedData);


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
                await editButton.click();

                let typeInput = await page.waitForSelector('[name="title"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="image-url"]', { timeout: interval });
                let descriptionInput = await page.waitForSelector('[name="genre"]', { timeout: interval });
                let learnMoreInput = await page.waitForSelector('[name="country"]', { timeout: interval });

                await typeInput.fill(modifiedData.title);
                await imageInput.fill(modifiedData.imageUrl);
                await descriptionInput.fill(modifiedData.description);
                await learnMoreInput.fill(modifiedData.learnMore);

                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                let [request] = await Promise.all([
                    onRequest(),
                    submitBtn.click(),
                ]);

                const token = request.headers()["x-authorization"];
                expect(token).to.equal(userData.accessToken, 'Request did not send correct authorization header');
            });

            it("Edit sends correct information [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const data = mockData.catalog[2];
                const modifiedData = Object.assign({}, data);
                modifiedData.title = 'title test';
                modifiedData.imageUrl = 'Image Test';
                modifiedData.genre = 'Genre Test';
                modifiedData.country = 'country test';

                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { onRequest } = put(modifiedData);


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
                await editButton.click();

                let titleInput = await page.waitForSelector('[name="title"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="image-url"]', { timeout: interval });
                let descriptionInput = await page.waitForSelector('[name="genre"]', { timeout: interval });
                let countryInput = await page.waitForSelector('[name="country"]', { timeout: interval });

                await titleInput.fill(modifiedData.title);
                await imageInput.fill(modifiedData.imageUrl);
                await descriptionInput.fill(modifiedData.genre);
                await countryInput.fill(modifiedData.country);

                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                const [request] = await Promise.all([
                    onRequest(),
                    submitBtn.click(),
                ]);

                const postData = JSON.parse(request.postData());

                expect(postData.title).to.contains(modifiedData.title);
                expect(postData.imageUrl).to.contains(modifiedData.imageUrl);
                expect(postData.genre).to.contains(modifiedData.genre);
                expect(postData.country).to.contains(modifiedData.country);
            });

            it("Edit redirects to Details on success [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const data = mockData.catalog[2];
                const modifiedData = Object.assign({}, data);
                modifiedData.title = 'title test';
                modifiedData.imageUrl = 'Image Test';
                modifiedData.description = 'Description Test';
                modifiedData.learnMore = 'country test';

                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { onResponse } = put(modifiedData);

                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
                await editButton.click();

                let typeInput = await page.waitForSelector('[name="title"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="image-url"]', { timeout: interval });
                let descriptionInput = await page.waitForSelector('[name="genre"]', { timeout: interval });
                let learnMoreInput = await page.waitForSelector('[name="country"]', { timeout: interval });

                await typeInput.fill(modifiedData.title);
                await imageInput.fill(modifiedData.imageUrl);
                await descriptionInput.fill(modifiedData.description);
                await learnMoreInput.fill(modifiedData.learnMore);

                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await Promise.all([
                    onResponse(),
                    submitBtn.click(),
                ]);

                await page.waitForSelector('#description', { timeout: interval });
            });
        })

        describe('Delete [ 10 Points ]', function () {
            it("Delete makes correct API call [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();
                const data = mockData.catalog[2];

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const { get, del } = await handle(endpoints.details(data._id));
                get(data);
                const { onRequest, onResponse, isHandled } = del({ "_deletedOn": 1688586307461 });


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let deleteButton = await page.waitForSelector('#action-buttons >> text="Delete"', { timeout: interval });

                page.on('dialog', (dialog) => dialog.accept());

                let [request] = await Promise.all([onRequest(), onResponse(), deleteButton.click()]);

                const token = request.headers()["x-authorization"];
                expect(token).to.equal(userData.accessToken, 'Request did not send correct authorization header');
                expect(isHandled()).to.be.true;
            });

            it("Delete shows a confirm dialog [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();
                const data = mockData.catalog[2];

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const { get, del } = await handle(endpoints.details(data._id));
                get(data);
                const { onResponse, isHandled } = del({ "_deletedOn": 1688586307461 });


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let deleteButton = await page.waitForSelector('#action-buttons >> text="Delete"', { timeout: interval });

                let alertPromise = new Promise(resolve => {
                    page.on('dialog', (dialog) => {
                        dialog.accept();
                        resolve(dialog.type());
                    });
                });

                let result = await Promise.all([alertPromise, onResponse(), deleteButton.click()]);
                expect(result[0]).to.equal('confirm');
            });

            it("Delete redirects to Dashboard on confirm accept [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();
                const data = mockData.catalog[2];

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const { get, del } = await handle(endpoints.details(data._id));
                get(data);
                const { onResponse, isHandled } = del({ "_deletedOn": 1688586307461 });


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let deleteButton = await page.waitForSelector('#action-buttons >> text="Delete"', { timeout: interval });

                let alertPromise = new Promise(resolve => {
                    page.on('dialog', (dialog) => {
                        dialog.accept();
                        resolve(dialog.type());
                    });
                });

                await Promise.all([alertPromise, onResponse(), deleteButton.click()]);

                await page.waitForSelector('#shows', { timeout: interval });
            });

            it("Delete does not delete on confirm reject [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();
                const data = mockData.catalog[2];

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const { get, del } = await handle(endpoints.details(data._id));
                get(data);
                const { isHandled } = del({ "_deletedOn": 1688586307461 });


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let tvShowBtn = await page.waitForSelector('nav >> text=TV Shows', { timeout: interval });
                await tvShowBtn.click();

                let learnMoreButton = await page.waitForSelector(`.show:has-text("${data.title}") >> .details-btn`, { timeout: interval });
                await learnMoreButton.click();

                let deleteButton = await page.waitForSelector('#action-buttons >> text="Delete"', { timeout: interval });

                let alertPromise = new Promise(resolve => {
                    page.on('dialog', (dialog) => {
                        dialog.dismiss();
                        resolve(dialog.type());
                    });
                });

                await Promise.all([alertPromise, deleteButton.click()]);
                expect(isHandled()).to.equal(false, 'Delete API was called when the confirm dialog not accepted');

                //Check if we're still on Details page
                await page.waitForSelector('#description', { timeout: interval });
            });
        })

    });
    describe('BONUS:Search Page [ 15 Points ]', async () => {

        it('Show no matches for Guest [ 2.5 Points ]', async () => {
            const { get } = await handle(endpoints.search('Tomato'));
            get([]);

            await page.goto(host);
            await page.waitForTimeout(interval);

            await page.click('nav >> text=Search');
            await page.waitForTimeout(interval);

            await page.fill('[name="search"]', 'Tomato');
            await page.click('button >> text="Search"');
            await page.waitForTimeout(interval);

            expect(await page.isVisible('text=There is no TV show with this title')).to.be.true;
        });

        it('Show results with 2 shows for Guest [ 2.5 Points ]', async () => {
            const { get } = await handle(endpoints.search('e'));
            get(mockData.catalog.slice(0, 2));

            await page.goto(host);
            await page.waitForTimeout(interval);

            await page.click('nav >> text=Search');
            await page.waitForTimeout(interval);

            await page.fill('[name="search"]', 'e');
            await page.click('button >> text="Search"');
            await page.waitForTimeout(interval);

            const titles = await page.$$eval(".show .title", (t) =>
                t.map((s) => s.textContent)
            );

            expect(titles.length).to.equal(2);
            expect(titles[0]).to.contains(`${mockData.catalog[0].title}`);
            expect(titles[1]).to.contains(`${mockData.catalog[1].title}`);
        });

        it('Show Details button for Guest [ 2.5 Points ]', async () => {
            const { get } = await handle(endpoints.search('f'));
            get(mockData.catalog.slice(0, 1));

            await page.goto(host);
            await page.waitForTimeout(interval);

            await page.click('nav >> text=Search');
            await page.waitForTimeout(interval);

            await page.fill('[name="search"]', 'f');
            await page.click('button >> text="Search"');
            await page.waitForTimeout(interval);

            const names = await page.$$eval(".show .title", (t) =>
                t.map((s) => s.textContent));

            expect(names.length).to.equal(1);
            expect(names[0]).to.contains(`${mockData.catalog[0].title}`);

            expect(await page.isVisible('text="Details"')).to.be.true;
        });

        it('Show no matches for Users [ 2.5 Points ]', async () => {
            // Login user
            const data = mockData.users[0];
            await page.goto(host);
            await page.waitForTimeout(interval);
            await page.click('text=Login');
            await page.waitForTimeout(interval);
            await page.waitForSelector('form');

            await page.fill('[name="email"]', data.email);
            await page.fill('[name="password"]', data.password);

            await page.click('[type="submit"]');

            const { get } = await handle(endpoints.search('Tomato'));
            get([]);

            await page.goto(host);
            await page.waitForTimeout(interval);

            await page.click('nav >> text=Search');
            await page.waitForTimeout(interval);

            await page.fill('[name="search"]', 'Tomato');
            await page.click('button >> text="Search"');
            await page.waitForTimeout(interval);

            expect(await page.isVisible('text=There is no TV show with this title')).to.be.true;
        });

        it('Show results with 2 show for Users [ 2.5 Points ]', async () => {
            // Login user
            const data = mockData.users[0];
            await page.goto(host);
            await page.waitForTimeout(interval);
            await page.click('text=Login');
            await page.waitForTimeout(interval);
            await page.waitForSelector('form');

            await page.fill('[name="email"]', data.email);
            await page.fill('[name="password"]', data.password);

            await page.click('[type="submit"]');

            const { get } = await handle(endpoints.search('e'));
            get(mockData.catalog.slice(0, 2));

            await page.goto(host);
            await page.waitForTimeout(interval);

            await page.click('nav >> text=Search');
            await page.waitForTimeout(interval);

            await page.fill('[name="search"]', 'e');
            await page.click('button >> text="Search"');
            await page.waitForTimeout(interval);

            const titles = await page.$$eval(".show .title", (t) =>
                t.map((s) => s.textContent));

            expect(titles.length).to.equal(2);
            expect(titles[0]).to.contains(`${mockData.catalog[0].title}`);
            expect(titles[1]).to.contains(`${mockData.catalog[1].title}`);


        });

        it('Details info button for User [ 2.5 Points ]', async () => {
            // Login user
            const data = mockData.users[0];
            await page.goto(host);
            await page.waitForTimeout(interval);
            await page.click('text=Login');
            await page.waitForTimeout(interval);
            await page.waitForSelector('form');

            await page.fill('[name="email"]', data.email);
            await page.fill('[name="password"]', data.password);

            await page.click('[type="submit"]');

            const { get } = await handle(endpoints.search('f'));
            get(mockData.catalog.slice(0, 1));

            await page.goto(host);
            await page.waitForTimeout(interval);

            await page.click('nav >> text=Search');
            await page.waitForTimeout(interval);

            await page.fill('[name="search"]', 'f');
            await page.click('button >> text="Search"');
            await page.waitForTimeout(interval);

            const names = await page.$$eval(".show .title", (t) =>
                t.map((s) => s.textContent));

            expect(names.length).to.equal(1);
            expect(names[0]).to.contains(`${mockData.catalog[0].title}`);

            expect(await page.isVisible('text="Details"')).to.be.true;


        });
    });
});

async function setupContext(context) {
    // Block external calls
    await context.route(
        (url) => url.href.slice(0, host.length) != host,
        (route) => {
            if (DEBUG) {
                console.log("Preventing external call to " + route.request().url());
            }
            route.abort();
        }
    );
}

function handle(match, handlers) {
    return handleRaw.call(page, match, handlers);
}

function handleContext(context, match, handlers) {
    return handleRaw.call(context, match, handlers);
}

async function handleRaw(match, handlers) {
    const methodHandlers = {};
    const result = {
        get: (returns, options) => request("GET", returns, options),
        post: (returns, options) => request("POST", returns, options),
        put: (returns, options) => request("PUT", returns, options),
        patch: (returns, options) => request("PATCH", returns, options),
        del: (returns, options) => request("DELETE", returns, options),
        delete: (returns, options) => request("DELETE", returns, options),
    };

    const context = this;

    await context.route(urlPredicate, (route, request) => {
        if (DEBUG) {
            console.log(">>>", request.method(), request.url());
        }

        const handler = methodHandlers[request.method().toLowerCase()];
        if (handler == undefined) {
            route.continue();
        } else {
            handler(route, request);
        }
    });

    if (handlers) {
        for (let method in handlers) {
            if (typeof handlers[method] == "function") {
                handlers[method](result[method]);
            } else {
                result[method](handlers[method]);
            }
        }
    }

    return result;

    function request(method, returns, options) {
        let handled = false;

        methodHandlers[method.toLowerCase()] = (route, request) => {
            handled = true;
            route.fulfill(respond(returns, options));
        };

        return {
            onRequest: () => context.waitForRequest(urlPredicate),
            onResponse: () => context.waitForResponse(urlPredicate),
            isHandled: () => handled,
        };
    }

    function urlPredicate(current) {
        if (current instanceof URL) {
            return current.href.toLowerCase().endsWith(match.toLowerCase());
        } else {
            return current.url().toLowerCase().endsWith(match.toLowerCase());
        }
    }
}

function respond(data, options = {}) {
    options = Object.assign(
        {
            json: true,
            status: 200,
        },
        options
    );

    const headers = {
        "Access-Control-Allow-Origin": "*",
    };
    if (options.json) {
        headers["Content-Type"] = "application/json";
        data = JSON.stringify(data);
    }

    return {
        status: options.status,
        headers,
        body: data,
    };
}