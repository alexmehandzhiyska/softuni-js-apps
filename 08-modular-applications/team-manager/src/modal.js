const overlayEl = document.querySelector('.overlay');
const modalMesageEl = document.getElementById('modal-message');
const confirmBtnEl = document.getElementById('modal-confirm-btn');
const cancelBtnEl = document.getElementById('modal-cancel-btn');

export default function showModal(message, onConfirm, onCancel) {
    modalMesageEl.textContent = message;
    overlayEl.style.display = 'block';

    confirmBtnEl.addEventListener('click', () => {
        overlayEl.style.display = 'none';
        onConfirm();
    });

    cancelBtnEl.addEventListener('click', () => {
        overlayEl.style.display = 'none';
        onCancel();
    });
}