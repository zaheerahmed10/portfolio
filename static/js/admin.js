/* ========== AUTH ========== */
if (!localStorage.getItem('token')) {
    window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', () => {
    /* Active sidebar */
    const path = window.location.pathname;
    document.querySelectorAll('.sidebar-nav a').forEach(a => {
        const href = a.getAttribute('href');
        if (href && path.startsWith(href)) a.classList.add('active');
    });

    /* Mobile toggle */
    const t = document.getElementById('menuToggle');
    const s = document.getElementById('sidebar');
    if (t && s) t.addEventListener('click', () => s.classList.toggle('open'));

    /* Logout */
    const lb = document.getElementById('logoutBtn');
    if (lb) lb.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    });

    /* Search */
    const gs = document.getElementById('globalSearch');
    if (gs) gs.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        document.querySelectorAll('table tbody tr, .note-card, .project-card').forEach(el => {
            el.style.display = (q === '' || el.textContent.toLowerCase().includes(q)) ? '' : 'none';
        });
    });
});