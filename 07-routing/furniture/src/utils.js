export function getToken() {
    const token = localStorage.getItem('token');
    return token;
}

export function getUserId() {
    const userId = localStorage.getItem('userId');
    return userId;
}