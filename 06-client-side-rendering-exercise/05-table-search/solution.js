import { html, render } from './node_modules/lit-html/lit-html.js';

const tbodyEl = document.querySelector('tbody');
const inputEl = document.getElementById('searchField');

async function showStudents() {
    const students = await getStudents();
    console.log(students);

    render(studentsTemplate(students), tbodyEl)
}

showStudents();

async function getStudents() {
    try {
        const res = await fetch('http://localhost:3030/jsonstore/advanced/table');
        const data = await res.json();
        return Object.values(data);
    } catch (err) {
        alert(err.message);
    }
}

function studentsTemplate(students) {
    return html`
        ${students.map(student => singleStudentTemplate(student))}
    `;
}

function singleStudentTemplate(student) {
    return html`
         <tr>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.course}</td>
        </tr>
    `;
}

function solve() {
    document.querySelector('#searchBtn').addEventListener('click', onClick);

    function onClick() {
        const searchedValue = inputEl.value.toLowerCase();
        inputEl.value = '';

        const allTrEls = Array.from(document.querySelectorAll('tbody tr'));

        allTrEls.forEach(trEl => {
            const tdEls = Array.from(trEl.children);

            if (tdEls.some(tdEl => tdEl.textContent.toLowerCase().includes(searchedValue))) {
                trEl.className = 'select';
            } else {
                trEl.className = '';
            }
        });
    }
}

solve();