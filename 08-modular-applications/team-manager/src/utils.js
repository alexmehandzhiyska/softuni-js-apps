export function getToken() {
    return localStorage.getItem('token');
}

export function getUserId() {
    return localStorage.getItem('userId');
}

export function setUserData(data) {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('userId', data._id);
}

export function removeUserData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
}