const { chromium } = require('playwright-chromium');
const { expect } = require('chai');

const host = 'http://localhost:3000'; // Application host (NOT service host - that can be anything)
const interval = 300;
const timeout = 8000;
const DEBUG = false;
const slowMo = 500;

const mockData = {
  users: [
    {
      _id: '0001',
      email: 'peter@abv.bg',
      password: '123456',
      accessToken: 'AAAA',
    },
    {
      _id: '0002',
      email: 'john@abv.bg',
      password: '123456',
      accessToken: 'BBBB',
    },
  ],
  catalog: [
    {
      angler: 'Paulo Admorim',
      weight: 636,
      species: 'Atlantic Blue Marlin',
      location: 'Vitoria, Brazil',
      bait: 'trolled pink',
      captureTime: 80,
      _id: '1001',
      _ownerId: '0001',
    },
    {
      angler: 'Paulo Admorim2',
      weight: 636,
      species: 'Atlantic Blue Marlin',
      location: 'Vitoria, Brazil',
      bait: 'trolled pink',
      captureTime: 80,
      _id: '1002',
      _ownerId: '0002',
    },
  ],
};
const endpoints = {
  register: '/users/register',
  login: '/users/login',
  logout: '/users/logout',
  catalog: '/data/catches',
  create: '/data/catches ',
  details: (id) => `/data/catches/${id}`,
};

let browser;
let context;
let page;

describe('E2E tests', function () {
  // Setup
  this.timeout(DEBUG ? 120000 : timeout);
  before(
    async () =>
      (browser = await chromium.launch(
        DEBUG ? { headless: false, slowMo } : {}
      ))
  );
  after(async () => await browser.close());
  beforeEach(async () => {
    context = await browser.newContext();
    setupContext(context);
    page = await context.newPage();
  });
  afterEach(async () => {
    await page.close();
    await context.close();
  });
  // Test proper
  describe('Authentication', () => {
    it('register does not work with empty fields', async () => {
      const { post } = await handle(endpoints.register);
      const isCalled = post().isHandled;

      await page.goto(host);
      await page.waitForSelector('#register');

      await page.click('nav >> text=Register', { timeout: interval });
      await page.waitForSelector('#register-view', { timeout: interval });

      await page.click('#register >> text=Register', { timeout: interval });

      expect(isCalled()).to.be.false;
    });

    it('register makes correct API call', async () => {
      const data = mockData.users[0];
      const { post } = await handle(endpoints.register);
      const { onRequest } = post(data);

      await page.goto(host);
      await page.waitForSelector('#register', { timeout: interval });

      await page.click('nav >> text=Register', { timeout: interval });
      await page.waitForSelector('#register-view', { timeout: interval });

      await page.waitForSelector('#register');
      await page.fill('[name="email"]', data.email);
      await page.fill('[name="password"]', data.password);
      await page.fill('[name="rePass"]', data.password);

      const [request] = await Promise.all([
        onRequest(),
        page.click('form >> text=Register', { timeout: interval }),
      ]);

      const postData = JSON.parse(request.postData());

      expect(postData.email).to.equal(data.email);
      expect(postData.password).to.equal(data.password);
    });

    it('login makes correct API call', async () => {
      const data = mockData.users[0];
      const { post } = await handle(endpoints.login);
      const { onRequest } = post(data);

      await page.goto(host);
      await page.waitForSelector('#login', { timeout: interval });

      await page.click('nav >> text=Login', { timeout: interval });
      await page.waitForSelector('#login-view', { timeout: interval });

      await page.waitForSelector('#login', { timeout: interval });
      await page.fill('[name="email"]', data.email);
      await page.fill('[name="password"]', data.password);

      const [request] = await Promise.all([
        onRequest(),
        page.click('form >> text=Login', { timeout: interval }),
      ]);

      const postData = JSON.parse(request.postData());
      expect(postData.email).to.equal(data.email);
      expect(postData.password).to.equal(data.password);
    });

    it('logout makes correct API call', async () => {
      const data = mockData.users[0];
      const { post } = await handle(endpoints.login);
      const { get } = await handle(endpoints.logout);
      const { onResponse } = post(data);
      const { onRequest } = get('', { json: false, status: 204 });

      await page.goto(host);
      await page.click('text=Login', { timeout: interval });
      await page.waitForSelector('form', { timeout: interval });
      await page.fill('[name="email"]', data.email);
      await page.fill('[name="password"]', data.password);

      await Promise.all([onResponse(), page.click('form >> text=Login', { timeout: interval })]);

      await page.waitForSelector('#logout', { timeout: interval });

      const [request] = await Promise.all([
        onRequest(),
        page.click('nav >> text=Logout', { timeout: interval }),
      ]);

      const token = request.headers()['x-authorization'];
      expect(request.method()).to.equal('GET');
      expect(token).to.equal(data.accessToken);
    });
  });

  describe('Navigation bar', () => {
    it('guest user should see correct navigation', async () => {
      await page.goto(host);
      await page.waitForSelector('#guest', { timeout: interval });

      expect(await page.isVisible('#guest')).to.be.true;

      expect(await page.isVisible('#user')).to.be.false;
    });

    it('logged user should see correct navigation', async () => {
      // Login user
      const data = mockData.users[0];
      const { post } = await handle(endpoints.login);
      const { onResponse } = post(data);
       // Login user
       await page.goto(host);
      await page.click('nav >> text=Login', { timeout: interval });
      await page.waitForSelector('#login-view', { timeout: interval });

      await page.waitForSelector('#login', { timeout: interval });
      await page.fill('[name="email"]', data.email);
      await page.fill('[name="password"]', data.password);

      const[loginResponse] = await Promise.all([
        onResponse(),
        page.click('form >> text=Login', { timeout: interval })
      ])

      await page.waitForSelector('#user', { timeout: interval });

      //Test for navigation
      expect(await page.isVisible('#guest')).to.be.false;

      expect(await page.isVisible('#user')).to.be.true;
    });
  });

  describe('Catalog', () => {
    it('load catches', async () => {
      const data = mockData.catalog;
      const { get } = await handle(endpoints.catalog);
      get(data);
      await page.goto(host);

      await page.waitForSelector('.load', { timeout: interval });

      await page.click('text=Load', { timeout: interval });

      await page.waitForSelector('#main', { timeout: interval });
      const titles = await page.$$eval('#catches .catch', (t) =>
        t.map((s) => s.textContent)
      );

      expect(titles.length).to.be.equal(data.length);
    });

    it('before load catches', async () => {
      const data = mockData.catalog;
      const { get } = await handle(endpoints.catalog);
      get(data);
      await page.goto(host);

      await page.waitForSelector('#main', { timeout: interval });
      const titles = await page.$$eval('#catches .catch', (t) =>
        t.map((s) => s.textContent)
      );

      expect(titles.length).to.be.equal(0);
    });
  });

  describe('CRUD', () => {
 

    it('create does NOT work with empty fields', async () => {
       // Login user
       const loginUser = async () => {
        const data = mockData.users[0];
        await page.goto(host);
        await page.click('text=Login');
        await page.waitForSelector('#login', { timeout: interval });
        await page.fill('[name="email"]', data.email);
        await page.fill('[name="password"]', data.password);
        await page.click('form >> text=Login');
      };
      await loginUser();
      const { post } = await handle(endpoints.create);
      const isCalled = post().isHandled;

      await page.waitForSelector('#addForm', { timeout: interval });
      page.click('form >> text=Add', { timeout: interval });

      expect(isCalled()).to.be.false;
    });

    it('create makes correct API call for logged in user', async () => {
      // Login user
         const loginUser = async () => {
           const data = mockData.users[0];
           await page.goto(host);
           await page.click('text=Login');
           await page.waitForSelector('#login', { timeout: interval });
           await page.fill('[name="email"]', data.email);
           await page.fill('[name="password"]', data.password);
           await page.click('form >> text=Login');
         };
           await loginUser();
           const data = mockData.catalog[0];
           const { post } = await handle(endpoints.catalog);
           const { onRequest } = post();
     
           await page.waitForSelector('#addForm', { timeout: interval });
           await page.fill('[name="angler"]', data.angler);
           await page.fill('[name="weight"]', data.weight.toString());
           await page.fill('[name="species"]', data.species);
           await page.fill('[name="location"]', data.location);
           await page.fill('[name="bait"]', data.bait);
           await page.fill('[name="captureTime"]', data.captureTime.toString());
           
     
     
           const [request] = await Promise.all([
             onRequest(),
             page.click('fieldset >> .add', { timeout: interval }),
           ]);
     
           const postData = JSON.parse(request.postData());
     
           expect(postData.angler).to.equal(data.angler);
           expect(postData.weight).to.equal(data.weight.toString());
           expect(postData.species).to.equal(data.species);
           expect(postData.location).to.equal(data.location);
           expect(postData.bait).to.equal(data.bait);
           expect(postData.captureTime).to.equal(data.captureTime.toString());
           
     
     
         });

    it("non-author can't click on other post", async () => {
       // Login user
       const loginUser = async () => {
        const data = mockData.users[0];
        await page.goto(host);
        await page.click('text=Login');
        await page.waitForSelector('#login', { timeout: interval });
        await page.fill('[name="email"]', data.email);
        await page.fill('[name="password"]', data.password);
        await page.click('form >> text=Login');
      };
      await loginUser();
      const data = mockData.catalog;
      const { get } = await handle(endpoints.catalog);
      get(data);

      await page.click('.load', { timeout: interval });
      const titles = await page.$$eval(`#catches .catch >> button`, (t) =>
        t.map((s) => s.disabled)
      );
      const result = titles.filter((x) => {
        if (x !== false) {
          return true;
        }
      });

      expect(result.length).to.be.equals(2);
    });

    it('author can click on other post', async () => {
       // Login user
       const loginUser = async () => {
        const data = mockData.users[0];
        await page.goto(host);
        await page.click('text=Login');
        await page.waitForSelector('#login', { timeout: interval });
        await page.fill('[name="email"]', data.email);
        await page.fill('[name="password"]', data.password);
        await page.click('form >> text=Login');
      };
      await loginUser();
      const data = mockData.catalog;
      const { get } = await handle(endpoints.catalog);
      get(data);

      await page.click('.load', { timeout: interval });
      const titles = await page.$$eval(`#catches .catch >> button`, (t) =>
        t.map((s) => s.disabled)
      );
      const result = titles.filter((x) => {
        if (x !== true) {
          return true;
        }
      });

      expect(result.length).to.be.equals(2);
    });

    it('edit makes correct API call for logged in user', async () => {
      const loginUser = async () => {
          const data = mockData.users[0];
          await page.goto(host);
          await page.waitForTimeout(interval);
          await page.click('text=Login');
          await page.waitForTimeout(interval);
          await page.waitForSelector('#login');
          await page.fill('[name="email"]', data.email);
          await page.fill('[name="password"]', data.password);
          await page.click('form >> text=Login');
          await page.waitForTimeout(interval);
        };
    
    await loginUser();
    const data = mockData.catalog[0];
    await page.goto(host);
    const { get, put } = await handle(endpoints.details(data._id));
    get(data);
    const { onRequest } = put();
    await page.waitForSelector('.load');

    await page.click('.load');

    await page.waitForSelector('#catches');
    await page.fill('.catch input[class="angler"]', data.angler + 'edit');
    await page.waitForSelector('.update');

    const [request] = await Promise.all([onRequest(), page.click('.update')]);

    const postData = JSON.parse(request.postData());
    expect(postData.angler).to.contains(data.angler);
  });

  it('delete makes correct API call for logged in user', async () => {
    const loginUser = async () => {
        const data = mockData.users[0];
        await page.goto(host);
        await page.waitForTimeout(interval);
        await page.click('text=Login');
        await page.waitForTimeout(interval);
        await page.waitForSelector('#login');
        await page.fill('[name="email"]', data.email);
        await page.fill('[name="password"]', data.password);
        await page.click('form >> text=Login');
        await page.waitForTimeout(interval);
      };
  
  await loginUser();
  const data = mockData.catalog[0];
  await page.goto(host);
  const { del } = await handle(endpoints.details(data._id));
  const { onResponse, isHandled } = del({ id: data._id });

  await page.click('.load');
  await page.waitForSelector('.delete');

  await Promise.all([onResponse(), page.click('text="Delete"')]);

  expect(isHandled()).to.be.true;
});
  });
});

async function setupContext(context) {
  // Authentication
  await handleContext(context, endpoints.login, { post: mockData.users[0] });
  await handleContext(context, endpoints.register, { post: mockData.users[0] });
  await handleContext(context, endpoints.logout, {
    get: (h) => h('', { json: false, status: 204 }),
  });

  // Catalog and Details
  await handleContext(context, endpoints.catalog, { get: mockData.catalog });
  await handleContext(context, endpoints.details('1001'), {
    get: mockData.catalog[0],
  });
  await handleContext(context, endpoints.details('1002'), {
    get: mockData.catalog[1],
  });
  await handleContext(context, endpoints.details('1003'), {
    get: mockData.catalog[2],
  });

  // Block external calls
  await context.route(
    (url) => url.href.slice(0, host.length) != host,
    (route) => {
      if (DEBUG) {
        console.log('Preventing external call to ' + route.request().url());
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
    get: (returns, options) => request('GET', returns, options),
    post: (returns, options) => request('POST', returns, options),
    put: (returns, options) => request('PUT', returns, options),
    patch: (returns, options) => request('PATCH', returns, options),
    del: (returns, options) => request('DELETE', returns, options),
    delete: (returns, options) => request('DELETE', returns, options),
  };

  const context = this;

  await context.route(urlPredicate, (route, request) => {
    if (DEBUG) {
      console.log('>>>', request.method(), request.url());
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
      if (typeof handlers[method] == 'function') {
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
      return current.href.toLowerCase().includes(match.toLowerCase());
    } else {
      return current.url().toLowerCase().includes(match.toLowerCase());
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
    'Access-Control-Allow-Origin': '*',
  };
  if (options.json) {
    headers['Content-Type'] = 'application/json';
    data = JSON.stringify(data);
  }

  return {
    status: options.status,
    headers,
    body: data,
  };
}
