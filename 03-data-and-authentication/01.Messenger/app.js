function attachEvents() {
    const messagesTextareaEl = document.getElementById('messages');

    const authorInputEl = document.querySelector('input[name="author"]');
    const contentInputEl = document.querySelector('input[name="content"]');

    const submitBtnEl = document.getElementById('submit');
    const refreshBtnEl = document.getElementById('refresh');

    submitBtnEl.addEventListener('click', handleSendMessage);
    refreshBtnEl.addEventListener('click', handleLoadMessages);

    async function handleSendMessage() {
        const author = authorInputEl.value;
        const content = contentInputEl.value;

        try {
            const response = await fetch('http://localhost:3030/jsonstore/messenger', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ author, content })
            });

            // if (!response.ok) {
            //     throw new Error('...');
            // }

            const data = await response.json();
            console.log(data);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleLoadMessages() {
        try {
            const response = await fetch('http://localhost:3030/jsonstore/messenger');
            const data = await response.json();

            const messages = Object.values(data);
            let messageStrs = [];

            for (const { author, content } of messages) {
                messageStrs.push(`${author}: ${content}`);
            }

            messagesTextareaEl.textContent = messageStrs.join('\n');
        } catch (err) {
            console.error(err);
        }
    }
}

attachEvents();