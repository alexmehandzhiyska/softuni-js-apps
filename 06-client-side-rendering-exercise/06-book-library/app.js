import { html, render } from './node_modules/lit-html/lit-html.js';

const bodyEl = document.querySelector('body');

function showHomePage() {
    render(homeTemplate(), bodyEl);
}

showHomePage();

function homeTemplate() {
    return html`
        <button id="loadBooks" @click=${showBooks}>LOAD ALL BOOKS</button>

        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
               
            </tbody>
        </table>

        <form id="add-form" @submit=${addBook}>
            <h3>Add book</h3>
            <label>TITLE</label>
            <input type="text" name="title" placeholder="Title...">
            <label>AUTHOR</label>
            <input type="text" name="author" placeholder="Author...">
            <input type="submit" value="Submit">
        </form>

        <form id="edit-form" @submit=${editBook}>
            <input type="hidden" name="id">
            <h3>Edit book</h3>
            <label>TITLE</label>
            <input type="text" name="title" placeholder="Title...">
            <label>AUTHOR</label>
            <input type="text" name="author" placeholder="Author...">
            <input type="submit" value="Save">
        </form>
    `;
}

async function showBooks() {
    const tbodyEl = document.querySelector('tbody');
    const books = await getBooks();
    render(booksTemplate(books), tbodyEl)
}

function booksTemplate(books) {
    return html`
        ${books.map(book => singleBookTemplate(book))}
    `;
}

function singleBookTemplate(book) {
    return html`
        <tr>
            <td>${book[1].title}</td>
            <td>${book[1].author}</td>
            <td>
                <button @click=${(e) => showEditForm(e, book)}>Edit</button>
                <button id=${book[0]} @click=${deleteBook}>Delete</button>
            </td>
        </tr>
    `;
}

async function getBooks() {
    try {
        const res = await fetch('http://localhost:3030/jsonstore/collections/books');
        const data = await res.json();
        console.log(Object.entries(data));
        return Object.entries(data);
    } catch (err) {
        alert(err.message);
    }
}

async function addBook(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const bookData = Object.fromEntries(formData);
    console.log(bookData);

    try {
        const res = await fetch('http://localhost:3030/jsonstore/collections/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });

        const data = await res.json();
        console.log(data);
    } catch (err) {
        alert(err);
    }
}

function showEditForm(e, book) {
    const addBookFormEl = document.getElementById('add-form');
    const editBookFormEl = document.getElementById('edit-form');

    addBookFormEl.style.display = 'none';
    editBookFormEl.style.display = 'block';

    editBookFormEl.elements.id.value = book[0];
    editBookFormEl.elements.title.value = book[1].title;
    editBookFormEl.elements.author.value = book[1].author;
}

async function editBook(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const bookData = Object.fromEntries(formData);

    try {
        const res = await fetch(`http://localhost:3030/jsonstore/collections/books/${bookData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });

        const data = await res.json();
        console.log(data);
    } catch (err) {
        alert(err);
    }
}

async function deleteBook(e) {
    const bookId = e.target.id;

    try {
        await fetch(`http://localhost:3030/jsonstore/collections/books/${bookId}`, {
            method: 'DELETE'
        });
    } catch (err) {
        alert(err.message)
    }
}