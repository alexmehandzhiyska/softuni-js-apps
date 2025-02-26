async function solution() {
    const mainEl = document.getElementById('main');

    const articlesResponse = await fetch('http://localhost:3030/jsonstore/advanced/articles/list');
    const articlesData = await articlesResponse.json();

    for (const article of articlesData) {
        const currentArticleResponse = await fetch(`http://localhost:3030/jsonstore/advanced/articles/details/${article._id}`);
        const currentArticleData = await currentArticleResponse.json();
        // {
        //  _id: 'ee', 
        //  title: 'Scalable Vector Graphics', 
        //  content: 'Scalable Vector Graphics (SVG) is an Extensible Ma…y the World Wide Web Consortium (W3C) since 1999.'
        // }

        const accordionDivEl = document.createElement('div');
        accordionDivEl.className = 'accordion';

        const headDivEl = document.createElement('div');
        headDivEl.className = 'head';

        const titleSpanEl = document.createElement('span');
        titleSpanEl.textContent = currentArticleData.title;

        const changeInfoBtnEl = document.createElement('button');
        changeInfoBtnEl.className = 'button';
        changeInfoBtnEl.id = currentArticleData._id;
        changeInfoBtnEl.textContent = 'More';

        const extraDivEl = document.createElement('div');
        extraDivEl.className = 'extra';

        const contentPEl = document.createElement('p');
        contentPEl.textContent = currentArticleData.content;

        headDivEl.appendChild(titleSpanEl);
        headDivEl.appendChild(changeInfoBtnEl);

        extraDivEl.appendChild(contentPEl);

        accordionDivEl.appendChild(headDivEl);
        accordionDivEl.appendChild(extraDivEl);

        mainEl.appendChild(accordionDivEl);

        changeInfoBtnEl.addEventListener('click', handleInfoChange);

        function handleInfoChange() {
            if (changeInfoBtnEl.textContent === 'More') {
                extraDivEl.style.display = 'block';
                changeInfoBtnEl.textContent = 'Less';
            } else {
                extraDivEl.style.display = 'none';
                changeInfoBtnEl.textContent = 'More';
            }
        }
    }
}

solution();