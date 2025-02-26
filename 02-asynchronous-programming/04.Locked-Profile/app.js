async function lockedProfile() {
    const mainEl = document.getElementById('main');

    const usersResponse = await fetch("http://localhost:3030/jsonstore/advanced/profiles");
    const usersData = await usersResponse.json();
    const users = Object.values(usersData);

    for (let index in users) {
        index = Number(index);
        const user = users[index];

        // {_id: 'fb', username: 'John', email: 'john@users.bg', age: 31}

        const profileDivEl = document.createElement('div');
        profileDivEl.className = 'profile';

        const userIconImgEl = document.createElement('img');
        userIconImgEl.className = 'userIcon';
        userIconImgEl.setAttribute('src', './iconProfile2.png');

        const lockLabelEl = document.createElement('label');
        lockLabelEl.textContent = 'Lock';

        const lockInputEl = document.createElement('input');
        lockInputEl.setAttribute('type', 'radio');
        lockInputEl.setAttribute('name', `user${index + 1}Locked`);
        lockInputEl.value = 'lock';
        lockInputEl.checked = true;

        const unlockLabelEl = document.createElement('label');
        unlockLabelEl.textContent = 'Unlock';

        const unlockInputEl = document.createElement('input');
        unlockInputEl.setAttribute('type', 'radio');
        unlockInputEl.setAttribute('name', `user${index + 1}Locked`);
        unlockInputEl.value = 'unlock';

        const brEl = document.createElement('br');
        const hrEl1 = document.createElement('hr');

        const usernameLabelEl = document.createElement('label');
        usernameLabelEl.textContent = 'Username';

        const usernameInputEl = document.createElement('input');
        usernameInputEl.setAttribute('type', 'text');
        usernameInputEl.setAttribute('name', `user${index + 1}Username`);
        usernameInputEl.value = user.username;
        usernameInputEl.disabled = true;
        usernameInputEl.readOnly = true;

        const usernameDivEl = document.createElement('div');
        usernameDivEl.className = `user${index + 1}Username`;

        const hrEl2 = document.createElement('hr');

        const emailLabelEl = document.createElement('label');
        emailLabelEl.textContent = 'Email:';

        const emailInputEl = document.createElement('input');
        emailInputEl.setAttribute('type', 'email');
        emailInputEl.setAttribute('name', `user${index + 1}Email`);
        emailInputEl.value = user.email;
        emailInputEl.disabled = true;
        emailInputEl.readOnly = true;

        const ageLabelEl = document.createElement('label');
        ageLabelEl.textContent = 'Age:';

        const ageInputEl = document.createElement('input');
        ageInputEl.setAttribute('type', 'number');
        ageInputEl.setAttribute('name', `user${index + 1}Age`);
        ageInputEl.value = user.age;
        ageInputEl.disabled = true;
        ageInputEl.readOnly = true;

        const showInfoBtnEl = document.createElement('button');
        showInfoBtnEl.textContent = 'Show more';

        usernameDivEl.appendChild(hrEl2);
        usernameDivEl.appendChild(emailLabelEl);
        usernameDivEl.appendChild(emailInputEl);
        usernameDivEl.appendChild(ageLabelEl);
        usernameDivEl.appendChild(ageInputEl);

        profileDivEl.appendChild(userIconImgEl);
        profileDivEl.appendChild(lockLabelEl);
        profileDivEl.appendChild(lockInputEl);
        profileDivEl.appendChild(unlockLabelEl);
        profileDivEl.appendChild(unlockInputEl);
        profileDivEl.appendChild(brEl);
        profileDivEl.appendChild(hrEl1);
        profileDivEl.appendChild(usernameLabelEl);
        profileDivEl.appendChild(usernameInputEl);
        profileDivEl.appendChild(usernameDivEl);
        profileDivEl.appendChild(showInfoBtnEl);

        mainEl.appendChild(profileDivEl);

        usernameDivEl.style.display = 'none';

        showInfoBtnEl.addEventListener('click', handleInfoChange);

        function handleInfoChange() {
            if (unlockInputEl.checked) {
                if (showInfoBtnEl.textContent === 'Show more') {
                    usernameDivEl.style.display = 'block';
                    showInfoBtnEl.textContent = 'Hide it';
                } else {
                    usernameDivEl.style.display = 'none';
                    showInfoBtnEl.textContent = 'Show more';
                }
            }
        }
    }
}