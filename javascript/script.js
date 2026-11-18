// V Gordner
// Last update: 11/18

document.addEventListener('DOMContentLoaded', () => {
    // 1. MOBILE NAV
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            const isExpanded = navLinks.classList.contains('active');
            hamburger.setAttribute('aria-expanded', isExpanded);
        });
    }

    // 2. AUTH HELPER
    const authMessage = document.getElementById('auth-message');

    function showMessage(text, isError = true) {
        if (!authMessage) return;
        authMessage.textContent = text;
        authMessage.style.color = isError ? '#e85d75' : '#2e7d32';
    }

    // 3. SIGN UP LOGIC (signup.html)
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim().toLowerCase();
            const password = document.getElementById('password').value;
            const password2 = document.getElementById('password2').value;

            if (password !== password2) {
                showMessage('Passwords do not match. Please try again.');
                return;
            }

            const users = JSON.parse(localStorage.getItem('knittyUsers')) || [];

            if (users.some(user => user.email === email)) {
                showMessage('An account with this email already exists.');
                return;
            }

            // Use the email username (before @) as their initial display name
            const displayName = email.split('@').at(0);
            const newUser = {
                name: displayName,
                email,
                password,
                avatar: 'images/circle-user.png'
            };

            users.push(newUser);
            localStorage.setItem('knittyUsers', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            showMessage('Account created! Redirecting...', false);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        });
    }

    // 4. LOG IN LOGIC (login.html)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim().toLowerCase();
            const password = document.getElementById('password').value;

            const users = JSON.parse(localStorage.getItem('knittyUsers')) || [];
            const matchedUser = users.find(u => u.email === email && u.password === password);

            if (matchedUser) {
                localStorage.setItem('currentUser', JSON.stringify(matchedUser));
                showMessage(`Welcome back, ${matchedUser.name}!`, false);
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
            } else {
                showMessage('Incorrect email or password. Please try again.');
            }
        });
    }

    // 5. UPDATE NAVBAR WHEN LOGGED IN (All pages)
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    function updateNavbarProfile(user) {
        if (!user || !navLinks) return;
        const userAvatar = user.avatar || 'images/circle-user.png';
        const navItem = navLinks.querySelector('a[href="login.html"], a[href="account.html"]');
        if (navItem) {
            navItem.innerHTML = `Hi, ${user.name} <img src="${userAvatar}" alt="user">`;
            navItem.href = 'account.html';
        }
    }

    if (currentUser) {
        updateNavbarProfile(currentUser);
    }

    // 6. ACCOUNT PAGE LOGIC (account.html)
    const accountForm = document.getElementById('account-form');
    if (accountForm) {
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        const greeting = document.getElementById('account-greeting');
        const emailDisplay = document.getElementById('account-email-display');
        const nameInput = document.getElementById('account-name');
        const avatarImg = document.getElementById('account-avatar-img');
        const avatarInput = document.getElementById('avatar-input');

        if (greeting) greeting.textContent = `Welcome, ${currentUser.name}`;
        if (emailDisplay) emailDisplay.textContent = currentUser.email;
        if (nameInput) nameInput.value = currentUser.name;
        if (avatarImg && currentUser.avatar) avatarImg.src = currentUser.avatar;

        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files.item(0);
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const maxSize = 200;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > maxSize) {
                                height *= maxSize / width;
                                width = maxSize;
                            }
                        } else {
                            if (height > maxSize) {
                                width *= maxSize / height;
                                height = maxSize;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

                        currentUser.avatar = resizedDataUrl;
                        const users = JSON.parse(localStorage.getItem('knittyUsers')) || [];
                        const userIndex = users.findIndex(u => u.email === currentUser.email);
                        if (userIndex !== -1) {
                            users.splice(userIndex, 1, currentUser);
                            localStorage.setItem('knittyUsers', JSON.stringify(users));
                        }
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));

                        if (avatarImg) avatarImg.src = resizedDataUrl;
                        updateNavbarProfile(currentUser);
                        showMessage('Profile photo updated!', false);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        accountForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const updatedName = nameInput.value.trim();
            const newPassword = document.getElementById('account-new-password').value;

            const users = JSON.parse(localStorage.getItem('knittyUsers')) || [];
            const userIndex = users.findIndex(u => u.email === currentUser.email);

            currentUser.name = updatedName;
            if (newPassword) {
                currentUser.password = newPassword;
            }

            if (userIndex !== -1) {
                users.splice(userIndex, 1, currentUser);
                localStorage.setItem('knittyUsers', JSON.stringify(users));
            }
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            if (greeting) greeting.textContent = `Welcome, ${currentUser.name}`;
            updateNavbarProfile(currentUser);

            document.getElementById('account-new-password').value = '';
            showMessage('Account changes saved!', false);
        });

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            });
        }
    }
});
