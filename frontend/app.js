// Configuration
const JAC_SERVER_URL = 'http://localhost:8000';
let currentCareer = null;
let skillsData = [];
let learningPathData = [];
let userExtractedSkills = ['Python', 'SQL'];
let currentUser = null;
let isLoggedIn = false;

// Career skill requirements
const careerRequirements = {
    'AI Engineer': ['Python', 'TensorFlow', 'SQL', 'Machine Learning', 'Deep Learning'],
    'Data Engineer': ['Python', 'SQL', 'Spark', 'Hadoop', 'ETL'],
    'Web Developer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'CSS'],
    'Cloud Architect': ['AWS', 'Azure', 'Kubernetes', 'Docker', 'Infrastructure'],
    'DevOps Engineer': ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'],
    'Machine Learning': ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Statistics'],
    'Data Scientist': ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization']
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupAuthListeners();
    if (isLoggedIn) {
        setupNavigation();
        setupEventListeners();
        loadInitialData();
        setupScrollAnimations();
    }
});

// Authentication Functions
function checkAuthStatus() {
    const sessionUser = localStorage.getItem('currentUser');
    if (sessionUser) {
        currentUser = JSON.parse(sessionUser);
        isLoggedIn = true;
        hideAuthModal();
    } else {
        isLoggedIn = false;
        showAuthModal();
    }
}

function showAuthModal() {
    const modal = document.getElementById('authModal');
    const header = document.getElementById('header');
    const mainContent = document.getElementById('mainContent');
    if (modal) modal.classList.add('active');
    if (header) header.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    document.body.style.overflow = 'hidden';
}

function hideAuthModal() {
    const modal = document.getElementById('authModal');
    const header = document.getElementById('header');
    const mainContent = document.getElementById('mainContent');
    if (modal) modal.classList.remove('active');
    if (header) header.style.display = 'block';
    if (mainContent) mainContent.style.display = 'block';
    document.body.style.overflow = 'auto';
}

function setupAuthListeners() {
    // Screen navigation
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    const switchToLoginFromSignup = document.getElementById('switchToLoginFromSignup');

    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthScreen('signup');
        });
    }
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthScreen('login');
        });
    }
    if (switchToLoginFromSignup) {
        switchToLoginFromSignup.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthScreen('login');
        });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                currentUser = user;
                isLoggedIn = true;
                localStorage.setItem('currentUser', JSON.stringify(user));
                showNotification(`✓ Welcome back, ${user.name}!`, 'success');
                hideAuthModal();
                location.reload();
            } else {
                showNotification('Invalid email or password', 'error');
            }
        });
    }

    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const firstName = document.getElementById('signupFirstName').value;
            const lastName = document.getElementById('signupLastName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            if (!agreeTerms) {
                showNotification('Please agree to the Terms & Conditions', 'error');
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.find(u => u.email === email)) {
                showNotification('Email already registered', 'error');
                return;
            }
            
            const fullName = `${firstName} ${lastName}`;
            const newUser = {
                id: Date.now(),
                name: fullName,
                email: email,
                password: password,
                learning_style: 'balanced',
                target_career: '',
                skills: [],
                connectedMentors: []
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            currentUser = newUser;
            isLoggedIn = true;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            showNotification(`✓ Account created! Welcome, ${fullName}!`, 'success');
            hideAuthModal();
            location.reload();
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            isLoggedIn = false;
            currentUser = null;
            showNotification('✓ Logged out successfully', 'success');
            location.reload();
        });
    }
}

// Show specific auth screen
function showAuthScreen(screenName) {
    document.querySelectorAll('.auth-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const screen = document.getElementById(screenName + 'Screen') || document.getElementById('authChoice');
    if (screen) {
        screen.classList.add('active');
    }
}

// Setup Scroll Animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = getAnimationForElement(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and elements
    document.querySelectorAll('.card, .course-card, .job-card, .mentor-card, .timeline-item, .insight-card').forEach(el => {
        observer.observe(el);
    });
}

// Get animation based on element type
function getAnimationForElement(element) {
    if (element.classList.contains('job-card')) {
        return 'slideInLeft 0.6s ease-out forwards';
    } else if (element.classList.contains('mentor-card')) {
        return 'scaleIn 0.6s ease-out forwards';
    } else if (element.classList.contains('course-card')) {
        return 'slideInUp 0.6s ease-out forwards';
    } else {
        return 'slideInUp 0.6s ease-out forwards';
    }
}

// Navigation Setup
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            showPage(page);
            
            navBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

// Show Page
function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Re-trigger scroll animations for new page
        setTimeout(() => {
            setupScrollAnimations();
        }, 100);
        
        // Load page-specific data
        if (pageName === 'skills') {
            loadSkillGraph();
        } else if (pageName === 'learning') {
            loadLearningPath();
        } else if (pageName === 'jobs') {
            loadJobMarket();
        } else if (pageName === 'mentors') {
            loadMentors();
        } else if (pageName === 'profile') {
            loadProfile();
        }
    }
}

// Event Listeners Setup
function setupEventListeners() {
    setupAuthListeners();
    
    // Career selection
    const careerSelect = document.getElementById('careerSelect');
    const customCareer = document.getElementById('customCareer');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadSkillsBtn = document.getElementById('loadSkillsBtn');
    
    careerSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Custom') {
            customCareer.style.display = 'block';
            customCareer.focus();
        } else {
            customCareer.style.display = 'none';
            if (e.target.value) {
                currentCareer = e.target.value;
            }
        }
    });
    
    customCareer.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            analyzeCareerReadiness();
        }
    });
    
    analyzeBtn.addEventListener('click', analyzeCareerReadiness);
    loadSkillsBtn.addEventListener('click', loadSkillGraph);
    
    // Resume upload
    const uploadResumeBtn = document.getElementById('uploadResumeBtn');
    const resumeFile = document.getElementById('resumeFile');
    
    if (uploadResumeBtn && resumeFile) {
        uploadResumeBtn.addEventListener('click', () => {
            resumeFile.click();
        });
        
        resumeFile.addEventListener('change', handleResumeFileUpload);
    }
    
    // Profile form
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateProfile();
    });
}

// Handle Resume File Upload
function handleResumeFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(2); // KB
    
    showNotification(`📄 Processing ${fileName} (${fileSize} KB)...`, 'info');
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const content = e.target.result;
        
        // For text files, directly use the content
        if (file.type === 'text/plain') {
            document.getElementById('resumeText').value = content;
            showNotification(`✓ Resume loaded: ${fileName}`, 'success');
            return;
        }
        
        // For PDF and DOC files, we'll extract text using a simple approach
        if (file.type === 'application/pdf') {
            extractTextFromPDF(file);
        } else if (file.type === 'application/msword' || 
                   file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            extractTextFromDOC(file);
        } else {
            showNotification('Unsupported file type. Please use TXT, PDF, or DOC/DOCX', 'error');
        }
    };
    
    reader.onerror = () => {
        showNotification('Error reading file', 'error');
    };
    
    reader.readAsText(file);
}

// Extract text from PDF (simplified - requires pdf.js library)
function extractTextFromPDF(file) {
    // For now, show a message that PDF support requires additional library
    const resumeText = `[PDF File: ${file.name}]\n\nNote: PDF text extraction requires additional libraries. Please paste your resume text or use a TXT file instead.`;
    document.getElementById('resumeText').value = resumeText;
    showNotification('📄 PDF uploaded. Please paste the text content or use a TXT file for automatic extraction.', 'info');
}

// Extract text from DOC/DOCX (simplified - requires docx library)
function extractTextFromDOC(file) {
    // For now, show a message that DOC support requires additional library
    const resumeText = `[DOC File: ${file.name}]\n\nNote: DOC/DOCX text extraction requires additional libraries. Please paste your resume text or use a TXT file instead.`;
    document.getElementById('resumeText').value = resumeText;
    showNotification('📄 DOC file uploaded. Please paste the text content or use a TXT file for automatic extraction.', 'info');
}

// Load Initial Data
async function loadInitialData() {
    try {
        // Sync career from Profile page to Dashboard if it exists
        if (currentUser.target_career) {
            const careerSelect = document.getElementById('careerSelect');
            const customCareer = document.getElementById('customCareer');
            
            // Check if career is in the predefined list
            const options = Array.from(careerSelect.options).map(opt => opt.value);
            if (options.includes(currentUser.target_career)) {
                careerSelect.value = currentUser.target_career;
                customCareer.style.display = 'none';
            } else {
                // If custom career, show the custom input field
                careerSelect.value = 'Custom';
                customCareer.value = currentUser.target_career;
                customCareer.style.display = 'block';
            }
            currentCareer = currentUser.target_career;
        }
        
        // Load skills on dashboard
        const skillsResponse = await callWalker('get_skill_graph', {});
        let skills = skillsResponse;
        
        // Handle both direct array and wrapped response
        if (skillsResponse && Array.isArray(skillsResponse)) {
            skills = skillsResponse;
        } else if (skillsResponse && skillsResponse[0] && Array.isArray(skillsResponse[0])) {
            skills = skillsResponse[0];
        }
        
        if (skills && Array.isArray(skills) && skills.length > 0) {
            skillsData = skills;
            displaySkillsOverview(skills);
            displayMarketInsights(skills);
        } else {
            console.log('No skills data received from backend');
        }
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

// Fallback data for when backend walkers don't return data
const fallbackData = {
    get_skill_graph: [
        {"name": "Python", "category": "AI/ML", "difficulty": 3, "market_demand": 0.9},
        {"name": "TensorFlow", "category": "AI/ML", "difficulty": 7, "market_demand": 0.8},
        {"name": "SQL", "category": "Data", "difficulty": 4, "market_demand": 0.7},
        {"name": "JavaScript", "category": "Web", "difficulty": 4, "market_demand": 0.85},
        {"name": "TypeScript", "category": "Web", "difficulty": 5, "market_demand": 0.8},
        {"name": "Go", "category": "Backend", "difficulty": 6, "market_demand": 0.75},
        {"name": "Rust", "category": "Systems", "difficulty": 8, "market_demand": 0.7}
    ],
    mentor_match_agent: [
        {"mentor_name": "Anna Mentor", "expertise": ["Python", "TensorFlow", "Machine Learning"], "score": 0.9, "overlap": 3, "rating": 4.8, "availability": 85},
        {"mentor_name": "Bob Guide", "expertise": ["SQL", "Data Engineering", "Python"], "score": 0.85, "overlap": 2, "rating": 4.6, "availability": 70},
        {"mentor_name": "Carol Expert", "expertise": ["JavaScript", "React", "Web Development"], "score": 0.75, "overlap": 1, "rating": 4.9, "availability": 90},
        {"mentor_name": "David Coach", "expertise": ["Cloud Architecture", "AWS", "DevOps"], "score": 0.65, "overlap": 1, "rating": 4.7, "availability": 60}
    ]
};

// Call Jac Walker
async function callWalker(walkerName, payload = {}) {
    try {
        const url = `${JAC_SERVER_URL}/walker/${walkerName}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Unwrap Jac Cloud response
        if (data.reports && Array.isArray(data.reports) && data.reports.length > 0) {
            return data.reports[0];
        }
        
        // If backend returns empty reports, use fallback data
        if (fallbackData[walkerName]) {
            console.log(`Backend returned empty reports for ${walkerName}, using fallback data`);
            return fallbackData[walkerName];
        }
        
        return data;
    } catch (error) {
        console.error(`Error calling walker ${walkerName}:`, error);
        // Use fallback data on error
        if (fallbackData[walkerName]) {
            console.log(`Error calling ${walkerName}, using fallback data`);
            return fallbackData[walkerName];
        }
        showNotification(`Error calling ${walkerName}: ${error.message}`, 'error');
        return null;
    }
}

// Show Loading State
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<p class="placeholder">Loading...</p>';
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Analyze Career Readiness
async function analyzeCareerReadiness() {
    const careerSelect = document.getElementById('careerSelect');
    const customCareer = document.getElementById('customCareer');
    
    let career = careerSelect.value;
    if (career === 'Custom') {
        career = customCareer.value;
        if (!career) {
            showNotification('Please enter a custom career title', 'error');
            return;
        }
    } else if (!career) {
        showNotification('Please select a career', 'error');
        return;
    }
    
    currentCareer = career;
    currentUser.target_career = career;
    
    try {
        showNotification(`Analyzing readiness for ${career}...`, 'info');
        
        // Calculate readiness based on extracted skills
        const readinessScore = calculateReadiness(career, userExtractedSkills);
        
        // Generate personalized learning path based on skill gaps
        const path = generateLearningPath(career, userExtractedSkills);
        
        // Display results
        displayReadiness(readinessScore, career);
        if (path) {
            learningPathData = path;
            displayLearningPath(path);
        }
        
        showNotification(`✓ Analysis complete for ${career}!`, 'success');
    } catch (error) {
        showNotification('Error analyzing career readiness', 'error');
    }
}

// Calculate readiness score based on user skills vs career requirements
function calculateReadiness(career, userSkills) {
    const requirements = careerRequirements[career] || ['Python'];
    
    if (requirements.length === 0) return 0;
    
    let matched = 0;
    for (let req of requirements) {
        for (let skill of userSkills) {
            if (skill.toLowerCase().includes(req.toLowerCase()) || 
                req.toLowerCase().includes(skill.toLowerCase())) {
                matched++;
                break;
            }
        }
    }
    
    return matched / requirements.length;
}

// Generate personalized learning path based on skill gaps
function generateLearningPath(career, userSkills) {
    const requirements = careerRequirements[career] || ['Python'];
    const gaps = [];
    
    for (let req of requirements) {
        let hasSkill = false;
        for (let skill of userSkills) {
            if (skill.toLowerCase().includes(req.toLowerCase()) || 
                req.toLowerCase().includes(skill.toLowerCase())) {
                hasSkill = true;
                break;
            }
        }
        if (!hasSkill) {
            gaps.push(req);
        }
    }
    
    // Create learning path from skill gaps
    if (gaps.length === 0) {
        return ['Advanced Topics', 'Specialization', 'Leadership Skills'];
    }
    
    return gaps.map(skill => `Master ${skill}`);
}

// Display Readiness
function displayReadiness(score, career) {
    const percent = Math.round((score || 0) * 100);
    document.getElementById('readinessPercent').textContent = percent;
    
    let readinessText = `You are ${percent}% ready for ${career}`;
    if (percent < 30) {
        readinessText += ' - Start with foundational courses';
    } else if (percent < 60) {
        readinessText += ' - You have some skills, build on them';
    } else if (percent < 90) {
        readinessText += ' - You\'re well-prepared, focus on advanced topics';
    } else {
        readinessText += ' - You\'re highly ready for this role!';
    }
    
    document.getElementById('readinessText').textContent = readinessText;
    document.getElementById('readinessBar').style.width = `${percent}%`;
}

// Display Learning Path
function displayLearningPath(path) {
    const pathList = document.getElementById('pathList');
    
    if (!path || !Array.isArray(path) || path.length === 0) {
        pathList.innerHTML = '<p class="placeholder">No learning path available</p>';
        return;
    }
    
    pathList.innerHTML = path.map((item, idx) => `
        <div class="path-item">
            <strong>${idx + 1}. ${item}</strong>
        </div>
    `).join('');
}

// Display Skills Overview
function displaySkillsOverview(skills) {
    const skillsList = document.getElementById('skillsList');
    
    if (!skills || skills.length === 0) {
        skillsList.innerHTML = '<p class="placeholder">No skills loaded</p>';
        return;
    }
    
    skillsList.innerHTML = skills.slice(0, 6).map(skill => `
        <span class="skill-tag">${skill.name}</span>
    `).join('');
}

// Display Market Insights
function displayMarketInsights(skills) {
    const demandSkills = document.getElementById('demandSkills');
    
    if (!skills || skills.length === 0) {
        return;
    }
    
    // Sort by market demand
    const sorted = [...skills].sort((a, b) => (b.market_demand || 0) - (a.market_demand || 0));
    
    demandSkills.innerHTML = sorted.slice(0, 5).map(skill => `
        <span class="tag">${skill.name} (${Math.round((skill.market_demand || 0) * 100)}%)</span>
    `).join('');
    
    // Trends
    const trends = document.getElementById('trends');
    trends.innerHTML = `
        <div class="trend-item">
            <strong>AI/ML Skills</strong> - Highest demand growth (15% YoY)
        </div>
        <div class="trend-item">
            <strong>Cloud Platforms</strong> - AWS, GCP, Azure in high demand
        </div>
        <div class="trend-item">
            <strong>Data Engineering</strong> - Growing 12% annually
        </div>
    `;
}

// Load Skill Graph
async function loadSkillGraph() {
    try {
        showLoading('skillsTableBody');
        
        let skills = skillsData;
        if (!skills || skills.length === 0) {
            const skillsResponse = await callWalker('get_skill_graph', {});
            
            // Handle both direct array and wrapped response
            if (skillsResponse && Array.isArray(skillsResponse)) {
                skills = skillsResponse;
            } else if (skillsResponse && skillsResponse[0] && Array.isArray(skillsResponse[0])) {
                skills = skillsResponse[0];
            }
        }
        
        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            document.getElementById('skillsTableBody').innerHTML = '<tr><td colspan="4" class="placeholder">No skills data available</td></tr>';
            showNotification('No skills data available', 'error');
            return;
        }
        
        skillsData = skills;
        
        // Display table
        const tbody = document.getElementById('skillsTableBody');
        tbody.innerHTML = skills.map(skill => `
            <tr>
                <td>${skill.name}</td>
                <td>${skill.category}</td>
                <td>${skill.difficulty}/10</td>
                <td>${Math.round((skill.market_demand || 0) * 100)}%</td>
            </tr>
        `).join('');
        
        // Draw simple chart
        setTimeout(() => drawSkillChart(skills), 100);
        
        showNotification('✓ Skills loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading skills:', error);
        showNotification('Error loading skills', 'error');
    }
}

// Draw Skill Chart
function drawSkillChart(skills) {
    const canvas = document.getElementById('skillsCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.offsetWidth - 20;
    const height = 300;
    
    canvas.width = width;
    canvas.height = height;
    
    if (!skills || skills.length === 0) return;
    
    // Simple bar chart
    const barWidth = width / skills.length;
    const maxDemand = Math.max(...skills.map(s => s.market_demand || 0), 1);
    
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    skills.forEach((skill, idx) => {
        const barHeight = ((skill.market_demand || 0) / maxDemand) * (height - 40);
        const x = idx * barWidth + 10;
        const y = height - barHeight - 20;
        
        // Bar
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x, y, barWidth - 20, barHeight);
        
        // Label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(skill.name, x + (barWidth - 20) / 2, height - 5);
    });
}

// Load Learning Path
async function loadLearningPath() {
    if (!currentCareer) {
        document.getElementById('timeline').innerHTML = '<p class="placeholder">Select a career on the Dashboard first</p>';
        return;
    }
    
    try {
        showLoading('timeline');
        
        let path = learningPathData;
        if (!path || path.length === 0) {
            path = await callWalker('learning_path_agent', {
                target_career_title: currentCareer
            });
        }
        
        if (!path || !Array.isArray(path)) {
            document.getElementById('timeline').innerHTML = '<p class="placeholder">No learning path available</p>';
            showNotification('No learning path available for this career', 'error');
            return;
        }
        
        learningPathData = path;
        
        // Display timeline
        const timeline = document.getElementById('timeline');
        timeline.innerHTML = path.map((item, idx) => `
            <div class="timeline-item">
                <div class="timeline-marker">${idx + 1}</div>
                <div class="timeline-content">
                    <h4>${item}</h4>
                    <p>Complete this module to progress in your learning journey</p>
                </div>
            </div>
        `).join('');
        
        // Display sample courses
        displaySampleCourses(path);
        
        showNotification('✓ Learning path loaded', 'success');
    } catch (error) {
        showNotification('Error loading learning path', 'error');
    }
}

// Display Sample Courses
function displaySampleCourses(path) {
    const coursesList = document.getElementById('coursesList');
    
    const sampleCourses = [
        {
            title: 'Python Fundamentals',
            provider: 'Coursera',
            duration: '4 weeks',
            difficulty: 'Beginner'
        },
        {
            title: 'Advanced Machine Learning',
            provider: 'Udacity',
            duration: '8 weeks',
            difficulty: 'Advanced'
        },
        {
            title: 'Data Engineering Essentials',
            provider: 'LinkedIn Learning',
            duration: '6 weeks',
            difficulty: 'Intermediate'
        },
        {
            title: 'Web Development Bootcamp',
            provider: 'Codecademy',
            duration: '12 weeks',
            difficulty: 'Intermediate'
        },
        {
            title: 'Cloud Architecture Fundamentals',
            provider: 'A Cloud Guru',
            duration: '5 weeks',
            difficulty: 'Intermediate'
        },
        {
            title: 'System Design Interview Prep',
            provider: 'Educative',
            duration: '6 weeks',
            difficulty: 'Advanced'
        }
    ];
    
    coursesList.innerHTML = sampleCourses.map(course => `
        <div class="course-card">
            <h4>${course.title}</h4>
            <p>${course.provider}</p>
            <div class="course-meta">
                <span>⏱️ ${course.duration}</span>
                <span>📊 ${course.difficulty}</span>
            </div>
        </div>
    `).join('');
}

// Load Job Market
async function loadJobMarket() {
    if (!currentCareer) {
        document.getElementById('jobsList').innerHTML = '<p class="placeholder">Select a career on the Dashboard first</p>';
        return;
    }
    
    try {
        showLoading('jobsList');
        
        let skills = skillsData;
        if (!skills || skills.length === 0) {
            const skillsResponse = await callWalker('get_skill_graph', {});
            
            // Handle both direct array and wrapped response
            if (skillsResponse && Array.isArray(skillsResponse)) {
                skills = skillsResponse;
            } else if (skillsResponse && skillsResponse[0] && Array.isArray(skillsResponse[0])) {
                skills = skillsResponse[0];
            }
        }
        
        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            showNotification('Error loading job market data', 'error');
            return;
        }
        
        // Display sample jobs
        displaySampleJobs(currentCareer);
        
        // Draw demand chart
        setTimeout(() => drawDemandChart(skills), 100);
        
        showNotification('✓ Job market data loaded', 'success');
    } catch (error) {
        console.error('Error loading job market:', error);
        showNotification('Error loading job market', 'error');
    }
}

// Display Sample Jobs
function displaySampleJobs(career) {
    const jobsList = document.getElementById('jobsList');
    
    const sampleJobs = [
        {
            title: `Senior ${career}`,
            company: 'Tech Corp',
            location: 'San Francisco, CA',
            salary: '$150k - $200k',
            skills: ['Python', 'TensorFlow', 'SQL']
        },
        {
            title: `${career} - Mid Level`,
            company: 'StartUp Inc',
            location: 'Remote',
            salary: '$120k - $160k',
            skills: ['Python', 'SQL', 'JavaScript']
        },
        {
            title: `Junior ${career}`,
            company: 'Learning Labs',
            location: 'New York, NY',
            salary: '$80k - $120k',
            skills: ['Python', 'SQL']
        },
        {
            title: `Lead ${career}`,
            company: 'Enterprise Solutions',
            location: 'Austin, TX',
            salary: '$180k - $250k',
            skills: ['Python', 'TensorFlow', 'Kubernetes', 'AWS']
        },
        {
            title: `${career} Intern`,
            company: 'Tech Startup',
            location: 'Boston, MA',
            salary: '$25/hr - $35/hr',
            skills: ['Python', 'Git']
        }
    ];
    
    jobsList.innerHTML = sampleJobs.map(job => `
        <div class="job-card">
            <h4>${job.title}</h4>
            <div class="job-meta">
                <span>🏢 ${job.company}</span>
                <span>📍 ${job.location}</span>
                <span>💰 ${job.salary}</span>
            </div>
            <div class="job-skills">
                ${job.skills.map(skill => `<span class="job-skill">${skill}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// Draw Demand Chart
function drawDemandChart(skills) {
    const canvas = document.getElementById('demandCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.offsetWidth - 40;
    const height = 250;
    
    canvas.width = width;
    canvas.height = height;
    
    if (!skills || skills.length === 0) return;
    
    // Simple line chart
    const sorted = [...skills].sort((a, b) => (b.market_demand || 0) - (a.market_demand || 0));
    const maxDemand = Math.max(...sorted.map(s => s.market_demand || 0), 1);
    
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw line
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    sorted.forEach((skill, idx) => {
        const x = (width / sorted.length) * idx;
        const y = height - (((skill.market_demand || 0) / maxDemand) * (height - 40)) - 20;
        
        if (idx === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw point
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    sorted.forEach((skill, idx) => {
        const x = (width / sorted.length) * idx;
        ctx.fillText(skill.name, x, height - 5);
    });
}

// Load Mentors
async function loadMentors() {
    try {
        showLoading('mentorsList');
        
        const mentorsResponse = await callWalker('mentor_match_agent', {});
        let mentors = mentorsResponse;
        
        // Handle both direct array and wrapped response
        if (mentorsResponse && Array.isArray(mentorsResponse)) {
            mentors = mentorsResponse;
        } else if (mentorsResponse && mentorsResponse[0] && Array.isArray(mentorsResponse[0])) {
            mentors = mentorsResponse[0];
        }
        
        if (!mentors || !Array.isArray(mentors) || mentors.length === 0) {
            document.getElementById('mentorsList').innerHTML = '<p class="placeholder">No mentors available</p>';
            showNotification('No mentors available', 'error');
            return;
        }
        
        displayMentors(mentors);
        updateConnectedMentorButtons();
        showNotification('✓ Mentors loaded', 'success');
    } catch (error) {
        console.error('Error loading mentors:', error);
        showNotification('Error loading mentors', 'error');
    }
}

// Display Mentors
function displayMentors(mentors) {
    const mentorsList = document.getElementById('mentorsList');
    
    if (!mentors || mentors.length === 0) {
        mentorsList.innerHTML = '<p class="placeholder">No mentors available</p>';
        return;
    }
    
    mentorsList.innerHTML = mentors.map((mentor, index) => {
        const rating = mentor.rating || 0;
        const stars = '⭐'.repeat(Math.round(rating));
        const availability = mentor.availability || 0;
        const expertise = (mentor.expertise || []).join(', ');
        
        return `
            <div class="mentor-card">
                <div class="mentor-avatar">👤</div>
                <h4>${mentor.mentor_name || 'Mentor'}</h4>
                <p class="mentor-title">Expert Mentor</p>
                <div class="mentor-rating">
                    <span class="stars">${stars}</span>
                    <span>${rating.toFixed(1)}/5.0</span>
                </div>
                <div class="mentor-skills">
                    <span class="mentor-skill">Expertise: ${expertise}</span>
                    <span class="mentor-skill">Overlap: ${mentor.overlap || 0} skills</span>
                </div>
                <p class="mentor-availability">Available: ${availability}% of time</p>
                <button class="btn btn-primary" onclick="connectWithMentor('${mentor.mentor_name}', ${index})">Connect</button>
            </div>
        `;
    }).join('');
}

// Connect with Mentor
function connectWithMentor(mentorName, mentorIndex) {
    const connectedMentors = JSON.parse(localStorage.getItem('connectedMentors') || '[]');
    
    if (!connectedMentors.includes(mentorName)) {
        connectedMentors.push(mentorName);
        localStorage.setItem('connectedMentors', JSON.stringify(connectedMentors));
        showNotification(`✓ Connected with ${mentorName}!`, 'success');
    } else {
        showNotification(`Already connected with ${mentorName}`, 'info');
    }
    
    // Update button state
    const buttons = document.querySelectorAll('.mentor-card button');
    if (buttons[mentorIndex]) {
        buttons[mentorIndex].textContent = 'Connected ✓';
        buttons[mentorIndex].disabled = true;
        buttons[mentorIndex].style.opacity = '0.6';
    }
}

// Update Connected Mentor Buttons
function updateConnectedMentorButtons() {
    const connectedMentors = JSON.parse(localStorage.getItem('connectedMentors') || '[]');
    const buttons = document.querySelectorAll('.mentor-card button');
    const mentorCards = document.querySelectorAll('.mentor-card h4');
    
    buttons.forEach((button, index) => {
        if (mentorCards[index]) {
            const mentorName = mentorCards[index].textContent;
            if (connectedMentors.includes(mentorName)) {
                button.textContent = 'Connected ✓';
                button.disabled = true;
                button.style.opacity = '0.6';
            }
        }
    });
}

// Load Profile
function loadProfile() {
    document.getElementById('userName').value = currentUser.name;
    document.getElementById('learningStyle').value = currentUser.learning_style;
    document.getElementById('targetCareer').value = currentUser.target_career || currentCareer || '';
    
    // Display progress
    const progressList = document.getElementById('progressList');
    progressList.innerHTML = `
        <div class="progress-item">
            <h4>Python Fundamentals</h4>
            <p>Completed 5 of 8 modules</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 62.5%"></div>
            </div>
        </div>
        <div class="progress-item">
            <h4>SQL for Data Analysis</h4>
            <p>Completed 3 of 6 modules</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 50%"></div>
            </div>
        </div>
        <div class="progress-item">
            <h4>Web Development Basics</h4>
            <p>Completed 2 of 5 modules</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 40%"></div>
            </div>
        </div>
        <div class="progress-item">
            <h4>Machine Learning Essentials</h4>
            <p>Completed 1 of 7 modules</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 14%"></div>
            </div>
        </div>
    `;
}

// Update Profile
async function updateProfile() {
    const name = document.getElementById('userName').value;
    const style = document.getElementById('learningStyle').value;
    const career = document.getElementById('targetCareer').value;
    const resume = document.getElementById('resumeText').value;
    
    if (!name || !career) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    currentUser.name = name;
    currentUser.learning_style = style;
    currentUser.target_career = career;
    currentUser.skills = userExtractedSkills;
    
    try {
        if (resume) {
            showNotification('Analyzing your resume...', 'info');
            const extractedSkills = await callWalker('skill_analyzer_agent', {
                resume_text: resume
            });
            
            if (extractedSkills && Array.isArray(extractedSkills)) {
                // Update user's skills from resume analysis
                userExtractedSkills = extractedSkills;
                currentUser.skills = extractedSkills;
                
                showNotification(`✓ Profile updated! Found skills: ${extractedSkills.join(', ')}`, 'success');
                
                // If career is selected, recalculate readiness
                if (career && career !== '') {
                    const newReadiness = calculateReadiness(career, userExtractedSkills);
                    const newPath = generateLearningPath(career, userExtractedSkills);
                    
                    displayReadiness(newReadiness, career);
                    displayLearningPath(newPath);
                    
                    showNotification(`✓ Career readiness updated to ${Math.round(newReadiness * 100)}%!`, 'success');
                }
            } else {
                showNotification('✓ Profile updated (skill analysis completed)', 'success');
            }
        } else {
            showNotification('✓ Profile updated successfully!', 'success');
        }
    } catch (error) {
        showNotification('Profile updated (skill analysis skipped)', 'success');
    }
    
    // Save updated user profile to localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex >= 0) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}
