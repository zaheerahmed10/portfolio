/* ============================================
   AUTHENTICATION JAVASCRIPT
   ============================================ */

// ============================================
// LOGIN
// ============================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const originalText = loginBtn.innerHTML;
        
        if (!email || !password) {
            showAuthMessage('Please fill in all fields', 'error');
            return;
        }
        
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showAuthMessage('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    // Admin → dashboard, User → home page
                    if (data.user.role === 'admin') {
                        window.location.href = '/admin/dashboard';
                    } else {
                        window.location.href = '/';
                    }
                }, 1000);
            } else {
                showAuthMessage(data.message || 'Login failed', 'error');
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Login error:', error);
            showAuthMessage('Network error. Please try again.', 'error');
            loginBtn.disabled = false;
            loginBtn.innerHTML = originalText;
        }
    });
}

// ============================================
// REGISTER
// ============================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const registerBtn = document.getElementById('registerBtn');
        const originalText = registerBtn.innerHTML;
        
        if (!name || !email || !password) {
            showAuthMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAuthMessage('Please enter a valid email', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAuthMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showAuthMessage('Account created! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                showAuthMessage(data.message || 'Registration failed', 'error');
                registerBtn.disabled = false;
                registerBtn.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Register error:', error);
            showAuthMessage('Network error. Please try again.', 'error');
            registerBtn.disabled = false;
            registerBtn.innerHTML = originalText;
        }
    });
}

// ============================================
// HELPERS
// ============================================
function showAuthMessage(message, type) {
    const authMessage = document.getElementById('authMessage');
    if (authMessage) {
        authMessage.textContent = message;
        authMessage.className = 'auth-message ' + type;
        authMessage.style.display = 'block';
    }
}

// If already logged in and on login/register page, redirect
if (window.location.pathname === '/login' || window.location.pathname === '/register') {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token) {
        if (user.role === 'admin') {
            window.location.href = '/admin/dashboard';
        } else {
            window.location.href = '/';
        }
    }
}