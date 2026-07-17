
// Check authentication
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user && !window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
        window.location.href = 'login.html';
    }
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (user) {
        const avatar = document.getElementById('userAvatar');
        const name = document.getElementById('userName');
        if (avatar && name) {
            avatar.textContent = user.fullName.charAt(0).toUpperCase();
            name.textContent = user.fullName;
        }
    }
});
