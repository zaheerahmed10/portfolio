"""
Portfolio Website - Main Flask Application
Full-stack portfolio with Supabase backend
"""
import os
import re
import uuid
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, render_template, request, jsonify, redirect, url_for
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try importing supabase
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️ Supabase package not installed. Run: pip install supabase")

# Try importing jwt and bcrypt
try:
    import jwt
    JWT_AVAILABLE = True
except ImportError:
    JWT_AVAILABLE = False
    print("⚠️ PyJWT not installed. Run: pip install PyJWT")

try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    BCRYPT_AVAILABLE = False
    print("⚠️ bcrypt not installed. Run: pip install bcrypt")


# ==================================================
# FLASK APP INITIALIZATION (with absolute paths)
# ==================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__,
            template_folder=os.path.join(BASE_DIR, 'templates'),
            static_folder=os.path.join(BASE_DIR, 'static'),
            static_url_path='/static')
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')

# ==================================================
# SUPABASE CONNECTION
# ==================================================
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
JWT_SECRET = os.getenv('JWT_SECRET', 'jwt-secret-key')

supabase: Client = None

print("=" * 60)
print("🔍 SUPABASE CONNECTION CHECK")
print("=" * 60)
print(f"URL: {SUPABASE_URL}")
print(f"KEY present: {bool(SUPABASE_KEY)}")
print(f"SERVICE KEY present: {bool(SUPABASE_SERVICE_ROLE_KEY)}")
print("=" * 60)

if SUPABASE_AVAILABLE and SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("✅ Supabase connected successfully!")
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        supabase = None
else:
    print("⚠️ Warning: Supabase credentials not configured")


# ==================================================
# AUTH DECORATORS
# ==================================================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'success': False, 'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'success': False, 'message': 'Authentication token required'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.user_id = data['user_id']
            request.user_email = data['email']
            request.user_role = data.get('role', 'user')
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Only admin role can access"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'success': False, 'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.user_id = data['user_id']
            request.user_email = data['email']
            request.user_role = data.get('role', 'user')
            
            # Check admin role
            if request.user_role != 'admin':
                return jsonify({'success': False, 'message': 'Admin access required'}), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated


def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def check_supabase():
    if not supabase:
        return jsonify({
            'success': False,
            'message': 'Database not configured. Please check .env file.'
        }), 500
    return None


# ==================================================
# PUBLIC ROUTES
# ==================================================

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login')
def login_page():
    return render_template('login.html')


@app.route('/register')
def register_page():
    return render_template('register.html')


@app.route('/admin/<page>')
def admin_page(page):
    valid_pages = ['dashboard', 'profile', 'skills', 'projects', 'experience', 'messages', 'users']
    if page not in valid_pages:
        return redirect(url_for('admin_page', page='dashboard'))
    return render_template(f'admin/{page}.html')


# ==================================================
# API: PROFILE
# ==================================================

@app.route('/api/profile', methods=['GET'])
def get_profile():
    if not supabase:
        return jsonify({
            'success': True,
            'profile': {
                'name': 'Zaheer Ahmed',
                'title': 'AI/ML Engineer',
                'bio': 'Building intelligent solutions',
                'about': 'I am an AI/ML Engineer passionate about building intelligent solutions.',
                'email': 'zaheerahmed@example.com',
                'location': 'Nawabshah, Pakistan'
            }
        })
    
    try:
        response = supabase.table('profile').select('*').limit(1).execute()
        if response.data and len(response.data) > 0:
            return jsonify({'success': True, 'profile': response.data[0]})
        return jsonify({'success': True, 'profile': {}})
    except Exception as e:
        print(f"❌ Profile error: {e}")
        return jsonify({'success': True, 'profile': {}})


@app.route('/api/profile', methods=['PUT'])
@admin_required
def update_profile():
    error = check_supabase()
    if error: return error
    
    try:
        data = request.get_json()
        if not data.get('name'):
            return jsonify({'success': False, 'message': 'Name is required'}), 400
        
        existing = supabase.table('profile').select('id').limit(1).execute()
        
        update_data = {
            'name': data.get('name', ''),
            'title': data.get('title', ''),
            'bio': data.get('bio', ''),
            'about': data.get('about', ''),
            'email': data.get('email', ''),
            'phone': data.get('phone', ''),
            'location': data.get('location', ''),
            'github_url': data.get('github_url', ''),
            'linkedin_url': data.get('linkedin_url', ''),
            'profile_image_url': data.get('profile_image_url', ''),
            'resume_url': data.get('resume_url', ''),
            'updated_at': datetime.now().isoformat()
        }
        
        if existing.data and len(existing.data) > 0:
            supabase.table('profile').update(update_data).eq('id', existing.data[0]['id']).execute()
        else:
            supabase.table('profile').insert(update_data).execute()
        
        return jsonify({'success': True, 'message': 'Profile updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================================================
# API: SKILLS
# ==================================================

@app.route('/api/skills', methods=['GET'])
def get_skills():
    if not supabase:
        return jsonify({'success': True, 'skills': []})
    
    try:
        response = supabase.table('skills').select('*').eq('is_active', True).order('display_order').execute()
        return jsonify({'success': True, 'skills': response.data or []})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/skills/all', methods=['GET'])
@admin_required
def get_all_skills():
    error = check_supabase()
    if error: return error
    try:
        response = supabase.table('skills').select('*').order('display_order').execute()
        return jsonify({'success': True, 'skills': response.data or []})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/skills', methods=['POST'])
@admin_required
def create_skill():
    error = check_supabase()
    if error: return error
    try:
        data = request.get_json()
        if not data.get('name'):
            return jsonify({'success': False, 'message': 'Skill name required'}), 400
        
        skill_data = {
            'name': data['name'],
            'category': data.get('category', 'Programming'),
            'level': int(data.get('level', 80)),
            'icon': data.get('icon', 'fas fa-code'),
            'display_order': int(data.get('display_order', 0)),
            'is_active': data.get('is_active', True)
        }
        response = supabase.table('skills').insert(skill_data).execute()
        return jsonify({'success': True, 'message': 'Skill created', 'skill': response.data[0] if response.data else {}}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/skills/<skill_id>', methods=['PUT'])
@admin_required
def update_skill(skill_id):
    error = check_supabase()
    if error: return error
    try:
        data = request.get_json()
        update_data = {}
        if 'name' in data: update_data['name'] = data['name']
        if 'category' in data: update_data['category'] = data['category']
        if 'level' in data: update_data['level'] = int(data['level'])
        if 'icon' in data: update_data['icon'] = data['icon']
        if 'display_order' in data: update_data['display_order'] = int(data['display_order'])
        if 'is_active' in data: update_data['is_active'] = data['is_active']
        
        supabase.table('skills').update(update_data).eq('id', skill_id).execute()
        return jsonify({'success': True, 'message': 'Skill updated'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/skills/<skill_id>', methods=['DELETE'])
@admin_required
def delete_skill(skill_id):
    error = check_supabase()
    if error: return error
    try:
        supabase.table('skills').delete().eq('id', skill_id).execute()
        return jsonify({'success': True, 'message': 'Skill deleted'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================================================
# API: PROJECTS
# ==================================================

@app.route('/api/projects', methods=['GET'])
def get_projects():
    if not supabase:
        return jsonify({'success': True, 'projects': []})
    
    try:
        response = supabase.table('projects').select('*').eq('is_active', True).order('display_order').execute()
        return jsonify({'success': True, 'projects': response.data or []})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/projects/all', methods=['GET'])
@admin_required
def get_all_projects():
    error = check_supabase()
    if error: return error
    try:
        response = supabase.table('projects').select('*').order('display_order').execute()
        return jsonify({'success': True, 'projects': response.data or []})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/projects', methods=['POST'])
@admin_required
def create_project():
    error = check_supabase()
    if error: return error
    try:
        data = request.get_json()
        if not data.get('title'):
            return jsonify({'success': False, 'message': 'Title required'}), 400
        
        project_data = {
            'title': data['title'],
            'description': data.get('description', ''),
            'image_url': data.get('image_url', ''),
            'technologies': data.get('technologies', ''),
            'category': data.get('category', 'Machine Learning'),
            'github_url': data.get('github_url', ''),
            'live_url': data.get('live_url', ''),
            'is_featured': data.get('is_featured', False),
            'is_active': data.get('is_active', True),
            'display_order': int(data.get('display_order', 0))
        }
        response = supabase.table('projects').insert(project_data).execute()
        return jsonify({'success': True, 'message': 'Project created', 'project': response.data[0] if response.data else {}}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/projects/<project_id>', methods=['PUT'])
@admin_required
def update_project(project_id):
    error = check_supabase()
    if error: return error
    try:
        data = request.get_json()
        update_data = {}
        if 'title' in data: update_data['title'] = data['title']
        if 'description' in data: update_data['description'] = data['description']
        if 'image_url' in data: update_data['image_url'] = data['image_url']
        if 'technologies' in data: update_data['technologies'] = data['technologies']
        if 'category' in data: update_data['category'] = data['category']
        if 'github_url' in data: update_data['github_url'] = data['github_url']
        if 'live_url' in data: update_data['live_url'] = data['live_url']
        if 'is_featured' in data: update_data['is_featured'] = data['is_featured']
        if 'is_active' in data: update_data['is_active'] = data['is_active']
        if 'display_order' in data: update_data['display_order'] = int(data['display_order'])
        
        supabase.table('projects').update(update_data).eq('id', project_id).execute()
        return jsonify({'success': True, 'message': 'Project updated'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/projects/<project_id>', methods=['DELETE'])
@admin_required
def delete_project(project_id):
    error = check_supabase()
    if error: return error
    try:
        supabase.table('projects').delete().eq('id', project_id).execute()
        return jsonify({'success': True, 'message': 'Project deleted'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================================================
# API: EXPERIENCE
# ==================================================

@app.route('/api/experience', methods=['GET'])
def get_experience():
    if not supabase:
        return jsonify({'success': True, 'experience': []})
    
    try:
        response = supabase.table('experience').select('*').order('display_order').execute()
        return jsonify({'success': True, 'experience': response.data or []})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/experience', methods=['POST'])
@admin_required
def create_experience():
    error = check_supabase()
    if error: return error
    try:
        data = request.get_json()
        if not data.get('title'):
            return jsonify({'success': False, 'message': 'Title required'}), 400
        
        exp_data = {
            'title': data['title'],
            'organization': data.get('organization', ''),
            'description': data.get('description', ''),
            'start_date': data.get('start_date', ''),
            'end_date': data.get('end_date', ''),
            'is_current': data.get('is_current', False),
            'display_order': int(data.get('display_order', 0))
        }
        response = supabase.table('experience').insert(exp_data).execute()
        return jsonify({'success': True, 'message': 'Experience created', 'experience': response.data[0] if response.data else {}}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/experience/<exp_id>', methods=['PUT'])
@admin_required
def update_experience(exp_id):
    error = check_supabase()
    if error: return error
    try:
        data = request.get_json()
        update_data = {}
        if 'title' in data: update_data['title'] = data['title']
        if 'organization' in data: update_data['organization'] = data['organization']
        if 'description' in data: update_data['description'] = data['description']
        if 'start_date' in data: update_data['start_date'] = data['start_date']
        if 'end_date' in data: update_data['end_date'] = data['end_date']
        if 'is_current' in data: update_data['is_current'] = data['is_current']
        if 'display_order' in data: update_data['display_order'] = int(data['display_order'])
        
        supabase.table('experience').update(update_data).eq('id', exp_id).execute()
        return jsonify({'success': True, 'message': 'Experience updated'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/experience/<exp_id>', methods=['DELETE'])
@admin_required
def delete_experience(exp_id):
    error = check_supabase()
    if error: return error
    try:
        supabase.table('experience').delete().eq('id', exp_id).execute()
        return jsonify({'success': True, 'message': 'Experience deleted'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================================================
# API: CONTACT
# ==================================================

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    error = check_supabase()
    if error: return error
    try:
        data = request.get_json()
        errors = []
        if not data.get('name') or len(data['name'].strip()) < 2:
            errors.append('Name required')
        if not data.get('email') or not validate_email(data['email']):
            errors.append('Valid email required')
        if not data.get('subject') or len(data['subject'].strip()) < 3:
            errors.append('Subject required')
        if not data.get('message') or len(data['message'].strip()) < 10:
            errors.append('Message required')
        
        if errors:
            return jsonify({'success': False, 'message': '; '.join(errors)}), 400
        
        contact_data = {
            'name': data['name'].strip(),
            'email': data['email'].strip().lower(),
            'subject': data['subject'].strip(),
            'message': data['message'].strip(),
            'is_read': False
        }
        supabase.table('contacts').insert(contact_data).execute()
        return jsonify({'success': True, 'message': 'Message sent successfully!'}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/messages', methods=['GET'])
@admin_required
def get_messages():
    error = check_supabase()
    if error: return error
    try:
        response = supabase.table('contacts').select('*').order('created_at', desc=True).execute()
        return jsonify({'success': True, 'messages': response.data or []})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/messages/<message_id>/read', methods=['PUT'])
@admin_required
def mark_message_read(message_id):
    error = check_supabase()
    if error: return error
    try:
        data = request.get_json()
        is_read = data.get('is_read', True)
        supabase.table('contacts').update({'is_read': is_read}).eq('id', message_id).execute()
        return jsonify({'success': True, 'message': 'Status updated'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/messages/<message_id>', methods=['DELETE'])
@admin_required
def delete_message(message_id):
    error = check_supabase()
    if error: return error
    try:
        supabase.table('contacts').delete().eq('id', message_id).execute()
        return jsonify({'success': True, 'message': 'Message deleted'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================================================
# API: AUTHENTICATION
# ==================================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    error = check_supabase()
    if error: return error
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not name or len(name) < 2:
            return jsonify({'success': False, 'message': 'Name is required'}), 400
        if not email or not validate_email(email):
            return jsonify({'success': False, 'message': 'Valid email required'}), 400
        if not password or len(password) < 6:
            return jsonify({'success': False, 'message': 'Password must be 6+ characters'}), 400
        
        existing = supabase.table('users').select('id').eq('email', email).execute()
        if existing.data and len(existing.data) > 0:
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
        
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # New users get 'user' role
        user_data = {
            'name': name,
            'email': email,
            'password_hash': password_hash,
            'role': 'user'
        }
        
        response = supabase.table('users').insert(user_data).execute()
        user = response.data[0]
        
        token = jwt.encode({
            'user_id': user['id'],
            'email': user['email'],
            'role': user.get('role', 'user'),
            'exp': datetime.utcnow() + timedelta(days=7)
        }, JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'token': token,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user.get('role', 'user')
            }
        }), 201
    except Exception as e:
        print(f"❌ Register error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    error = check_supabase()
    if error: return error
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password required'}), 400
        
        response = supabase.table('users').select('*').eq('email', email).execute()
        if not response.data or len(response.data) == 0:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        
        user = response.data[0]
        
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        
        token = jwt.encode({
            'user_id': user['id'],
            'email': user['email'],
            'role': user.get('role', 'user'),
            'exp': datetime.utcnow() + timedelta(days=7)
        }, JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'name': user.get('name', 'User'),
                'email': user['email'],
                'role': user.get('role', 'user')
            }
        })
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': 'Logged out'})


# ==================================================
# API: USERS (Admin Only)
# ==================================================

@app.route('/api/users', methods=['GET'])
@admin_required
def get_all_users():
    error = check_supabase()
    if error: return error
    try:
        response = supabase.table('users').select('id, name, email, role, created_at').order('created_at', desc=True).execute()
        return jsonify({'success': True, 'users': response.data or []})
    except Exception as e:
        print(f"❌ Users error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    error = check_supabase()
    if error: return error
    try:
        if str(user_id) == str(request.user_id):
            return jsonify({'success': False, 'message': 'Cannot delete yourself'}), 400
        
        supabase.table('users').delete().eq('id', user_id).execute()
        return jsonify({'success': True, 'message': 'User deleted successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ==================================================
# ERROR HANDLERS
# ==================================================

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({'success': False, 'message': 'Endpoint not found'}), 404
    return render_template('index.html'), 404


@app.errorhandler(500)
def server_error(e):
    if request.path.startswith('/api/'):
        return jsonify({'success': False, 'message': 'Internal server error'}), 500
    return render_template('index.html'), 500


# ==================================================
# RUN
# ==================================================

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Portfolio Flask App Starting...")
    print("="*50)
    print(f"📍 URL: http://localhost:5000")
    print(f"📍 Admin: http://localhost:5000/login")
    print("="*50 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)