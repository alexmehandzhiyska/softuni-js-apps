function attachEvents() {
    const baseUrl = 'http://localhost:3030/jsonstore/phonebook';

    const phonebookUlEl = document.getElementById('phonebook');
    const loadBtnEl = document.getElementById('btnLoad');

    loadBtnEl.addEventListener('click', loadContacts);

    async function loadContacts() {
        phonebookUlEl.innerHTML = '';

        const response = await fetch(baseUrl);
        const data = await response.json();

        const contacts = Object.values(data);
        // [
        //     {person: 'Maya', phone: '+1-555-7653', _id: '2da4},
        //     {person: 'Pen4o', phone: '+3-234-7653', _id: '3da4},
        // ]

        for (const { person, phone, _id } of contacts) {
            const liEl = document.createElement('li');
            liEl.textContent = `${person}: ${phone}`;

            const deleteBtnEl = document.createElement('button');
            deleteBtnEl.textContent = 'Delete';

            liEl.appendChild(deleteBtnEl)
            phonebookUlEl.appendChild(liEl);

            deleteBtnEl.addEventListener('click', (e) => deleteContact(_id));
        }

        async function deleteContact(_id) {
            await fetch(`${baseUrl}/${_id}`, {
                method: 'DELETE'
            });
        }
    }

    const personInputEl = document.getElementById('person');
    const phoneInputEl = document.getElementById('phone');
    const createBtnEl = document.getElementById('btnCreate');

    createBtnEl.addEventListener('click', addContact);

    async function addContact() {
        const person = personInputEl.value;
        const phone = phoneInputEl.value;

        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ person, phone })
        });

        const data = await response.json();
        console.log(data);
    }
}

attachEvents();