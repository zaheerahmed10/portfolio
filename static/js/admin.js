/* ============================================
   ADMIN DASHBOARD JAVASCRIPT - COMPLETE
   ============================================ */

// ============================================
// AUTH CHECK
// ============================================
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = '/login';
}

// Set user email
const userEmail = document.getElementById('userEmail');
if (userEmail && user.email) {
    userEmail.textContent = user.email;
}

// ============================================
// API HELPER
// ============================================
async function apiCall(url, options = {}) {
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
        window.location.href = '/login';
        return { success: false, message: 'Not authenticated' };
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return { success: false, message: 'Session expired' };
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Network error' };
    }
}

// ============================================
// SIDEBAR TOGGLE
// ============================================
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// ============================================
// LOGOUT
// ============================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    });
}

// ============================================
// HELPERS
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;
        formMessage.style.display = 'block';
        setTimeout(() => { formMessage.style.display = 'none'; }, 5000);
    }
}

// ============================================
// PAGE ROUTING
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path.includes('/admin/dashboard')) initDashboard();
    else if (path.includes('/admin/profile')) initProfile();
    else if (path.includes('/admin/skills')) initSkills();
    else if (path.includes('/admin/projects')) initProjects();
    else if (path.includes('/admin/experience')) initExperience();
    else if (path.includes('/admin/messages')) initMessages();
    else if (path.includes('/admin/users')) initUsers();
});

// ============================================
// DASHBOARD
// ============================================
async function initDashboard() {
    try {
        const [projects, skills, messages, experience] = await Promise.all([
            apiCall('/api/projects/all'),
            apiCall('/api/skills/all'),
            apiCall('/api/messages'),
            apiCall('/api/experience')
        ]);
        
        const tp = document.getElementById('totalProjects');
        const ts = document.getElementById('totalSkills');
        const tm = document.getElementById('totalMessages');
        const te = document.getElementById('totalExperience');
        
        if (tp) tp.textContent = projects.projects?.length || 0;
        if (ts) ts.textContent = skills.skills?.length || 0;
        if (tm) tm.textContent = messages.messages?.length || 0;
        if (te) te.textContent = experience.experience?.length || 0;
        
        const recentDiv = document.getElementById('recentMessages');
        if (recentDiv) {
            const recent = (messages.messages || []).slice(0, 3);
            if (recent.length > 0) {
                recentDiv.innerHTML = recent.map(msg => `
                    <div class="message-preview">
                        <h4>${escapeHtml(msg.name)} - ${escapeHtml(msg.subject)}</h4>
                        <p>${escapeHtml((msg.message || '').substring(0, 100))}...</p>
                    </div>
                `).join('');
            } else {
                recentDiv.innerHTML = '<div class="loading">No messages yet.</div>';
            }
        }
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

// ============================================
// PROFILE
// ============================================
async function initProfile() {
    try {
        const data = await apiCall('/api/profile');
        const p = data.profile || {};
        
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };
        
        setVal('profileName', p.name);
        setVal('profileTitle', p.title);
        setVal('profileBio', p.bio);
        setVal('profileAbout', p.about);
        setVal('profileEmail', p.email);
        setVal('profilePhone', p.phone);
        setVal('profileLocation', p.location);
        setVal('profileGithub', p.github_url);
        setVal('profileLinkedin', p.linkedin_url);
        setVal('profileImageUrl', p.profile_image_url);
        setVal('profileResume', p.resume_url);
    } catch (error) {
        console.error('Profile load error:', error);
    }
    
    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            
            const data = {
                name: document.getElementById('profileName').value,
                title: document.getElementById('profileTitle').value,
                bio: document.getElementById('profileBio').value,
                about: document.getElementById('profileAbout').value,
                email: document.getElementById('profileEmail').value,
                phone: document.getElementById('profilePhone').value,
                location: document.getElementById('profileLocation').value,
                github_url: document.getElementById('profileGithub').value,
                linkedin_url: document.getElementById('profileLinkedin').value,
                profile_image_url: document.getElementById('profileImageUrl').value,
                resume_url: document.getElementById('profileResume').value
            };
            
            try {
                const result = await apiCall('/api/profile', { 
                    method: 'PUT', 
                    body: JSON.stringify(data) 
                });
                showFormMessage(result.message, result.success ? 'success' : 'error');
            } catch (error) {
                showFormMessage('Failed to save profile', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }
}

// ============================================
// SKILLS
// ============================================
async function initSkills() {
    await loadSkillsTable();
    
    const addBtn = document.getElementById('addSkillBtn');
    const form = document.getElementById('skillForm');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('modalTitle').textContent = 'Add Skill';
            form.reset();
            document.getElementById('skillId').value = '';
            document.getElementById('skillActive').checked = true;
            
            const modal = new bootstrap.Modal(document.getElementById('skillModal'));
            modal.show();
        });
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('skillId').value;
            const data = {
                name: document.getElementById('skillName').value,
                category: document.getElementById('skillCategory').value,
                level: parseInt(document.getElementById('skillLevel').value),
                icon: document.getElementById('skillIcon').value,
                display_order: parseInt(document.getElementById('skillOrder').value),
                is_active: document.getElementById('skillActive').checked
            };
            
            try {
                if (id) {
                    await apiCall(`/api/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) });
                } else {
                    await apiCall('/api/skills', { method: 'POST', body: JSON.stringify(data) });
                }
                
                const modalEl = document.getElementById('skillModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
                
                await loadSkillsTable();
            } catch (error) {
                alert('Failed to save skill');
            }
        });
    }
}

async function loadSkillsTable() {
    const tbody = document.getElementById('skillsTableBody');
    if (!tbody) return;
    
    try {
        const data = await apiCall('/api/skills/all');
        const skills = data.skills || [];
        
        if (skills.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No skills yet. Click "Add Skill" to create one.</td></tr>';
            return;
        }
        
        tbody.innerHTML = skills.map(skill => `
            <tr>
                <td>${escapeHtml(skill.name)}</td>
                <td>${escapeHtml(skill.category)}</td>
                <td>${skill.level}%</td>
                <td><i class="${skill.icon}"></i></td>
                <td><span class="badge ${skill.is_active ? 'badge-success' : 'badge-danger'}">${skill.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-edit" onclick="editSkill('${skill.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-delete" onclick="deleteSkill('${skill.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        window._skills = skills;
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Failed to load skills</td></tr>';
    }
}

window.editSkill = function(id) {
    const skill = window._skills.find(s => s.id === id);
    if (!skill) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Skill';
    document.getElementById('skillId').value = skill.id;
    document.getElementById('skillName').value = skill.name;
    document.getElementById('skillCategory').value = skill.category;
    document.getElementById('skillLevel').value = skill.level;
    document.getElementById('skillIcon').value = skill.icon;
    document.getElementById('skillOrder').value = skill.display_order;
    document.getElementById('skillActive').checked = skill.is_active;
    
    const modal = new bootstrap.Modal(document.getElementById('skillModal'));
    modal.show();
};

window.deleteSkill = async function(id) {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
        await apiCall(`/api/skills/${id}`, { method: 'DELETE' });
        await loadSkillsTable();
    } catch (error) {
        alert('Failed to delete skill');
    }
};

// ============================================
// PROJECTS
// ============================================
async function initProjects() {
    await loadProjectsTable();
    
    const addBtn = document.getElementById('addProjectBtn');
    const form = document.getElementById('projectForm');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('modalTitle').textContent = 'Add Project';
            form.reset();
            document.getElementById('projectId').value = '';
            document.getElementById('projectActive').checked = true;
            
            const modal = new bootstrap.Modal(document.getElementById('projectModal'));
            modal.show();
        });
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('projectId').value;
            const data = {
                title: document.getElementById('projectTitle').value,
                category: document.getElementById('projectCategory').value,
                description: document.getElementById('projectDescription').value,
                technologies: document.getElementById('projectTech').value,
                image_url: document.getElementById('projectImage').value,
                github_url: document.getElementById('projectGithub').value,
                live_url: document.getElementById('projectLive').value,
                display_order: parseInt(document.getElementById('projectOrder').value),
                is_featured: document.getElementById('projectFeatured').checked,
                is_active: document.getElementById('projectActive').checked
            };
            
            try {
                if (id) {
                    await apiCall(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
                } else {
                    await apiCall('/api/projects', { method: 'POST', body: JSON.stringify(data) });
                }
                
                const modalEl = document.getElementById('projectModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
                
                await loadProjectsTable();
            } catch (error) {
                alert('Failed to save project');
            }
        });
    }
}

async function loadProjectsTable() {
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) return;
    
    try {
        const data = await apiCall('/api/projects/all');
        const projects = data.projects || [];
        
        if (projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No projects yet. Click "Add Project" to create one.</td></tr>';
            return;
        }
        
        tbody.innerHTML = projects.map(project => `
            <tr>
                <td><img src="${project.image_url || 'https://via.placeholder.com/60x45/0a0a0a/00ff88?text=NA'}" class="table-image" alt="${escapeHtml(project.title)}"></td>
                <td>${escapeHtml(project.title)}</td>
                <td>${escapeHtml(project.category)}</td>
                <td>${escapeHtml((project.technologies || '').substring(0, 30))}...</td>
                <td>${project.is_featured ? '<span class="badge badge-warning">Featured</span>' : '-'}</td>
                <td><span class="badge ${project.is_active ? 'badge-success' : 'badge-danger'}">${project.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-edit" onclick="editProject('${project.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-delete" onclick="deleteProject('${project.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        window._projects = projects;
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Failed to load projects</td></tr>';
    }
}

window.editProject = function(id) {
    const project = window._projects.find(p => p.id === id);
    if (!project) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Project';
    document.getElementById('projectId').value = project.id;
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectCategory').value = project.category;
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectTech').value = project.technologies || '';
    document.getElementById('projectImage').value = project.image_url || '';
    document.getElementById('projectGithub').value = project.github_url || '';
    document.getElementById('projectLive').value = project.live_url || '';
    document.getElementById('projectOrder').value = project.display_order || 0;
    document.getElementById('projectFeatured').checked = project.is_featured;
    document.getElementById('projectActive').checked = project.is_active;
    
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));
    modal.show();
};

window.deleteProject = async function(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
        await apiCall(`/api/projects/${id}`, { method: 'DELETE' });
        await loadProjectsTable();
    } catch (error) {
        alert('Failed to delete project');
    }
};

// ============================================
// EXPERIENCE
// ============================================
async function initExperience() {
    await loadExperienceList();
    
    const addBtn = document.getElementById('addExpBtn');
    const form = document.getElementById('expForm');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('modalTitle').textContent = 'Add Experience';
            form.reset();
            document.getElementById('expId').value = '';
            
            const modal = new bootstrap.Modal(document.getElementById('expModal'));
            modal.show();
        });
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('expId').value;
            const data = {
                title: document.getElementById('expTitle').value,
                organization: document.getElementById('expOrganization').value,
                description: document.getElementById('expDescription').value,
                start_date: document.getElementById('expStart').value,
                end_date: document.getElementById('expEnd').value,
                display_order: parseInt(document.getElementById('expOrder').value),
                is_current: document.getElementById('expCurrent').checked
            };
            
            try {
                if (id) {
                    await apiCall(`/api/experience/${id}`, { method: 'PUT', body: JSON.stringify(data) });
                } else {
                    await apiCall('/api/experience', { method: 'POST', body: JSON.stringify(data) });
                }
                
                const modalEl = document.getElementById('expModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
                
                await loadExperienceList();
            } catch (error) {
                alert('Failed to save experience');
            }
        });
    }
}

async function loadExperienceList() {
    const container = document.getElementById('experienceList');
    if (!container) return;
    
    try {
        const data = await apiCall('/api/experience');
        const experience = data.experience || [];
        
        if (experience.length === 0) {
            container.innerHTML = '<div class="loading">No experience yet. Click "Add Experience" to create one.</div>';
            return;
        }
        
        container.innerHTML = experience.map(exp => `
            <div class="exp-item">
                <div>
                    <h3>${escapeHtml(exp.title)}</h3>
                    <div class="org">${escapeHtml(exp.organization || '')}</div>
                    <span class="date">${escapeHtml(exp.start_date || '')} - ${exp.is_current ? 'Present' : escapeHtml(exp.end_date || '')}</span>
                    <p>${escapeHtml(exp.description || '')}</p>
                </div>
                <div class="action-btns">
                    <button class="btn-icon btn-edit" onclick="editExperience('${exp.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" onclick="deleteExperience('${exp.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
        
        window._experience = experience;
    } catch (error) {
        container.innerHTML = '<div class="loading">Failed to load experience</div>';
    }
}

window.editExperience = function(id) {
    const exp = window._experience.find(e => e.id === id);
    if (!exp) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Experience';
    document.getElementById('expId').value = exp.id;
    document.getElementById('expTitle').value = exp.title;
    document.getElementById('expOrganization').value = exp.organization || '';
    document.getElementById('expDescription').value = exp.description || '';
    document.getElementById('expStart').value = exp.start_date || '';
    document.getElementById('expEnd').value = exp.end_date || '';
    document.getElementById('expOrder').value = exp.display_order || 0;
    document.getElementById('expCurrent').checked = exp.is_current;
    
    const modal = new bootstrap.Modal(document.getElementById('expModal'));
    modal.show();
};

window.deleteExperience = async function(id) {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
        await apiCall(`/api/experience/${id}`, { method: 'DELETE' });
        await loadExperienceList();
    } catch (error) {
        alert('Failed to delete experience');
    }
};

// ============================================
// MESSAGES
// ============================================
async function initMessages() {
    await loadMessages();
}

async function loadMessages() {
    const container = document.getElementById('messagesList');
    if (!container) return;
    
    try {
        const data = await apiCall('/api/messages');
        const messages = data.messages || [];
        
        if (messages.length === 0) {
            container.innerHTML = '<div class="loading">No messages yet.</div>';
            return;
        }
        
        container.innerHTML = messages.map(msg => `
            <div class="message-card ${msg.is_read ? '' : 'unread'}">
                <div class="message-header">
                    <div>
                        <h3>${escapeHtml(msg.name)}</h3>
                        <div class="email">${escapeHtml(msg.email)}</div>
                    </div>
                    <div class="date">${new Date(msg.created_at).toLocaleDateString()}</div>
                </div>
                <div class="message-subject">${escapeHtml(msg.subject)}</div>
                <div class="message-body">${escapeHtml(msg.message)}</div>
                <div class="message-actions">
                    <button class="btn-icon btn-edit" onclick="toggleMessageRead('${msg.id}', ${!msg.is_read})">
                        <i class="fas ${msg.is_read ? 'fa-envelope' : 'fa-envelope-open'}"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteMessage('${msg.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="loading">Failed to load messages</div>';
    }
}

window.toggleMessageRead = async function(id, isRead) {
    try {
        await apiCall(`/api/messages/${id}/read`, { 
            method: 'PUT', 
            body: JSON.stringify({ is_read: isRead }) 
        });
        await loadMessages();
    } catch (error) {
        alert('Failed to update message');
    }
};

window.deleteMessage = async function(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
        await apiCall(`/api/messages/${id}`, { method: 'DELETE' });
        await loadMessages();
    } catch (error) {
        alert('Failed to delete message');
    }
};

// ============================================
// USERS (NEW)
// ============================================
async function initUsers() {
    await loadUsersTable();
}

async function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    try {
        const data = await apiCall('/api/users');
        const users = data.users || [];
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No users yet.</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${escapeHtml(user.name || '-')}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'badge-warning' : 'badge-success'}">
                        ${(user.role || 'user').toUpperCase()}
                    </span>
                </td>
                <td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                <td>
                    ${user.role !== 'admin' ? `
                        <button class="btn-icon btn-delete" onclick="deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : '<span style="color:var(--text-muted);font-size:0.8rem;">Protected</span>'}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Failed to load users</td></tr>';
    }
}

window.deleteUser = async function(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        await apiCall(`/api/users/${id}`, { method: 'DELETE' });
        await loadUsersTable();
    } catch (error) {
        alert('Failed to delete user');
    }
};