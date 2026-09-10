-- ==================================================
-- PORTFOLIO DATABASE SCHEMA
-- Supabase PostgreSQL
-- ==================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- USERS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- PROFILE TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL DEFAULT 'Zaheer Ahmed',
    title VARCHAR(150) DEFAULT 'AI/ML Developer',
    bio TEXT DEFAULT 'Building intelligent solutions with Machine Learning, Python and modern web technologies.',
    about TEXT DEFAULT 'I am an AI/ML Developer passionate about building intelligent solutions.',
    email VARCHAR(255) DEFAULT 'contact@example.com',
    phone VARCHAR(20),
    location VARCHAR(100),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    profile_image_url VARCHAR(500),
    resume_url VARCHAR(500),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- SKILLS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'Programming',
    level INTEGER DEFAULT 80 CHECK (level >= 0 AND level <= 100),
    icon VARCHAR(100) DEFAULT 'fas fa-code',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- PROJECTS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    technologies VARCHAR(500),
    category VARCHAR(50) DEFAULT 'Machine Learning',
    github_url VARCHAR(500),
    live_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- EXPERIENCE TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    organization VARCHAR(200),
    description TEXT,
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    is_current BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- CONTACTS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- INDEXES
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_active ON skills(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_contacts_read ON contacts(is_read);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at DESC);

-- ==================================================
-- DEFAULT PROFILE DATA
-- ==================================================
INSERT INTO profile (name, title, bio, about, email, location, github_url, linkedin_url)
VALUES (
    'Zaheer Ahmed',
    'AI/ML Developer',
    'Building intelligent solutions with Machine Learning, Python and modern web technologies.',
    'I am an AI/ML Developer passionate about building intelligent solutions using Machine Learning, Python, and modern web technologies. I focus on creating practical applications that solve real-world problems.',
    'zaheerahmed@example.com',
    'Pakistan',
    'https://github.com/zaheerahmed10',
    'https://linkedin.com/in/zaheerahmed'
) ON CONFLICT DO NOTHING;

-- ==================================================
-- DEFAULT SKILLS
-- ==================================================
INSERT INTO skills (name, category, level, icon, display_order) VALUES
('Python', 'Programming', 90, 'fab fa-python', 1),
('JavaScript', 'Programming', 85, 'fab fa-js', 2),
('Scikit-learn', 'Machine Learning', 85, 'fas fa-brain', 3),
('Pandas', 'Machine Learning', 88, 'fas fa-table', 4),
('NumPy', 'Machine Learning', 85, 'fas fa-calculator', 5),
('Flask', 'Backend', 82, 'fas fa-flask', 6),
('REST APIs', 'Backend', 80, 'fas fa-server', 7),
('PostgreSQL', 'Database', 78, 'fas fa-database', 8),
('Supabase', 'Database', 80, 'fas fa-cloud', 9),
('Git', 'Tools', 85, 'fab fa-git-alt', 10),
('GitHub', 'Tools', 88, 'fab fa-github', 11),
('VS Code', 'Tools', 90, 'fas fa-code', 12)
ON CONFLICT DO NOTHING;

-- ==================================================
-- DEFAULT PROJECTS
-- ==================================================
INSERT INTO projects (title, description, technologies, category, is_featured) VALUES
('SmartWatt Pakistan', 'Machine Learning regression project for electricity consumption and cost prediction using historical data.', 'Python, Scikit-learn, Pandas, NumPy', 'Machine Learning', TRUE),
('Heart Disease Prediction', 'Machine Learning classification project using Logistic Regression, Gaussian Naive Bayes and KNN algorithms.', 'Python, Scikit-learn, Pandas, Matplotlib', 'Machine Learning', TRUE),
('School Attendance System', 'Full-stack attendance management system with authentication and database integration.', 'Python, Flask, PostgreSQL, HTML, CSS, JavaScript', 'Full Stack', TRUE)
ON CONFLICT DO NOTHING;

-- ==================================================
-- DEFAULT EXPERIENCE
-- ==================================================
INSERT INTO experience (title, organization, description, start_date, end_date, is_current, display_order) VALUES
('Bachelor of Science in Computer Science', 'University', 'Currently pursuing BSCS with focus on Machine Learning and Web Development.', '2023', 'Present', TRUE, 1),
('AI/ML Developer', 'Self-Employed', 'Building machine learning projects and web applications using Python and modern frameworks.', '2024', 'Present', TRUE, 2)
ON CONFLICT DO NOTHING;

-- ==================================================
-- ROW LEVEL SECURITY
-- ==================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- ==================================================
-- STORAGE BUCKET
-- ==================================================
-- Run these in Supabase SQL Editor to create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-images', 'project-images', true)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT DO NOTHING;