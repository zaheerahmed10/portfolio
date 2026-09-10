/* ============================================
   MAIN PORTFOLIO JAVASCRIPT - COMPLETE
   ============================================ */

// ============================================
// INIT AOS
// ============================================
AOS.init({ duration: 800, once: true, offset: 50 });

// ============================================
// PARTICLES
// ============================================
(function createParticles() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 20 + 's';
        p.style.animationDuration = (12 + Math.random() * 18) + 's';
        p.style.width = p.style.height = (Math.random() * 3 + 2) + 'px';
        container.appendChild(p);
    }
})();

// ============================================
// TYPED.JS
// ============================================
const typedEl = document.getElementById('typed-text');
if (typedEl) {
    new Typed('#typed-text', {
        strings: ['MERN Stack Developer', 'AI Engineer', 'Full Stack Developer', 'Problem Solver'],
        typeSpeed: 50,
        backSpeed: 30,
        loop: true
    });
}

// ============================================
// NAVBAR AUTH STATE
// ============================================
function updateNavAuth() {
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user.name) {
        const firstName = user.name.split(' ')[0];
        const initial = firstName.charAt(0).toUpperCase();
        
        navAuth.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <div class="nav-user-welcome">
                    <div class="avatar">${initial}</div>
                    <span>Welcome, Mr. ${firstName}</span>
                </div>
                <a href="#" class="btn-outline-custom" id="navLogoutBtn" style="padding: 6px 18px; font-size: 0.8rem;">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
        `;
        
        document.getElementById('navLogoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
        });
    } else {
        navAuth.innerHTML = `
            <a href="/login" class="btn-outline-custom" style="padding: 6px 18px; font-size: 0.8rem;">
                <i class="fas fa-sign-in-alt"></i> Login
            </a>
        `;
    }
}

updateNavAuth();

// ============================================
// LOAD PROFILE
// ============================================
async function loadProfile() {
    try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        
        if (data.success && data.profile) {
            const p = data.profile;
            
            const heroProfile = document.getElementById('heroProfileImage');
            if (heroProfile && p.profile_image_url) {
                heroProfile.src = p.profile_image_url;
                heroProfile.onerror = null;
            }
            
            const navbarLogo = document.getElementById('navbarBrandImage');
            if (navbarLogo && p.profile_image_url) {
                navbarLogo.src = p.profile_image_url;
                navbarLogo.onerror = null;
            }
            
            const heroName = document.getElementById('heroName');
            if (heroName && p.name) heroName.textContent = p.name;
            
            const profileName = document.getElementById('profileName');
            if (profileName && p.name) profileName.textContent = p.name;
            
            const profileTitle = document.getElementById('profileTitle');
            if (profileTitle && p.title) profileTitle.textContent = p.title;
            
            const aboutText = document.getElementById('aboutText');
            if (aboutText && p.bio) aboutText.textContent = p.bio;
            
            const contactEmail = document.getElementById('contactEmail');
            if (contactEmail && p.email) {
                contactEmail.textContent = p.email;
                contactEmail.href = `mailto:${p.email}`;
            }
            
            const contactPhone = document.getElementById('contactPhone');
            if (contactPhone && p.phone) {
                contactPhone.textContent = p.phone;
                contactPhone.href = `https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`;
            }
            
            const contactLocation = document.getElementById('contactLocation');
            if (contactLocation && p.location) contactLocation.textContent = p.location;
        }
    } catch (error) {
        console.error('Profile load error:', error);
    }
}

// ============================================
// LOAD SKILLS
// ============================================
async function loadSkills() {
    const container = document.getElementById('skillsContainer');
    if (!container) return;
    
    try {
        const res = await fetch('/api/skills');
        const data = await res.json();
        const skills = data.skills || [];
        
        const totalSkillsEl = document.getElementById('totalSkills');
        if (totalSkillsEl) totalSkillsEl.textContent = skills.length;
        
        if (skills.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-white-50">No skills added yet.</div>';
            return;
        }
        
        container.innerHTML = skills.map((skill, i) => `
            <div class="col-md-6" data-aos="fade-up" data-aos-delay="${i * 50}">
                <div class="skill-item">
                    <div class="skill-header">
                        <span>${skill.name}</span>
                        <span class="glow-text">${skill.level}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-fill" style="width:0%" data-width="${skill.level}"></div>
                    </div>
                </div>
            </div>
        `).join('');
        
        setTimeout(() => {
            document.querySelectorAll('.skill-fill').forEach(bar => {
                bar.style.width = bar.getAttribute('data-width') + '%';
            });
        }, 300);
    } catch (error) {
        console.error('Skills error:', error);
    }
}

// ============================================
// LOAD PROJECTS
// ============================================
async function loadProjects() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;
    
    try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        const projects = data.projects || [];
        
        const totalProjectsEl = document.getElementById('totalProjects');
        if (totalProjectsEl) totalProjectsEl.textContent = projects.length;
        
        if (projects.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-white-50">No projects added yet.</div>';
            return;
        }
        
        container.innerHTML = projects.map((project, i) => `
            <div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="${i * 100}">
                <div class="glass-card project-card h-100">
                    <img src="${project.image_url || 'https://via.placeholder.com/400x220/0a0a0a/00ff88?text=Project'}" 
                         class="project-img" alt="${project.title}" loading="lazy">
                    <div class="p-4">
                        <h4 class="fs-5 fw-bold">${project.title}</h4>
                        <p class="text-white-50 small mt-2">${(project.description || '').substring(0, 100)}${project.description?.length > 100 ? '...' : ''}</p>
                        <div class="d-flex flex-wrap gap-2 mt-3">
                            ${(project.technologies || '').split(',').slice(0, 3).map(t => `<span class="tech-badge">${t.trim()}</span>`).join('')}
                        </div>
                        <div class="d-flex gap-2 mt-3">
                            ${project.live_url ? `<a href="${project.live_url}" class="btn-outline-custom py-1 px-3" style="font-size:0.7rem" target="_blank"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
                            ${project.github_url ? `<a href="${project.github_url}" class="btn-outline-custom py-1 px-3" style="font-size:0.7rem" target="_blank"><i class="fab fa-github"></i> Code</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Projects error:', error);
    }
}

// ============================================
// CONTACT FORM
// ============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;
        
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: e.target.name.value,
                    email: e.target.email.value,
                    subject: e.target.subject.value || 'No Subject',
                    message: e.target.message.value
                })
            });
            const data = await res.json();
            alert(data.success ? '✅ Message sent!' : '❌ ' + (data.message || 'Failed'));
            if (data.success) e.target.reset();
        } catch (error) {
            alert('❌ Failed to send');
        } finally {
            btn.innerHTML = original;
            btn.disabled = false;
        }
    });
}

// ============================================
// BACK TO TOP
// ============================================
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('show', window.scrollY > 300);
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadSkills();
    loadProjects();
});