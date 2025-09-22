 // Database Management System using localStorage
        class EduQuestDB {
            constructor() {
                this.dbName = 'eduquest_db';
                this.initializeDB();
            }
            
            initializeDB() {
                if (!localStorage.getItem(this.dbName)) {
                    const initialDB = {
                        users: {},
                        sessions: {},
                        leaderboard: [],
                        lastUpdated: new Date().toISOString()
                    };
                    localStorage.setItem(this.dbName, JSON.stringify(initialDB));
                    this.createDemoUsers();
                }
            }
            
            createDemoUsers() {
                // Create demo users with some progress
                const demoUsers = [
                    {
                        username: 'demo1',
                        password: 'demo123',
                        fullName: 'Alex Johnson',
                        class: 8,
                        stars: 1250,
                        streak: 7,
                        level: 3,
                        totalVideosWatched: 25,
                        dailyGoal: 2,
                        joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        studyTime: 450 // minutes
                    },
                    {
                        username: 'demo2',
                        password: 'demo123',
                        fullName: 'Priya Sharma',
                        class: 10,
                        stars: 2100,
                        streak: 12,
                        level: 5,
                        totalVideosWatched: 45,
                        dailyGoal: 3,
                        joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                        lastLogin: new Date().toISOString(),
                        studyTime: 720 // minutes
                    }
                ];
                
                demoUsers.forEach(user => {
                    this.createUser(user.username, user.password, user.fullName, user.class, user);
                });
            }
            
            getDB() {
                return JSON.parse(localStorage.getItem(this.dbName));
            }
            
            saveDB(db) {
                db.lastUpdated = new Date().toISOString();
                localStorage.setItem(this.dbName, JSON.stringify(db));
            }
            
            createUser(username, password, fullName, userClass, additionalData = {}) {
                const db = this.getDB();
                
                if (db.users[username]) {
                    return { success: false, message: 'Username already exists' };
                }
                
                const newUser = {
                    username,
                    password, // In production, this should be hashed
                    fullName,
                    class: userClass,
                    stars: additionalData.stars || 0,
                    streak: additionalData.streak || 0,
                    level: additionalData.level || 1,
                    totalVideosWatched: additionalData.totalVideosWatched || 0,
                    dailyGoal: additionalData.dailyGoal || 0,
                    studyTime: additionalData.studyTime || 0,
                    joinDate: additionalData.joinDate || new Date().toISOString(),
                    lastLogin: additionalData.lastLogin || new Date().toISOString(),
                    progress: this.initializeUserProgress(userClass),
                    recentActivity: [],
                    achievements: [],
                    notes: {}
                };
                
                db.users[username] = newUser;
                this.saveDB(db);
                
                return { success: true, user: newUser };
            }
            
            authenticateUser(username, password) {
                const db = this.getDB();
                const user = db.users[username];
                
                if (!user || user.password !== password) {
                    return { success: false, message: 'Invalid username or password' };
                }
                
                // Update last login
                user.lastLogin = new Date().toISOString();
                db.users[username] = user;
                this.saveDB(db);
                
                return { success: true, user };
            }
            
            updateUser(username, updates) {
                const db = this.getDB();
                if (!db.users[username]) {
                    return { success: false, message: 'User not found' };
                }
                
                db.users[username] = { ...db.users[username], ...updates };
                this.saveDB(db);
                
                return { success: true, user: db.users[username] };
            }
            
            initializeUserProgress(userClass) {
                const progress = {};
                Object.keys(subjectTopics).forEach(subject => {
                    progress[subject] = {};
                    const topics = subjectTopics[subject][userClass] || [];
                    topics.forEach(topic => {
                        progress[subject][topic] = {
                            completed: false,
                            progress: 0,
                            videosWatched: 0,
                            totalVideos: 3,
                            timeSpent: 0,
                            lastAccessed: null
                        };
                    });
                });
                return progress;
            }
            
            addActivity(username, activity) {
                const db = this.getDB();
                if (!db.users[username]) return;
                
                const user = db.users[username];
                if (!user.recentActivity) user.recentActivity = [];
                
                user.recentActivity.unshift({
                    ...activity,
                    timestamp: new Date().toISOString()
                });
                
                // Keep only last 10 activities
                user.recentActivity = user.recentActivity.slice(0, 10);
                
                db.users[username] = user;
                this.saveDB(db);
            }
            
            getLeaderboard() {
                const db = this.getDB();
                const users = Object.values(db.users);
                
                return users
                    .sort((a, b) => b.stars - a.stars)
                    .slice(0, 10)
                    .map((user, index) => ({
                        rank: index + 1,
                        username: user.username,
                        fullName: user.fullName,
                        stars: user.stars,
                        level: user.level,
                        streak: user.streak,
                        class: user.class
                    }));
            }
            
            resetUserProgress(username) {
                const db = this.getDB();
                if (!db.users[username]) return { success: false };
                
                const user = db.users[username];
                user.progress = this.initializeUserProgress(user.class);
                user.stars = 0;
                user.streak = 0;
                user.level = 1;
                user.totalVideosWatched = 0;
                user.dailyGoal = 0;
                user.studyTime = 0;
                user.recentActivity = [];
                user.achievements = [];
                
                db.users[username] = user;
                this.saveDB(db);
                
                return { success: true, user };
            }
        }
        
        // Initialize database
        const db = new EduQuestDB();
        
        // Global variables
        let currentSlide = 0;
        let currentClass = 6;
        let currentSubject = '';
        let currentUser = null;
        let currentTopicIndex = 0;
        let currentTopicName = '';
        let currentVideoIndex = 0;
        

        
        // Subject topics data structure
        const subjectTopics = {
            mathematics: {
                6: ['Number Systems', 'Whole Numbers', 'Playing with Numbers', 'Basic Geometry', 'Fractions'],
                7: ['Integers', 'Fractions & Decimals', 'Data Handling', 'Simple Equations', 'Lines & Angles'],
                8: ['Rational Numbers', 'Linear Equations', 'Quadrilaterals', 'Data Handling', 'Squares & Square Roots'],
                9: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations', 'Triangles'],
                10: ['Real Numbers', 'Polynomials', 'Linear Equations', 'Quadratic Equations', 'Arithmetic Progressions'],
                11: ['Sets', 'Relations & Functions', 'Trigonometry', 'Complex Numbers', 'Linear Inequalities'],
                12: ['Relations & Functions', 'Inverse Trigonometry', 'Matrices', 'Determinants', 'Continuity']
            },
            physics: {
                6: ['Motion & Measurement', 'Light & Shadows', 'Electricity', 'Fun with Magnets', 'Water & Air'],
                7: ['Heat', 'Acids & Bases', 'Physical & Chemical Changes', 'Weather & Climate', 'Winds & Storms'],
                8: ['Force & Pressure', 'Friction', 'Sound', 'Chemical Effects of Current', 'Natural Phenomena'],
                9: ['Motion', 'Force & Laws of Motion', 'Gravitation', 'Work & Energy', 'Sound'],
                10: ['Light', 'Human Eye', 'Electricity', 'Magnetic Effects', 'Sources of Energy'],
                11: ['Physical World', 'Units & Measurements', 'Motion in Straight Line', 'Motion in Plane', 'Laws of Motion'],
                12: ['Electric Charges', 'Electric Potential', 'Current Electricity', 'Magnetic Field', 'Electromagnetic Induction']
            },
            chemistry: {
                6: ['Food & Its Components', 'Materials & Their Properties', 'Water', 'Air Around Us', 'Garbage Management'],
                7: ['Acids & Bases', 'Physical & Chemical Changes', 'Fiber to Fabric', 'Heat', 'Respiration in Organisms'],
                8: ['Synthetic Fibers', 'Materials & Metals', 'Coal & Petroleum', 'Combustion & Flame', 'Force & Pressure'],
                9: ['Matter Around Us', 'Pure Substances', 'Atoms & Molecules', 'Structure of Atom', 'Fundamental Unit of Life'],
                10: ['Chemical Reactions', 'Acids & Bases', 'Metals & Non-metals', 'Carbon Compounds', 'Life Processes'],
                11: ['Basic Concepts', 'Structure of Atom', 'Chemical Bonding', 'States of Matter', 'Thermodynamics'],
                12: ['Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry']
            },
            biology: {
                6: ['Food & Health', 'Body Movements', 'Living & Non-living', 'Plants & Animals', 'Environment'],
                7: ['Nutrition in Plants', 'Animal Nutrition', 'Fiber to Fabric', 'Heat', 'Respiration in Organisms'],
                8: ['Crop Production', 'Microorganisms', 'Cell Structure', 'Reproduction in Animals', 'Light'],
                9: ['Fundamental Unit of Life', 'Tissues', 'Diversity in Living', 'Disease & Health', 'Natural Resources'],
                10: ['Life Processes', 'Control & Coordination', 'Reproduction', 'Heredity & Evolution', 'Natural Resource Management'],
                11: ['Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom', 'Morphology of Plants'],
                12: ['Reproduction in Organisms', 'Sexual Reproduction', 'Human Reproduction', 'Reproductive Health', 'Heredity']
            }
        };
        
        // Puzzle suggestions for each subject
        const puzzleSuggestions = {
            mathematics: [
                '🔢 Number Pattern Detective: Find the missing numbers in sequences',
                '🧮 Magic Square Challenge: Complete the 3x3 magic square',
                '📐 Shape Puzzle Master: Identify and count geometric shapes',
                '🎯 Equation Solver: Balance the mathematical equations',
                '🔍 Prime Number Hunt: Find all prime numbers in a range'
            ],
            physics: [
                '⚡ Circuit Builder: Connect wires to light up the bulb',
                '🌈 Light Spectrum Sorter: Arrange colors in correct order',
                '🔊 Sound Wave Matcher: Match sounds with their wave patterns',
                '⚖️ Force Balance Game: Balance objects using different forces',
                '🌍 Gravity Drop Challenge: Predict where objects will land'
            ],
            chemistry: [
                '🧪 Element Mixer: Combine elements to create compounds',
                '⚗️ Reaction Predictor: Guess the products of chemical reactions',
                '🔬 Periodic Table Puzzle: Place elements in correct positions',
                '💧 pH Level Detective: Test and identify acid/base solutions',
                '🔥 Combustion Challenge: Identify what burns and what doesn\'t'
            ],
            biology: [
                '🌱 Plant Part Identifier: Match plant parts with their functions',
                '🦴 Human Body Builder: Assemble the skeletal system',
                '🔬 Cell Organelle Matcher: Place organelles in correct positions',
                '🍃 Food Chain Constructor: Build complete food chains',
                '🧬 DNA Sequence Puzzle: Complete the genetic code patterns'
            ]
        };
        
        // Authentication Functions
        function validateForm(formType) {
            const errors = {};
            
            if (formType === 'login') {
                const username = document.getElementById('loginUsername').value.trim();
                const password = document.getElementById('loginPassword').value;
                
                if (!username) errors.username = 'Username is required';
                if (!password) errors.password = 'Password is required';
                
                return { isValid: Object.keys(errors).length === 0, errors };
            } else {
                const fullName = document.getElementById('signupFullName').value.trim();
                const username = document.getElementById('signupUsername').value.trim();
                const userClass = document.getElementById('signupClass').value;
                const password = document.getElementById('signupPassword').value;
                const confirmPassword = document.getElementById('signupConfirmPassword').value;
                
                if (!fullName) errors.fullName = 'Full name is required';
                if (!username) errors.username = 'Username is required';
                if (username.length < 3) errors.username = 'Username must be at least 3 characters';
                if (!userClass) errors.class = 'Please select your class';
                if (!password) errors.password = 'Password is required';
                if (password.length < 6) errors.password = 'Password must be at least 6 characters';
                if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
                
                return { isValid: Object.keys(errors).length === 0, errors };
            }
        }
        
        function showFormErrors(errors, formType) {
            // Clear previous errors
            document.querySelectorAll('.text-red-500').forEach(el => el.classList.add('hidden'));
            
            const prefix = formType === 'login' ? 'login' : 'signup';
            
            Object.keys(errors).forEach(field => {
                const errorElement = document.getElementById(`${prefix}${field.charAt(0).toUpperCase() + field.slice(1)}Error`);
                if (errorElement) {
                    errorElement.textContent = errors[field];
                    errorElement.classList.remove('hidden');
                }
            });
        }
        
        function login() {
            const validation = validateForm('login');
            if (!validation.isValid) {
                showFormErrors(validation.errors, 'login');
                return;
            }
            
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            const result = db.authenticateUser(username, password);
            
            if (result.success) {
                currentUser = result.user;
                currentClass = currentUser.class;
                showNotification('Welcome back! Your progress has been restored.', 'success');
                switchToMainDashboard();
            } else {
                showFormErrors({ username: result.message }, 'login');
            }
        }
        
        function signup() {
            const validation = validateForm('signup');
            if (!validation.isValid) {
                showFormErrors(validation.errors, 'signup');
                return;
            }
            
            const fullName = document.getElementById('signupFullName').value.trim();
            const username = document.getElementById('signupUsername').value.trim();
            const userClass = parseInt(document.getElementById('signupClass').value);
            const password = document.getElementById('signupPassword').value;
            
            const result = db.createUser(username, password, fullName, userClass);
            
            if (result.success) {
                currentUser = result.user;
                currentClass = userClass;
                showNotification('Account created successfully! Welcome to EduQuest!', 'success');
                switchToMainDashboard();
            } else {
                showFormErrors({ username: result.message }, 'signup');
            }
        }
        
        function quickLogin(username, password) {
            document.getElementById('loginUsername').value = username;
            document.getElementById('loginPassword').value = password;
            login();
        }
        
        function logout() {
            if (confirm('Are you sure you want to logout? Your progress is automatically saved.')) {
                currentUser = null;
                currentClass = 6;
                currentSubject = '';
                
                // Reset forms
                document.getElementById('loginUsername').value = '';
                document.getElementById('loginPassword').value = '';
                
                // Hide all views and show auth modal
                document.getElementById('mainDashboard').classList.add('hidden');
                document.getElementById('classView').classList.add('hidden');
                document.getElementById('subjectView').classList.add('hidden');
                document.getElementById('authModal').classList.remove('hidden');
                
                showNotification('Logged out successfully. See you soon!', 'info');
            }
        }
        
        function switchToMainDashboard() {
            document.getElementById('authModal').classList.add('hidden');
            document.getElementById('mainDashboard').classList.remove('hidden');
            updateUserInterface();
            updateDashboardStats();
            updateRecentActivity();
            refreshLeaderboard();
            startCarousel();
        }
        
        // UI Update Functions
        function updateUserInterface() {
            if (!currentUser) return;
            
            // Update header information
            document.getElementById('starCount').textContent = currentUser.stars.toLocaleString();
            document.getElementById('streakCount').textContent = currentUser.streak + ' days';
            document.getElementById('welcomeUserName').textContent = currentUser.fullName.split(' ')[0];
            
            // Update level display
            const levelDisplay = document.getElementById('levelDisplay');
            const levelProgress = document.getElementById('levelProgress');
            if (levelDisplay && levelProgress) {
                levelDisplay.textContent = `Level ${currentUser.level}`;
                const progressPercent = ((currentUser.totalVideosWatched % 10) / 10) * 100;
                levelProgress.style.width = progressPercent + '%';
            }
            
            // Update user avatar
            const userAvatar = document.getElementById('userAvatar');
            const menuUserName = document.getElementById('menuUserName');
            const menuUserClass = document.getElementById('menuUserClass');
            
            if (userAvatar) userAvatar.textContent = currentUser.fullName.charAt(0).toUpperCase();
            if (menuUserName) menuUserName.textContent = currentUser.fullName;
            if (menuUserClass) menuUserClass.textContent = `Class ${currentUser.class}`;
            
            // Update rewards section
            updateRewardsSection();
            
            // Update hero message
            const heroMessage = document.getElementById('heroMessage');
            if (heroMessage) {
                if (currentUser.totalVideosWatched === 0) {
                    heroMessage.textContent = 'Start your learning journey today!';
                } else {
                    heroMessage.textContent = `You've watched ${currentUser.totalVideosWatched} videos. Keep going!`;
                }
            }
            
            // Update class view stars and streak
            document.getElementById('classViewStars').textContent = `⭐ ${currentUser.stars.toLocaleString()}`;
            document.getElementById('classViewStreak').textContent = `🔥 ${currentUser.streak} days`;
            document.getElementById('subjectViewStars').textContent = `⭐ ${currentUser.stars.toLocaleString()}`;
            document.getElementById('subjectViewStreak').textContent = `🔥 ${currentUser.streak} days`;
        }
        
        function updateRewardsSection() {
            if (!currentUser) return;
            
            const dailyGoalElement = document.getElementById('dailyGoalText');
            const consistencyElement = document.getElementById('consistencyText');
            const achievementElement = document.getElementById('achievementText');
            
            if (dailyGoalElement) {
                dailyGoalElement.textContent = `${currentUser.dailyGoal}/3 videos watched`;
            }
            
            if (consistencyElement) {
                if (currentUser.streak === 0) {
                    consistencyElement.textContent = 'Start your streak!';
                } else {
                    consistencyElement.textContent = `${currentUser.streak}-day streak!`;
                }
            }
            
            if (achievementElement) {
                const achievements = ['Beginner', 'Explorer', 'Scholar', 'Expert', 'Master', 'Genius'];
                const achievementLevel = Math.min(Math.floor(currentUser.totalVideosWatched / 5), achievements.length - 1);
                achievementElement.textContent = achievements[achievementLevel];
            }
        }
        
        function updateDashboardStats() {
            if (!currentUser) return;
            
            document.getElementById('totalVideosWatched').textContent = currentUser.totalVideosWatched;
            
            // Calculate completed topics
            let completedTopics = 0;
            Object.values(currentUser.progress).forEach(subject => {
                Object.values(subject).forEach(topic => {
                    if (topic.completed) completedTopics++;
                });
            });
            document.getElementById('topicsCompleted').textContent = completedTopics;
            
            // Format study time
            const hours = Math.floor(currentUser.studyTime / 60);
            const minutes = currentUser.studyTime % 60;
            document.getElementById('totalStudyTime').textContent = `${hours}h ${minutes}m`;
            
            // Calculate rank
            const leaderboard = db.getLeaderboard();
            const userRank = leaderboard.findIndex(user => user.username === currentUser.username) + 1;
            document.getElementById('currentRank').textContent = userRank > 0 ? `#${userRank}` : '#-';
        }
        
        function updateRecentActivity() {
            if (!currentUser || !currentUser.recentActivity) return;
            
            const activityContainer = document.getElementById('recentActivity');
            
            if (currentUser.recentActivity.length === 0) {
                activityContainer.innerHTML = `
                    <div class="text-gray-500 text-center py-8">
                        <div class="text-4xl mb-2">🎯</div>
                        <p>Start learning to see your activity here!</p>
                    </div>
                `;
                return;
            }
            
            activityContainer.innerHTML = currentUser.recentActivity.map(activity => {
                const timeAgo = getTimeAgo(activity.timestamp);
                return `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-3">
                            <span class="text-2xl">${activity.icon}</span>
                            <div>
                                <p class="font-medium text-gray-800">${activity.title}</p>
                                <p class="text-sm text-gray-600">${activity.description}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-500">${timeAgo}</p>
                            ${activity.stars ? `<p class="text-xs text-yellow-600">+${activity.stars} ⭐</p>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        function getTimeAgo(timestamp) {
            const now = new Date();
            const time = new Date(timestamp);
            const diffInMinutes = Math.floor((now - time) / (1000 * 60));
            
            if (diffInMinutes < 1) return 'Just now';
            if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
            if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
            return `${Math.floor(diffInMinutes / 1440)}d ago`;
        }
        
        // Notification System
        function showNotification(message, type = 'info') {
            const container = document.getElementById('notificationContainer');
            const notification = document.createElement('div');
            
            const colors = {
                success: 'bg-green-500',
                error: 'bg-red-500',
                warning: 'bg-yellow-500',
                info: 'bg-blue-500'
            };
            
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            
            notification.className = `notification ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm`;
            notification.innerHTML = `
                <span>${icons[type]}</span>
                <span>${message}</span>
            `;
            
            container.appendChild(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        }
        
        // User Menu Functions
        function toggleUserMenu() {
            const menu = document.getElementById('userMenu');
            menu.classList.toggle('hidden');
        }
        
        function viewProfile() {
            toggleUserMenu();
            if (!currentUser) return;
            
            // Update profile modal with user data
            document.getElementById('profileAvatar').textContent = currentUser.fullName.charAt(0).toUpperCase();
            document.getElementById('profileName').textContent = currentUser.fullName;
            document.getElementById('profileClass').textContent = `Class ${currentUser.class}`;
            document.getElementById('profileStars').textContent = currentUser.stars.toLocaleString();
            document.getElementById('profileStreak').textContent = currentUser.streak;
            document.getElementById('profileVideos').textContent = currentUser.totalVideosWatched;
            document.getElementById('profileLevel').textContent = currentUser.level;
            
            // Show recent achievements
            const achievementsContainer = document.getElementById('profileAchievements');
            if (currentUser.achievements && currentUser.achievements.length > 0) {
                achievementsContainer.innerHTML = currentUser.achievements.slice(0, 3).map(achievement => 
                    `<p class="text-sm">🏆 ${achievement}</p>`
                ).join('');
            } else {
                achievementsContainer.innerHTML = '<p>Start learning to unlock achievements!</p>';
            }
            
            document.getElementById('profileModal').classList.remove('hidden');
        }
        
        function closeProfile() {
            document.getElementById('profileModal').classList.add('hidden');
        }
        
        function resetProgress() {
            if (confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
                const result = db.resetUserProgress(currentUser.username);
                if (result.success) {
                    currentUser = result.user;
                    updateUserInterface();
                    updateDashboardStats();
                    updateRecentActivity();
                    closeProfile();
                    showNotification('Progress reset successfully!', 'success');
                }
            }
        }
        
        function viewProgress() {
            toggleUserMenu();
            // This could open a detailed progress modal
            showNotification('Detailed progress view coming soon!', 'info');
        }
        
        // Leaderboard Functions
        function refreshLeaderboard() {
            const leaderboard = db.getLeaderboard();
            const container = document.getElementById('leaderboardContent');
            
            if (leaderboard.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500">No users found</p>';
                return;
            }
            
            container.innerHTML = leaderboard.map((user, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = index < 3 ? medals[index] : `#${index + 1}`;
                const isCurrentUser = currentUser && user.username === currentUser.username;
                
                return `
                    <div class="flex items-center justify-between p-4 ${isCurrentUser ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300' : 'bg-gradient-to-r from-gray-100 to-gray-200'} rounded-lg">
                        <div class="flex items-center space-x-4">
                            <span class="text-2xl">${medal}</span>
                            <div>
                                <h4 class="font-bold text-gray-800">${user.fullName} ${isCurrentUser ? '(You)' : ''}</h4>
                                <p class="text-sm text-gray-600">Class ${user.class} • ${user.streak}-day streak</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-yellow-600">${user.stars.toLocaleString()} ⭐</p>
                            <p class="text-sm text-gray-600">Level ${user.level}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }
let translations = {};
let currentLang = "en";

// Load translation file
async function loadTranslations(lang) {
  const res = await fetch("lang.json");
  translations = await res.json();
  currentLang = lang;
  applyTranslations();
}

// Apply translations to all elements with [data-i18n]
function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[currentLang] && translations[currentLang][key]) {
      el.innerText = translations[currentLang][key];
    }
  });
}

// Change language from dropdown
function changeLanguage(lang) {
  loadTranslations(lang);
}

// Load default language when page starts
document.addEventListener("DOMContentLoaded", () => {
  loadTranslations("en");
});

        
        // Continue Learning Functions
        function continueLastActivity() {
            if (!currentUser) return;
            
            // Find the last accessed topic
            let lastTopic = null;
            let lastSubject = null;
            let lastAccessed = null;
            
            Object.keys(currentUser.progress).forEach(subject => {
                Object.keys(currentUser.progress[subject]).forEach(topic => {
                    const topicData = currentUser.progress[subject][topic];
                    if (topicData.lastAccessed && (!lastAccessed || new Date(topicData.lastAccessed) > new Date(lastAccessed))) {
                        lastAccessed = topicData.lastAccessed;
                        lastTopic = topic;
                        lastSubject = subject;
                    }
                });
            });
            
            if (lastTopic && lastSubject) {
                currentSubject = lastSubject;
                openSubject(lastSubject);
                setTimeout(() => {
                    const topicIndex = subjectTopics[lastSubject][currentClass].indexOf(lastTopic);
                    selectChapter(topicIndex, lastTopic);
                }, 500);
            } else {
                openClass(currentUser.class);
            }
        }
        
        // Carousel Functions
        function startCarousel() {
            setInterval(() => {
                nextSlide();
            }, 5000);
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % 3;
            updateCarousel();
        }
        
        function prevSlide() {
            currentSlide = currentSlide === 0 ? 2 : currentSlide - 1;
            updateCarousel();
        }
        
        function updateCarousel() {
            const carousel = document.getElementById('carousel');
            carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        
        // Subject and Class Functions
        function generateSubjectCards() {
            const subjectCards = document.getElementById('subjectCards');
            const subjects = [
                { key: 'mathematics', name: 'Mathematics', icon: '📊', gradient: 'from-blue-400 to-blue-600', lightColor: 'text-blue-100' },
                { key: 'physics', name: 'Physics', icon: '⚡', gradient: 'from-red-400 to-red-600', lightColor: 'text-red-100' },
                { key: 'chemistry', name: 'Chemistry', icon: '🧪', gradient: 'from-green-400 to-green-600', lightColor: 'text-green-100' },
                { key: 'biology', name: 'Biology', icon: '🌱', gradient: 'from-purple-400 to-purple-600', lightColor: 'text-purple-100' }
            ];
            
            subjectCards.innerHTML = '';
            
            subjects.forEach(subject => {
                const progress = calculateSubjectProgress(subject.key);
                const description = getSubjectDescription(subject.key, currentClass);
                
                const card = document.createElement('div');
                card.onclick = () => openSubject(subject.key);
                card.className = `bg-gradient-to-br ${subject.gradient} rounded-2xl p-6 text-center cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`;
                card.innerHTML = `
                    <div class="text-4xl mb-3">${subject.icon}</div>
                    <h3 class="text-xl font-bold text-white">${subject.name}</h3>
                    <p class="${subject.lightColor} text-sm">${description}</p>
                    <div class="mt-3 bg-white bg-opacity-20 rounded-full h-2">
                        <div class="bg-white h-full rounded-full" style="width: ${progress}%"></div>
                    </div>
                    <p class="text-white text-xs mt-1">${progress}% Complete</p>
                `;
                subjectCards.appendChild(card);
            });
        }

        
        function calculateSubjectProgress(subject) {
            if (!currentUser || !currentUser.progress[subject]) return 0;
            
            const topics = subjectTopics[subject][currentClass] || [];
            if (topics.length === 0) return 0;
            
            let totalProgress = 0;
            topics.forEach(topic => {
                const topicProgress = currentUser.progress[subject][topic];
                if (topicProgress) {
                    totalProgress += topicProgress.progress;
                }
            });
            
            return Math.round(totalProgress / topics.length);
        }
        
        function getSubjectDescription(subject, classNum) {
            const descriptions = {
                mathematics: {
                    6: 'Numbers & Geometry', 7: 'Algebra & Data', 8: 'Linear Equations', 9: 'Coordinate Geometry',
                    10: 'Quadratic Equations', 11: 'Trigonometry', 12: 'Calculus & Matrices'
                },
                physics: {
                    6: 'Motion & Light', 7: 'Heat & Weather', 8: 'Force & Sound', 9: 'Motion & Energy',
                    10: 'Light & Electricity', 11: 'Mechanics', 12: 'Electromagnetism'
                },
                chemistry: {
                    6: 'Materials & Water', 7: 'Acids & Changes', 8: 'Metals & Fuels', 9: 'Atoms & Molecules',
                    10: 'Reactions & Compounds', 11: 'Chemical Bonding', 12: 'Physical Chemistry'
                },
                biology: {
                    6: 'Living Things', 7: 'Nutrition & Plants', 8: 'Cells & Reproduction', 9: 'Life Processes',
                    10: 'Control & Heredity', 11: 'Plant Kingdom', 12: 'Human Reproduction'
                }
            };
            return descriptions[subject][classNum] || 'STEM Learning';
        }
        
        // Navigation Functions
        function openClass(classNum) {
            currentClass = classNum;
            generateSubjectCards();
            document.getElementById('mainDashboard').classList.add('hidden');
            document.getElementById('classView').classList.remove('hidden');
            document.getElementById('classTitle').textContent = `Class ${classNum} - STEM Subjects`;
        }
        
        function openSubject(subject) {
            currentSubject = subject;
            generateSyllabusTopics();
            generatePuzzleSuggestions();
            document.getElementById('classView').classList.add('hidden');
            document.getElementById('subjectView').classList.remove('hidden');
            
            const subjectNames = {
                'mathematics': 'Mathematics',
                'physics': 'Physics',
                'chemistry': 'Chemistry',
                'biology': 'Biology'
            };
            
            document.getElementById('subjectTitle').textContent = 
                `${subjectNames[subject]} - Class ${currentClass}`;
        }
        
        function backToMain() {
            document.getElementById('classView').classList.add('hidden');
            document.getElementById('mainDashboard').classList.remove('hidden');
        }
        
        function backToClass() {
            document.getElementById('subjectView').classList.add('hidden');
            document.getElementById('classView').classList.remove('hidden');
        }
        
        // Syllabus and Topic Functions
        function generateSyllabusTopics() {
            const syllabusContainer = document.getElementById('syllabusTopics');
            const topics = subjectTopics[currentSubject][currentClass] || [];
            
            syllabusContainer.innerHTML = '';
            
            topics.forEach((topic, index) => {
                const topicProgress = currentUser?.progress[currentSubject]?.[topic];
                const isCompleted = topicProgress?.completed || false;
                const progress = topicProgress?.progress || 0;
                const videosWatched = topicProgress?.videosWatched || 0;
                const totalVideos = topicProgress?.totalVideos || 3;
                
                let bgColor, borderColor, textColor, icon;
                if (isCompleted) {
                    bgColor = 'bg-green-50';
                    borderColor = 'border-green-500';
                    textColor = 'text-gray-800';
                    icon = '✓';
                } else if (progress > 0) {
                    bgColor = 'bg-blue-50';
                    borderColor = 'border-blue-500';
                    textColor = 'text-gray-800';
                    icon = '▶️';
                } else {
                    bgColor = 'bg-gray-50';
                    borderColor = 'border-gray-300';
                    textColor = 'text-gray-600';
                    icon = '🔒';
                }
                
                const topicDiv = document.createElement('div');
                topicDiv.onclick = () => selectChapter(index, topic);
                topicDiv.className = `flex items-center justify-between p-3 ${bgColor} border-l-4 ${borderColor} rounded cursor-pointer hover:shadow-md transition-all`;
                topicDiv.innerHTML = `
                    <div class="flex-1">
                        <span class="font-medium ${textColor}">${index + 1}. ${topic}</span>
                        <div class="text-xs ${textColor} mt-1">${videosWatched}/${totalVideos} videos • ${progress}% complete</div>
                    </div>
                    <span class="${isCompleted ? 'text-green-500' : progress > 0 ? 'text-blue-500' : 'text-gray-400'}">${icon}</span>
                `;
                syllabusContainer.appendChild(topicDiv);
            });
        }
        
        function generatePuzzleSuggestions() {
            const puzzleContainer = document.getElementById('puzzleSuggestions');
            const puzzles = puzzleSuggestions[currentSubject] || [];
            
            puzzleContainer.innerHTML = '';
            
            const randomPuzzles = puzzles.sort(() => 0.5 - Math.random()).slice(0, 3);
            
            randomPuzzles.forEach(puzzle => {
                const puzzleDiv = document.createElement('div');
                puzzleDiv.className = 'p-2 bg-white bg-opacity-50 rounded text-xs cursor-pointer hover:bg-opacity-70 transition-all';
                puzzleDiv.onclick = () => startSpecificPuzzle(puzzle);
                puzzleDiv.textContent = puzzle;
                puzzleContainer.appendChild(puzzleDiv);
            });
        }
        
        // Video Learning Functions
        function selectChapter(topicIndex, topicName) {
            currentTopicIndex = topicIndex;
            currentTopicName = topicName;
            currentVideoIndex = 0;
            
            // Update last accessed time
            if (currentUser && currentUser.progress[currentSubject] && currentUser.progress[currentSubject][topicName]) {
                currentUser.progress[currentSubject][topicName].lastAccessed = new Date().toISOString();
                db.updateUser(currentUser.username, { progress: currentUser.progress });
            }
            
            updateVideoContent();
            document.querySelector('.lg\\:col-span-2').scrollIntoView({ behavior: 'smooth' });
        }
        
        function updateVideoContent() {
            const topicProgress = currentUser?.progress[currentSubject]?.[currentTopicName];
            const videosWatched = topicProgress?.videosWatched || 0;
            const totalVideos = topicProgress?.totalVideos || 3;
            const currentProgress = topicProgress?.progress || 0;
            
            const videoTitles = [
                'Introduction and Basic Concepts',
                'Detailed Explanation with Examples', 
                'Practice Problems and Applications'
            ];
            
            const currentVideoTitle = videoTitles[currentVideoIndex] || 'Video Content';
            const videoNumber = currentVideoIndex + 1;
            
            document.getElementById('currentChapterTitle').textContent = 
                `Chapter ${currentTopicIndex + 1}: ${currentTopicName}`;
            
            const videoPlayerArea = document.getElementById('videoPlayerArea');
            videoPlayerArea.innerHTML = `
                <div class="text-center text-white">
                    <div class="text-6xl mb-4">${videosWatched >= totalVideos ? '✅' : '▶️'}</div>
                    <h4 class="text-xl font-semibold mb-2">${currentTopicName}</h4>
                    <p class="text-lg mb-2">Video ${videoNumber}: ${currentVideoTitle}</p>
                    <p class="text-gray-300 mb-4">Duration: ${8 + Math.floor(Math.random() * 10)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} minutes</p>
                    <div class="mb-4">
                        <p class="text-sm text-gray-300">Progress: ${videosWatched}/${totalVideos} videos completed (${currentProgress}%)</p>
                        <div class="w-full bg-gray-600 rounded-full h-3 mt-2">
                            <div class="progress-bar h-full rounded-full transition-all duration-500" style="width: ${currentProgress}%"></div>
                        </div>
                    </div>
                    ${videosWatched > currentVideoIndex ? `
                        <button onclick="playCurrentVideo()" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                            ✅ Video ${videoNumber} Completed
                        </button>
                        ${currentVideoIndex < 2 ? `
                            <button onclick="nextVideo()" class="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                                ➡️ Next Video
                            </button>
                        ` : ''}
                    ` : `
                        <button onclick="playCurrentVideo()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                            ▶️ Play Video ${videoNumber}
                        </button>
                    `}
                    ${videosWatched < totalVideos ? `
                        <p class="text-sm text-yellow-300 mt-2">🌟 Complete this video to earn 15-35 stars!</p>
                    ` : `
                        <p class="text-sm text-green-300 mt-2">✅ All videos completed! Topic mastered!</p>
                    `}
                </div>
            `;
            
            // Update progress displays with animation
            const overallProgress = currentProgress;
            const progressBar = document.getElementById('videoProgressBar');
            const progressText = document.getElementById('videoProgressText');
            
            if (progressBar && progressText) {
                progressBar.style.width = overallProgress + '%';
                progressText.textContent = Math.round(overallProgress) + '%';
            }
            
            // Update chapter summary with progress info
            document.getElementById('chapterSummary').innerHTML = `
                <h4 class="font-bold text-blue-800 mb-2">📋 ${currentTopicName} - Progress: ${currentProgress}%</h4>
                <ul class="text-blue-700 space-y-1">
                    <li>• ${videosWatched >= 1 ? '✅' : '⏳'} Fundamental concepts and definitions</li>
                    <li>• ${videosWatched >= 2 ? '✅' : '⏳'} Step-by-step problem-solving techniques</li>
                    <li>• ${videosWatched >= 3 ? '✅' : '⏳'} Real-world applications and examples</li>
                    <li>• ${topicProgress?.completed ? '✅' : '⏳'} Practice exercises and assessments</li>
                </ul>
            `;
        }
        
        function playCurrentVideo() {
            if (!currentTopicName) {
                showNotification('Please select a topic first!', 'warning');
                return;
            }
            
            const topicProgress = currentUser?.progress[currentSubject]?.[currentTopicName];
            if (!topicProgress) return;
            
            if (currentVideoIndex < topicProgress.videosWatched) {
                showNotification('This video is already completed! Moving to next video...', 'info');
                if (currentVideoIndex < 2) {
                    currentVideoIndex++;
                    updateVideoContent();
                }
                return;
            }
            
            showNotification('Video is now playing! (Offline content loaded)', 'success');
            
            const videoPlayerArea = document.getElementById('videoPlayerArea');
            const playButton = videoPlayerArea.querySelector('button');
            playButton.innerHTML = '⏸️ Playing...';
            playButton.disabled = true;
            playButton.className = 'bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed';
            
            let videoProgress = 0;
            const videoInterval = setInterval(() => {
                videoProgress += 10;
                
                const progressIndicator = videoPlayerArea.querySelector('.text-gray-300');
                if (progressIndicator && progressIndicator.textContent.includes('Duration:')) {
                    progressIndicator.textContent = `Playing... ${videoProgress}% complete`;
                }
                
                if (videoProgress >= 100) {
                    clearInterval(videoInterval);
                    completeCurrentVideo();
                }
            }, 800);
        }
        
        function completeCurrentVideo() {
            if (!currentUser || !currentSubject || !currentTopicName) return;
            
            const topicProgress = currentUser.progress[currentSubject][currentTopicName];
            
            // Update video completion
            topicProgress.videosWatched = Math.min(topicProgress.videosWatched + 1, topicProgress.totalVideos);
            topicProgress.progress = Math.round((topicProgress.videosWatched / topicProgress.totalVideos) * 100);
            topicProgress.timeSpent += Math.floor(Math.random() * 15) + 10; // 10-25 minutes
            
            if (topicProgress.videosWatched >= topicProgress.totalVideos) {
                topicProgress.completed = true;
            }
            
            // Update user stats
            currentUser.totalVideosWatched++;
            currentUser.dailyGoal++;
            currentUser.studyTime += Math.floor(Math.random() * 15) + 10;
            
            // Award random stars
            const randomStars = Math.floor(Math.random() * 21) + 15;
            currentUser.stars += randomStars;
            
            // Update streak and level
            updateStreakAndLevel();
            
            // Add to recent activity
            db.addActivity(currentUser.username, {
                icon: '📹',
                title: `Completed Video: ${currentTopicName}`,
                description: `Video ${currentVideoIndex + 1} of 3 completed`,
                stars: randomStars
            });
            
            // Save to database
            db.updateUser(currentUser.username, currentUser);
            
            const completionMessage = topicProgress.completed ? 
                `🎉 Topic "${currentTopicName}" completed! All videos watched!\nYou earned ${randomStars} stars! 🌟\nTotal progress: ${topicProgress.progress}%` :
                `🎉 Video completed! Progress: ${topicProgress.videosWatched}/${topicProgress.totalVideos} videos\nYou earned ${randomStars} stars! 🌟\nTopic progress: ${topicProgress.progress}%`;
            
            showNotification(completionMessage.split('\n')[0], 'success');
            
            // Immediately update all UI elements
            updateUserInterface();
            updateDashboardStats();
            updateRecentActivity();
            generateSyllabusTopics();
            generateSubjectCards();
            
            // Auto-advance to next video if available
            if (currentVideoIndex < 2 && topicProgress.videosWatched > currentVideoIndex) {
                currentVideoIndex++;
                setTimeout(() => {
                    updateVideoContent();
                }, 1000);
            } else {
                updateVideoContent();
            }
            
            // Show detailed progress notification
            setTimeout(() => {
                showNotification(`Progress Updated: ${topicProgress.progress}% complete (${topicProgress.videosWatched}/${topicProgress.totalVideos} videos)`, 'info');
            }, 2000);
        }
        
        function updateStreakAndLevel() {
            if (!currentUser) return;
            
            if (currentUser.dailyGoal >= 3) {
                currentUser.streak++;
            }
            
            const newLevel = Math.floor(currentUser.totalVideosWatched / 10) + 1;
            if (newLevel > currentUser.level) {
                currentUser.level = newLevel;
                showNotification(`🎉 Level Up! You're now Level ${newLevel}! 🚀`, 'success');
                
                // Add achievement
                if (!currentUser.achievements) currentUser.achievements = [];
                currentUser.achievements.push(`Reached Level ${newLevel}`);
            }
        }
        
        // Puzzle Functions
        function openPuzzle() {
            const puzzles = puzzleSuggestions[currentSubject] || [];
            const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
            startInteractivePuzzle(randomPuzzle);
        }
        
        function startSpecificPuzzle(puzzleDescription) {
            startInteractivePuzzle(puzzleDescription);
        }
        
        function startInteractivePuzzle(puzzleDescription) {
            const puzzleModal = document.createElement('div');
            puzzleModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            
            let puzzleContent = '';
            let correctAnswer = '';
            
            if (currentSubject === 'mathematics') {
                const num1 = Math.floor(Math.random() * 20) + 1;
                const num2 = Math.floor(Math.random() * 20) + 1;
                const operation = ['+', '-', '×'][Math.floor(Math.random() * 3)];
                
                if (operation === '+') {
                    correctAnswer = (num1 + num2).toString();
                    puzzleContent = `${num1} + ${num2} = ?`;
                } else if (operation === '-') {
                    correctAnswer = (num1 - num2).toString();
                    puzzleContent = `${num1} - ${num2} = ?`;
                } else {
                    correctAnswer = (num1 * num2).toString();
                    puzzleContent = `${num1} × ${num2} = ?`;
                }
            } else if (currentSubject === 'physics') {
                const questions = [
                    { q: 'What color is formed when red and green light mix?', a: 'yellow' },
                    { q: 'Sound travels faster in: air or water?', a: 'water' },
                    { q: 'What force pulls objects toward Earth?', a: 'gravity' }
                ];
                const randomQ = questions[Math.floor(Math.random() * questions.length)];
                puzzleContent = randomQ.q;
                correctAnswer = randomQ.a.toLowerCase();
            } else if (currentSubject === 'chemistry') {
                const questions = [
                    { q: 'What is the chemical symbol for water?', a: 'h2o' },
                    { q: 'What gas do plants release during photosynthesis?', a: 'oxygen' },
                    { q: 'What is the pH of pure water?', a: '7' }
                ];
                const randomQ = questions[Math.floor(Math.random() * questions.length)];
                puzzleContent = randomQ.q;
                correctAnswer = randomQ.a.toLowerCase();
            } else if (currentSubject === 'biology') {
                const questions = [
                    { q: 'Which organ pumps blood in the human body?', a: 'heart' },
                    { q: 'What do plants need to make their own food?', a: 'sunlight' },
                    { q: 'How many chambers does a human heart have?', a: '4' }
                ];
                const randomQ = questions[Math.floor(Math.random() * questions.length)];
                puzzleContent = randomQ.q;
                correctAnswer = randomQ.a.toLowerCase();
            }
            
            puzzleModal.innerHTML = `
                <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                    <div class="text-center mb-6">
                        <h2 class="text-3xl font-bold text-gray-800 mb-2">🧩 Puzzle Challenge</h2>
                        <p class="text-gray-600">${puzzleDescription}</p>
                    </div>
                    
                    <div class="mb-6">
                        <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 text-center">
                            <h3 class="text-xl font-bold text-purple-800 mb-4">${puzzleContent}</h3>
                            <input type="text" id="puzzleAnswer" placeholder="Your answer..." 
                                   class="w-full p-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 outline-none text-center text-lg font-semibold">
                        </div>
                    </div>
                    
                    <div class="flex space-x-4">
                        <button onclick="checkPuzzleAnswer('${correctAnswer}', this.parentElement.parentElement.parentElement)" 
                                class="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white p-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all">
                            ✓ Submit Answer
                        </button>
                        <button onclick="closePuzzle(this.parentElement.parentElement.parentElement)" 
                                class="flex-1 bg-gray-500 text-white p-3 rounded-lg font-semibold hover:bg-gray-600 transition-all">
                            ✕ Close
                        </button>
                    </div>
                    
                    <div class="mt-4 text-center">
                        <p class="text-sm text-gray-600">💡 Hint: Think about what you learned in the videos!</p>
                        <p class="text-xs text-purple-600 mt-2">Reward: 25-75 stars for correct answer! 🌟</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(puzzleModal);
            
            setTimeout(() => {
                document.getElementById('puzzleAnswer').focus();
            }, 100);
            
            document.getElementById('puzzleAnswer').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    checkPuzzleAnswer(correctAnswer, puzzleModal);
                }
            });
        }
        
        function checkPuzzleAnswer(correctAnswer, modalElement) {
            const userAnswer = document.getElementById('puzzleAnswer').value.toLowerCase().trim();
            
            if (userAnswer === correctAnswer.toLowerCase()) {
                const randomStars = Math.floor(Math.random() * 51) + 25;
                currentUser.stars += randomStars;
                
                // Add to recent activity
                db.addActivity(currentUser.username, {
                    icon: '🧩',
                    title: 'Puzzle Solved!',
                    description: `Correctly answered ${currentSubject} puzzle`,
                    stars: randomStars
                });
                
                db.updateUser(currentUser.username, currentUser);
                updateUserInterface();
                
                modalElement.innerHTML = `
                    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
                        <div class="text-6xl mb-4">🎉</div>
                        <h2 class="text-3xl font-bold text-green-600 mb-2">Correct!</h2>
                        <p class="text-gray-600 mb-4">Great job! You earned ${randomStars} stars!</p>
                        <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg p-4 mb-4">
                            <p class="text-yellow-800 font-semibold">⭐ +${randomStars} Stars</p>
                            <p class="text-yellow-700 text-sm">Total: ${currentUser.stars} stars</p>
                        </div>
                        <button onclick="closePuzzle(this.parentElement.parentElement)" 
                                class="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all">
                            🚀 Continue Learning
                        </button>
                    </div>
                `;
            } else {
                modalElement.innerHTML = `
                    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
                        <div class="text-6xl mb-4">🤔</div>
                        <h2 class="text-3xl font-bold text-orange-600 mb-2">Try Again!</h2>
                        <p class="text-gray-600 mb-4">That's not quite right. Don't give up!</p>
                        <div class="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4 mb-4">
                            <p class="text-orange-800 font-semibold">💡 Hint</p>
                            <p class="text-orange-700 text-sm">Review the video content for clues!</p>
                        </div>
                        <div class="flex space-x-4">
                            <button onclick="startSpecificPuzzle('Try the puzzle again!')" 
                                    class="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all">
                                🔄 Try Again
                            </button>
                            <button onclick="closePuzzle(this.parentElement.parentElement.parentElement)" 
                                    class="flex-1 bg-gray-500 text-white p-3 rounded-lg font-semibold hover:bg-gray-600 transition-all">
                                ✕ Close
                            </button>
                        </div>
                    </div>
                `;
            }
        }
        
        function closePuzzle(modalElement) {
            document.body.removeChild(modalElement);
        }
        
        // Video Navigation Functions
        function nextVideo() {
            if (currentVideoIndex < 2) {
                currentVideoIndex++;
                updateVideoContent();
                showNotification(`Moved to Video ${currentVideoIndex + 1}`, 'info');
            }
        }
        
        // Additional Functions
        function takeNotes() {
            showNotification('Note-taking feature coming soon!', 'info');
        }
        
        function markComplete() {
            if (currentTopicName && currentUser) {
                const topicProgress = currentUser.progress[currentSubject][currentTopicName];
                if (topicProgress && !topicProgress.completed) {
                    topicProgress.completed = true;
                    topicProgress.progress = 100;
                    topicProgress.videosWatched = topicProgress.totalVideos;
                    
                    db.updateUser(currentUser.username, currentUser);
                    generateSyllabusTopics();
                    generateSubjectCards();
                    updateUserInterface();
                    
                    showNotification(`Topic "${currentTopicName}" marked as complete!`, 'success');
                } else {
                    showNotification('Topic is already completed!', 'info');
                }
            } else {
                showNotification('Please select a topic first!', 'warning');
            }
        }
        
        // Form switching functions
        function showSignup() {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('signupForm').classList.remove('hidden');
        }
        
        function showLogin() {
            document.getElementById('signupForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
        }
        
        // Close user menu when clicking outside
        document.addEventListener('click', function(event) {
            const userMenu = document.getElementById('userMenu');
            const userAvatar = document.getElementById('userAvatar');
            
            if (!userMenu.contains(event.target) && !userAvatar.contains(event.target)) {
                userMenu.classList.add('hidden');
            }
        });
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('authModal').classList.remove('hidden');
        });
        (function(){
    function c(){
        var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'97dea214d0fddc0a',t:'MTc1NzY3MjAxNi4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();
        if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(reg => console.log("Service Worker registered:", reg))
    .catch(err => console.log("Service Worker failed:", err));
}
