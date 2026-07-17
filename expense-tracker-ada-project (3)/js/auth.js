
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid credentials');
            }
        });

        const showPw = document.getElementById('showPassword');
        if (showPw) {
            showPw.addEventListener('change', (e) => {
                document.getElementById('password').type = e.target.checked ? 'text' : 'password';
            });
        }
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const mobile = document.getElementById('mobile').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.find(u => u.username === username)) {
                alert('Username already taken');
                return;
            }
            if (users.find(u => u.email === email)) {
                alert('Email already registered');
                return;
            }
            
            const newUser = { fullName, username, email, mobile, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            window.location.href = 'dashboard.html';
        });
    }
});
