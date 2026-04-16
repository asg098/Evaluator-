// ============================================================
// app.js  -  Main Application Logic + Dark/Light Mode Toggle
// ============================================================

// ---- Theme System (Dark / Light Mode) ----
(function initTheme() {
    var saved = localStorage.getItem('evaluator-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    function makeToggleBtn() {
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        var btn = document.createElement('button');
        btn.id = 'themeToggleBtn';
        btn.type = 'button';
        btn.innerHTML = dark ? '\u2600\uFE0F Light Mode' : '\uD83C\uDF19 Dark Mode';
        btn.setAttribute('aria-label', 'Toggle dark/light mode');
        btn.onclick = window.toggleTheme;
        return btn;
    }

    function injectToggleButtons() {
        document.querySelectorAll('#themeToggleBtn').forEach(function(b) { b.remove(); });
        document.querySelectorAll('.dashboard-header .user-info').forEach(function(userInfo) {
            var btn = makeToggleBtn();
            userInfo.insertBefore(btn, userInfo.firstChild);
        });
        var authHeader = document.querySelector('.auth-header');
        if (authHeader && !authHeader.querySelector('#themeToggleBtn')) {
            var btn = makeToggleBtn();
            btn.style.cssText = 'position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.18);border-color:rgba(255,255,255,0.3);font-size:11px;padding:4px 10px;';
            authHeader.style.position = 'relative';
            authHeader.appendChild(btn);
        }
        updateAllBtns();
    }

    function updateAllBtns() {
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.querySelectorAll('#themeToggleBtn').forEach(function(btn) {
            btn.innerHTML = dark ? '\u2600\uFE0F Light Mode' : '\uD83C\uDF19 Dark Mode';
        });
    }

    window.toggleTheme = function() {
        var html = document.documentElement;
        var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('evaluator-theme', next);
        updateAllBtns();
    };

    document.addEventListener('DOMContentLoaded', injectToggleButtons);
    window._injectThemeToggles = injectToggleButtons;
})();

        (function bootstrapStandalonePortal() {
            const preferLocalMode = window.location.protocol === 'file:' || localStorage.getItem('portalPreferredMode') === 'local';
            const firebaseUnavailable = !window.auth || !window.collection || !window.getDocs;

            if (!preferLocalMode && !firebaseUnavailable) {
                return;
            }

            const STORAGE_KEY = 'portalStandaloneDataV1';
            const AUTH_KEY = 'portalStandaloneAuthV1';
            const APP_MODE = 'local';

            function createId(prefix) {
                return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
            }

            function clone(value) {
                return JSON.parse(JSON.stringify(value));
            }

            function createDocSnapshot(id, data) {
                return {
                    id,
                    exists: () => !!data,
                    data: () => clone(data)
                };
            }

            function createQuerySnapshot(docs) {
                return {
                    docs,
                    empty: docs.length === 0,
                    size: docs.length,
                    forEach(callback) {
                        docs.forEach(callback);
                    }
                };
            }

            function loadStore() {
                try {
                    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
                } catch (error) {
                    console.error('Standalone store load failed:', error);
                    return null;
                }
            }

            function saveStore() {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(window.__standaloneStore));
            }

            function getStore() {
                if (!window.__standaloneStore) {
                    window.__standaloneStore = loadStore() || seedStore();
                    saveStore();
                }
                return window.__standaloneStore;
            }

            function loadAuthState() {
                try {
                    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
                } catch (error) {
                    return null;
                }
            }

            function saveAuthState(state) {
                if (!state) {
                    localStorage.removeItem(AUTH_KEY);
                } else {
                    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
                }
            }

            function getCollectionData(name) {
                const store = getStore();
                if (!store.collections[name]) {
                    store.collections[name] = {};
                }
                return store.collections[name];
            }

            function seedStore() {
                const now = new Date().toISOString();
                const collections = {
                    users: {},
                    students: {},
                    departments: {},
                    classes: {},
                    divisions: {},
                    subjects: {},
                    teacher_assignments: {},
                    coordinator_assignments: {},
                    exams: {},
                    results: {},
                    audit_logs: {},
                    failed_logins: {},
                    security_events: {},
                    questions: {},
                    teacherQuestionUsage: {},
                    ca_question_assignments: {}
                };

                const ids = {
                    hod: 'hod_demo',
                    coord: 'coord_demo',
                    teacher: 'teacher_demo',
                    studentUser: 'student_user_demo',
                    student: 'student_demo',
                    dept: 'dept_demo',
                    class: 'class_demo',
                    division: 'division_demo',
                    subject: 'subject_demo',
                    assignment: 'assignment_demo',
                    coordAssign: 'coord_assignment_demo',
                    exam: 'exam_demo',
                    result: 'result_demo'
                };

                collections.users[ids.hod] = {
                    name: 'Demo HOD',
                    email: 'hod@portal.local',
                    password: 'hod12345',
                    role: 'hod',
                    department: 'Computer Engineering',
                    createdAt: now,
                    approved: true,
                    approvalStatus: 'approved',
                    isActive: true
                };

                collections.users[ids.coord] = {
                    name: 'Demo Coordinator',
                    email: 'coordinator@portal.local',
                    password: 'coord12345',
                    role: 'coordinator',
                    department: 'Computer Engineering',
                    createdAt: now,
                    approved: true,
                    approvalStatus: 'approved',
                    isActive: true
                };

                collections.users[ids.teacher] = {
                    name: 'Demo Teacher',
                    email: 'teacher@portal.local',
                    password: 'teach12345',
                    role: 'teacher',
                    department: 'Computer Engineering',
                    createdAt: now,
                    approved: true,
                    approvalStatus: 'approved',
                    isActive: true,
                    examRestricted: false
                };

                collections.users[ids.studentUser] = {
                    name: 'Demo Student',
                    email: 'student@portal.local',
                    password: 'stud12345',
                    role: 'student',
                    enrollment: '2025001',
                    createdAt: now,
                    approved: true,
                    approvalStatus: 'approved',
                    isActive: true
                };

                collections.departments[ids.dept] = {
                    name: 'Computer Engineering',
                    code: 'CE',
                    createdAt: now,
                    createdBy: ids.hod
                };

                collections.classes[ids.class] = {
                    name: 'Second Year Engineering',
                    code: 'SE',
                    academicYear: '2025-26',
                    semester: 'SEM-1',
                    createdAt: now
                };

                collections.divisions[ids.division] = {
                    classId: ids.class,
                    name: 'A',
                    classTeacherEmail: 'teacher@portal.local',
                    createdAt: now
                };

                collections.subjects[ids.subject] = {
                    name: 'Data Structures',
                    code: 'CE301',
                    class: 'SE',
                    division: 'A',
                    academicYear: '2025-26',
                    semester: 'SEM-1',
                    createdAt: now
                };

                collections.students[ids.student] = {
                    name: 'Demo Student',
                    enrollment: '2025001',
                    class: 'SE',
                    division: 'A',
                    email: 'student@portal.local',
                    phone: '9876543210',
                    rollNo: '01',
                    academicYear: '2025-26',
                    semester: 'SEM-1',
                    createdAt: now
                };

                collections.coordinator_assignments[ids.coordAssign] = {
                    department: 'Computer Engineering',
                    email: 'coordinator@portal.local',
                    assignedAt: now,
                    assignedBy: ids.hod
                };

                collections.teacher_assignments[ids.assignment] = {
                    teacherEmail: 'teacher@portal.local',
                    subjectId: ids.subject,
                    class: 'SE',
                    division: 'A',
                    assignedAt: now,
                    assignedBy: ids.coord
                };

                collections.exams[ids.exam] = {
                    name: 'Mid Term Assessment',
                    subjectId: ids.subject,
                    examType: 'standard',
                    status: 'DRAFT',
                    lifecycleState: 'DRAFT',
                    criteria: [
                        { name: 'Theory', maxMarks: 20 },
                        { name: 'Problem Solving', maxMarks: 20 }
                    ],
                    totalMarks: 40,
                    academicYear: '2025-26',
                    semester: 'SEM-1',
                    createdAt: now,
                    createdBy: ids.teacher,
                    createdByName: 'Demo Teacher'
                };

                collections.results[ids.result] = {
                    examId: ids.exam,
                    studentId: ids.student,
                    enrollment: '2025001',
                    studentName: 'Demo Student',
                    marks: [18, 16],
                    totalMarks: 34,
                    percentage: 85,
                    grade: 'A',
                    status: 'COMPLETE',
                    createdAt: now,
                    importedAt: now,
                    importedBy: ids.teacher
                };

                collections.audit_logs[createId('audit')] = {
                    action: 'STANDALONE_SEEDED',
                    performedBy: 'system',
                    performedByName: 'System',
                    performedByRole: 'system',
                    timestamp: now,
                    details: { mode: APP_MODE }
                };

                return { version: 1, mode: APP_MODE, collections };
            }

            function getAuthUserByEmail(email) {
                const users = getCollectionData('users');
                return Object.entries(users).find(([, data]) => (data.email || '').toLowerCase() === String(email || '').toLowerCase());
            }

            function sanitizeUserRecord(id, data) {
                if (!data) return null;
                return {
                    uid: id,
                    email: data.email,
                    emailVerified: true
                };
            }

            function notifyAuthListeners() {
                const session = loadAuthState();
                const users = getCollectionData('users');
                const authUser = session && users[session.uid] ? sanitizeUserRecord(session.uid, users[session.uid]) : null;
                (window.__authListeners || []).forEach((listener) => {
                    Promise.resolve().then(() => listener(authUser));
                });
            }

            function matchesWhere(data, clause) {
                const fieldValue = data[clause.field];
                if (clause.op === '==') return fieldValue === clause.value;
                if (clause.op === 'in') return Array.isArray(clause.value) && clause.value.includes(fieldValue);
                return true;
            }

            function sortDocs(entries, sorter) {
                const direction = sorter.direction === 'desc' ? -1 : 1;
                return entries.sort((a, b) => {
                    const av = a[1]?.[sorter.field];
                    const bv = b[1]?.[sorter.field];
                    if (av === bv) return 0;
                    if (av === undefined || av === null) return 1;
                    if (bv === undefined || bv === null) return -1;
                    return av > bv ? direction : -direction;
                });
            }

            window.__portalMode = APP_MODE;
            localStorage.setItem('portalPreferredMode', APP_MODE);
            window.auth = { mode: APP_MODE, name: 'primary' };
            window.secondaryAuth = { mode: APP_MODE, name: 'secondary' };
            window.db = { mode: APP_MODE };
            window.failedLoginAttempts = window.failedLoginAttempts || new Map();

            if (!window.logFailedLogin) {
                window.logFailedLogin = async function (email, errorCode) {
                    const attempts = (window.failedLoginAttempts.get(email) || 0) + 1;
                    window.failedLoginAttempts.set(email, attempts);
                    await window.addDoc(window.collection(window.db, 'failed_logins'), {
                        email,
                        errorCode,
                        timestamp: new Date().toISOString()
                    });
                    return attempts;
                };
            }

            if (!window.clearFailedAttempts) {
                window.clearFailedAttempts = async function (email) {
                    window.failedLoginAttempts.delete(email);
                };
            }

            if (!window.lockAccount) {
                window.lockAccount = async function (email) {
                    const match = getAuthUserByEmail(email);
                    if (match) {
                        const users = getCollectionData('users');
                        users[match[0]].isLocked = true;
                        users[match[0]].lockedAt = new Date().toISOString();
                        saveStore();
                    }
                };
            }

            if (!window.logAuditEvent) {
                window.logAuditEvent = async function (action, details) {
                    await window.addDoc(window.collection(window.db, 'audit_logs'), {
                        action,
                        details: details || {},
                        performedBy: window.currentUser?.uid || 'anonymous',
                        performedByName: window.currentUser?.name || 'Anonymous',
                        performedByRole: window.currentUser?.role || 'none',
                        timestamp: new Date().toISOString()
                    });
                };
            }

            if (!window.logSecurityEvent) {
                window.logSecurityEvent = async function (type, details) {
                    await window.addDoc(window.collection(window.db, 'security_events'), {
                        type,
                        details: details || {},
                        userId: window.currentUser?.uid || 'anonymous',
                        timestamp: new Date().toISOString()
                    });
                };
            }

            if (!window.validateForm) {
                window.validateForm = function (fields, rules) {
                    const errors = [];
                    for (const [field, value] of Object.entries(fields)) {
                        const rule = rules[field];
                        if (!rule) continue;
                        if (rule.required && (!value || value.toString().trim() === '')) errors.push(`${field} is required`);
                        if (rule.minLength && value && value.length < rule.minLength) errors.push(`${field} must be at least ${rule.minLength} characters`);
                        if (rule.pattern && value && !rule.pattern.test(value)) errors.push(rule.patternMessage || `${field} format is invalid`);
                    }
                    return { valid: errors.length === 0, errors };
                };
            }

            if (!window.exportToExcel) {
                window.exportToExcel = function (data, filename) {
                    if (!data || !data.length) return;
                    const headers = Object.keys(data[0]);
                    const rows = [headers.join(',')].concat(data.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')));
                    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${filename}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    URL.revokeObjectURL(url);
                };
            }

            if (!window.downloadExcelTemplate) {
                window.downloadExcelTemplate = function (headers, filename) {
                    const template = [headers.reduce((acc, header) => {
                        acc[header] = '';
                        return acc;
                    }, {})];
                    window.exportToExcel(template, `${filename}_template`);
                };
            }

            if (!window.importFromExcel) {
                window.importFromExcel = function () {
                    return Promise.reject(new Error('Excel import is unavailable in standalone mode unless the SheetJS library is loaded.'));
                };
            }

            if (!window.roundMarks) {
                window.roundMarks = function (value) {
                    if (value === null || value === undefined || value === '') return 0;
                    const num = parseFloat(value);
                    return Number.isFinite(num) ? Math.round(num * 100) / 100 : 0;
                };
            }

            if (!window.formatMarks) {
                window.formatMarks = function (value, decimals = 2) {
                    return window.roundMarks(value).toFixed(decimals);
                };
            }

            if (!window.calculatePercentage) {
                window.calculatePercentage = function (obtained, total) {
                    if (!total || total <= 0) return 0;
                    return window.roundMarks((obtained / total) * 100);
                };
            }

            window.createUserWithEmailAndPassword = async function (localAuth, email, password) {
                const normalizedEmail = String(email || '').trim().toLowerCase();
                if (!normalizedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    const error = new Error('Invalid email address');
                    error.code = 'auth/invalid-email';
                    throw error;
                }
                if (String(password || '').length < 6) {
                    const error = new Error('Password should be at least 6 characters');
                    error.code = 'auth/weak-password';
                    throw error;
                }
                const existing = getAuthUserByEmail(normalizedEmail);
                if (existing) {
                    const error = new Error('Email already in use');
                    error.code = 'auth/email-already-in-use';
                    throw error;
                }

                const uid = createId('user');
                const users = getCollectionData('users');
                users[uid] = {
                    email: normalizedEmail,
                    password,
                    createdAt: new Date().toISOString(),
                    isActive: true
                };
                saveStore();

                if (!localAuth || localAuth.name !== 'secondary') {
                    saveAuthState({ uid });
                    notifyAuthListeners();
                }

                return { user: sanitizeUserRecord(uid, users[uid]) };
            };

            window.signInWithEmailAndPassword = async function (localAuth, email, password) {
                const existing = getAuthUserByEmail(email);
                if (!existing || existing[1].password !== password) {
                    const error = new Error('Invalid email or password');
                    error.code = 'auth/invalid-credential';
                    throw error;
                }
                saveAuthState({ uid: existing[0] });
                notifyAuthListeners();
                return { user: sanitizeUserRecord(existing[0], existing[1]) };
            };

            window.signOut = async function (localAuth) {
                if (!localAuth || localAuth.name !== 'secondary') {
                    saveAuthState(null);
                    notifyAuthListeners();
                }
            };

            window.onAuthStateChanged = function (localAuth, callback) {
                window.__authListeners = window.__authListeners || [];
                window.__authListeners.push(callback);
                notifyAuthListeners();
                return function unsubscribe() {
                    window.__authListeners = (window.__authListeners || []).filter((listener) => listener !== callback);
                };
            };

            window.sendPasswordResetEmail = async function (localAuth, email) {
                const existing = getAuthUserByEmail(email);
                if (!existing) {
                    const error = new Error('No user found');
                    error.code = 'auth/user-not-found';
                    throw error;
                }
                return true;
            };

            window.sendEmailVerification = async function (user) {
                return true;
            };

            window.collection = function (dbRef, name) {
                return { kind: 'collection', name };
            };

            window.doc = function (dbOrCollection, collectionName, docId) {
                if (dbOrCollection && dbOrCollection.kind === 'collection') {
                    return { kind: 'doc', collection: dbOrCollection.name, id: collectionName };
                }
                return { kind: 'doc', collection: collectionName, id: docId };
            };

            window.where = function (field, op, value) {
                return { kind: 'where', field, op, value };
            };

            window.orderBy = function (field, direction) {
                return { kind: 'orderBy', field, direction: direction || 'asc' };
            };

            window.limit = function (count) {
                return { kind: 'limit', count };
            };

            window.query = function (base, ...constraints) {
                const normalizedBase = base && base.kind === 'query'
                    ? { collection: base.collection, constraints: base.constraints.slice() }
                    : { collection: base.name, constraints: [] };
                return {
                    kind: 'query',
                    collection: normalizedBase.collection,
                    constraints: normalizedBase.constraints.concat(constraints)
                };
            };

            window.addDoc = async function (collectionRef, data) {
                const collectionData = getCollectionData(collectionRef.name);
                const id = createId(collectionRef.name);
                collectionData[id] = clone(data);
                saveStore();
                return { id };
            };

            window.setDoc = async function (docRef, data) {
                const collectionData = getCollectionData(docRef.collection);
                const existing = collectionData[docRef.id] || {};
                const nextValue = clone(data);
                if (existing.password && !nextValue.password) {
                    nextValue.password = existing.password;
                }
                collectionData[docRef.id] = nextValue;
                saveStore();
            };

            window.getDoc = async function (docRef) {
                const collectionData = getCollectionData(docRef.collection);
                return createDocSnapshot(docRef.id, collectionData[docRef.id] || null);
            };

            window.getDocs = async function (queryRef) {
                const collectionName = queryRef.kind === 'collection' ? queryRef.name : queryRef.collection;
                const constraints = queryRef.kind === 'query' ? queryRef.constraints : [];
                let entries = Object.entries(getCollectionData(collectionName));

                constraints.filter((item) => item.kind === 'where').forEach((clause) => {
                    entries = entries.filter(([, data]) => matchesWhere(data, clause));
                });

                constraints.filter((item) => item.kind === 'orderBy').forEach((sorter) => {
                    entries = sortDocs(entries, sorter);
                });

                const limiter = constraints.find((item) => item.kind === 'limit');
                if (limiter) entries = entries.slice(0, limiter.count);

                const docs = entries.map(([id, data]) => ({
                    id,
                    data: () => clone(data)
                }));

                return createQuerySnapshot(docs);
            };

            window.updateDoc = async function (docRef, updates) {
                const collectionData = getCollectionData(docRef.collection);
                collectionData[docRef.id] = Object.assign({}, collectionData[docRef.id] || {}, clone(updates));
                saveStore();
            };

            window.deleteDoc = async function (docRef) {
                const collectionData = getCollectionData(docRef.collection);
                delete collectionData[docRef.id];
                saveStore();
            };

            window.resetStandalonePortal = function () {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(AUTH_KEY);
                localStorage.setItem('portalPreferredMode', APP_MODE);
                window.__standaloneStore = null;
                saveAuthState(null);
                notifyAuthListeners();
            };

            window.fillStandaloneCredentials = function (email, password) {
                const emailInput = document.getElementById('loginEmail');
                const passwordInput = document.getElementById('loginPassword');
                if (emailInput) emailInput.value = email;
                if (passwordInput) passwordInput.value = password;
            };

            window.renderPortalModeNotice = function () {
                if (document.getElementById('portalModeNotice')) return;
                const loginForm = document.getElementById('loginForm');
                if (!loginForm) return;

                const panel = document.createElement('div');
                panel.id = 'portalModeNotice';
                panel.className = 'alert alert-info';
                panel.style.marginBottom = '18px';
                panel.innerHTML = `
 <strong>Standalone mode is active.</strong> This portal saves data on this device so every dashboard can work without Firebase setup.
 <div style="margin-top:10px;font-size:12px;line-height:1.6;">
 <div><strong>HOD:</strong> hod@portal.local / hod12345</div>
 <div><strong>Coordinator:</strong> coordinator@portal.local / coord12345</div>
 <div><strong>Teacher:</strong> teacher@portal.local / teach12345</div>
 <div><strong>Student:</strong> student@portal.local / stud12345</div>
 </div>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
 <button class="btn btn-primary btn-sm" type="button" onclick="fillStandaloneCredentials('hod@portal.local','hod12345')">Use HOD Login</button>
 <button class="btn btn-secondary btn-sm" type="button" onclick="fillStandaloneCredentials('teacher@portal.local','teach12345')">Use Teacher Login</button>
 <button class="btn btn-danger btn-sm" type="button" onclick="if(confirm('Reset standalone data and restore clean demo records?')){ resetStandalonePortal(); location.reload(); }">Reset Demo Data</button>
 </div>
 `;
                loginForm.prepend(panel);
            };
        })();

        function collection(...a) { return window.collection(...a); }
        function addDoc(...a) { return window.addDoc(...a); }
        function doc(...a) { return window.doc(...a); }
        function setDoc(...a) { return window.setDoc(...a); }
        function getDoc(...a) { return window.getDoc(...a); }
        function getDocs(...a) { return window.getDocs(...a); }
        function query(...a) { return window.query(...a); }
        function where(...a) { return window.where(...a); }
        function updateDoc(...a) { return window.updateDoc(...a); }
        function deleteDoc(...a) { return window.deleteDoc(...a); }
        function orderBy(...a) { return window.orderBy(...a); }
        function limit(...a) { return window.limit(...a); }
        function signOut(...a) { return window.signOut(...a); }
        function logAuditEvent(...a) { return window.logAuditEvent ? window.logAuditEvent(...a) : Promise.resolve(); }
        function logSecurityEvent(...a) { return window.logSecurityEvent ? window.logSecurityEvent(...a) : Promise.resolve(); }

        function importFromExcel(...a) { return window.importFromExcel ? window.importFromExcel(...a) : Promise.reject(new Error('importFromExcel not ready')); }

        function exportToExcel(...a) { return window.exportToExcel ? window.exportToExcel(...a) : void 0; }
        function validateForm(...a) { return window.validateForm ? window.validateForm(...a) : { valid: false, errors: ['System not ready'] }; }
        function generateAndDistributeQuestions(...a) { return window.generateAndDistributeQuestions ? window.generateAndDistributeQuestions(...a) : Promise.reject(new Error('Not ready')); }
        function getTeacherAssignedQuestions(...a) { return window.getTeacherAssignedQuestions ? window.getTeacherAssignedQuestions(...a) : Promise.resolve([]); }


        function getAcademicYear() { var el = document.getElementById('academicYear'); return el ? el.value : ''; }
        function getSemester() { var el = document.getElementById('semester'); return el ? el.value : ''; }
        window.addEventListener('unhandledrejection', function (event) {
            var reason = event.reason;
            var msg = (reason && reason.message) ? reason.message : String(reason || '');
            if (msg.indexOf('permission-denied') >= 0) {
                if (typeof showToast === 'function') showToast('Permission denied. Please log in again.', 'danger');
            } else if (msg.indexOf('Failed to fetch') >= 0 || msg.indexOf('unavailable') >= 0) {
                if (typeof showToast === 'function') showToast('Network error. Check your connection.', 'danger');
            } else {
                console.error('Unhandled rejection:', reason);
            }
            event.preventDefault();
        });


        function showForgotPassword() {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('signupForm').classList.add('hidden');
            document.getElementById('forgotPasswordForm').classList.remove('hidden');
        }

        function showLogin() {
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('signupForm').classList.add('hidden');
            document.getElementById('forgotPasswordForm').classList.add('hidden');
        }
        async function sendPasswordReset() {
            const email = document.getElementById('resetEmail').value.trim();

            if (!email) {
                showToast('Please enter your email address', 'warning');
                return;
            }

            try {
                await window.sendPasswordResetEmail(window.auth, email);
                showToast('Password reset email sent! Check your inbox.', 'success', 6000);
                showLogin();
                document.getElementById('resetEmail').value = '';
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    showToast('No account found with this email address.', 'danger');
                } else if (error.code === 'auth/invalid-email') {
                    showToast('Invalid email address.', 'danger');
                } else {
                    showToast('Error: ' + error.message, 'danger');
                }
            }
        }
        function toggleAuth() {
            document.getElementById('loginForm').classList.toggle('hidden');
            document.getElementById('signupForm').classList.toggle('hidden');
        }
        function toggleSignupFields() {
            const role = document.getElementById('signupRole').value;
            const enrollmentGroup = document.getElementById('enrollmentGroup');
            const departmentGroup = document.getElementById('departmentGroup');
            const approvalNotice = document.getElementById('approvalNotice');

            if (role === 'student') {
                enrollmentGroup.classList.remove('hidden');
                departmentGroup.classList.add('hidden');
                approvalNotice.classList.add('hidden');
            } else if (role === 'coordinator' || role === 'teacher') {
                enrollmentGroup.classList.add('hidden');
                departmentGroup.classList.remove('hidden');
                approvalNotice.classList.remove('hidden');
            } else if (role === 'hod') {
                enrollmentGroup.classList.add('hidden');
                departmentGroup.classList.remove('hidden');
                approvalNotice.classList.add('hidden');
            } else {
                enrollmentGroup.classList.add('hidden');
                departmentGroup.classList.add('hidden');
                approvalNotice.classList.add('hidden');
            }
        }
        async function signup() {
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const role = document.getElementById('signupRole').value;
            const enrollment = document.getElementById('signupEnrollment').value;
            const department = document.getElementById('signupDepartment').value;

            if (!name || !email || !password) {
                showToast('Please fill in all fields', 'warning');
                return;
            }

            if (role === 'student' && !enrollment) {
                showToast('Please enter enrollment number for student role', 'warning');
                return;
            }

            if ((role === 'hod' || role === 'coordinator' || role === 'principal' || role === 'dean') && !department) {
                showToast('Please enter department', 'warning');
                return;
            }

            const btn = document.getElementById('signupBtn');
            if (btn) { btn.classList.add('loading'); btn.textContent = 'Creating account...'; }

            try {
                if (role === 'student' && enrollment) {
                    const duplicateCheck = await window.getDocs(window.query(window.collection(window.db, 'users'),
                        window.where('enrollment', '==', enrollment)));

                    if (!duplicateCheck.empty) {
                        showToast('Enrollment number already exists! Please use a unique enrollment number.', 'danger');
                        if (btn) { btn.classList.remove('loading'); btn.textContent = 'Create Account'; }
                        return;
                    }
                }

                const userCredential = await window.createUserWithEmailAndPassword(window.auth, email, password);
                const user = userCredential.user;

                const userData = {
                    name,
                    email,
                    role,
                    createdAt: new Date().toISOString(),
                    approved: (['student', 'hod'].includes(role)),
                    approvalStatus: (['student', 'hod'].includes(role)) ? 'approved' : 'pending',
                    isActive: true
                };

                if (role === 'student') {
                    userData.enrollment = enrollment;
                }
                if (role === 'hod' || role === 'coordinator' || role === 'teacher') {
                    userData.department = department;
                    userData.requestedRole = role;
                }
                if (role === 'teacher') {
                    userData.examRestricted = false;
                }

                await window.setDoc(window.doc(window.db, 'users', user.uid), userData);
                if (role !== 'student') {
                    try {
                        await window.sendEmailVerification(user);
                    } catch (verifyError) { }
                }
                await window.signOut(window.auth);

                if (role === 'hod') {
                    showToast('HOD account created! You can now login.', 'success', 6000);
                } else if (role === 'student') {
                    showToast('Account created successfully! You can now login.', 'success');
                } else {
                    showToast('Registration submitted! Your account requires HOD approval before access.', 'info', 6000);
                }
                document.getElementById('signupName').value = '';
                document.getElementById('signupEmail').value = '';
                document.getElementById('signupPassword').value = '';
                document.getElementById('signupEnrollment').value = '';
                document.getElementById('signupDepartment').value = '';

                if (btn) { btn.classList.remove('loading'); btn.textContent = 'Create Account'; }
                toggleAuth();
            } catch (error) {
                if (btn) { btn.classList.remove('loading'); btn.textContent = 'Create Account'; }
                if (error.code === 'auth/email-already-in-use') {
                    showToast('This email is already registered. Please login instead.', 'danger');
                } else if (error.code === 'auth/weak-password') {
                    showToast('Password should be at least 6 characters.', 'danger');
                } else if (error.code === 'auth/invalid-email') {
                    showToast('Invalid email address.', 'danger');
                } else {
                    showToast('Error: ' + error.message, 'danger');
                }
            }
        }
        async function adminCreateUser() {
            if (!window.currentUser || window.currentUser.role !== 'hod') {
                showToast('Access Denied: Only HOD can create user accounts', "danger");
                return;
            }

            const name = document.getElementById('adminCreateName').value.trim();
            const email = document.getElementById('adminCreateEmail').value.trim().toLowerCase();
            const password = document.getElementById('adminCreatePassword').value;
            const role = document.getElementById('adminCreateRole').value;
            const enrollment = document.getElementById('adminCreateEnrollment').value.trim();
            const department = document.getElementById('adminCreateDepartment').value.trim();

            if (!name || !email || !password) {
                showToast('Please fill in all required fields', "danger");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showToast('Invalid email format', 'danger');
                return;
            }

            if (password.length < 6) {
                showToast('Password must be at least 6 characters', "danger");
                return;
            }

            if (role === 'student' && !enrollment) {
                showToast('Please enter enrollment number for student role', "danger");
                return;
            }

            if ((role === 'hod' || role === 'coordinator' || role === 'teacher') && !department) {
                showToast('Please enter department for this role', 'danger');
                return;
            }

            try {

                const duplicateEmailCheck = await window.getDocs(
                    window.query(
                        window.collection(window.db, 'users'),
                        window.where('email', '==', email)
                    )
                );

                if (!duplicateEmailCheck.empty) {
                    showToast('Error: A user with this email already exists!', 'danger', 5000);
                    return;
                }

                const duplicateNameCheck = await window.getDocs(
                    window.query(
                        window.collection(window.db, 'users'),
                        window.where('name', '==', name)
                    )
                );

                if (!duplicateNameCheck.empty) {
                    if (!confirm(`⚠️ WARNING: A user with name "${name}" already exists.\n\nContinue creating account anyway?`)) {
                        return;
                    }
                }

                if (role === 'student') {
                    const duplicateCheck = await window.getDocs(window.query(window.collection(window.db, 'users'),
                        window.where('enrollment', '==', enrollment)));

                    if (!duplicateCheck.empty) {
                        showToast('Enrollment number already exists!', "danger");
                        return;
                    }
                }

                const userCredential = await window.createUserWithEmailAndPassword(window.secondaryAuth || window.auth, email, password);
                const newUser = userCredential.user;

                const userData = {
                    name,
                    email,
                    role,
                    createdAt: new Date().toISOString(),
                    createdBy: window.currentUser.uid,
                    createdByName: window.currentUser.name,
                    createdByRole: window.currentUser.role,
                    adminCreated: true,
                    isDeleted: false,
                    isActive: true,
                    lastModifiedBy: window.currentUser.uid,
                    lastModifiedAt: new Date().toISOString(),
                    modificationHistory: []
                };

                if (role === 'student') {
                    userData.enrollment = enrollment;
                }

                if (role === 'hod' || role === 'coordinator' || role === 'teacher') {
                    userData.department = department;
                }

                if (role === 'teacher') {
                    userData.examRestricted = false;
                }

                const autoApprove = true;
                userData.approved = autoApprove;
                userData.approvalStatus = autoApprove ? 'approved' : 'pending';

                await window.setDoc(window.doc(window.db, 'users', newUser.uid), userData);
                await window.signOut(window.secondaryAuth || window.auth);

                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'ADMIN_CREATE_USER',
                    createdUserId: newUser.uid,
                    createdUserEmail: email,
                    createdUserName: name,
                    createdUserRole: role,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    performedByRole: window.currentUser.role,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        department: department || null,
                        enrollment: enrollment || null,
                        autoApproved: autoApprove
                    }
                });

                document.getElementById('adminCreateName').value = '';
                document.getElementById('adminCreateEmail').value = '';
                document.getElementById('adminCreatePassword').value = '';
                document.getElementById('adminCreateEnrollment').value = '';
                document.getElementById('adminCreateDepartment').value = '';
                loadAllUsers();
                showToast(`✅ User created successfully!\n\nEmail: ${email}\nTemporary Password: ${password}\n\n⚠️ Important: Ask user to change password after first login.`, 'success', 10000);

            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    showToast('This email is already registered in the system.', "danger");
                } else if (error.code === 'auth/weak-password') {
                    showToast('Password should be at least 6 characters.', "danger");
                } else if (error.code === 'auth/invalid-email') {
                    showToast('Invalid email address format.', "danger");
                } else {
                    showToast('Error: ' + error.message, 'danger');
                }
            }
        }
        function toggleAdminCreateFields() {
            const role = document.getElementById('adminCreateRole').value;
            const enrollmentGroup = document.getElementById('adminEnrollmentGroup');
            const departmentGroup = document.getElementById('adminDepartmentGroup');

            if (role === 'student') {
                enrollmentGroup.classList.remove('hidden');
                departmentGroup.classList.add('hidden');
            } else if (role === 'hod' || role === 'coordinator' || role === 'teacher') {
                enrollmentGroup.classList.add('hidden');
                departmentGroup.classList.remove('hidden');
            } else {
                enrollmentGroup.classList.add('hidden');
                departmentGroup.classList.add('hidden');
            }
        }
        async function loadAllUsers() {
            const tbody = document.getElementById('allUsersList');
            if (!tbody) return;

            const roleFilter = document.getElementById('userFilterRole').value;

            tbody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';

            try {
                let q = window.collection(window.db, 'users');
                if (roleFilter) {
                    q = window.query(q, window.where('role', '==', roleFilter));
                }

                const snapshot = await window.getDocs(q);
                tbody.innerHTML = '';

                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    const created = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A';
                    const extraInfo = data.enrollment || data.department || '-';
                    const isActive = data.isActive !== false;
                    const isTeacher = data.role === 'teacher';

                    const row = tbody.insertRow();
                    if (!isActive) row.classList.add('teacher-row-disabled');
                    const approvalBadge = data.approvalStatus === 'approved'
                        ? '<span class="badge badge-success">Approved</span>'
                        : '<span class="badge badge-warning">Pending</span>';
                    const accountBadge = isActive
                        ? '<span class="account-status-on">ON</span>'
                        : '<span class="account-status-off">OFF</span>';
                    row.innerHTML = `
 <td><strong>${data.name}</strong></td>
<td style="font-size:12px;">${data.email}</td>
<td><span class="badge badge-info">${data.role.toUpperCase()}</span></td>
<td>${extraInfo}</td>
<td>${accountBadge}</td>
<td>${approvalBadge}</td>
<td>${created}</td>
<td style="white-space:nowrap;">
${data.approvalStatus !== 'approved' ? `<button class="btn btn-success btn-sm" onclick="approveUser('${docSnap.id}')">Approve</button> ` : ''}
${isTeacher ? `<button class="btn btn-sm ${isActive ? 'btn-off' : 'btn-on'}" onclick="toggleTeacherAccount('${docSnap.id}','${data.email}',${isActive})">${isActive ? 'Disable' : 'Enable'}</button> ` : ''}
<button class="btn btn-danger btn-sm" onclick="deleteUserFromManage('${docSnap.id}','${data.email}')">Delete</button>
</td> `;
                });

                if (snapshot.empty) {
                    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No users found</td></tr>';
                }
            } catch (error) {
                tbody.innerHTML = '<tr><td colspan="8">Error loading users</td></tr>';
            }
        }
        async function login() {
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                showToast('Please fill in all fields', 'warning');
                return;
            }

            const failedAttempts = window.failedLoginAttempts.get(email) || 0;
            if (failedAttempts >= 5) {
                showToast('Account locked due to too many failed attempts. Please contact administrator.', 'danger', 7000);
                return;
            }

            const btn = document.getElementById('loginBtn');
            if (btn) { btn.classList.add('loading'); btn.textContent = 'Logging in...'; }

            try {
                const userCredential = await window.signInWithEmailAndPassword(window.auth, email, password);
                const user = userCredential.user;

                if (btn) { btn.classList.remove('loading'); btn.textContent = 'Login'; }

                const userDoc = await window.getDoc(window.doc(window.db, 'users', user.uid));
                if (!userDoc.exists()) {
                    showToast('User record not found. Please contact the administrator.', 'danger');
                    await window.signOut(window.auth);
                    return;
                }

                const userData = userDoc.data();

                if (userData.isLocked) {
                    await window.signOut(window.auth);
                    if (btn) { btn.classList.remove('loading'); btn.textContent = 'Login'; }
                    showToast('Your account has been locked. Please contact administrator.', 'danger', 7000);
                    return;
                }

                if (userData.isDeleted || userData.isActive === false) {
                    await window.signOut(window.auth);
                    if (btn) { btn.classList.remove('loading'); btn.textContent = 'Login'; }
                    showToast('Your account has been deactivated. Please contact administrator.', 'danger', 7000);
                    return;
                }

                if (userData.role === 'teacher' && userData.isActive === false) {
                    await window.signOut(window.auth);
                    if (btn) { btn.classList.remove('loading'); btn.textContent = 'Login'; }
                    showToast('Your account has been disabled by the coordinator. Please contact your department.', 'danger', 7000);
                    return;
                }

                await window.clearFailedAttempts(email);

                try {
                    await window.addDoc(window.collection(window.db, 'audit_logs'), {
                        action: 'LOGIN_SUCCESS',
                        userEmail: email,
                        userId: userCredential.user.uid,
                        emailVerified: user.emailVerified,
                        timestamp: new Date().toISOString()
                    });
                } catch (logError) { }

                window.resetIdleTimer();

            } catch (error) {
                if (btn) { btn.classList.remove('loading'); btn.textContent = 'Login'; }

                const attempts = await window.logFailedLogin(email, error.code);

                try {
                    await window.addDoc(window.collection(window.db, 'audit_logs'), {
                        action: 'LOGIN_FAILED',
                        userEmail: email,
                        errorCode: error.code,
                        attemptNumber: attempts,
                        timestamp: new Date().toISOString()
                    });
                } catch (logError) { }

                if (attempts >= 5) {
                    await window.lockAccount(email);
                    showToast('Account locked due to too many failed attempts. Please contact administrator.', 'danger', 7000);
                    return;
                }

                if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    showToast(`Invalid email or password. ${5 - attempts} attempts remaining before account lock.`, 'danger', 5000);
                } else if (error.code === 'auth/too-many-requests') {
                    showToast('Too many failed login attempts. Please try again later or reset your password.', 'warning', 6000);
                } else {
                    showToast('Error: ' + error.message, 'danger');
                }
            }
        }
        async function logout() {
            _evalExamCache = {};
            try {
                await window.signOut(window.auth);
            } catch (error) {
                showToast('Error signing out: ' + error.message, 'danger');
            }
        }
        function showDashboard(role) {
            document.getElementById('authContainer').style.display = 'none';
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) { loginBtn.classList.remove('loading'); loginBtn.textContent = 'Login'; }
            hideAllDashboards();

            switch (role) {
                case 'hod':
                    document.getElementById('hodDashboard').classList.add('active');
                    const badge = document.getElementById('hodRoleBadge');
                    if (badge && window.currentUser) badge.textContent = 'HOD';
                    loadHODData();
                    loadCoordinatorsDropdown();
                    break;
                case 'coordinator':
                    document.getElementById('coordinatorDashboard').classList.add('active');
                    loadCoordinatorData();
                    loadTeachersDropdown();
                    break;
                case 'teacher':
                    document.getElementById('teacherDashboard').classList.add('active');
                    loadTeacherData();
                    break;
                case 'student':
                    document.getElementById('studentDashboard').classList.add('active');
                    loadStudentData();
                    break;
                default:
                    showToast('Unknown role "' + role + '". Please contact the administrator.', 'danger');
                    document.getElementById('authContainer').style.display = 'block';
                    window.signOut(window.auth);
                    break;
            }
            // Re-inject theme toggle button after dashboard becomes active
            if (typeof window._injectThemeToggles === 'function') {
                setTimeout(window._injectThemeToggles, 60);
            }
        }

        function hideAllDashboards() {
            document.getElementById('hodDashboard').classList.remove('active');
            document.getElementById('coordinatorDashboard').classList.remove('active');
            document.getElementById('teacherDashboard').classList.remove('active');
            document.getElementById('studentDashboard').classList.remove('active');
        }

        if (window.__portalMode === 'local' && typeof window.onAuthStateChanged === 'function' && !window.__localPortalAuthAttached) {
            window.__localPortalAuthAttached = true;
            window.onAuthStateChanged(window.auth, async (user) => {
                if (user) {
                    const userDoc = await window.getDoc(window.doc(window.db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();

                        if (userData.isLocked) {
                            await window.signOut(window.auth);
                            document.getElementById('authContainer').style.display = 'block';
                            hideAllDashboards();
                            setTimeout(() => {
                                if (typeof showToast === 'function') showToast('Your account has been locked. Please contact administrator.', 'danger', 7000);
                            }, 300);
                            return;
                        }

                        if (userData.isDeleted || (userData.hasOwnProperty('isActive') && userData.isActive === false && userData.role !== 'teacher')) {
                            await window.signOut(window.auth);
                            document.getElementById('authContainer').style.display = 'block';
                            hideAllDashboards();
                            setTimeout(() => {
                                if (typeof showToast === 'function') showToast('Your account has been deactivated. Please contact administrator.', 'danger', 7000);
                            }, 300);
                            return;
                        }

                        const autoApprovedRoles = ['student', 'hod'];
                        const needsApproval = !autoApprovedRoles.includes(userData.role) && (!userData.approved || userData.approvalStatus !== 'approved');
                        if (needsApproval) {
                            document.getElementById('authContainer').style.display = 'none';
                            document.getElementById('accessDeniedScreen').style.display = 'block';
                            document.getElementById('deniedEmail').textContent = userData.email;
                            document.getElementById('deniedRole').textContent = userData.role.toUpperCase();
                            hideAllDashboards();
                            return;
                        }

                        if (userData.role === 'teacher' && userData.isActive === false) {
                            await window.signOut(window.auth);
                            document.getElementById('authContainer').style.display = 'block';
                            hideAllDashboards();
                            setTimeout(() => {
                                if (typeof showToast === 'function') showToast('Your account has been disabled by the coordinator. Please contact your department.', 'danger', 7000);
                            }, 300);
                            return;
                        }

                        window.currentUser = { ...userData, uid: user.uid };
                        if (typeof window.resetIdleTimer === 'function') window.resetIdleTimer();
                        showDashboard(window.currentUser.role);
                    }
                } else {
                    window.currentUser = null;
                    document.getElementById('authContainer').style.display = 'block';
                    document.getElementById('accessDeniedScreen').style.display = 'none';
                    hideAllDashboards();
                }
            });
        }

        async function createDepartment() {
            const name = document.getElementById('deptName').value.trim();
            const code = document.getElementById('deptCode').value.trim().toUpperCase();

            if (!name || !code) {
                showToast('Please fill in all fields', "danger");
                return;
            }

            try {
                const duplicateCheck = await window.getDocs(window.query(window.collection(window.db, 'departments'),
                    window.where('code', '==', code)));

                if (!duplicateCheck.empty) {
                    showToast('Department code already exists!', "danger");
                    return;
                }

                await window.addDoc(window.collection(window.db, 'departments'), {
                    name,
                    code,
                    createdBy: window.currentUser.uid,
                    createdAt: new Date().toISOString(),
                    isActive: true
                });

                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'CREATE_DEPARTMENT',
                    departmentName: name,
                    departmentCode: code,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    timestamp: new Date().toISOString()
                });

                showToast('Department created successfully!', "success");
                document.getElementById('deptName').value = '';
                document.getElementById('deptCode').value = '';
                loadDepartments();
                loadHODData();
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }

        async function loadDepartments() {
            const tbody = document.getElementById('departmentsList');
            if (!tbody) return;

            tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';

            try {
                const snapshot = await window.getDocs(window.collection(window.db, 'departments'));
                tbody.innerHTML = '';

                for (const deptDoc of snapshot.docs) {
                    const data = deptDoc.data();
                    const created = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A';

                    const row = tbody.insertRow();
                    row.innerHTML = `
 <td><strong>${data.name}</strong></td>
<td>${data.code}</td>
<td>${created}</td> `;
                }

                if (snapshot.empty) {
                    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No departments created yet</td></tr>';
                }
            } catch (error) {
                tbody.innerHTML = '<tr><td colspan="3">Error loading departments</td></tr>';
            }
        }

        async function loadPendingApprovals() {
            const tbody = document.getElementById('pendingApprovalsList');
            if (!tbody) return;

            tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

            try {
                const snapshot = await window.getDocs(window.query(window.collection(window.db, 'users'),
                    window.where('approvalStatus', '==', 'pending')));

                tbody.innerHTML = '';

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const created = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A';

                    const row = tbody.insertRow();
                    row.innerHTML = `
 <td><strong>${data.name}</strong></td>
<td>${data.email}</td>
<td><span class="badge badge-warning">${data.role.toUpperCase()}</span></td>
<td>${data.department || '-'}</td>
<td>${created}</td>
<td>
<button class="btn btn-success btn-sm" onclick="approveUser('${doc.id}')">Approve</button>
<button class="btn btn-danger btn-sm" onclick="rejectUser('${doc.id}')">Reject</button>
</td> `;
                });

                if (snapshot.empty) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No pending approvals</td></tr>';
                }
            } catch (error) {
                tbody.innerHTML = '<tr><td colspan="6">Error loading approvals</td></tr>';
            }
        }

        async function approveUser(userId) {
            if (!window.currentUser) return;
            try {
                const userDoc = await window.getDoc(window.doc(window.db, 'users', userId));
                const userData = userDoc.data();

                await window.updateDoc(window.doc(window.db, 'users', userId), {
                    approved: true,
                    approvedBy: window.currentUser.uid,
                    approvedAt: new Date().toISOString(),
                    approvalStatus: 'approved'
                });

                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'APPROVE_USER',
                    userId: userId,
                    userEmail: userData.email,
                    userRole: userData.role,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    timestamp: new Date().toISOString()
                });

                showToast('User approved successfully!', "success");
                loadPendingApprovals();
                loadHODData();
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }

        async function rejectUser(userId) {
            if (!confirm('Reject and delete this user? This cannot be undone.')) return;
            if (!window.currentUser) return;
            try {
                const userDoc = await window.getDoc(window.doc(window.db, 'users', userId));
                const userData = userDoc.data();

                await window.deleteDoc(window.doc(window.db, 'users', userId));

                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'REJECT_USER',
                    userEmail: userData.email,
                    userRole: userData.role,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    timestamp: new Date().toISOString()
                });

                showToast('User rejected and removed!', "success");
                loadPendingApprovals();
                loadHODData();
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }

        async function exportDepartmentsExcel() {
            try {
                const snapshot = await window.getDocs(window.collection(window.db, 'departments'));
                if (snapshot.empty) {
                    showToast('No departments to export', "warning");
                    return;
                }

                const data = snapshot.docs.map(doc => {
                    const d = doc.data();
                    return {
                        'Department Name': d.name,
                        'Code': d.code,
                        'Created Date': d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A'
                    };
                });

                exportToExcel(data, `departments_${Date.now()}`, 'Departments');
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }
        function showHODSection(section, btn) {
            document.querySelectorAll('#hodDashboard .section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('#hodDashboard .nav-btn').forEach(b => b.classList.remove('active'));

            document.getElementById('hod' + section.charAt(0).toUpperCase() + section.slice(1)).classList.add('active');
            if (btn) btn.classList.add('active');
            if (section === 'analytics') {
                loadAuditLogs();
            } else if (section === 'coordinators') {
                loadCoordinatorsList();
            } else if (section === 'approvals') {
                loadPendingApprovals();
            } else if (section === 'departments') {
                loadDepartments();
            } else if (section === 'users') {
                loadAllUsers();
                loadTeacherAccountList();
            } else if (section === 'results') {
                loadResultsForHOD();
            }
        }

        async function loadHODData() {
            try {
                const deptsSnap = await window.getDocs(window.collection(window.db, 'departments'));
                const pendingSnap = await window.getDocs(window.query(window.collection(window.db, 'users'), window.where('approvalStatus', '==', 'pending')));
                const hodDept = window.currentUser.department || window.currentUser.departmentId;
                let coordQuery = window.query(window.collection(window.db, 'users'),
                    window.where('role', '==', 'coordinator'),
                    window.where('approved', '==', true));
                if (hodDept) {
                    coordQuery = window.query(window.collection(window.db, 'users'),
                        window.where('role', '==', 'coordinator'),
                        window.where('approved', '==', true),
                        window.where('department', '==', hodDept));
                }
                let teacherQuery = window.query(window.collection(window.db, 'users'),
                    window.where('role', '==', 'teacher'),
                    window.where('approved', '==', true));
                if (hodDept) {
                    teacherQuery = window.query(window.collection(window.db, 'users'),
                        window.where('role', '==', 'teacher'),
                        window.where('approved', '==', true),
                        window.where('department', '==', hodDept));
                }

                const [coordinatorsSnap, teachersSnap, studentsSnap, examsSnap] = await Promise.all([
                    window.getDocs(coordQuery),
                    window.getDocs(teacherQuery),
                    window.getDocs(window.query(window.collection(window.db, 'students'), window.limit(1000))),
                    window.getDocs(window.collection(window.db, 'exams'))
                ]);

                document.getElementById('hodTotalDepts').textContent = deptsSnap.size;
                document.getElementById('hodPendingApprovals').textContent = pendingSnap.size;
                document.getElementById('totalCoordinators').textContent = coordinatorsSnap.size;
                document.getElementById('totalTeachers').textContent = teachersSnap.size;
                document.getElementById('totalStudents').textContent = studentsSnap.size;
                document.getElementById('totalExams').textContent = examsSnap.size;

                loadCoordinatorsList();
                loadTeacherAccountList().catch(() => { });
            } catch (error) {
                showToast('Error loading dashboard: ' + error.message, 'danger');
            }
        }

        async function assignCoordinator() {
            const department = document.getElementById('coordDept').value;
            const emailSelect = document.getElementById('coordEmail').value;
            const emailManual = document.getElementById('coordEmailManual').value.trim();
            const email = emailSelect || emailManual;

            if (!department || !email) {
                showToast('Please fill in all fields', "danger");
                return;
            }

            try {
                const userQuery = await window.getDocs(window.query(window.collection(window.db, 'users'),
                    window.where('email', '==', email),
                    window.where('role', '==', 'coordinator')));

                if (userQuery.empty) {
                    showToast('User not found or not registered as Coordinator!\n\nThe user must first register with role "Coordinator".', "danger");
                    return;
                }

                const coordUser = userQuery.docs[0].data();
                const coordUserId = userQuery.docs[0].id;
                if (!coordUser.approved || coordUser.approvalStatus !== 'approved') {
                    showToast('This coordinator account is not approved yet!\n\nPlease approve the user first in "Pending Approvals" section.', "danger");
                    return;
                }
                const hodDept = window.currentUser.department || window.currentUser.departmentId;
                if (hodDept && coordUser.department && coordUser.department !== hodDept) {
                    showToast('Cross-department assignment not allowed. Coordinator dept: ' + coordUser.department, 'danger');
                    return;
                }
                const existingByEmail = await window.getDocs(window.query(window.collection(window.db, 'coordinator_assignments'),
                    window.where('email', '==', email)));
                if (!existingByEmail.empty) {
                    const existingDept = existingByEmail.docs[0].data().department;
                    if (existingDept === department) {
                        showToast('This coordinator is already assigned to this department!', 'danger');
                    } else {
                        showToast('This coordinator is already assigned to department "' + existingDept + '". A coordinator can only manage one department at a time. Remove the existing assignment first.', 'danger');
                    }
                    return;
                }

                const existingByDept = await window.getDocs(window.query(window.collection(window.db, 'coordinator_assignments'),
                    window.where('department', '==', department)));
                if (!existingByDept.empty) {
                    const existingCoord = existingByDept.docs[0].data().coordinatorName || existingByDept.docs[0].data().email;
                    showToast('Department "' + department + '" already has coordinator "' + existingCoord + '" assigned. Remove them first before assigning a new one.', 'danger');
                    return;
                }

                await window.addDoc(window.collection(window.db, 'coordinator_assignments'), {
                    department,
                    email,
                    coordinatorId: coordUserId,
                    coordinatorName: coordUser.name,
                    assignedBy: window.currentUser.uid,
                    assignedByName: window.currentUser.name,
                    assignedAt: new Date().toISOString()
                });
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'ASSIGN_COORDINATOR',
                    department: department,
                    coordinatorEmail: email,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    timestamp: new Date().toISOString()
                });

                showToast('Coordinator assigned successfully!', "success");
                document.getElementById('coordDept').value = '';
                document.getElementById('coordEmail').value = '';
                document.getElementById('coordEmailManual').value = '';
                loadCoordinatorsList();
                loadCoordinatorsDropdown();
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }

        async function removeCoordinator(assignmentId, department, email) {
            if (!window._pendingRemoval) {
                window._pendingRemoval = assignmentId;
                showToast('Click Remove again to confirm removing ' + email + ' from "' + department + '"', 'warning', 4000);
                setTimeout(() => { window._pendingRemoval = null; }, 4000);
                return;
            }
            window._pendingRemoval = null;
            try {
                await window.deleteDoc(window.doc(window.db, 'coordinator_assignments', assignmentId));
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'REMOVE_COORDINATOR',
                    department: department,
                    coordinatorEmail: email,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    timestamp: new Date().toISOString()
                });
                showToast('Coordinator removed from "' + department + '" successfully.', 'success');
                loadCoordinatorsList();
                loadCoordinatorsDropdown();
            } catch (error) {
                showToast('Error removing coordinator: ' + error.message, 'danger');
            }
        }

        async function loadCoordinatorsList() {
            const tbody = document.getElementById('coordinatorsList');
            tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

            try {
                const snapshot = await window.getDocs(window.collection(window.db, 'coordinator_assignments'));
                tbody.innerHTML = '';

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const assignedDate = data.assignedAt ? new Date(data.assignedAt).toLocaleDateString() : 'N/A';
                    const row = tbody.insertRow();
                    row.innerHTML = `
 <td><strong>${data.department}</strong></td>
<td>${data.coordinatorName || data.email.split('@')[0]}</td>
<td>${data.email}</td>
<td>${assignedDate}</td>
<td><button class="btn btn-danger btn-sm" onclick="removeCoordinator('${doc.id}','${data.department}','${data.email}')">Remove</button></td>`;
                });

                if (snapshot.empty) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No coordinators assigned yet</td></tr>';
                }
            } catch (error) {
                tbody.innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
            }
        }

        async function loadAuditLogs() {
            const auditDiv = document.getElementById('auditLogsList');
            const filter = document.getElementById('auditFilter').value;

            auditDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Loading audit logs...</div>';

            try {
                let q = window.collection(window.db, 'audit_logs');

                if (filter) {
                    q = window.query(q, window.where('action', '==', filter));
                }

                q = window.query(q, window.orderBy('timestamp', 'desc'));

                const snapshot = await window.getDocs(q);

                if (snapshot.empty) {
                    auditDiv.innerHTML = '<div class="alert alert-info">No audit logs found</div>';
                    return;
                }

                let html = '<table><thead><tr><th>Date/Time</th><th>Action</th><th>Details</th><th>Performed By</th><th>Academic Session</th></tr></thead><tbody>';

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const timestamp = data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A';

                    let details = '';
                    switch (data.action) {
                        case 'ADD_STUDENT':
                            details = `Student: ${data.studentName} (${data.studentEnrollment})`;
                            break;
                        case 'BULK_IMPORT_STUDENTS':
                            details = `Imported: ${data.successCount}, Skipped: ${data.skipCount}`;
                            break;
                        case 'EVALUATE_STUDENT':
                        case 'EVALUATE_STUDENT_CA':
                            details = `Marks: ${data.marks}`;
                            break;
                        case 'FINALIZE_EXAM_RESULTS':
                            details = `Exam: ${data.examName}<br>Students: ${data.totalStudents}<br>Reason: ${data.reason}`;
                            break;
                        default:
                            details = 'Action performed';
                    }

                    const badgeColor = data.irreversible ? 'danger' : 'info';

                    html += `
 <tr>
<td>${timestamp}</td>
<td><span class="badge badge-${badgeColor}">${data.action.replace(/_/g, ' ')}</span></td>
<td>${details}</td>
<td>${data.performedByName || data.performedBy || 'System'}</td>
<td>${data.academicYear || 'N/A'} / ${data.semester || 'N/A'}</td>
</tr> `;
                });

                html += '</tbody></table>';
                auditDiv.innerHTML = html;
            } catch (error) {
                auditDiv.innerHTML = '<div class="alert alert-danger">Error loading audit logs: ' + error.message + '</div>';
            }
        }
        function showCoordSection(section, btn) {
            document.querySelectorAll('#coordinatorDashboard .section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('#coordinatorDashboard .nav-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('coord' + section.charAt(0).toUpperCase() + section.slice(1)).classList.add('active');
            if (btn) btn.classList.add('active');
            if (section === 'classes') { loadClassesList(); loadClassesDropdown(); }
            else if (section === 'subjects') loadSubjectsList();
            else if (section === 'students') loadStudentsList();
            else if (section === 'exams') loadExamsList();
            else if (section === 'teachers') { loadTeacherAssignments(); loadTeachersDropdown(); loadTeacherAccountList(); }
            else if (section === 'results') { loadExamsList(); loadResultsForCoordinator(); loadResults(); }
            else if (section === 'questionbank') {
                loadQuestionBankSubjects();
                loadQuestions();

                const dateInput = document.getElementById('distDate');
                if (dateInput && !dateInput.value) {
                    dateInput.value = new Date().toISOString().split('T')[0];
                }
            }
        }

        async function loadCoordinatorData() {
            const year = document.getElementById('academicYear').value;
            const semester = document.getElementById('semester').value;
            try {
                const [subjectsSnap, studentsSnap, examsSnap] = await Promise.all([
                    window.getDocs(window.query(window.collection(window.db, 'subjects'),
                        window.where('academicYear', '==', year),
                        window.where('semester', '==', semester))),
                    window.getDocs(window.query(window.collection(window.db, 'students'), window.limit(1000))),
                    window.getDocs(window.query(window.collection(window.db, 'exams'),
                        window.where('academicYear', '==', year),
                        window.where('semester', '==', semester)))
                ]);
                const nonFinalizedIds = examsSnap.docs.filter(d => d.data().status !== 'FINALIZED').map(d => d.id);
                let pendingCount = 0;
                if (nonFinalizedIds.length > 0) {
                    const pendingPromises = nonFinalizedIds.map(eid =>
                        window.getDocs(window.query(window.collection(window.db, 'results'),
                            window.where('examId', '==', eid),
                            window.where('status', '==', 'INCOMPLETE')))
                    );
                    const pendingSnaps = await Promise.all(pendingPromises);
                    pendingCount = pendingSnaps.reduce((s, snap) => s + snap.size, 0);
                }

                document.getElementById('coordTotalSubjects').textContent = subjectsSnap.size;
                document.getElementById('coordTotalStudents').textContent = studentsSnap.size;
                document.getElementById('coordTotalExams').textContent = examsSnap.size;
                document.getElementById('coordPendingEvals').textContent = pendingCount;

                loadSubjectsList();
                loadStudentsList();
                loadExamsList();
                loadTeacherAssignments();
                loadEvaluationProgress(examsSnap);
                loadClassesDropdown();
                loadTeacherAccountList().catch(() => { });

                loadQuestionBankSubjects();
            } catch (error) {
                showToast('Error loading dashboard: ' + error.message, 'danger');
            }
        }

        async function loadQuestionBankSubjects() {
            const year = document.getElementById('academicYear')?.value;
            const semester = document.getElementById('semester')?.value;

            if (!year || !semester) return;

            try {
                const snapshot = await getDocs(
                    query(
                        collection(window.db, 'subjects'),
                        where('academicYear', '==', year),
                        where('semester', '==', semester)
                    )
                );

                const options = snapshot.docs.map(doc => {
                    const s = doc.data();
                    return `<option value="${doc.id}">${s.name} (${s.code}) - ${s.class} ${s.division}</option>`;
                }).join('');

                const baseOption = '<option value="">Select Subject</option>';

                const dropdowns = [
                    'qbSubjectSelect',
                    'qbFilterSubject',
                    'distSubject',
                    'historySubject'
                ];

                dropdowns.forEach(id => {
                    const elem = document.getElementById(id);
                    if (elem) elem.innerHTML = baseOption + options;
                });

            } catch (error) {
                console.error('Error loading QB subjects:', error);
            }
        }

        window.loadQuestionBankSubjects = loadQuestionBankSubjects;

        async function loadEvaluationProgress(examsSnap) {
            const progressDiv = document.getElementById('evaluationProgress');

            if (!examsSnap || examsSnap.empty) {
                progressDiv.innerHTML = '<p style="color: #6b7280;">No exams created yet</p>';
                return;
            }

            progressDiv.innerHTML = '<div class="loading">Calculating progress...</div>';

            try {
                let html = '<table><thead><tr><th>Exam</th><th>Status</th><th>Evaluated</th><th>Incomplete</th><th>Completion %</th><th>Action</th></tr></thead><tbody>';

                for (const examDoc of examsSnap.docs) {
                    const examData = examDoc.data();
                    const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', examData.subjectId));
                    const subjectData = subjectDoc.exists() ? subjectDoc.data() : { name: 'N/A' };

                    const resultsSnap = await window.getDocs(window.query(window.collection(window.db, 'results'),
                        window.where('examId', '==', examDoc.id)));

                    const completeCount = resultsSnap.docs.filter(d => d.data().status === 'COMPLETE').length;
                    const incompleteCount = resultsSnap.docs.filter(d => d.data().status === 'INCOMPLETE').length;
                    const totalEvaluated = resultsSnap.size;
                    const studentsSnap = await window.getDocs(window.query(window.collection(window.db, 'students'),
                        window.where('class', '==', subjectData.class),
                        window.where('division', '==', subjectData.division)));

                    const expectedCount = studentsSnap.size;
                    const completionPercentage = expectedCount > 0 ? ((totalEvaluated / expectedCount) * 100).toFixed(1) : 0;

                    const statusBadge = examData.status === 'FINALIZED' ?
                        '<span class="badge badge-danger">FINALIZED</span>' :
                        '<span class="badge badge-success">ACTIVE</span>';

                    const progressColor = completionPercentage >= 100 ? 'success' :
                        completionPercentage >= 50 ? 'warning' : 'danger';

                    html += `
 <tr>
<td><strong>${examData.name}</strong><br><small>${subjectData.name}</small></td>
<td>${statusBadge}</td>
<td><span class="badge badge-success">${completeCount}</span></td>
<td><span class="badge badge-warning">${incompleteCount}</span></td>
<td><span class="badge badge-${progressColor}">${completionPercentage}% (${totalEvaluated}/${expectedCount})</span></td>
<td> ${examData.status !== 'FINALIZED' ?
                            `<button class="btn btn-primary btn-sm" onclick="showToast('Teacher evaluation in progress', "info")">Monitor</button>` :
                            '<small>Locked</small>'}
 </td>
</tr> `;
                }

                html += '</tbody></table>';
                progressDiv.innerHTML = html;
            } catch (error) {
                progressDiv.innerHTML = '<p style="color: #ef4444;">Error loading progress</p>';
            }
        }

        async function addSubject() {
            if (!window.currentUser) { showToast('Session expired. Please log in again.', 'danger'); return; }
            const name = document.getElementById('subjectName').value.trim();
            const code = document.getElementById('subjectCode').value.trim();
            const classVal = document.getElementById('subjectClass').value.trim();
            const division = document.getElementById('subjectDivision').value.trim();
            const year = document.getElementById('academicYear').value;
            const semester = document.getElementById('semester').value;

            if (!name || !code || !classVal || !division) {
                showToast('Please fill in all fields', "danger");
                return;
            }

            try {
                const duplicateCheck = await window.getDocs(window.query(window.collection(window.db, 'subjects'),
                    window.where('code', '==', code),
                    window.where('class', '==', classVal),
                    window.where('division', '==', division),
                    window.where('academicYear', '==', year),
                    window.where('semester', '==', semester)));

                if (!duplicateCheck.empty) {
                    const existingSubject = duplicateCheck.docs[0].data();
                    if (!existingSubject.isDeleted) {
                        showToast('This subject already exists for this class, division, and semester!', "danger");
                        return;
                    }
                }

                await window.addDoc(window.collection(window.db, 'subjects'), {
                    name,
                    code,
                    class: classVal,
                    division,
                    academicYear: year,
                    semester,
                    createdBy: window.currentUser.uid,
                    createdAt: new Date().toISOString(),
                    isDeleted: false
                });
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'ADD_SUBJECT',
                    subjectCode: code,
                    subjectName: name,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    timestamp: new Date().toISOString(),
                    academicYear: year,
                    semester: semester
                });

                showToast('Subject added successfully!', "success");
                document.getElementById('subjectName').value = '';
                document.getElementById('subjectCode').value = '';
                document.getElementById('subjectClass').value = '';
                document.getElementById('subjectDivision').value = '';
                loadSubjectsList();
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }

        async function loadSubjectsList() {
            const tbody = document.getElementById('subjectsList');
            const assignSelect = document.getElementById('assignSubject');
            tbody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';
            assignSelect.innerHTML = '<option value="">Select subject</option>';

            try {
                const year = document.getElementById('academicYear').value;
                const semester = document.getElementById('semester').value;
                const snapshot = await window.getDocs(window.query(window.collection(window.db, 'subjects'),
                    window.where('academicYear', '==', year),
                    window.where('semester', '==', semester)));
                tbody.innerHTML = '';

                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    if (data.isDeleted) return;

                    const row = tbody.insertRow();
                    row.innerHTML = `
 <td>${data.code}</td>
<td>${data.name}</td>
<td>${data.class}</td>
<td>${data.division}</td>
<td><button class="btn btn-danger btn-sm" onclick="deleteSubject('${docSnap.id}')">Delete</button></td> `;

                    const option = document.createElement('option');
                    option.value = docSnap.id;
                    option.textContent = `${data.code} - ${data.name} (${data.class}-${data.division})`;
                    assignSelect.appendChild(option);
                });

                if (tbody.rows.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No subjects added yet</td></tr>';
                }
            } catch (error) {
                tbody.innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
            }
        }

        async function deleteSubject(id) {
            {
                try {
                    await window.updateDoc(window.doc(window.db, 'subjects', id), {
                        isDeleted: true,
                        deletedAt: new Date().toISOString(),
                        deletedBy: window.currentUser.uid
                    });
                    await window.addDoc(window.collection(window.db, 'audit_logs'), {
                        action: 'SOFT_DELETE_SUBJECT',
                        subjectId: id,
                        performedBy: window.currentUser.uid,
                        performedByName: window.currentUser.name,
                        timestamp: new Date().toISOString(),
                        academicYear: document.getElementById('academicYear').value,
                        semester: document.getElementById('semester').value
                    });

                    showToast('Subject deleted successfully (can be restored by admin)', "success");
                    loadSubjectsList();
                } catch (error) {
                    showToast('Error: ' + error.message, 'danger');
                }
            }
        }

        async function addStudent() {
            if (!window.currentUser) { showToast('Session expired. Please log in again.', 'danger'); return; }
            const enrollment = document.getElementById('studentEnrollment').value;
            const name = document.getElementById('studentName').value;
            const classVal = document.getElementById('studentClass').value;
            const division = document.getElementById('studentDivision').value;

            if (!enrollment || !name || !classVal || !division) {
                showToast('Please fill in all fields', "warning");
                return;
            }

            try {
                const duplicateCheck = await window.getDocs(window.query(window.collection(window.db, 'students'),
                    window.where('enrollment', '==', enrollment)));

                if (!duplicateCheck.empty) {
                    showToast('ERROR: Enrollment number already exists!\nEnrollment numbers must be unique.', "danger");
                    return;
                }

                await window.addDoc(window.collection(window.db, 'students'), {
                    enrollment,
                    name,
                    class: classVal,
                    division,
                    academicYear: document.getElementById('academicYear').value,
                    semester: document.getElementById('semester').value,
                    createdBy: window.currentUser.uid,
                    createdAt: new Date().toISOString(),
                    isActive: true
                });
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'ADD_STUDENT',
                    studentEnrollment: enrollment,
                    studentName: name,
                    performedBy: window.currentUser.uid,
                    timestamp: new Date().toISOString(),
                    academicYear: document.getElementById('academicYear').value,
                    semester: document.getElementById('semester').value
                });

                showToast('Student added successfully!', "success");
                document.getElementById('studentEnrollment').value = '';
                document.getElementById('studentName').value = '';
                document.getElementById('studentClass').value = '';
                document.getElementById('studentDivision').value = '';
                loadStudentsList();
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }
        let csvData = [];

        function handleCSVUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                const text = e.target.result;
                parseCSV(text);
            };
            reader.readAsText(file);
        }

        function parseCSV(text) {
            const lines = text.split('\n').filter(line => line.trim());
            const preview = document.getElementById('csvPreview');
            csvData = [];
            let errors = [];
            const startIdx = lines[0].toLowerCase().includes('name') ? 1 : 0;

            for (let i = startIdx; i < lines.length; i++) {
                const parts = lines[i].split(',').map(p => p.trim());

                if (parts.length < 4) {
                    errors.push(`Line ${i + 1}: Incomplete data`);
                    continue;
                }

                const [name, enrollment, classVal, division] = parts;

                if (!name || !enrollment || !classVal || !division) {
                    errors.push(`Line ${i + 1}: Missing required fields`);
                    continue;
                }

                csvData.push({ name, enrollment, class: classVal, division });
            }

            let html = `<div class="alert alert-${errors.length > 0 ? 'warning' : 'success'}">
<strong>Preview:</strong> ${csvData.length} students ready to import`;

            if (errors.length > 0) {
                html += `<br><strong>Errors:</strong><br>${errors.join('<br>')}`;
            }
            html += '</div>';

            if (csvData.length > 0) {
                html += '<table style="margin-top: 10px;"><thead><tr><th>Name</th><th>Enrollment</th><th>Class</th><th>Division</th></tr></thead><tbody>';
                csvData.slice(0, 10).forEach(student => {
                    html += `<tr><td>${student.name}</td><td>${student.enrollment}</td><td>${student.class}</td><td>${student.division}</td></tr>`;
                });
                if (csvData.length > 10) {
                    html += `<tr><td colspan="4" style="text-align: center;">... and ${csvData.length - 10} more</td></tr>`;
                }
                html += '</tbody></table>';
                document.getElementById('importBtn').style.display = 'block';
            }

            preview.innerHTML = html;
        }

        function handleExcelUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.name.match(/\.(xlsx|xls)$/i)) {
                showToast('Please select a valid Excel file (.xlsx or .xls)', 'danger');
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                        showToast('Excel file has no sheets', 'danger');
                        return;
                    }
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
                    parseExcelStudents(jsonData);
                } catch (err) {
                    console.error('Excel parse error:', err);
                    showToast('Failed to parse Excel file. Please check the format.', 'danger');
                }
            };
            reader.onerror = function () { showToast('Failed to read Excel file', 'danger'); };
            reader.readAsArrayBuffer(file);
        }

        function parseExcelStudents(rows) {
            const preview = document.getElementById('csvPreview');
            csvData = [];
            const errors = [];

            rows.forEach((row, idx) => {
                const keys = Object.keys(row);
                const get = (variants) => {
                    const k = keys.find(k => variants.some(v => k.trim().toLowerCase() === v.toLowerCase()));
                    return k ? String(row[k]).trim() : '';
                };
                const name = get(['name', 'studentname', 'student name', 'full name', 'fullname']);
                const enrollment = get(['enrollmentno', 'enrollment', 'enrollno', 'enrollment no', 'enrollment number', 'enrollmentnumber']);
                const classVal = get(['class', 'classname', 'class name']);
                const division = get(['division', 'div', 'section']);

                if (!name || !enrollment || !classVal || !division) {
                    errors.push(`Row ${idx + 2}: Missing required field(s) – Name, EnrollmentNo, Class, Division`);
                    return;
                }
                csvData.push({ name, enrollment, class: classVal, division });
            });

            let html = `<div class="alert alert-${errors.length > 0 ? 'warning' : 'success'}">
 <strong>Preview:</strong> ${csvData.length} student(s) ready to import`;
            if (errors.length > 0) {
                html += `<br><strong>Warnings:</strong><br>${errors.slice(0, 5).join('<br>')}${errors.length > 5 ? `<br>...and ${errors.length - 5} more` : ''}`;
            }
            html += '</div>';

            if (csvData.length > 0) {
                html += '<table style="margin-top:10px;"><thead><tr><th>Name</th><th>Enrollment</th><th>Class</th><th>Division</th></tr></thead><tbody>';
                csvData.slice(0, 10).forEach(s => {
                    html += `<tr><td>${s.name}</td><td>${s.enrollment}</td><td>${s.class}</td><td>${s.division}</td></tr>`;
                });
                if (csvData.length > 10) {
                    html += `<tr><td colspan="4" style="text-align:center;">… and ${csvData.length - 10} more</td></tr>`;
                }
                html += '</tbody></table>';
                document.getElementById('importBtn').style.display = 'block';
            } else {
                document.getElementById('importBtn').style.display = 'none';
            }
            preview.innerHTML = html;
        }

        async function importStudentsExcel() {
            return importStudentsCSV();
        }

        async function exportStudentsExcel() {
            try {
                const snapshot = await window.getDocs(window.collection(window.db, 'students'));
                if (snapshot.empty) {
                    showToast('No students to export', 'warning');
                    return;
                }
                const data = [];
                snapshot.forEach(docSnap => {
                    const d = docSnap.data();
                    data.push({
                        'Enrollment No': d.enrollment || '',
                        'Name': d.name || '',
                        'Class': d.class || '',
                        'Division': d.division || '',
                        'Academic Year': d.academicYear || '',
                        'Semester': d.semester || '',
                        'Status': d.isActive ? 'Active' : 'Inactive'
                    });
                });
                exportToExcel(data, `students_${Date.now()}`, 'Students');
                showToast('Students exported to Excel successfully!', 'success');
            } catch (error) {
                showToast('Error exporting students: ' + error.message, 'danger');
            }
        }

        async function importStudentsCSV() {
            if (csvData.length === 0) {
                showToast('No data to import', "warning");
                return;
            }

            const importBtn = document.getElementById('importBtn');
            importBtn.disabled = true;
            importBtn.textContent = 'Importing...';

            let successCount = 0;
            let skipCount = 0;
            let errors = [];

            try {
                for (const student of csvData) {
                    try {
                        const duplicateCheck = await window.getDocs(window.query(window.collection(window.db, 'students'),
                            window.where('enrollment', '==', student.enrollment)));

                        if (!duplicateCheck.empty) {
                            skipCount++;
                            errors.push(`${student.enrollment} - Duplicate`);
                            continue;
                        }

                        await window.addDoc(window.collection(window.db, 'students'), {
                            name: student.name,
                            enrollment: student.enrollment,
                            class: student.class,
                            division: student.division,
                            academicYear: document.getElementById('academicYear').value,
                            semester: document.getElementById('semester').value,
                            createdBy: window.currentUser.uid,
                            createdAt: new Date().toISOString(),
                            importedViaCSV: true,
                            isActive: true
                        });

                        successCount++;
                    } catch (error) {
                        errors.push(`${student.enrollment} - ${error.message}`);
                    }
                }
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'BULK_IMPORT_STUDENTS',
                    totalAttempted: csvData.length,
                    successCount,
                    skipCount,
                    performedBy: window.currentUser.uid,
                    timestamp: new Date().toISOString(),
                    academicYear: document.getElementById('academicYear').value,
                    semester: document.getElementById('semester').value
                });

                let message = ` Import Complete!\n\nSuccessfully imported: ${successCount}\nSkipped (duplicates): ${skipCount}`;

                if (errors.length > 0 && errors.length <= 5) {
                    message += '\n\nErrors:\n' + errors.join('\n');
                }

                showToast(message, 'warning');

                document.getElementById('csvFile').value = '';
                document.getElementById('csvPreview').innerHTML = '';
                importBtn.style.display = 'none';
                csvData = [];

                loadStudentsList();
            } catch (error) {
                showToast('Import error: ' + error.message, 'danger');
            } finally {
                importBtn.disabled = false;
                importBtn.textContent = 'Import Students';
            }
        }

        let allStudentsData = [];

        async function loadStudentsList() {
            const tbody = document.getElementById('studentsList');
            const countDiv = document.getElementById('studentsCount');
            tbody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';

            try {
                const year = document.getElementById('academicYear')?.value;
                const semester = document.getElementById('semester')?.value;
                let studentsQuery = year && semester
                    ? window.query(window.collection(window.db, 'students'),
                        window.where('academicYear', '==', year),
                        window.where('semester', '==', semester),
                        window.orderBy('enrollment'), window.limit(500))
                    : window.query(window.collection(window.db, 'students'),
                        window.orderBy('enrollment'), window.limit(500));
                const snapshot = await window.getDocs(studentsQuery);

                allStudentsData = [];
                snapshot.forEach(docSnap => {
                    allStudentsData.push(docSnap.data());
                });

                displayStudents(allStudentsData);

                if (countDiv) {
                    countDiv.textContent = `Total: ${allStudentsData.length} students`;
                    if (snapshot.size === 200) {
                        countDiv.textContent += ' (showing first 200)';
                    }
                }
            } catch (error) {
                tbody.innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
            }
        }

        function displayStudents(students) {
            const tbody = document.getElementById('studentsList');
            tbody.innerHTML = '';

            students.forEach(data => {
                const row = tbody.insertRow();
                row.innerHTML = `
 <td>${data.enrollment}</td>
<td>${data.name}</td>
<td>${data.class}</td>
<td>${data.division}</td>
<td><span class="badge badge-success">Active</span></td> `;
            });

            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No students found</td></tr>';
            }
        }

        var _filterDebounce;

        function filterStudents() {

            clearTimeout(_filterDebounce);

            _filterDebounce = setTimeout(_doFilterStudents, 180);

        }

        function _doFilterStudents() {
            const searchText = document.getElementById('studentSearch')?.value?.toLowerCase() || '';
            const countDiv = document.getElementById('studentsCount');

            if (!searchText) {
                displayStudents(allStudentsData);
                if (countDiv) countDiv.textContent = `Total: ${allStudentsData.length} students`;
                return;
            }

            const filtered = allStudentsData.filter(student => student.name.toLowerCase().includes(searchText) ||
                student.enrollment.toLowerCase().includes(searchText) ||
                student.class.toLowerCase().includes(searchText) ||
                student.division.toLowerCase().includes(searchText)
            );

            displayStudents(filtered);
            if (countDiv) countDiv.textContent = `Showing: ${filtered.length} of ${allStudentsData.length} students`;
        }

        function filterResults() {
            const searchText = document.getElementById('resultSearch')?.value?.toLowerCase() || '';
            const table = document.querySelector('#resultsTable table');
            if (!table) return;
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = !searchText || text.includes(searchText) ? '' : 'none';
            });
        }

        function openExamModal(type) {
            const modal = document.getElementById('examModal');
            const title = document.getElementById('examModalTitle');
            const body = document.getElementById('examModalBody');

            title.textContent = type === 'standard' ? 'Create Standard Exam' : 'Create CA Exam';

            if (type === 'standard') {
                body.innerHTML = `
 <div class="form-group">
<label>Exam Name</label>
<input type="text" id="examName" placeholder="e.g., Mid-Term Exam">
</div>
<div class="form-group">
<label>Subject</label>
<select id="examSubject"></select>
</div>
<div class="form-group">
<label>Exam Type</label>
<select id="examType">
<option value="theory">Theory</option>
<option value="practical">Practical</option>
<option value="viva">Viva</option>
<option value="assignment">Assignment</option>
</select>
</div>

<div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:12px;margin-bottom:16px;">
<strong>⚡ Quick Templates:</strong>
<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
<button type="button" class="btn btn-sm btn-warning" onclick="applyStandardTemplate('theory')" style="font-size:12px;">
📝 Theory (5 criteria)
</button>
<button type="button" class="btn btn-sm btn-info" onclick="applyStandardTemplate('practical')" style="font-size:12px;">
🔬 Practical (4 criteria)
</button>
<button type="button" class="btn btn-sm btn-success" onclick="applyStandardTemplate('assignment')" style="font-size:12px;">
📄 Assignment (3 criteria)
</button>
<button type="button" class="btn btn-sm btn-primary" onclick="addMultipleCriteria(5)" style="font-size:12px;">
➕ Add 5 Blank
</button>
</div>
</div>

<div class="criteria-builder">
<label>Criteria (Add criteria with max marks)</label>
<div id="criteriaList"></div>
<button type="button" class="btn btn-secondary btn-sm" onclick="addCriterion()">+ Add One Criterion</button>
</div>
<div class="btn-group">
<button class="btn btn-primary" onclick="createStandardExam()">✅ Create Exam</button>
<button class="btn btn-secondary" onclick="closeExamModal()">Cancel</button>
</div> `;
                loadSubjectsDropdown('examSubject');

            } else {
                body.innerHTML = `
 <div style="display:flex;gap:10px;margin-bottom:16px;border-bottom:2px solid #e5e7eb;padding-bottom:12px;">
<button id="caTab1" class="btn btn-primary btn-sm" onclick="switchCATab(1)" style="flex:1;">Step 1: Exam Info & Question Bank</button>
<button id="caTab2" class="btn btn-secondary btn-sm" onclick="switchCATab(2)" style="flex:1;">Step 2: CO Setup & Assignment</button>
</div>
<div id="caTabPanel1">
<div class="form-row">
<div class="form-group">
<label>Exam Name</label>
<input type="text" id="examName" placeholder="e.g., CA-1 Assessment">
</div>
<div class="form-group">
<label>Subject</label>
<select id="examSubject"></select>
</div>
</div>
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:16px;">
<h4 style="margin:0 0 10px;color:#166534;">Question Bank - Upload Questions per Lesson</h4>
<p style="font-size:13px;color:#374151;margin:0 0 12px;">Add lessons and their questions. Each question will be available for random assignment to students per CO.</p>
<div id="lessonList"></div>
<button type="button" class="btn btn-success btn-sm" onclick="addLesson()" style="margin-top:8px;">+ Add Lesson</button>
</div>
<div class="btn-group">
<button class="btn btn-primary" onclick="switchCATab(2)">Next: CO Setup</button>
<button class="btn btn-secondary" onclick="closeExamModal()">Cancel</button>
</div>
</div>
<div id="caTabPanel2" style="display:none;">
<div class="alert alert-info" style="font-size:13px;margin-bottom:12px;">For each CO: write the outcome description, select which lesson to draw questions from, set how many questions each student gets randomly, and set marks per criterion.
</div>
<div id="coList"></div>
<div class="btn-group" style="margin-top:16px;">
<button class="btn btn-primary" onclick="createCAExam()">Create CA Exam</button>
<button class="btn btn-secondary" onclick="switchCATab(1)">Back</button>
<button class="btn btn-secondary" onclick="closeExamModal()">Cancel</button>
</div>
</div> `;
                loadSubjectsDropdown('examSubject');
                lessonCounter = 0;
                addLesson();
                buildCOStructure();
            }

            modal.classList.add('active');
        }

        function closeExamModal() {
            document.getElementById('examModal').classList.remove('active');
        }

        async function loadSubjectsDropdown(selectId) {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select subject</option>';

            try {
                const year = document.getElementById('academicYear').value;
                const semester = document.getElementById('semester').value;
                const snapshot = await window.getDocs(window.query(window.collection(window.db, 'subjects'),
                    window.where('academicYear', '==', year),
                    window.where('semester', '==', semester)));

                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    const option = document.createElement('option');
                    option.value = docSnap.id;
                    option.textContent = `${data.code} - ${data.name}`;
                    select.appendChild(option);
                });
            } catch (error) { }
        }

        let criterionCount = 0;
        function addCriterion() {
            const list = document.getElementById('criteriaList');
            const div = document.createElement('div');
            div.className = 'criteria-item';
            div.innerHTML = `
 <input type="text" placeholder="Criterion name (e.g., Understanding)" class="criterion-name">
<input type="number" placeholder="Max marks" class="criterion-marks" style="width: 150px;">
<button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">Remove</button> `;
            list.appendChild(div);

            const newInput = div.querySelector('.criterion-name');
            if (newInput) newInput.focus();

            criterionCount++;
        }

        function addMultipleCriteria(count = 5) {
            const names = ['Understanding', 'Application', 'Analysis', 'Synthesis', 'Evaluation'];
            for (let i = 0; i < count; i++) {
                const list = document.getElementById('criteriaList');
                const div = document.createElement('div');
                div.className = 'criteria-item';
                div.innerHTML = `
 <input type="text" placeholder="Criterion name" class="criterion-name" value="${names[i] || ''}">
<input type="number" placeholder="Max marks" class="criterion-marks" value="20" style="width: 150px;">
<button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">Remove</button> `;
                list.appendChild(div);
                criterionCount++;
            }
            showToast(`✅ Added ${count} criteria`, 'success', 1500);
        }

        function applyStandardTemplate(type) {
            const criteriaList = document.getElementById('criteriaList');
            criteriaList.innerHTML = '';

            let templates = {
                'theory': [
                    { name: 'Knowledge & Understanding', marks: 25 },
                    { name: 'Application', marks: 25 },
                    { name: 'Analysis', marks: 20 },
                    { name: 'Problem Solving', marks: 20 },
                    { name: 'Critical Thinking', marks: 10 }
                ],
                'practical': [
                    { name: 'Procedure & Setup', marks: 25 },
                    { name: 'Execution', marks: 35 },
                    { name: 'Observations & Data', marks: 20 },
                    { name: 'Results & Conclusion', marks: 20 }
                ],
                'assignment': [
                    { name: 'Content Quality', marks: 40 },
                    { name: 'Presentation', marks: 30 },
                    { name: 'Timeliness', marks: 30 }
                ]
            };

            const criteria = templates[type] || [];
            criteria.forEach(c => {
                const div = document.createElement('div');
                div.className = 'criteria-item';
                div.innerHTML = `
 <input type="text" placeholder="Criterion name" class="criterion-name" value="${c.name}">
<input type="number" placeholder="Max marks" class="criterion-marks" value="${c.marks}" style="width: 150px;">
<button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">✕</button> `;
                criteriaList.appendChild(div);
            });

            showToast(`✅ Applied ${type.toUpperCase()} template with ${criteria.length} criteria`, 'success', 2000);
        }

        let lessonCounter = 0;
        function addLesson() {
            lessonCounter++;
            const id = `lesson-${lessonCounter}`;
            const list = document.getElementById('lessonList');
            if (!list) return;
            const div = document.createElement('div');
            div.id = id;
            div.style.cssText = 'background:#fff;border:1px solid #d1fae5;border-radius:8px;padding:12px;margin-bottom:10px;';
            div.innerHTML = `
 <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
<input type="text" class="lesson-name" placeholder="Lesson name (e.g., Unit 1 - Arrays)" 
 style="flex:1;padding:8px 12px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;" 
 oninput="refreshLessonDropdowns()">
<button type="button" onclick="removeLesson('${id}')" 
 style="background:#fee2e2;color:#dc2626;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:13px;">✕ Remove</button>
</div>

<div style="background:#f0f9ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px;margin-bottom:8px;">
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
<button type="button" onclick="addBulkQuestions('${id}')" class="btn btn-sm btn-primary" style="font-size:12px;padding:4px 10px;">
📝 Paste Multiple
</button>
<button type="button" onclick="addMultipleQuestions('${id}', 5)" class="btn btn-sm btn-success" style="font-size:12px;padding:4px 10px;">
➕ Add 5 Blank
</button>
<button type="button" onclick="addMultipleQuestions('${id}', 10)" class="btn btn-sm btn-info" style="font-size:12px;padding:4px 10px;">
➕ Add 10 Blank
</button>
</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;">
<label style="cursor:pointer;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:6px;padding:4px 10px;font-size:12px;display:flex;align-items:center;gap:4px;">
📄 Import CSV
 <input type="file" accept=".csv,.txt" style="display:none;" onchange="importQuestionsFromCSV(event,'${id}')">
</label>
<label style="cursor:pointer;background:#fdf4ff;color:#7c3aed;border:1px solid #e9d5ff;border-radius:6px;padding:4px 10px;font-size:12px;display:flex;align-items:center;gap:4px;">
📑 Import PDF
 <input type="file" accept=".pdf" style="display:none;" onchange="importQuestionsFromPDF(event,'${id}')">
</label>
<a href="data:text/plain;charset=utf-8,What%20is%20an%20array%3F%0AExplain%20linked%20list%0AWhat%20is%20a%20stack%3F" 
 download="question_template.txt"
 style="background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;border-radius:6px;padding:4px 10px;font-size:12px;text-decoration:none;">
📥 Template
 </a>
</div>
</div>

<div class="question-list"></div>
<button type="button" onclick="addLessonQuestion('${id}')" 
 style="margin-top:6px;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:6px;padding:5px 12px;cursor:pointer;font-size:13px;">+ Add Question Manually</button> `;
            list.appendChild(div);

            refreshLessonDropdowns();

            const nameInput = div.querySelector('.lesson-name');
            if (nameInput) nameInput.focus();
        }

        function removeLesson(id) {
            const el = document.getElementById(id);
            if (el) { el.remove(); refreshLessonDropdowns(); }
        }

        function addLessonQuestion(lessonId) {
            const lessonEl = document.getElementById(lessonId);
            if (!lessonEl) return;
            const ql = lessonEl.querySelector('.question-list');
            const qDiv = document.createElement('div');
            qDiv.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:6px;';
            qDiv.innerHTML = `
 <input type="text" class="question-text" placeholder="Enter question text..." 
 style="flex:1;padding:7px 10px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;">
<button type="button" onclick="this.parentElement.remove()" style="background:#fee2e2;color:#dc2626;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:12px;font-weight:bold;">✕</button> `;
            ql.appendChild(qDiv);

            const newInput = qDiv.querySelector('.question-text');
            if (newInput) newInput.focus();
        }

        function addMultipleQuestions(lessonId, count = 5) {
            for (let i = 0; i < count; i++) {
                addLessonQuestion(lessonId);
            }
            showToast(`✅ Added ${count} question fields`, 'success', 1500);
        }

        function addBulkQuestions(lessonId) {
            const questions = prompt('Paste questions (one per line):');
            if (!questions) return;

            const lessonEl = document.getElementById(lessonId);
            if (!lessonEl) return;

            const lines = questions.split('\n').filter(line => line.trim());
            const ql = lessonEl.querySelector('.question-list');

            lines.forEach(line => {
                const qDiv = document.createElement('div');
                qDiv.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:6px;';
                qDiv.innerHTML = `
 <input type="text" class="question-text" value="${line.trim()}" 
 style="flex:1;padding:7px 10px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;">
<button type="button" onclick="this.parentElement.remove()" style="background:#fee2e2;color:#dc2626;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:12px;font-weight:bold;">✕</button> `;
                ql.appendChild(qDiv);
            });

            showToast(`✅ Added ${lines.length} questions!`, 'success', 2000);
        }

        function getLessons() {
            const lessons = [];
            document.querySelectorAll('#lessonList >div[id^="lesson-"]').forEach(lessonEl => {
                const name = lessonEl.querySelector('.lesson-name')?.value?.trim() || '';
                const questions = [];
                lessonEl.querySelectorAll('.question-text').forEach(q => {
                    const txt = q.value.trim();
                    if (txt) questions.push(txt);
                });
                if (name) lessons.push({ name, questions, id: lessonEl.id });
            });
            return lessons;
        }

        function importQuestionsFromCSV(event, lessonId) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                const text = e.target.result;
                const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
                const lessonEl = document.getElementById(lessonId);
                if (!lessonEl) return;
                const ql = lessonEl.querySelector('.question-list');
                let added = 0;
                lines.forEach(line => {
                    const cleaned = line.replace(/^["'\d\.\-\*]+\s*/, '').replace(/["']$/, '').trim();
                    if (cleaned.length > 3) {
                        const qDiv = document.createElement('div');
                        qDiv.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:6px;';
                        qDiv.innerHTML = `
 <input type="text" class="question-text" value="${cleaned.replace(/"/g, '&quot;')}"
 style="flex:1;padding:7px 10px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;">
<button type="button" onclick="this.parentElement.remove()" style="background:#fee2e2;color:#dc2626;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:12px;font-weight:bold;">x</button> `;
                        ql.appendChild(qDiv);
                        added++;
                    }
                });
                showToast(`Imported ${added} questions from CSV`, 'success');
            };
            reader.readAsText(file);
            event.target.value = '';
        }

        async function importQuestionsFromPDF(event, lessonId) {
            const file = event.target.files[0];
            if (!file) return;
            showToast('Reading PDF... please wait', 'info', 3000);
            try {
                const arrayBuffer = await file.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                let text = '';
                const decoder = new TextDecoder('utf-8', { fatal: false });
                const rawText = decoder.decode(uint8Array);
                const textMatches = rawText.match(/\(([^)]{5,200})\)/g) || [];
                const seen = new Set();
                textMatches.forEach(match => {
                    const line = match.slice(1, -1).replace(/\\n/g, ' ').replace(/\\/g, '').trim();
                    if (line.length > 8 && !seen.has(line) && /[a-zA-Z]/.test(line)) {
                        seen.add(line);
                        text += line + '\n';
                    }
                });

                if (!text.trim()) {
                    showToast('Could not extract text from PDF. Please use CSV or type questions manually.', 'warning', 6000);
                    event.target.value = '';
                    return;
                }

                const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
                const lessonEl = document.getElementById(lessonId);
                if (!lessonEl) return;
                const ql = lessonEl.querySelector('.question-list');
                let added = 0;
                lines.forEach(line => {
                    const cleaned = line.replace(/^[\d\.\-\*\)]+\s*/, '').trim();
                    if (cleaned.length > 5) {
                        const qDiv = document.createElement('div');
                        qDiv.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:6px;';
                        qDiv.innerHTML = `
 <input type="text" class="question-text" value="${cleaned.replace(/"/g, '&quot;')}"
 style="flex:1;padding:7px 10px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;">
<button type="button" onclick="this.parentElement.remove()" style="background:#fee2e2;color:#dc2626;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:12px;font-weight:bold;">x</button> `;
                        ql.appendChild(qDiv);
                        added++;
                    }
                });
                if (added > 0) {
                    showToast(`Imported ${added} questions from PDF - please review and edit as needed`, 'success', 6000);
                } else {
                    showToast('No readable text found in PDF. Try a text-based PDF or use CSV upload.', 'warning', 6000);
                }
            } catch (e) {
                showToast('Failed to read PDF: ' + e.message, 'danger');
            }
            event.target.value = '';
        }

        function refreshLessonDropdowns() {
            const lessons = getLessons();
            document.querySelectorAll('.co-lesson-select').forEach(sel => {
                const cur = sel.value;
                sel.innerHTML = '<option value="">select lesson</option>';
                lessons.forEach((l, idx) => {
                    const opt = document.createElement('option');
                    opt.value = idx;
                    opt.textContent = l.name || `Lesson ${idx + 1}`;
                    sel.appendChild(opt);
                });
                if (cur !== '') sel.value = cur;
            });
        }
        function buildCOStructure() {
            const coList = document.getElementById('coList');
            if (!coList) return;
            coList.innerHTML = '';

            // SPEED: Add quick fill template
            const templateDiv = document.createElement('div');
            templateDiv.style.cssText = 'background:#fef3c7;border:2px solid #fbbf24;border-radius:10px;padding:14px;margin-bottom:16px;';
            templateDiv.innerHTML = `
 <div style="font-weight:700;color:#92400e;margin-bottom:10px;font-size:14px;">⚡ Quick Fill All COs</div>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
 <button onclick="fillAllCOMarks(5, 5, 5, 5)" class="btn btn-sm btn-warning" style="font-size:12px;">
 Equal: 5+5+5+5 = 20 each
 </button>
 <button onclick="fillAllCOMarks(10, 5, 3, 2)" class="btn btn-sm btn-info" style="font-size:12px;">
 Weighted: 10+5+3+2 = 20 each
 </button>
 <button onclick="fillAllCOMarks(8, 8, 4, 0)" class="btn btn-sm btn-success" style="font-size:12px;">
 Top Heavy: 8+8+4+0 = 20 each
 </button>
 </div>
 <div style="font-size:11px;color:#78350f;">Click to auto-fill all 5 COs with same marks pattern</div>
 `;
            coList.appendChild(templateDiv);

            for (let i = 1; i <= 5; i++) {
                const coDiv = document.createElement('div');
                coDiv.className = 'co-item';
                coDiv.style.cssText = 'background:#f9fafb;border:2px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:16px;';
                coDiv.innerHTML = `
 <div class="co-header" style="font-size:15px;font-weight:700;color:#1d4ed8;margin-bottom:12px;">CO${i} - Course Outcome ${i}
</div>
<div class="form-group" style="margin-bottom:10px;">
<label style="font-size:13px;color:#374151;font-weight:600;">Outcome Statement</label>
<textarea class="co${i}-desc" placeholder="e.g., Student will be able to analyse and apply data structure concepts..." 
 rows="2" style="width:100%;padding:8px 12px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;resize:vertical;box-sizing:border-box;"></textarea>
</div>
<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:10px;">
<label style="font-size:13px;font-weight:600;color:#1e40af;display:block;margin-bottom:6px;">Random Question Assignment</label>
<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
<div class="form-group" style="margin:0;flex:1;min-width:160px;">
<label style="font-size:12px;">Source Lesson</label>
<select class="co-lesson-select co${i}-lesson" style="width:100%;padding:8px;border:2px solid #e5e7eb;border-radius:8px;font-size:13px;">
<option value="">select lesson</option>
</select>
</div>
<div class="form-group" style="margin:0;width:140px;">
<label style="font-size:12px;">Questions per Student</label>
<input type="number" class="co${i}-qcount" value="1" min="1" max="20" 
 style="width:100%;padding:8px;border:2px solid#e5e7eb;border-radius:8px;font-size:13px;">
</div>
</div>
<p style="font-size:11px;color:#6b7280;margin:6px 0 0;">Each student will randomly receive this many questions from the chosen lesson for CO${i}.</p>
</div> ${[1, 2, 3, 4].map(j => `
 <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:8px;">
<div style="font-weight:600;font-size:13px;color:#374151;margin-bottom:6px;">C${j} - Criterion ${j}</div>
<div class="form-group" style="margin:0;">
<label style="font-size:12px;color:#6b7280;">Max Marks for C${j}</label>
<input type="number" class="co${i}-c${j}" placeholder="Max marks" min="0" 
 style="width:130px;padding:8px 12px;border:2px solid #e5e7eb;border-radius:8px;font-size:13px;">
</div>
</div> `).join('')}
 `;
                coList.appendChild(coDiv);
            }
            refreshLessonDropdowns();
        }

        // SPEED: Fill all COs with same marks pattern
        function fillAllCOMarks(c1, c2, c3, c4) {
            for (let i = 1; i <= 5; i++) {
                document.querySelector(`.co${i}-c1`).value = c1;
                document.querySelector(`.co${i}-c2`).value = c2;
                document.querySelector(`.co${i}-c3`).value = c3;
                document.querySelector(`.co${i}-c4`).value = c4;
            }
            const total = c1 + c2 + c3 + c4;
            showToast(`✅ All 5 COs filled! Each CO = ${total} marks (Total: ${total * 5})`, 'success', 3000);
        }

        function switchCATab(tab) {
            document.getElementById('caTabPanel1').style.display = tab === 1 ? '' : 'none';
            document.getElementById('caTabPanel2').style.display = tab === 2 ? '' : 'none';
            document.getElementById('caTab1').className = tab === 1 ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
            document.getElementById('caTab2').className = tab === 2 ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
            if (tab === 2) refreshLessonDropdowns();
        }

        async function createStandardExam() {
            if (!window.currentUser) { showToast('Session expired. Please log in again.', 'danger'); return; }
            const name = document.getElementById('examName').value.trim();
            const subjectId = document.getElementById('examSubject').value;
            const type = document.getElementById('examType').value;
            const year = document.getElementById('academicYear').value;
            const semester = document.getElementById('semester').value;

            const criteria = [];
            let totalMarks = 0;
            document.querySelectorAll('.criteria-item').forEach(item => {
                const criterionName = item.querySelector('.criterion-name').value;
                const marks = parseInt(item.querySelector('.criterion-marks').value) || 0;
                if (criterionName && marks > 0) {
                    criteria.push({ name: criterionName, maxMarks: marks });
                    totalMarks += marks;
                }
            });

            if (!name || !subjectId || criteria.length === 0) {
                showToast('Please fill in all required fields', "warning");
                return;
            }

            try {
                const duplicateCheck = await window.getDocs(window.query(window.collection(window.db, 'exams'),
                    window.where('name', '==', name),
                    window.where('subjectId', '==', subjectId),
                    window.where('academicYear', '==', year),
                    window.where('semester', '==', semester)));

                if (!duplicateCheck.empty) {
                    showToast('An exam with this name already exists for this subject in this semester!', "danger");
                    return;
                }

                await window.addDoc(window.collection(window.db, 'exams'), {
                    name,
                    subjectId,
                    type,
                    examType: 'standard',
                    criteria,
                    totalMarks,
                    academicYear: year,
                    semester,
                    status: 'DRAFT',
                    lifecycleState: 'DRAFT',
                    createdBy: window.currentUser.uid,
                    createdAt: new Date().toISOString()
                });

                showToast('Standard exam created successfully!', "success");
                closeExamModal();
                loadExamsList();
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }
        function shuffleArray(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        function pickRandom(arr, count) {
            const shuffled = shuffleArray(arr);
            return shuffled.slice(0, Math.min(count, shuffled.length));
        }

        async function createCAExam() {
            if (!window.currentUser) { showToast('Session expired. Please log in again.', 'danger'); return; }
            const name = document.getElementById('examName').value.trim();
            const subjectId = document.getElementById('examSubject').value;
            const year = document.getElementById('academicYear').value;
            const semester = document.getElementById('semester').value;

            if (!name || !subjectId) {
                showToast('Please fill in all required fields', 'warning');
                return;
            }
            const lessons = getLessons();
            if (lessons.length === 0) {
                showToast('Please add at least one lesson with questions', 'danger');
                return;
            }
            for (const l of lessons) {
                if (!l.name) { showToast('Each lesson must have a name', 'danger'); return; }
                if (l.questions.length === 0) { showToast(`Lesson "${l.name}" has no questions`, 'danger'); return; }
            }
            const courseOutcomes = [];
            let totalMarks = 0;

            for (let i = 1; i <= 5; i++) {
                const coDesc = document.querySelector(`.co${i}-desc`)?.value?.trim() || '';
                const lessonIdx = document.querySelector(`.co${i}-lesson`)?.value;
                const qCount = parseInt(document.querySelector(`.co${i}-qcount`)?.value) || 1;
                const assignedLesson = (lessonIdx !== '' && lessonIdx !== undefined) ? lessons[parseInt(lessonIdx)] : null;

                const co = {
                    name: `CO${i}`,
                    description: coDesc,
                    lessonName: assignedLesson ? assignedLesson.name : '',
                    questionPool: assignedLesson ? assignedLesson.questions : [],
                    questionsPerStudent: qCount,
                    criteria: []
                };
                let coTotal = 0;
                for (let j = 1; j <= 4; j++) {
                    const marks = parseInt(document.querySelector(`.co${i}-c${j}`)?.value) || 0;
                    co.criteria.push({ name: `C${j}`, maxMarks: marks });
                    coTotal += marks;
                }
                co.totalMarks = coTotal;
                courseOutcomes.push(co);
                totalMarks += coTotal;
            }

            try {
                // OPTIMIZATION: Show progress indicator
                window.showLoadingMessage('Creating CA exam...');

                const dupCheck = await window.getDocs(window.query(window.collection(window.db, 'exams'),
                    window.where('name', '==', name),
                    window.where('subjectId', '==', subjectId),
                    window.where('academicYear', '==', year),
                    window.where('semester', '==', semester)));
                if (!dupCheck.empty) {
                    window.hideLoadingMessage();
                    showToast('Exam with this name already exists for this subject/semester', 'danger');
                    return;
                }

                const examRef = await window.addDoc(window.collection(window.db, 'exams'), {
                    name,
                    subjectId,
                    examType: 'ca',
                    courseOutcomes,
                    lessons,
                    totalMarks,
                    academicYear: year,
                    semester,
                    status: 'DRAFT',
                    lifecycleState: 'DRAFT',
                    createdBy: window.currentUser.uid,
                    createdAt: new Date().toISOString()
                });

                window.showLoadingMessage('Fetching students...');

                const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', subjectId));
                const subjectData = subjectDoc.exists() ? subjectDoc.data() : null;

                if (subjectData) {
                    const studentsSnap = await window.getDocs(window.query(window.collection(window.db, 'students'),
                        window.where('class', '==', subjectData.class),
                        window.where('division', '==', subjectData.division)));

                    if (studentsSnap.size > 0) {
                        window.showLoadingMessage(`Assigning questions to ${studentsSnap.size} students...`);

                        // OPTIMIZATION: Batch process in groups of 50 for better performance
                        const BATCH_SIZE = 50;
                        const studentDocs = studentsSnap.docs;
                        let processedCount = 0;

                        for (let i = 0; i < studentDocs.length; i += BATCH_SIZE) {
                            const batch = studentDocs.slice(i, i + BATCH_SIZE);
                            const assignmentPromises = batch.map(studentDoc => {
                                const studentAssignment = {};
                                courseOutcomes.forEach((co, coIdx) => {
                                    if (co.questionPool.length > 0) {
                                        studentAssignment[`CO${coIdx + 1}`] = pickRandom(co.questionPool, co.questionsPerStudent);
                                    } else {
                                        studentAssignment[`CO${coIdx + 1}`] = [];
                                    }
                                });

                                return window.setDoc(
                                    window.doc(window.db, 'ca_question_assignments', `${examRef.id}_${studentDoc.id}`),
                                    {
                                        examId: examRef.id,
                                        studentId: studentDoc.id,
                                        studentName: studentDoc.data().name,
                                        enrollment: studentDoc.data().enrollment,
                                        assignments: studentAssignment,
                                        assignedAt: new Date().toISOString()
                                    }
                                );
                            });

                            await Promise.all(assignmentPromises);
                            processedCount += batch.length;

                            // Update progress
                            window.showLoadingMessage(`Assigned questions: ${processedCount}/${studentDocs.length} students`);
                        }

                        window.hideLoadingMessage();
                        showToast(`✅ CA Exam created! Questions assigned to ${studentsSnap.size} students in ${Math.ceil(studentsSnap.size / BATCH_SIZE)} batches.`, 'success', 5000);
                    } else {
                        window.hideLoadingMessage();
                        showToast('CA Exam created! (No students found to assign questions yet)', 'success');
                    }
                } else {
                    window.hideLoadingMessage();
                    showToast('CA Exam created! (No students found to assign questions yet)', 'success');
                }

                closeExamModal();
                loadExamsList();
            } catch (error) {
                window.hideLoadingMessage();
                showToast('Error: ' + error.message, 'danger');
            }
        }

        async function reassignCAQuestions(examId) {

            try {
                const examDoc = await window.getDoc(window.doc(window.db, 'exams', examId));
                if (!examDoc.exists()) { showToast('Exam not found', 'danger'); return; }
                const exam = examDoc.data();

                const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', exam.subjectId));
                const subjectData = subjectDoc.exists() ? subjectDoc.data() : null;
                if (!subjectData) { showToast('Subject not found', 'danger'); return; }

                const studentsSnap = await window.getDocs(window.query(window.collection(window.db, 'students'),
                    window.where('class', '==', subjectData.class),
                    window.where('division', '==', subjectData.division)));

                const promises = [];
                studentsSnap.forEach(studentDoc => {
                    const studentAssignment = {};
                    exam.courseOutcomes.forEach((co, coIdx) => {
                        if (co.questionPool && co.questionPool.length > 0) {
                            studentAssignment[`CO${coIdx + 1}`] = pickRandom(co.questionPool, co.questionsPerStudent || 1);
                        } else {
                            studentAssignment[`CO${coIdx + 1}`] = [];
                        }
                    });
                    promises.push(window.setDoc(window.doc(window.db, 'ca_question_assignments', `${examId}_${studentDoc.id}`), {
                        examId,
                        studentId: studentDoc.id,
                        studentName: studentDoc.data().name,
                        enrollment: studentDoc.data().enrollment,
                        assignments: studentAssignment,
                        assignedAt: new Date().toISOString()
                    }));
                });
                await Promise.all(promises);
                showToast(`Questions reassigned to ${studentsSnap.size} students!`, 'success');
            } catch (err) {
                showToast('Error: ' + err.message, 'danger');
            }
        }

        async function loadExamsList() {
            const tbody = document.getElementById('examsList');
            const resultsSelect = document.getElementById('resultsExam');
            const importSelect = document.getElementById('coordImportExamSelect');

            tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
            if (resultsSelect) {
                resultsSelect.innerHTML = '<option value="">Select exam</option>';
            }
            if (importSelect) {
                importSelect.innerHTML = '<option value="">Choose exam</option>';
            }

            try {
                const year = document.getElementById('academicYear').value;
                const semester = document.getElementById('semester').value;
                const snapshot = await window.getDocs(window.query(window.collection(window.db, 'exams'),
                    window.where('academicYear', '==', year),
                    window.where('semester', '==', semester),
                    window.orderBy('createdAt', 'desc'),
                    window.limit(50)));
                tbody.innerHTML = '';

                for (const docSnap of snapshot.docs) {
                    const data = docSnap.data();
                    const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', data.subjectId));
                    const subjectData = subjectDoc.exists() ? subjectDoc.data() : {};

                    const row = tbody.insertRow();
                    row.innerHTML = `
 <td>${data.name}</td>
<td><span class="badge badge-info">${data.examType}</span></td>
<td>${subjectData.name || 'N/A'}</td>
<td>${data.totalMarks}</td>
<td><span class="badge badge-${data.status === 'FINALIZED' ? 'danger' : 'success'}">${data.status}</span></td>
<td style="display:flex;gap:4px;flex-wrap:wrap;">
<button class="btn btn-primary btn-sm" onclick="viewExamDetails('${docSnap.id}')">View</button> ${data.examType === 'ca' ? `<button class="btn btn-secondary btn-sm" onclick="reassignCAQuestions('${docSnap.id}')" title="Re-run random question assignment for all students">Reassign</button>` : ''}
 </td> `;

                    if (resultsSelect) {
                        const option = document.createElement('option');
                        option.value = docSnap.id;
                        option.textContent = `${data.name} - ${subjectData.name || 'N/A'}`;
                        resultsSelect.appendChild(option);
                    }
                    if (importSelect && data.status !== 'FINALIZED') {
                        const importOption = document.createElement('option');
                        importOption.value = docSnap.id;
                        importOption.textContent = `${data.name} - ${subjectData.name || 'N/A'}`;
                        importSelect.appendChild(importOption);
                    }
                }

                if (snapshot.empty) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No exams created yet</td></tr>';
                } else if (snapshot.size === 50) {
                    const row = tbody.insertRow();
                    row.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #f59e0b; font-weight: bold;">Showing 50 most recent exams. Total may be more.</td></tr>';
                }
            } catch (error) {
                tbody.innerHTML = '<tr><td colspan="6">Error loading data</td></tr>';
            }
        }

        async function viewExamDetails(examId) {
            try {
                const examDoc = await window.getDoc(window.doc(window.db, 'exams', examId));
                if (!examDoc.exists()) { showToast('Exam not found', 'danger'); return; }
                const exam = examDoc.data();

                const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', exam.subjectId));
                const subject = subjectDoc.exists() ? subjectDoc.data() : {};

                let html = `
 <div style="max-height:80vh;overflow-y:auto;">
<div style="background:#1d4ed8;color:#fff;border-radius:10px;padding:16px;margin-bottom:16px;">
<h3 style="margin:0 0 6px;">${exam.name}</h3>
<div style="font-size:13px;opacity:0.85;">${subject.code || ''} - ${subject.name || 'N/A'} | ${exam.academicYear} Sem ${exam.semester}</div>
<div style="margin-top:8px;display:flex;gap:10px;flex-wrap:wrap;">
<span style="background:rgba(255,255,255,0.2);padding:3px 10px;border-radius:12px;font-size:12px;">${exam.examType?.toUpperCase()}</span>
<span style="background:rgba(255,255,255,0.2);padding:3px 10px;border-radius:12px;font-size:12px;">Total: ${exam.totalMarks} marks</span>
<span style="background:rgba(255,255,255,0.2);padding:3px 10px;border-radius:12px;font-size:12px;">${exam.status}</span>
</div>
</div> `;

                if (exam.examType === 'ca') {
                    if (exam.lessons && exam.lessons.length > 0) {
                        html += `<div style="margin-bottom:16px;"><h4 style="color:#374151;margin:0 0 8px;">Question Bank</h4>`;
                        exam.lessons.forEach((l, li) => {
                            html += `
 <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
<div style="font-weight:700;color:#1f2937;margin-bottom:4px;">Lesson ${li + 1}: ${l.name}</div>
<div style="color:#6b7280;font-size:12px;margin-bottom:4px;">${l.questions.length} questions</div> ${l.questions.map((q, qi) => `<div style="font-size:13px;color:#374151;padding:2px 0;">${qi + 1}. ${q}</div>`).join('')}
</div> `;
                        });
                        html += `</div>`;
                    }
                    html += `<h4 style="color:#374151;margin:0 0 8px;">Course Outcomes</h4>`;
                    exam.courseOutcomes?.forEach((co, ci) => {
                        html += `
 <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
<div style="font-weight:700;color:#1e40af;margin-bottom:4px;">${co.name}</div>
<div style="font-size:13px;color:#374151;margin-bottom:4px;">${co.description || ''}</div>
<div style="font-size:12px;color:#6b7280;">Source: ${co.lessonName || 'N/A'} | ${co.questionsPerStudent || 1} question(s) per student | Pool: ${co.questionPool?.length || 0} questions</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;"> ${co.criteria?.map(c => `<span style="background:#dbeafe;color:#1e40af;border-radius:4px;padding:2px 8px;font-size:12px;">${c.name}: ${c.maxMarks}</span>`).join('')}
</div>
</div> `;
                    });
                } else {
                    html += `<h4 style="color:#374151;margin:0 0 8px;">Criteria</h4>`;
                    exam.criteria?.forEach(c => {
                        html += `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;margin-bottom:6px;display:flex;justify-content:space-between;">
<span>${c.name}</span><span style="font-weight:700;">${c.maxMarks} marks</span></div>`;
                    });
                }

                html += `</div>`;
                const modal = document.getElementById('examModal');
                document.getElementById('examModalTitle').textContent = ` Exam Details`;
                document.getElementById('examModalBody').innerHTML = html + `
 <div style="text-align:right;margin-top:12px;">
<button class="btn btn-secondary" onclick="closeExamModal()">Close</button>
</div>`;
                modal.classList.add('active');
            } catch (err) {
                showToast('Error loading exam details: ' + err.message, 'danger');
            }
        }

        async function assignTeacher() {
            if (!window.currentUser) { showToast('Session expired. Please log in again.', 'danger'); return; }
            const emailSelect = document.getElementById('assignTeacherEmail')?.value;
            const emailManual = document.getElementById('assignTeacherEmailManual')?.value?.trim();
            const email = emailSelect || emailManual;
            const subjectId = document.getElementById('assignSubject').value;

            if (!email || !subjectId) {
                showToast('Please fill in all fields', "danger");
                return;
            }

            try {
                const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', subjectId));
                const subjectData = subjectDoc.data();
                const duplicateCheck = await window.getDocs(window.query(window.collection(window.db, 'teacher_assignments'),
                    window.where('teacherEmail', '==', email),
                    window.where('subjectId', '==', subjectId),
                    window.where('class', '==', subjectData.class),
                    window.where('division', '==', subjectData.division)));

                if (!duplicateCheck.empty) {
                    showToast('This teacher is already assigned to this subject for this class and division!', "danger");
                    return;
                }

                await window.addDoc(window.collection(window.db, 'teacher_assignments'), {
                    teacherEmail: email,
                    subjectId,
                    class: subjectData.class,
                    division: subjectData.division,
                    assignedBy: window.currentUser.uid,
                    assignedAt: new Date().toISOString()
                });
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'ASSIGN_TEACHER',
                    teacherEmail: email,
                    subjectId: subjectId,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    timestamp: new Date().toISOString(),
                    academicYear: subjectData.academicYear,
                    semester: subjectData.semester
                });

                showToast('Teacher assigned successfully!', "success");
                if (document.getElementById('assignTeacherEmail')) document.getElementById('assignTeacherEmail').value = '';
                if (document.getElementById('assignTeacherEmailManual')) document.getElementById('assignTeacherEmailManual').value = '';
                loadTeacherAssignments();
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }

        async function loadTeacherAssignments() {
            const tbody = document.getElementById('teacherAssignmentsList');
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
            try {
                const snapshot = await window.getDocs(window.collection(window.db, 'teacher_assignments'));
                if (snapshot.empty) {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No teachers assigned yet</td></tr>';
                    return;
                }
                // Parallel fetch subjects + teacher user docs
                const asgns = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                const [subjectDocs, teacherDocs] = await Promise.all([
                    Promise.all(asgns.map(a => window.getDoc(window.doc(window.db, 'subjects', a.subjectId)))),
                    Promise.all(asgns.map(a => window.getDocs(window.query(window.collection(window.db, 'users'), window.where('email', '==', a.teacherEmail), window.where('role', '==', 'teacher')))))
                ]);
                tbody.innerHTML = '';
                asgns.forEach((data, aIdx) => {
                    const subjectData = subjectDocs[aIdx].exists() ? subjectDocs[aIdx].data() : {};
                    const teacherSnap = teacherDocs[aIdx];
                    const teacherData = !teacherSnap.empty ? teacherSnap.docs[0].data() : null;
                    const teacherId = !teacherSnap.empty ? teacherSnap.docs[0].id : null;
                    const isActive = teacherData ? teacherData.isActive !== false : true;
                    const row = tbody.insertRow();
                    if (!isActive) row.classList.add('teacher-row-disabled');
                    row.innerHTML = `
 <td><strong>${teacherData?.name || data.teacherEmail.split('@')[0]}</strong></td>
<td style="font-size:12px;">${data.teacherEmail}</td>
<td>${subjectData.name || 'N/A'}</td>
<td>${data.class}</td>
<td>${data.division}</td>
<td>${isActive ? '<span class="account-status-on">ON</span>' : '<span class="account-status-off">OFF</span>'}</td>
<td style="white-space:nowrap;">
${teacherId ? `<button class="btn btn-sm ${isActive ? 'btn-off' : 'btn-on'}" onclick="toggleTeacherAccount('${teacherId}','${data.teacherEmail}',${isActive})">${isActive ? 'Disable' : 'Enable'}</button> ` : ''}
<button class="btn btn-danger btn-sm" onclick="removeTeacherAssignment('${data.id}','${data.teacherEmail}')">Remove</button>
</td>`;
                });
            } catch (error) {
                tbody.innerHTML = '<tr><td colspan="7" style="color:#dc2626;">Error: ' + error.message + '</td></tr>';
            }
        }

        let allResultsData = [];
        let currentExamData = null;

        async function loadResults() {
            const examId = document.getElementById('resultsExam')?.value;
            const container = document.getElementById('resultsTable');

            if (!examId) {
                if (container) {
                    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Select an exam above to view results</p>';
                }
                return;
            }
            if (container) {
                container.innerHTML = `
 <div style="margin-bottom: 15px; text-align: right;">
<button class="btn btn-success btn-sm" onclick="exportAllStudentsResultsCSV('${examId}')">Export All Results to CSV</button>
</div>
<div style="padding: 40px; text-align: center;">
<div class="spinner"></div>
<p style="margin-top: 15px;">Loading all students and results...</p>
</div> `;
            }

            loadAllStudentsResults();
        }

        function calculateCOSummaryFromArray(results) {
            const coTotals = Array(5).fill(0);
            const coCounts = Array(5).fill(0);

            results.forEach(data => {
                if (data.coAttainment) {
                    data.coAttainment.forEach((co, idx) => {
                        if (co.status !== 'Not Evaluated' && co.percentage > 0) {
                            coTotals[idx] += co.percentage;
                            coCounts[idx]++;
                        }
                    });
                }
            });

            return coTotals.map((total, idx) => {
                const average = coCounts[idx] > 0 ? total / coCounts[idx] : 0;
                return {
                    name: `CO${idx + 1}`,
                    average,
                    evaluatedCount: coCounts[idx],
                    status: average >= 70 ? 'Strong' : average >= 50 ? 'Moderate' : 'Weak'
                };
            });
        }
        function validateMarks(input, maxMarks) {
            const value = parseFloat(input.value);

            if (isNaN(value) || value < 0) {
                input.value = 0;
                return;
            }

            if (value > maxMarks) {
                showToast(`Marks cannot exceed maximum: ${maxMarks}`, "warning");
                input.value = maxMarks;
                input.style.borderColor = '#ef4444';
                setTimeout(() => {
                    input.style.borderColor = '';
                }, 2000);
                return;
            }
            const rounded = Math.round(value * 2) / 2;
            if (value !== rounded) {
                input.value = rounded;
            }
        }

        async function finalizeResults() {
            if (!window.currentUser) { showToast('Session expired. Please log in again.', 'danger'); return; }
            const examId = document.getElementById('resultsExam')?.value;

            if (!examId) {
                showToast('Please select an exam', 'warning');
                return;
            }
            if (!window._finalizeConfirm) {
                window._finalizeConfirm = examId;
                showToast('Click Finalize again to confirm. This action cannot be undone!', 'warning', 4000);
                setTimeout(() => { window._finalizeConfirm = null; }, 4000);
                return;
            }
            window._finalizeConfirm = null;
            try {
                const resultsSnap = await window.getDocs(window.query(window.collection(window.db, 'results'), window.where('examId', '==', examId)));
                const incompleteCount = resultsSnap.docs.filter(doc => doc.data().status === 'INCOMPLETE').length;
                const absentCount = resultsSnap.docs.filter(doc => doc.data().status === 'ABSENT').length;

                if (incompleteCount > 0) {
                    showToast(`Note: ${incompleteCount} incomplete + ${absentCount} absent student(s). Proceeding with finalization.`, 'warning', 5000);
                }

                const reason = 'End of evaluation period';
                const examDoc = await window.getDoc(window.doc(window.db, 'exams', examId));
                if (!examDoc.exists()) { showToast('Exam not found', 'danger'); return; }
                const examData = examDoc.data();
                await window.updateDoc(window.doc(window.db, 'exams', examId), {
                    status: 'FINALIZED',
                    finalizedBy: window.currentUser.uid,
                    finalizedByName: window.currentUser.name,
                    finalizedAt: new Date().toISOString(),
                    finalizationReason: reason,
                    totalStudentsEvaluated: resultsSnap.size,
                    incompleteStudents: incompleteCount
                });
                const batch = [];
                resultsSnap.forEach(resultDoc => {
                    batch.push(window.updateDoc(window.doc(window.db, 'results', resultDoc.id), {
                        finalStatus: 'FINALIZED',
                        publicationStatus: 'PUBLISHED',
                        finalizedAt: new Date().toISOString(),
                        publishedAt: new Date().toISOString()
                    }));
                });
                await Promise.all(batch);
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'FINALIZE_EXAM_RESULTS',
                    examId,
                    examName: examData.name,
                    totalStudents: resultsSnap.size,
                    incompleteStudents: incompleteCount,
                    reason: reason,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    performedByRole: window.currentUser.role,
                    timestamp: new Date().toISOString(),
                    academicYear: examData.academicYear,
                    semester: examData.semester,
                    irreversible: true
                });

                showToast(`Results finalized! Students: ${resultsSnap.size}`, 'success');

                loadExamsList();
                loadResults();
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }
        function showTeacherSection(section, btn) {
            document.querySelectorAll('#teacherDashboard .section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('#teacherDashboard .nav-btn').forEach(b => b.classList.remove('active'));

            if (section === 'assignments') {
                document.getElementById('teacherAssignments').classList.add('active');
            } else if (section === 'students') {
                document.getElementById('teacherStudents').classList.add('active');
                loadTeacherStudentDropdowns();
            } else if (section === 'exams') {
                document.getElementById('teacherExams').classList.add('active');
                loadTeacherExamsTab();
            } else if (section === 'evaluate') {
                document.getElementById('teacherEvaluate').classList.add('active');
            } else if (section === 'results') {
                document.getElementById('teacherResults').classList.add('active');
                loadTeacherResultsExams();
            } else if (section === 'myquestions') {
                document.getElementById('teacherMyquestions').classList.add('active');
                loadTeacherQuestionsTab();
            }
            if (btn) btn.classList.add('active');
        }

        /**
         * Load Teacher Questions tab
         */
        async function loadTeacherQuestionsTab() {
            const subjectSelect = document.getElementById('teacherQuestionsSubject');
            if (!subjectSelect) return;

            subjectSelect.innerHTML = '<option value="">Choose Subject</option>';

            try {
                const assignmentsSnap = await getDocs(query(
                    collection(window.db, 'teacher_assignments'),
                    where('teacherEmail', '==', window.currentUser.email)
                ));

                for (const doc of assignmentsSnap.docs) {
                    const data = doc.data();
                    const subjectDoc = await getDoc(window.doc(window.db, 'subjects', data.subjectId));
                    const subjectData = subjectDoc.exists() ? subjectDoc.data() : {};

                    const opt = document.createElement('option');
                    opt.value = data.subjectId;
                    opt.textContent = `${subjectData.name} (${data.class}-${data.division})`;
                    subjectSelect.appendChild(opt);
                }
            } catch (error) {
                console.error('Error loading teacher questions tab:', error);
            }
        }

        window.loadTeacherQuestionsTab = loadTeacherQuestionsTab;

        async function loadTeacherExamsTab() {
            const subjectSelect = document.getElementById('teacherExamSubject');
            const filterSelect = document.getElementById('teacherExamsFilter');

            if (!subjectSelect) return;

            subjectSelect.innerHTML = '<option value="">Choose Subject</option>';
            filterSelect.innerHTML = '<option value="">All Subjects</option>';

            try {
                const assignmentsSnap = await window.getDocs(window.query(
                    window.collection(window.db, 'teacher_assignments'),
                    window.where('teacherEmail', '==', window.currentUser.email)
                ));

                for (const doc of assignmentsSnap.docs) {
                    const data = doc.data();
                    const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', data.subjectId));
                    const subjectData = subjectDoc.exists() ? subjectDoc.data() : {};

                    const opt1 = document.createElement('option');
                    opt1.value = data.subjectId;
                    opt1.textContent = `${subjectData.name} (${data.class}-${data.division})`;
                    opt1.setAttribute('data-class', data.class);
                    opt1.setAttribute('data-division', data.division);
                    opt1.setAttribute('data-year', subjectData.academicYear || '');
                    opt1.setAttribute('data-sem', subjectData.semester || '');
                    subjectSelect.appendChild(opt1);

                    const opt2 = opt1.cloneNode(true);
                    filterSelect.appendChild(opt2);
                }
                generateTeacherCriteriaFields();
                loadTeacherExamsList();

            } catch (error) { /* silent */ }
        }

        function toggleTeacherExamType() {
            const type = document.getElementById('teacherExamType').value;
            const standardFields = document.getElementById('teacherStandardExamFields');
            const caFields = document.getElementById('teacherCAExamFields');

            if (type === 'ca') {
                standardFields.style.display = 'none';
                caFields.style.display = 'block';
            } else {
                standardFields.style.display = 'block';
                caFields.style.display = 'none';
            }
        }

        function generateTeacherCriteriaFields() {
            const count = parseInt(document.getElementById('teacherCriteriaCount')?.value || 5);
            const container = document.getElementById('teacherCriteriaFields');
            if (!container) return;

            let html = '<div class="criteria-grid">';
            for (let i = 1; i <= count; i++) {
                html += `
 <div class="form-group">
<label>Criterion ${i} Name</label>
<input type="text" id="teacherCriterion${i}Name" placeholder="e.g., Theory Knowledge" value="Criterion ${i}">
</div>
<div class="form-group">
<label>Max Marks</label>
<input type="number" id="teacherCriterion${i}Marks" placeholder="Max marks" value="10" min="1" max="100">
</div> `;
            }
            html += '</div>';
            container.innerHTML = html;
        }

        async function createTeacherExam() {
            if (!window.currentUser) { showToast('Session expired. Please log in again.', 'danger'); return; }
            const subjectId = document.getElementById('teacherExamSubject').value;
            const examType = document.getElementById('teacherExamType').value;
            const examName = document.getElementById('teacherExamName').value.trim();

            if (!subjectId || !examName) {
                showToast('Please fill in all required fields', "warning");
                return;
            }

            try {
                const subjectSelect = document.getElementById('teacherExamSubject');
                const selectedOption = subjectSelect.selectedOptions[0];
                const academicYear = selectedOption.getAttribute('data-year');
                const semester = selectedOption.getAttribute('data-sem');

                let examData = {
                    name: examName,
                    subjectId: subjectId,
                    examType: examType,
                    status: 'DRAFT',
                    lifecycleState: 'DRAFT',
                    academicYear: academicYear || '',
                    semester: semester || '',
                    createdAt: new Date().toISOString(),
                    createdBy: window.currentUser.uid,
                    createdByName: window.currentUser.name
                };

                if (examType === 'standard') {
                    const count = parseInt(document.getElementById('teacherCriteriaCount').value);
                    const criteria = [];
                    let totalMarks = 0;

                    for (let i = 1; i <= count; i++) {
                        const name = document.getElementById(`teacherCriterion${i}Name`).value;
                        const marks = parseFloat(document.getElementById(`teacherCriterion${i}Marks`).value);
                        criteria.push({ name, maxMarks: marks });
                        totalMarks += marks;
                    }

                    examData.criteria = criteria;
                    examData.totalMarks = totalMarks;
                } else {
                    const coCount = parseInt(document.getElementById('teacherCOCount').value);
                    const caCount = parseInt(document.getElementById('teacherCACount').value);
                    const maxMarks = parseFloat(document.getElementById('teacherCAMaxMarks').value);

                    const courseOutcomes = [];
                    for (let co = 1; co <= coCount; co++) {
                        const criteria = [];
                        for (let ca = 1; ca <= caCount; ca++) {
                            criteria.push({ name: `CA${ca}`, maxMarks: maxMarks });
                        }
                        courseOutcomes.push({ name: `CO${co}`, criteria });
                    }

                    examData.courseOutcomes = courseOutcomes;
                    examData.totalMarks = coCount * caCount * maxMarks;
                    examData.caCount = caCount;
                    examData.coCount = coCount;
                }

                await window.addDoc(window.collection(window.db, 'exams'), examData);

                const detailsMsg = examType === 'ca'
                    ? `\n\nCOs: ${examData.coCount}\nCAs per CO: ${examData.caCount}\nTotal Marks: ${examData.totalMarks}`
                    : `\n\nCriteria: ${examData.criteria.length}\nTotal Marks: ${examData.totalMarks}`;

                showToast('Exam created successfully!', 'success');
                document.getElementById('teacherExamName').value = '';
                loadTeacherExamsList();

            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }

        async function loadTeacherExamsList() {
            const container = document.getElementById('teacherExamsList');
            const filterValue = document.getElementById('teacherExamsFilter').value;

            if (!container) return;

            container.innerHTML = '<p>Loading exams...</p>';

            try {
                const assignmentsSnap = await window.getDocs(window.query(
                    window.collection(window.db, 'teacher_assignments'),
                    window.where('teacherEmail', '==', window.currentUser.email)
                ));

                const assignedSubjectIds = [];
                assignmentsSnap.forEach(doc => assignedSubjectIds.push(doc.data().subjectId));

                if (assignedSubjectIds.length === 0) {
                    container.innerHTML = '<p>No subjects assigned</p>';
                    return;
                }

                let q = window.query(
                    window.collection(window.db, 'exams'),
                    window.where('subjectId', 'in', assignedSubjectIds)
                );

                const examsSnap = await window.getDocs(q);

                if (examsSnap.empty) {
                    container.innerHTML = '<p>No exams created yet</p>';
                    return;
                }

                let html = '<table><thead><tr><th>Exam Name</th><th>Subject</th><th>Type</th><th>Structure</th><th>Total Marks</th><th>Status</th><th>Created</th></tr></thead><tbody>';

                for (const examDoc of examsSnap.docs) {
                    const exam = examDoc.data();

                    if (filterValue && exam.subjectId !== filterValue) continue;

                    const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', exam.subjectId));
                    const subjectData = subjectDoc.exists() ? subjectDoc.data() : {};

                    let structure = '';
                    if (exam.examType === 'ca') {
                        structure = `${exam.coCount || 5} COs x ${exam.caCount || 2} CAs`;
                    } else {
                        structure = `${exam.criteria?.length || 0} Criteria`;
                    }

                    html += `
 <tr>
<td><strong>${exam.name}</strong></td>
<td>${subjectData.name || 'N/A'}</td>
<td><span class="badge badge-${exam.examType === 'ca' ? 'info' : 'secondary'}">${exam.examType === 'ca' ? 'CA' : 'Standard'}</span></td>
<td><strong>${structure}</strong></td>
<td>${exam.totalMarks}</td>
<td><span class="badge badge-${exam.status === 'FINALIZED' ? 'success' : 'warning'}">${exam.status}</span></td>
<td>${new Date(exam.createdAt).toLocaleDateString()}</td>
</tr> `;
                }

                html += '</tbody></table>';
                container.innerHTML = html;

            } catch (error) {
                container.innerHTML = '<p>Error: ' + error.message + '</p>';
            }
        }
        async function loadTeacherStudentDropdowns() {
            // Handled by loadTeacherData - kept for backward compatibility
        }
        async function loadTeacherStudents() {
            const select = document.getElementById('teacherStudentSubject');
            const container = document.getElementById('teacherStudentsListContainer');

            if (!select || !select.value) {
                if (container) container.innerHTML = '<p style="text-align:center;color:#9ca3af;padding:20px;">Select a subject to view students.</p>';
                return;
            }

            const rawValue = select.value;
            let subjectId, className, division;
            if (rawValue.includes('|')) {
                [subjectId, className, division] = rawValue.split('|');
            } else {
                subjectId = rawValue;
                const selectedOption = select.selectedOptions[0];
                className = selectedOption?.getAttribute('data-class') || '';
                division = selectedOption?.getAttribute('data-division') || '';
            }
            if (!className || !division) {
                if (container) container.innerHTML = '<div class="alert alert-warning">Class/division info missing for this subject. Contact your coordinator.</div>';
                return;
            }
            container.innerHTML = '<p>Loading students...</p>';

            try {
                const studentsSnap = await window.getDocs(window.query(
                    window.collection(window.db, 'students'),
                    window.where('class', '==', className),
                    window.where('division', '==', division)
                ));

                if (studentsSnap.empty) {
                    container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No students found. Import students using the section above.</p>';
                    return;
                }

                let html = `
 <p style="margin-bottom: 10px;"><strong>Total Students:</strong> ${studentsSnap.size}</p>
<table>
<thead>
<tr>
<th>Sr. No.</th>
<th>Roll No.</th>
<th>Enrollment</th>
<th>Name</th>
<th>Email</th>
<th>Phone</th>
</tr>
</thead>
<tbody>`;

                let srNo = 1;
                studentsSnap.forEach(doc => {
                    const student = doc.data();
                    html += `
 <tr>
<td>${srNo}</td>
<td>${student.rollNo || '-'}</td>
<td>${student.enrollment}</td>
<td>${student.name}</td>
<td>${student.email || '-'}</td>
<td>${student.phone || '-'}</td>
</tr>`;
                    srNo++;
                });

                html += '</tbody></table>';
                container.innerHTML = html;
            } catch (error) {
                container.innerHTML = '<p style="color: red;">Error loading students: ' + error.message + '</p>';
            }
        }

        let teacherResultsData = [];

        async function loadTeacherResults() {
            // Delegates to loadAllStudentsResults which handles teacher context
            await loadAllStudentsResults();
        }

        function displayTeacherResults(results, examData) {
            const container = document.getElementById('teacherResultsContainer');

            if (results.length === 0) {
                container.innerHTML = '<p>No results found for this exam.</p>';
                return;
            }

            let html = '<table><thead><tr>';
            html += '<th>Enrollment</th><th>Name</th><th>Total Marks</th><th>Percentage</th><th>Grade</th><th>Status</th>';

            if (examData.examType === 'ca') {
                html += '<th>CO Attainment</th>';
            }
            html += '</tr></thead><tbody>';

            results.forEach(result => {
                const statusClass = result.status === 'COMPLETE' ? 'success' : 'warning';
                html += `
 <tr>
<td>${result.enrollment}</td>
<td>${result.studentName}</td>
<td>${result.totalMarks != null ? Number(result.totalMarks).toFixed(2) : 'N/A'} / ${examData.totalMarks || 'N/A'}</td>
<td>${(result.percentage != null ? Number(result.percentage).toFixed(2) : '0.00')}%</td>
<td><span class="badge badge-info">${result.grade}</span></td>
<td><span class="badge badge-${statusClass}">${result.status}</span></td> `;

                if (examData.examType === 'ca' && result.coAttainment) {
                    let coSummary = '<div style="font-size: 12px;">';
                    result.coAttainment.forEach(co => {
                        const color = co.percentage >= 70 ? '#10b981' : co.percentage >= 50 ? '#f59e0b' : '#ef4444';
                        coSummary += `<div>${co.co}: ${co.percentage != null ? Number(co.percentage).toFixed(0) : '0'}%</div>`;
                    });
                    coSummary += '</div>';
                    html += `<td>${coSummary}</td>`;
                }

                html += '</tr>';
            });

            html += '</tbody></table>';
            const complete = results.filter(r => r.status === 'COMPLETE').length;
            const avgPercentage = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;

            html += `
 <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
<strong>Summary:</strong><br>Total Students: ${results.length}<br>Complete: ${complete} | Incomplete: ${results.length - complete}<br>Class Average: ${(avgPercentage != null && !isNaN(avgPercentage) ? Number(avgPercentage).toFixed(2) : '0.00')}%
</div> `;

            container.innerHTML = html;
        }

        function filterTeacherResults() {
            const searchText = document.getElementById('teacherResultSearch')?.value?.toLowerCase() || '';
            if (!searchText) {
                const rows = document.querySelectorAll('#teacherResultsContainer table tbody tr');
                rows.forEach(row => row.style.display = '');
                return;
            }
            const rows = document.querySelectorAll('#teacherResultsContainer table tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchText) ? '' : 'none';
            });
        }

        async function exportTeacherResults() {
            const examId = document.getElementById('teacherResultsExam')?.value;
            if (!examId) {
                showToast('Please select an exam first', 'warning');
                return;
            }
            try {
                await exportAllStudentsResultsCSV(examId);
            } catch (error) {
                showToast('Export failed: ' + error.message, 'danger');
            }
        }
        async function teacherImportStudents() {
            const classSelect = document.getElementById('teacherImportClass');
            const fileInput = document.getElementById('teacherStudentExcel');

            const classData = classSelect.value;
            if (!classData) {
                showToast('Please select a class first', "warning");
                return;
            }

            if (!fileInput.files[0]) {
                showToast('Please select a CSV file', "warning");
                return;
            }

            const parts = classData.split('|');
            const subjectId = parts[0] || '';
            const className = parts[1] || '';
            const division = parts[2] || '';
            if (!className || !division) {
                showToast('Invalid class selection. Please re-select.', 'danger');
                return;
            }
            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = async function (e) {
                try {
                    const csv = e.target.result;
                    const lines = csv.split('\n');

                    let successCount = 0;
                    let skipCount = 0;
                    for (let i = 2; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;

                        const cols = line.split(',');
                        if (cols.length < 4) continue;

                        const rollNo = cols[1]?.trim();
                        const enrollment = cols[2]?.trim();
                        const name = cols[3]?.trim();
                        const parentEmail = cols[4]?.trim();
                        const studentEmail = cols[6]?.trim();
                        const phone = cols[8]?.trim();
                        const batch = cols[10]?.trim();

                        if (!enrollment || !name) {
                            skipCount++;
                            continue;
                        }
                        const existingSnap = await window.getDocs(window.query(
                            window.collection(window.db, 'students'),
                            window.where('enrollment', '==', enrollment)
                        ));

                        if (!existingSnap.empty) {
                            skipCount++;
                            continue;
                        }
                        await window.addDoc(window.collection(window.db, 'students'), {
                            rollNo: rollNo || '',
                            enrollment: enrollment,
                            name: name,
                            email: studentEmail || parentEmail || '',
                            parentEmail: parentEmail || '',
                            phone: phone || '',
                            class: className,
                            division: division,
                            batch: batch || division,
                            createdAt: new Date().toISOString(),
                            createdBy: window.currentUser.uid
                        });

                        successCount++;
                    }

                    showToast(`Import Complete!\n\nAdded: ${successCount} students\nSkipped: ${skipCount} (duplicates or invalid)`, "success");
                    fileInput.value = '';

                } catch (error) {
                    showToast('Error importing: ' + error.message, 'danger');
                }
            };

            reader.readAsText(file);
        }

        async function loadTeacherData() {
            const tbody = document.getElementById('teacherAssignmentsList');
            const examSelect = document.getElementById('teacherExamSelect');
            const subjectSelect = document.getElementById('teacherResultsSubject');
            const studentSubjectSelect = document.getElementById('teacherStudentSubject');
            if (studentSubjectSelect) studentSubjectSelect.innerHTML = '<option value="">Select Subject</option>';
            const importClassSelect = document.getElementById('teacherImportClass');

            if (!tbody || !examSelect) {
                return;
            }

            tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
            examSelect.innerHTML = '<option value="">Select exam to evaluate</option>';
            if (subjectSelect) subjectSelect.innerHTML = '<option value="">Select Subject First</option>';
            if (importClassSelect) importClassSelect.innerHTML = '<option value="">Select Class</option>';

            try {
                const assignmentsSnap = await window.getDocs(window.query(window.collection(window.db, 'teacher_assignments'),
                    window.where('teacherEmail', '==', window.currentUser.email)));
                tbody.innerHTML = '';

                if (assignmentsSnap.empty) {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No assignments yet. Contact your coordinator to assign you to subjects.</td></tr>';
                }
                const assignedSubjectIds = [];
                const subjectsMap = new Map();

                for (const docSnap of assignmentsSnap.docs) {
                    const data = docSnap.data();
                    assignedSubjectIds.push(data.subjectId);

                    const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', data.subjectId));
                    const subjectData = subjectDoc.exists() ? subjectDoc.data() : {};
                    const studentsSnap = await window.getDocs(window.query(window.collection(window.db, 'students'),
                        window.where('class', '==', data.class),
                        window.where('division', '==', data.division)));
                    if (!subjectsMap.has(data.subjectId)) {
                        subjectsMap.set(data.subjectId, {
                            name: subjectData.name || 'N/A',
                            class: data.class,
                            division: data.division,
                            academicYear: subjectData.academicYear || '',
                            semester: subjectData.semester || ''
                        });
                    }
                    if (importClassSelect) {
                        const option = document.createElement('option');
                        option.value = `${data.subjectId}|${data.class}|${data.division}`;
                        option.textContent = `${subjectData.name} - ${data.class}-${data.division}`;
                        importClassSelect.appendChild(option);
                    }

                    const row = tbody.insertRow();
                    row.innerHTML = `
 <td><strong>${subjectData.name || 'N/A'}</strong></td>
<td>${subjectData.code || '-'}</td>
<td>${data.class}</td>
<td>${data.division}</td>
<td><span class="badge badge-info">${studentsSnap.size}</span></td>
<td>${subjectData.academicYear || '-'}</td>
<td>${subjectData.semester || '-'}</td> `;
                }
                const evalSubjectSelect = document.getElementById('teacherSubjectSelect');
                if (evalSubjectSelect) evalSubjectSelect.innerHTML = '<option value="">Choose Subject</option>';
                const createExamSubjectSelect = document.getElementById('teacherExamSubject');
                const createExamFilterSelect = document.getElementById('teacherExamsFilter');
                if (createExamSubjectSelect) createExamSubjectSelect.innerHTML = '<option value="">Choose Subject</option>';
                if (createExamFilterSelect) createExamFilterSelect.innerHTML = '<option value="">All Subjects</option>';
                if (subjectSelect) {
                    subjectsMap.forEach((subjectInfo, subjectId) => {
                        const option = document.createElement('option');
                        option.value = subjectId;
                        option.textContent = `${subjectInfo.name} (${subjectInfo.class}-${subjectInfo.division})`;
                        option.setAttribute('data-class', subjectInfo.class);
                        option.setAttribute('data-division', subjectInfo.division);
                        option.setAttribute('data-year', subjectInfo.academicYear || '');
                        option.setAttribute('data-sem', subjectInfo.semester || '');
                        subjectSelect.appendChild(option);
                        if (evalSubjectSelect) evalSubjectSelect.appendChild(option.cloneNode(true));
                        if (studentSubjectSelect) studentSubjectSelect.appendChild(option.cloneNode(true));
                        if (createExamSubjectSelect) createExamSubjectSelect.appendChild(option.cloneNode(true));
                        if (createExamFilterSelect) {
                            const filterOpt = option.cloneNode(true);
                            createExamFilterSelect.appendChild(filterOpt);
                        }
                    });
                }
                if (assignedSubjectIds.length > 0) {
                    // Firestore 'in' query max 30 items - chunk if needed
                    const chunks = [];
                    for (let i = 0; i < assignedSubjectIds.length; i += 30) {
                        chunks.push(assignedSubjectIds.slice(i, i + 30));
                    }
                    const examDocs = [];
                    for (const chunk of chunks) {
                        const snap = await window.getDocs(window.query(window.collection(window.db, 'exams'),
                            window.where('subjectId', 'in', chunk)));
                        snap.forEach(d => examDocs.push(d));
                    }
                    const examsSnap = { forEach: (cb) => examDocs.forEach(cb), docs: examDocs };
                    const importSelect = document.getElementById('importExamSelect');

                    if (importSelect) importSelect.innerHTML = '<option value="">Choose exam</option>';

                    examsSnap.forEach(docSnap => {
                        const data = docSnap.data();
                        if (data.status !== 'FINALIZED') {
                            const option = document.createElement('option');
                            option.value = docSnap.id;
                            option.textContent = data.name;
                            examSelect.appendChild(option);
                            if (importSelect) {
                                const importOption = document.createElement('option');
                                importOption.value = docSnap.id;
                                importOption.textContent = data.name;
                                importSelect.appendChild(importOption);
                            }
                        }
                    });
                }
            } catch (error) {
                tbody.innerHTML = '<tr><td colspan="4">Error loading data: ' + error.message + '</td></tr>';
                showToast('Error loading dashboard: ' + error.message, 'danger');
            }
        }
        async function loadTeacherExamsDropdown() {
            const subjectId = document.getElementById('teacherSubjectSelect').value;
            const examSelect = document.getElementById('teacherExamSelect');
            const formDiv = document.getElementById('evaluationForm');
            if (!subjectId) {
                examSelect.innerHTML = '<option value="">Choose Exam</option>';
                if (formDiv) formDiv.innerHTML = '';
                return;
            }
            examSelect.innerHTML = '<option value="">Loading...</option>';
            try {
                const examsSnap = await window.getDocs(window.query(
                    window.collection(window.db, 'exams'),
                    window.where('subjectId', '==', subjectId)
                ));
                examSelect.innerHTML = '<option value="">Choose Exam</option>';
                examsSnap.forEach(docSnap => {
                    const data = docSnap.data();
                    const option = document.createElement('option');
                    option.value = docSnap.id;
                    option.textContent = data.name + (data.status === 'FINALIZED' ? ' [Finalized]' : '');
                    examSelect.appendChild(option);
                });
                if (examsSnap.empty) {
                    examSelect.innerHTML = '<option value="">No exams for this subject</option>';
                }
            } catch (error) {
                examSelect.innerHTML = '<option value="">Error loading exams</option>';
            }
        }
        async function loadTeacherResultsExams() {
            const subjectId = document.getElementById('teacherResultsSubject').value;
            const examSelect = document.getElementById('teacherResultsExam');
            const container = document.getElementById('teacherResultsContainer');

            if (!subjectId) {
                examSelect.innerHTML = '<option value="">Select Subject First</option>';
                container.innerHTML = '';
                return;
            }

            examSelect.innerHTML = '<option value="">Loading...</option>';

            try {
                const examsSnap = await window.getDocs(window.query(
                    window.collection(window.db, 'exams'),
                    window.where('subjectId', '==', subjectId)
                ));

                examSelect.innerHTML = '<option value="">Select Exam</option>';

                examsSnap.forEach(docSnap => {
                    const data = docSnap.data();
                    const option = document.createElement('option');
                    option.value = docSnap.id;
                    option.textContent = data.name + (data.status === 'FINALIZED' ? ' [Finalized]' : '');
                    examSelect.appendChild(option);
                });

                if (examsSnap.empty) {
                    examSelect.innerHTML = '<option value="">No exams found for this subject</option>';
                }
            } catch (error) {
                examSelect.innerHTML = '<option value="">Error loading exams</option>';
            }
        }
        function toggleStudent(studentId) {
            const content = document.getElementById(studentId);
            const arrow = document.getElementById('arrow-' + studentId);

            if (content.style.display === 'none') {
                content.style.display = 'block';
                arrow.style.transform = 'rotate(90deg)';
            } else {
                content.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            }
        }

        // -- EVAL CACHE: exam doc cached so save doesn't re-fetch each time --
        let _evalExamCache = {};

        function markAsModified(studentId) {
            const statusBadge = document.getElementById('status-student-' + studentId);
            if (statusBadge && statusBadge.textContent !== 'Saving...') {
                statusBadge.className = 'badge badge-warning';
                statusBadge.textContent = 'Modified';
            }
        }

        function toggleAbsent(studentId, examId, examType) {
            const card = document.getElementById('student-' + studentId);
            const btn = document.getElementById('absent-btn-' + studentId);
            const badge = document.getElementById('status-student-' + studentId);
            const isAbsent = btn.dataset.absent === '1';
            if (isAbsent) {
                btn.dataset.absent = '0';
                btn.textContent = 'Mark Absent';
                btn.className = 'btn btn-warning btn-sm';
                if (card) card.style.opacity = '1';
                if (badge) { badge.className = 'badge badge-warning'; badge.textContent = 'Modified'; }
                card.querySelectorAll('input').forEach(i => i.disabled = false);
            } else {
                btn.dataset.absent = '1';
                btn.textContent = 'Absent';
                btn.className = 'btn btn-danger btn-sm';
                if (card) card.style.opacity = '0.45';
                if (badge) { badge.className = 'badge badge-secondary'; badge.textContent = 'Absent'; }
                card.querySelectorAll('input').forEach(i => { i.disabled = true; i.value = ''; });
                saveStudentEvaluation(studentId, examId, examType);
            }
        }

        async function saveStudentEvaluation(studentId, examId, examType) {
            try {
                const statusBadge = document.getElementById('status-student-' + studentId);
                if (statusBadge) { statusBadge.className = 'badge badge-info'; statusBadge.textContent = 'Saving...'; }

                let examData = _evalExamCache[examId];
                if (!examData) {
                    const examDoc = await window.getDoc(window.doc(window.db, 'exams', examId));
                    examData = examDoc.data();
                    _evalExamCache[examId] = examData;
                }

                const absentBtn = document.getElementById('absent-btn-' + studentId);
                const isAbsent = absentBtn && absentBtn.dataset.absent === '1';

                let marks = [], coMarks = {}, totalMarks = 0, allFilled = true, coAttainment = [];

                if (isAbsent) {
                    marks = examType === 'standard' ? (examData.criteria || []).map(() => null) : [];
                    if (examType === 'ca') {
                        (examData.courseOutcomes || []).forEach((co, coIdx) => {
                            (co.criteria || []).forEach((c, cIdx) => { coMarks[`CO${coIdx + 1}_C${cIdx + 1}`] = null; });
                        });
                    }
                    allFilled = false;
                } else if (examType === 'standard') {
                    examData.criteria.forEach((criterion, idx) => {
                        const val = document.querySelector(`#input-${studentId}-${idx}`)?.value;
                        if (val === '' || val == null) { marks.push(null); allFilled = false; }
                        else { const m = parseFloat(val); marks.push(m); totalMarks += m; }
                    });
                } else {
                    examData.courseOutcomes.forEach((co, coIdx) => {
                        co.criteria.forEach((c, cIdx) => {
                            const val = document.querySelector(`#input-${studentId}-${coIdx}-${cIdx}`)?.value;
                            const key = `CO${coIdx + 1}_C${cIdx + 1}`;
                            if (val === '' || val == null) { coMarks[key] = null; allFilled = false; }
                            else { const m = parseFloat(val); coMarks[key] = m; totalMarks += m; }
                        });
                    });
                }

                const maxTotalMarks = examType === 'standard'
                    ? examData.criteria.reduce((s, c) => s + c.maxMarks, 0)
                    : examData.courseOutcomes.reduce((s, co) => s + co.criteria.reduce((ss, c) => ss + c.maxMarks, 0), 0);

                let finalMarks = totalMarks;
                let criteriaCount = examType === 'standard' ? examData.criteria.length :
                    examData.courseOutcomes.reduce((sum, co) => sum + co.criteria.length, 0);

                if (examType === 'ca' && criteriaCount > 0) {
                    finalMarks = totalMarks / criteriaCount;
                }

                finalMarks = Math.round(finalMarks);

                const percentage = (!isAbsent && maxTotalMarks > 0) ? window.calculatePercentage(finalMarks, maxTotalMarks / (examType === 'ca' ? criteriaCount : 1)) : 0;
                const grade = isAbsent ? 'AB' : calculateGrade(percentage);

                if (!isAbsent && examType === 'ca') {
                    coAttainment = examData.courseOutcomes.map((co, coIdx) => {
                        const coMax = co.criteria.reduce((s, c) => s + c.maxMarks, 0);
                        let coTotal = 0;
                        let coCount = 0;
                        co.criteria.forEach((c, cIdx) => {
                            const key = `CO${coIdx + 1}_C${cIdx + 1}`;
                            if (coMarks[key] != null) {
                                coTotal += coMarks[key];
                                coCount++;
                            }
                        });

                        const coAvg = coCount > 0 ? coTotal / coCount : 0;
                        const coPct = window.calculatePercentage(coAvg, coMax / coCount);
                        return { co: co.name, percentage: Math.round(coPct), status: calculateCOStatus(coPct) };
                    });
                }

                const studentNameEl = document.querySelector(`[data-student="${studentId}"]`);
                const studentCardHeader = document.querySelector(`#student-${studentId}`)?.previousElementSibling;
                const studentDisplayName = studentCardHeader?.querySelector('h4')?.textContent?.replace(/^[\s\d.]+/, '').trim() || studentId;
                const resultData = {
                    examId, studentId,
                    studentName: studentDisplayName,
                    marks: examType === 'standard' ? marks : [],
                    coMarks: examType === 'ca' ? coMarks : {},
                    coAttainment: examType === 'ca' ? coAttainment : [],
                    totalMarks: finalMarks,
                    maxMarks: examType === 'ca' ? Math.round(maxTotalMarks / criteriaCount) : maxTotalMarks,
                    percentage: Math.round(percentage),
                    grade,
                    absent: isAbsent || false,
                    status: isAbsent ? 'ABSENT' : (allFilled ? 'COMPLETE' : 'INCOMPLETE'),
                    evaluatedAt: new Date().toISOString(),
                    evaluatedBy: window.currentUser.uid
                };

                const existingSnap = await window.getDocs(window.query(
                    window.collection(window.db, 'results'),
                    window.where('examId', '==', examId),
                    window.where('studentId', '==', studentId)
                ));
                if (!existingSnap.empty) {
                    await window.updateDoc(window.doc(window.db, 'results', existingSnap.docs[0].id), resultData);
                } else {
                    await window.addDoc(window.collection(window.db, 'results'), resultData);
                }

                if (statusBadge) {
                    statusBadge.className = isAbsent ? 'badge badge-secondary' : 'badge badge-success';
                    statusBadge.textContent = isAbsent ? 'Absent' : 'Saved';
                }
            } catch (error) {
                const badge = document.getElementById('status-student-' + studentId);
                if (badge) { badge.className = 'badge badge-danger'; badge.textContent = 'Error'; }
                showToast('Error saving ' + studentId + ': ' + error.message, 'danger');
                throw error;
            }
        }

        async function saveAllEvaluations(examId, examType) {
            const btn = document.querySelector(`button[onclick*="saveAllEvaluations"]`);
            if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
            const studentIds = new Set();
            document.querySelectorAll('[data-student]').forEach(el => studentIds.add(el.getAttribute('data-student')));

            const results = await Promise.allSettled([...studentIds].map(id => saveStudentEvaluation(id, examId, examType)));
            const saved = results.filter(r => r.status === 'fulfilled').length;
            const errors = results.filter(r => r.status === 'rejected').length;

            if (btn) { btn.disabled = false; btn.textContent = `Save All Students (${studentIds.size} students)`; }
            showToast(`Saved ${saved} student(s)${errors > 0 ? ' | ' + errors + ' error(s)' : ''}`, errors > 0 ? 'warning' : 'success');
        }

        async function loadExistingEvaluations(examId, examType) {
            try {
                const resultsSnap = await window.getDocs(window.query(
                    window.collection(window.db, 'results'),
                    window.where('examId', '==', examId)
                ));
                resultsSnap.forEach(doc => {
                    const result = doc.data();
                    const sid = result.studentId;
                    const badge = document.getElementById('status-student-' + sid);
                    const absentBtn = document.getElementById('absent-btn-' + sid);
                    const card = document.getElementById('student-' + sid);

                    if (result.absent) {
                        if (absentBtn) { absentBtn.dataset.absent = '1'; absentBtn.textContent = 'Absent'; absentBtn.className = 'btn btn-danger btn-sm'; }
                        if (card) { card.style.opacity = '0.45'; card.querySelectorAll('input').forEach(i => i.disabled = true); }
                        if (badge) { badge.className = 'badge badge-secondary'; badge.textContent = 'Absent'; }
                        return;
                    }

                    if (badge) { badge.className = 'badge badge-success'; badge.textContent = 'Saved'; }
                    if (examType === 'standard' && result.marks) {
                        result.marks.forEach((mark, idx) => {
                            const input = document.querySelector(`#input-${sid}-${idx}`);
                            if (input && mark !== null) input.value = mark;
                        });
                    } else if (examType === 'ca' && result.coMarks) {
                        Object.keys(result.coMarks).forEach(key => {
                            const match = key.match(/CO(\d+)_C(\d+)/);
                            if (match) {
                                const coIdx = parseInt(match[1]) - 1;
                                const cIdx = parseInt(match[2]) - 1;
                                const input = document.querySelector(`#input-${sid}-${coIdx}-${cIdx}`);
                                if (input && result.coMarks[key] !== null) input.value = result.coMarks[key];
                            }
                        });
                    }
                });
            } catch (e) { }
        }

        async function loadEvaluationForm() {
            _evalExamCache = {};
            const examId = document.getElementById('teacherExamSelect').value;
            const formDiv = document.getElementById('evaluationForm');
            if (!examId) { formDiv.innerHTML = ''; return; }
            formDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Loading evaluation form...</div>';
            try {

                const examDocP = window.getDoc(window.doc(window.db, 'exams', examId));
                const teacherCheckP = window.getDocs(window.query(window.collection(window.db, 'teacher_assignments'),
                    window.where('teacherEmail', '==', window.currentUser.email)));

                const [examDoc, teacherSnap] = await Promise.all([examDocP, teacherCheckP]);

                if (!examDoc.exists()) { formDiv.innerHTML = '<div class="alert alert-danger">Exam not found</div>'; return; }
                const examData = examDoc.data();
                _evalExamCache[examId] = examData;

                if (examData.status === 'FINALIZED' || examData.lifecycleState === 'FINALIZED') {
                    formDiv.innerHTML = '<div class="alert alert-danger"><strong>This exam is FINALIZED</strong><br>No further evaluations are allowed.</div>';
                    return;
                }

                const subjectDocP = window.getDoc(window.doc(window.db, 'subjects', examData.subjectId));
                const [subjectDoc] = await Promise.all([subjectDocP]);
                if (!subjectDoc.exists()) { formDiv.innerHTML = '<div class="alert alert-danger">Subject not found for this exam.</div>'; return; }
                const subjectData = subjectDoc.data();

                const assigned = teacherSnap.docs.some(d => d.data().subjectId === examData.subjectId);
                if (!assigned) {
                    formDiv.innerHTML = '<div class="alert alert-danger"><strong>Access Denied</strong><br>You are not assigned to this subject.</div>';
                    return;
                }

                const studentsP = window.getDocs(window.query(window.collection(window.db, 'students'),
                    window.where('class', '==', subjectData.class),
                    window.where('division', '==', subjectData.division)));
                const resultsP = window.getDocs(window.query(window.collection(window.db, 'results'),
                    window.where('examId', '==', examId)));

                const [studentsSnap, existingResultsSnap] = await Promise.all([studentsP, resultsP]);

                if (studentsSnap.empty) {
                    formDiv.innerHTML = '<div class="alert alert-warning">No students found for this class/division</div>';
                    return;
                }

                const resultsMap = {};
                existingResultsSnap.forEach(d => { resultsMap[d.data().studentId] = d.data(); });

                let assignmentsMap = {};
                if (examData.examType === 'ca') {
                    const assignPromises = studentsSnap.docs.map(sd =>
                        window.getDoc(window.doc(window.db, 'ca_question_assignments', `${examId}_${sd.id}`))
                            .then(d => { if (d.exists()) assignmentsMap[sd.id] = d.data().assignments; }).catch(function () { })
                    );
                    await Promise.all(assignPromises);
                }

                let html = `
 <div style="margin-bottom:16px;padding:14px;background:#e3f2fd;border-radius:8px;border-left:4px solid #2196f3;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;">
<div style="display:flex;flex-wrap:wrap;gap:14px;font-size:14px;">
<span><strong>📝 ${examData.name}</strong></span>
<span><strong>Subject:</strong> ${subjectData.name}</span>
<span><strong>Class:</strong> ${subjectData.class}-${subjectData.division}</span>
<span><strong>Students:</strong> <span class="badge badge-info">${studentsSnap.size}</span></span>
<span><strong>Type:</strong> <span class="badge badge-${examData.examType === 'ca' ? 'primary' : 'secondary'}">${examData.examType === 'ca' ? 'CA' : 'Standard'}</span></span>
</div>
<button class="btn btn-success btn-sm" onclick="saveAllEvaluations('${examId}','${examData.examType}')" style="white-space:nowrap;font-weight:600;">💾 Save All (${studentsSnap.size})</button>
</div>
<div style="background:#fff3cd;border-left:4px solid #ffc107;padding:12px;border-radius:6px;margin-bottom:12px;">
<strong>💡 Quick Tips:</strong>
<ul style="margin:8px 0 0 0;padding-left:20px;font-size:13px;">
<li>Click any student name to expand/collapse their marks entry</li>
<li>Use Tab key to move between fields quickly</li>
<li>Press Ctrl+S (Cmd+S on Mac) to save current student</li>
<li>Values are validated automatically (max marks, negatives blocked)</li>
<li>See live total as you type!</li>
</ul>
</div>
<div id="studentEvaluations">`;

                studentsSnap.docs.forEach((studentDoc, studentIndex) => {
                    const student = studentDoc.data();
                    const sid = studentDoc.id;
                    const existing = resultsMap[sid];
                    const isAbsent = existing?.absent === true;
                    const savedStatus = existing ? (isAbsent ? 'Absent' : 'Saved') : 'Not Saved';
                    const badgeClass = existing ? (isAbsent ? 'badge-secondary' : 'badge-success') : 'badge-secondary';
                    const cardOpacity = isAbsent ? '0.45' : '1';

                    html += `
 <div class="card" style="margin-bottom:12px;border-left:4px solid ${isAbsent ? '#ef4444' : '#28a745'};">
<div onclick="toggleStudent('student-${sid}')" style="padding:13px 15px;cursor:pointer;background:linear-gradient(to right,#f8f9fa,#fff);border-bottom:1px solid #dee2e6;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
<div style="flex:1;min-width:180px;">
<h4 style="margin:0;color:${isAbsent ? '#ef4444' : '#28a745'};font-size:16px;">
<span id="arrow-student-${sid}" style="display:inline-block;transition:transform 0.3s;"></span> ${studentIndex + 1}. ${student.name}
</h4>
<small style="color:#6c757d;">${student.enrollment}${student.rollNo ? ' | Roll: ' + student.rollNo : ''}</small>
</div>
<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
<span id="status-student-${sid}" class="badge ${badgeClass}">${savedStatus}</span>
<button id="absent-btn-${sid}" class="btn ${isAbsent ? 'btn-danger' : 'btn-warning'} btn-sm"
 data-absent="${isAbsent ? '1' : '0'}"
 onclick="event.stopPropagation(); toggleAbsent('${sid}','${examId}','${examData.examType}')">${isAbsent ? 'Absent' : 'Mark Absent'}</button>
<button class="btn btn-success btn-sm" onclick="event.stopPropagation(); saveStudentEvaluation('${sid}','${examId}','${examData.examType}')">Save</button>
</div>
</div>
<div id="student-${sid}" style="display:none;padding:15px;background:#fff;opacity:${cardOpacity};">`;

                    if (examData.examType === 'standard') {
                        html += `<div class="form-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">`;
                        examData.criteria.forEach((criterion, idx) => {
                            const savedMark = existing?.marks?.[idx];
                            html += `
 <div class="form-group" style="margin:0;">
<label style="font-weight:600;color:#495057;font-size:13px;display:block;margin-bottom:4px;">
${criterion.name} <span style="color:#888;font-weight:normal;">(Max: ${criterion.maxMarks})</span>
</label>
<input type="number" class="eval-input"
 id="input-${sid}-${idx}"
 data-student="${sid}" data-criterion="${idx}"
 min="0" max="${criterion.maxMarks}" step="0.5"
 placeholder="Marks" value="${savedMark != null ? savedMark : ''}"
 ${isAbsent ? 'disabled' : ''}
 style="width:100%;padding:8px;border:1px solid #ced4da;border-radius:4px;font-size:14px;"
 onchange="validateMarks(this,${criterion.maxMarks});markAsModified('${sid}')">
</div>`;
                        });
                        html += `</div>`;
                    } else {
                        const assignedQs = assignmentsMap[sid] || {};
                        html += `<div>`;
                        examData.courseOutcomes.forEach((co, coIdx) => {
                            const coKey = `CO${coIdx + 1}`;
                            const studentQs = assignedQs[coKey] || [];
                            html += `
 <div style="background:#f1f8ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:10px;">
<div style="font-weight:700;color:#1e40af;font-size:13px;margin-bottom:6px;">${co.name}${co.description ? ' - ' + co.description : ''}</div>
${studentQs.length > 0
                                    ? `<div style="background:#fff;border:1px solid #dbeafe;border-radius:6px;padding:8px;margin-bottom:8px;font-size:12px;color:#374151;">
${studentQs.map((q, qi) => `<div style="padding:2px 0;border-bottom:1px solid #f3f4f6;">${qi + 1}. ${q}</div>`).join('')}
</div>`
                                    : `<div style="font-size:12px;color:#9ca3af;margin-bottom:6px;font-style:italic;">No questions assigned</div>`}
<div style="display:flex;flex-wrap:wrap;gap:10px;">
${co.criteria.map((c, cIdx) => {
                                        const key = `CO${coIdx + 1}_C${cIdx + 1}`;
                                        const savedMark = existing?.coMarks?.[key];
                                        return `
 <div class="form-group" style="margin:0;min-width:120px;">
<label style="font-weight:600;color:#374151;font-size:12px;display:block;margin-bottom:3px;">
${c.name} <span style="color:#9ca3af;font-weight:normal;">(Max: ${c.maxMarks})</span>
</label>
<input type="number" class="eval-input-ca"
 id="input-${sid}-${coIdx}-${cIdx}"
 data-student="${sid}" data-co="${coIdx}" data-criterion="${cIdx}"
 min="0" max="${c.maxMarks}" step="0.5"
 placeholder="Marks" value="${savedMark != null ? savedMark : ''}"
 ${isAbsent ? 'disabled' : ''}
 style="width:100%;padding:7px;border:2px solid #e5e7eb;border-radius:6px;font-size:13px;"
 onchange="validateMarks(this,${c.maxMarks});markAsModified('${sid}')">
</div>`;
                                    }).join('')}
</div>
</div>`;
                        });
                        html += `</div>`;
                    }

                    html += `<div id="live-total-${sid}"></div>`;

                    html += `
<div style="margin-top:12px;padding-top:12px;border-top:1px solid #dee2e6;text-align:right;">
<button class="btn btn-success" onclick="saveStudentEvaluation('${sid}','${examId}','${examData.examType}')">
💾 Save ${student.name.split(' ')[0]}'s Marks
</button>
</div>
</div>
</div>`;
                });

                html += `</div>
<div style="position:sticky;bottom:0;background:#fff;padding:14px;border-top:2px solid #28a745;margin-top:16px;text-align:center;box-shadow:0 -2px 10px rgba(0,0,0,.1);">
<button class="btn btn-success btn-lg" onclick="saveAllEvaluations('${examId}','${examData.examType}')" style="padding:11px 28px;font-size:15px;">
Save All Students (${studentsSnap.size} students)
</button>
</div>`;

                formDiv.innerHTML = html;

                setTimeout(() => {
                    if (typeof window.setupEvaluationHelpers === 'function') {
                        window.setupEvaluationHelpers();
                    }
                }, 100);

            } catch (error) {
                formDiv.innerHTML = '<div class="alert alert-danger">Error loading evaluation form: ' + error.message + '</div>';
            }
        }

        async function loadStudentData() {
            const resultsDiv = document.getElementById('studentResults');
            resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Loading your results...</div>';

            try {
                const studentsSnap = await window.getDocs(window.query(window.collection(window.db, 'students'),
                    window.where('enrollment', '==', window.currentUser.enrollment)));

                if (studentsSnap.empty) {
                    resultsDiv.innerHTML = '<div class="alert alert-warning">No student record found. Please contact your coordinator to ensure your enrollment number matches.</div>';
                    return;
                }

                const studentId = studentsSnap.docs[0].id;
                const studentData = studentsSnap.docs[0].data();
                const resultsSnap = await window.getDocs(window.query(window.collection(window.db, 'results'),
                    window.where('studentId', '==', studentId)));

                if (resultsSnap.empty) {
                    resultsDiv.innerHTML = '<div class="alert alert-info" style="text-align:center;padding:30px;"><h4>No Results Yet</h4><p>Results will appear here once your teacher evaluates your performance.</p></div>';
                    return;
                }
                let totalPercentage = 0;
                let completedExams = 0;
                resultsSnap.forEach(doc => {
                    const data = doc.data();
                    if (data.percentage !== undefined) {
                        totalPercentage += data.percentage;
                        completedExams++;
                    }
                });
                const averagePercentage = completedExams > 0 ? (totalPercentage / completedExams).toFixed(2) : 0;

                let html = `
 <div class="alert alert-success" style="margin-bottom:16px;">
<strong>${studentData.name}</strong> | Enrollment: ${studentData.enrollment} | Class: ${studentData.class}-${studentData.division}<br>
<strong>Total Exams:</strong> ${resultsSnap.size} &nbsp;|&nbsp; <strong>Average Score:</strong> ${(isNaN(averagePercentage) ? 0 : averagePercentage)}%
</div>
<table><thead><tr><th>Exam</th><th>Subject</th><th>Marks</th><th>Percentage</th><th>Grade</th><th>Status</th></tr></thead><tbody>`;

                for (const resultDoc of resultsSnap.docs) {
                    const result = resultDoc.data();
                    let examName = result.examId;
                    let subjectName = 'N/A';
                    let totalM = 'N/A';
                    let maxM = 'N/A';
                    try {
                        const examDoc = await window.getDoc(window.doc(window.db, 'exams', result.examId));
                        if (examDoc.exists()) {
                            const examData = examDoc.data();
                            examName = examData.name;
                            maxM = examData.totalMarks || result.maxMarks || 'N/A';
                            const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', examData.subjectId));
                            if (subjectDoc.exists()) subjectName = subjectDoc.data().name;
                        }
                    } catch (e) { }
                    const isAbsent = result.absent === true || result.status === 'ABSENT';
                    totalM = isAbsent ? 'AB' : (result.totalMarks !== undefined ? Number(result.totalMarks).toFixed(2) : 'N/A');
                    const pct = isAbsent ? '-' : (result.percentage !== undefined ? (result.percentage != null ? Number(result.percentage).toFixed(2) : '0.00') : 'N/A');
                    const grade = isAbsent ? 'AB' : (result.grade || (result.percentage ? calculateGrade(result.percentage) : 'N/A'));
                    const displayStatus = isAbsent ? 'ABSENT' : (result.finalStatus || result.status || 'INCOMPLETE');

                    html += `
 <tr>
<td><strong>${examName}</strong></td>
<td>${subjectName}</td>
<td>${totalM} / ${maxM}</td>
<td>${pct}%</td>
<td><span class="badge badge-info">${grade}</span></td>
<td><span class="badge badge-${displayStatus === 'ABSENT' ? 'secondary' : displayStatus === 'FINALIZED' ? 'danger' : displayStatus === 'COMPLETE' ? 'success' : 'warning'}">${displayStatus}</span></td>
</tr> `;
                    if (result.coAttainment && result.coAttainment.length > 0) {
                        html += `
 <tr>
<td colspan="6" style="background: #f9fafb; padding: 12px;">
<strong>CO Attainment:</strong>
<div style="margin-top: 6px; display: flex; gap: 8px; flex-wrap: wrap;"> `;
                        (result.coAttainment || []).forEach(co => {
                            const color = co.status === 'Strong' ? 'success' : co.status === 'Moderate' ? 'warning' : 'danger';
                            html += `<span class="badge badge-${color}" style="padding:6px 10px;">${co.co}: ${(co.percentage != null ? Number(co.percentage).toFixed(1) : '0.0')}% - ${co.status}</span>`;
                        });
                        html += `</div></td></tr>`;
                    }
                }

                html += '</tbody></table>';
                resultsDiv.innerHTML = html;
            } catch (error) {
                resultsDiv.innerHTML = '<div class="alert alert-danger">Error loading results: ' + error.message + '<br><small>Check that your enrollment number is correctly registered.</small></div>';
            }
        }

        function showStudentSection(section, btn) {
            document.querySelectorAll('#studentDashboard .section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('#studentDashboard .nav-btn').forEach(b => b.classList.remove('active'));
            const el = document.getElementById(`studentSection${section.charAt(0).toUpperCase() + section.slice(1)}`);
            if (el) el.classList.add('active');
            if (btn) btn.classList.add('active');
            if (section === 'questions') loadStudentAssignedQuestions();
        }

        async function loadStudentAssignedQuestions() {
            const container = document.getElementById('studentAssignedQuestions');
            if (!container) return;
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

            try {
                const studentsSnap = await window.getDocs(window.query(window.collection(window.db, 'students'),
                    window.where('enrollment', '==', window.currentUser.enrollment)));
                if (studentsSnap.empty) {
                    container.innerHTML = '<div class="alert alert-warning">No student record found.</div>';
                    return;
                }
                const studentId = studentsSnap.docs[0].id;
                const assignSnap = await window.getDocs(window.query(window.collection(window.db, 'ca_question_assignments'),
                    window.where('studentId', '==', studentId)));

                if (assignSnap.empty) {
                    container.innerHTML = '<div style="text-align:center;padding:40px;color:#9ca3af;">No question assignments found yet. Assignments are created when the coordinator creates a CA exam.</div>';
                    return;
                }

                let html = '';

                const asnList = assignSnap.docs.map(d => d.data());
                const examDocs = await Promise.all(asnList.map(asn => window.getDoc(window.doc(window.db, 'exams', asn.examId))));
                const subjectDocs = await Promise.all(examDocs.map(ed => ed.exists() ? window.getDoc(window.doc(window.db, 'subjects', ed.data().subjectId)) : Promise.resolve(null)));
                for (let _i = 0; _i < asnList.length; _i++) {
                    const asn = asnList[_i];
                    const examDoc = examDocs[_i];
                    if (!examDoc.exists()) continue;
                    const exam = examDoc.data();
                    const subjectDoc = subjectDocs[_i];
                    const subject = subjectDoc && subjectDoc.exists() ? subjectDoc.data() : {};

                    html += `
 <div style="background:#f9fafb;border:2px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:16px;">
<div style="font-weight:700;font-size:16px;color:#1d4ed8;margin-bottom:4px;"> ${exam.name}</div>
<div style="font-size:13px;color:#6b7280;margin-bottom:12px;">${subject.code || ''} - ${subject.name || 'N/A'}</div> `;

                    const assignments = asn.assignments || {};
                    exam.courseOutcomes?.forEach((co, ci) => {
                        const coKey = `CO${ci + 1}`;
                        const qs = assignments[coKey] || [];
                        html += `
 <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
<div style="font-weight:600;color:#1e40af;margin-bottom:4px;">${co.name} - ${co.description || ''}</div> ${qs.length > 0 ? qs.map((q, qi) => `
 <div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid #dbeafe;">
<span style="background:#1d4ed8;color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">${qi + 1}</span>
<span style="font-size:14px;color:#1f2937;">${q}</span>
</div> `).join('') : '<div style="font-size:13px;color:#9ca3af;font-style:italic;">No questions assigned for this CO</div>'}
</div> `;
                    });

                    html += `</div>`;
                }

                container.innerHTML = html || '<div class="alert alert-info">No assignments yet.</div>';
            } catch (err) {
                container.innerHTML = '<div class="alert alert-danger">Error: ' + err.message + '</div>';
            }
        }
        function calculateGrade(percentage) {
            if (percentage >= 90) return 'A+';
            if (percentage >= 80) return 'A';
            if (percentage >= 70) return 'B+';
            if (percentage >= 60) return 'B';
            if (percentage >= 50) return 'C';
            if (percentage >= 40) return 'D';
            return 'F';
        }
        function calculateCOStatus(percentage) {
            if (percentage >= 70) return 'Strong';
            if (percentage >= 50) return 'Moderate';
            return 'Weak';
        }
        async function addClass() {
            if (!window.currentUser) { showToast('Session expired. Please log in again.', 'danger'); return; }
            const name = document.getElementById('className').value.trim();
            const code = document.getElementById('classCode').value.trim().toUpperCase();
            const year = document.getElementById('academicYear').value;
            const semester = document.getElementById('semester').value;

            if (!name || !code) {
                showToast('Please fill in all fields', "danger");
                return;
            }

            try {
                const duplicateCheck = await window.getDocs(window.query(window.collection(window.db, 'classes'),
                    window.where('code', '==', code),
                    window.where('academicYear', '==', year),
                    window.where('semester', '==', semester)));

                if (!duplicateCheck.empty) {
                    showToast('This class already exists for this academic session!', "danger");
                    return;
                }

                await window.addDoc(window.collection(window.db, 'classes'), {
                    name,
                    code,
                    academicYear: year,
                    semester,
                    createdBy: window.currentUser.uid,
                    createdAt: new Date().toISOString(),
                    isDeleted: false
                });
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'ADD_CLASS',
                    className: name,
                    classCode: code,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    timestamp: new Date().toISOString(),
                    academicYear: year,
                    semester: semester
                });

                showToast('Class added successfully!', "success");
                document.getElementById('className').value = '';
                document.getElementById('classCode').value = '';
                loadClassesList();
                loadClassesDropdown();
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }
        async function addDivision() {
            if (!window.currentUser) { showToast('Session expired. Please log in again.', 'danger'); return; }
            const classId = document.getElementById('divisionClass').value;
            const divisionName = document.getElementById('divisionName').value.trim().toUpperCase();
            const teacherEmail = document.getElementById('classTeacherEmail').value.trim();

            if (!classId || !divisionName) {
                showToast('Please fill in required fields', "danger");
                return;
            }

            try {
                const classDoc = await window.getDoc(window.doc(window.db, 'classes', classId));
                const classData = classDoc.data();
                const duplicateCheck = await window.getDocs(window.query(window.collection(window.db, 'divisions'),
                    window.where('classId', '==', classId),
                    window.where('name', '==', divisionName)));

                if (!duplicateCheck.empty) {
                    showToast('This division already exists for this class!', "danger");
                    return;
                }

                await window.addDoc(window.collection(window.db, 'divisions'), {
                    classId,
                    className: classData.name,
                    classCode: classData.code,
                    name: divisionName,
                    classTeacher: teacherEmail || null,
                    academicYear: classData.academicYear,
                    semester: classData.semester,
                    createdBy: window.currentUser.uid,
                    createdAt: new Date().toISOString(),
                    isDeleted: false
                });
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'ADD_DIVISION',
                    className: classData.name,
                    divisionName: divisionName,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    timestamp: new Date().toISOString(),
                    academicYear: classData.academicYear,
                    semester: classData.semester
                });

                showToast('Division added successfully!', "success");
                document.getElementById('divisionName').value = '';
                document.getElementById('classTeacherEmail').value = '';
                loadClassesList();
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }
        async function loadClassesDropdown() {
            const select = document.getElementById('divisionClass');
            if (!select) return;

            select.innerHTML = '<option value="">Select class</option>';

            try {
                const year = document.getElementById('academicYear').value;
                const semester = document.getElementById('semester').value;
                const snapshot = await window.getDocs(window.query(window.collection(window.db, 'classes'),
                    window.where('academicYear', '==', year),
                    window.where('semester', '==', semester)));

                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    if (!data.isDeleted) {
                        const option = document.createElement('option');
                        option.value = docSnap.id;
                        option.textContent = `${data.code} - ${data.name}`;
                        select.appendChild(option);
                    }
                });
            } catch (error) { }
        }
        async function loadClassesList() {
            const container = document.getElementById('classesList');
            if (!container) return;

            container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading classes...</div>';

            try {
                const year = document.getElementById('academicYear').value;
                const semester = document.getElementById('semester').value;
                const classesSnap = await window.getDocs(window.query(window.collection(window.db, 'classes'),
                    window.where('academicYear', '==', year),
                    window.where('semester', '==', semester)));

                if (classesSnap.empty) {
                    container.innerHTML = '<p style="color: #6b7280;">No classes created yet</p>';
                    return;
                }

                let html = '';

                for (const classDoc of classesSnap.docs) {
                    const classData = classDoc.data();
                    if (classData.isDeleted) continue;
                    const divisionsSnap = await window.getDocs(window.query(window.collection(window.db, 'divisions'),
                        window.where('classId', '==', classDoc.id)));
                    const studentsSnap = await window.getDocs(window.query(window.collection(window.db, 'students'),
                        window.where('class', '==', classData.code)));

                    html += `
 <div class="card" style="background: #f9fafb; margin-bottom: 16px;">
<h4 style="color: var(--primary); margin-bottom: 12px;"> ${classData.code} - ${classData.name}
 <span class="badge badge-info" style="margin-left: 8px;">${studentsSnap.size} students</span>
</h4>
<div style="margin-top: 12px;">
<strong>Divisions:</strong> `;

                    if (divisionsSnap.empty) {
                        html += '<p style="color: #6b7280; margin-left: 16px;">No divisions added yet</p>';
                    } else {
                        html += '<table style="margin-top: 8px;"><thead><tr><th>Division</th><th>Class Teacher</th><th>Students</th></tr></thead><tbody>';

                        for (const divDoc of divisionsSnap.docs) {
                            const divData = divDoc.data();
                            if (divData.isDeleted) continue;

                            const divStudents = await window.getDocs(window.query(window.collection(window.db, 'students'),
                                window.where('class', '==', classData.code),
                                window.where('division', '==', divData.name)));

                            html += `
 <tr>
<td><strong>${divData.name}</strong></td>
<td>${divData.classTeacher || '-'}</td>
<td><span class="badge badge-success">${divStudents.size}</span></td>
</tr> `;
                        }

                        html += '</tbody></table>';
                    }

                    html += `
</div>
</div> `;
                }

                container.innerHTML = html;
            } catch (error) {
                container.innerHTML = '<p style="color: #ef4444;">Error loading classes</p>';
            }
        }
        async function exportClassesExcel() {
            try {
                const year = document.getElementById('academicYear').value;
                const semester = document.getElementById('semester').value;
                const classesSnap = await window.getDocs(window.query(window.collection(window.db, 'classes'),
                    window.where('academicYear', '==', year),
                    window.where('semester', '==', semester)));

                if (classesSnap.empty) {
                    showToast('No classes to export', "warning");
                    return;
                }

                const data = [];

                for (const classDoc of classesSnap.docs) {
                    const classData = classDoc.data();
                    if (classData.isDeleted) continue;

                    const divisionsSnap = await window.getDocs(window.query(window.collection(window.db, 'divisions'),
                        window.where('classId', '==', classDoc.id)));

                    if (divisionsSnap.empty) {
                        data.push({
                            'Class Code': classData.code,
                            'Class Name': classData.name,
                            'Division': '-',
                            'Class Teacher': '-',
                            'Students Count': 0,
                            'Academic Year': classData.academicYear,
                            'Semester': classData.semester
                        });
                    } else {
                        for (const divDoc of divisionsSnap.docs) {
                            const divData = divDoc.data();
                            if (divData.isDeleted) continue;

                            const studentsSnap = await window.getDocs(window.query(window.collection(window.db, 'students'),
                                window.where('class', '==', classData.code),
                                window.where('division', '==', divData.name)));

                            data.push({
                                'Class Code': classData.code,
                                'Class Name': classData.name,
                                'Division': divData.name,
                                'Class Teacher': divData.classTeacher || '-',
                                'Students Count': studentsSnap.size,
                                'Academic Year': classData.academicYear,
                                'Semester': classData.semester
                            });
                        }
                    }
                }

                exportToExcel(data, `classes_${year}_${semester}_${Date.now()}`, 'Classes');
            } catch (error) {
                showToast('Error exporting classes: ' + error.message, 'danger');
            }
        }

        function downloadCSV(filename, csvContent) {

            console.warn('downloadCSV is deprecated. Please use exportToExcel()');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        function escapeCSV(field) {
            if (field === null || field === undefined) return '';
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        }
        async function deleteUserFromManage(userId, email) {
            if (!confirm('Permanently delete user ' + email + '? This cannot be undone.')) return;
            try {
                await window.deleteDoc(window.doc(window.db, 'users', userId));
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'DELETE_USER',
                    userEmail: email,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    timestamp: new Date().toISOString()
                });
                showToast('User ' + email + ' deleted.', 'success');
                loadAllUsers();
                loadHODData();
            } catch (error) {
                showToast('Error deleting user: ' + error.message, 'danger');
            }
        }
        async function downloadBlankTemplate() {
            const examId = document.getElementById('importExamSelect').value;

            if (!examId) {
                showToast('Please select an exam first', "danger");
                return;
            }

            try {
                const examDoc = await window.getDoc(window.doc(window.db, 'exams', examId));
                if (!examDoc.exists()) {
                    showToast('Exam not found', "danger");
                    return;
                }

                const examData = examDoc.data();
                const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', examData.subjectId));
                const subjectData = subjectDoc.exists() ? subjectDoc.data() : {};
                const studentsSnap = await window.getDocs(window.query(window.collection(window.db, 'students'),
                    window.where('class', '==', subjectData.class),
                    window.where('division', '==', subjectData.division)));

                if (studentsSnap.empty) {
                    showToast('No students found for this exam', "warning");
                    return;
                }
                let csv = 'Enrollment,Name';

                if (examData.examType === 'standard') {
                    examData.criteria.forEach(criterion => {
                        csv += `,${escapeCSV(criterion.name)} (Max: ${criterion.maxMarks})`;
                    });
                } else if (examData.examType === 'ca') {
                    examData.courseOutcomes.forEach(co => {
                        co.criteria.forEach(criterion => {
                            csv += `,${co.name}-${criterion.name} (Max: ${criterion.maxMarks})`;
                        });
                    });
                }
                csv += '\n';
                studentsSnap.forEach(docSnap => {
                    const student = docSnap.data();
                    csv += `${student.enrollment},${escapeCSV(student.name)}`;
                    if (examData.examType === 'standard') {
                        examData.criteria.forEach(() => csv += ',');
                    } else if (examData.examType === 'ca') {
                        examData.courseOutcomes.forEach(co => {
                            co.criteria.forEach(() => csv += ',');
                        });
                    }
                    csv += '\n';
                });

                (function () { const _wb = XLSX.utils.book_new(); const _rows = csv.trim().split('\n').map(r => r.split(',')); XLSX.utils.book_append_sheet(_wb, XLSX.utils.aoa_to_sheet(_rows), 'Data'); XLSX.writeFile(_wb, `template_${examData.name}_${Date.now()}.xlsx`); })();
                showToast('Blank template downloaded!\n\nFill in the marks and upload to import.', "success");
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }
        async function downloadCoordBlankTemplate() {
            const examId = document.getElementById('coordImportExamSelect').value;

            if (!examId) {
                showToast('Please select an exam first', "danger");
                return;
            }

            try {
                const examDoc = await window.getDoc(window.doc(window.db, 'exams', examId));
                if (!examDoc.exists()) {
                    showToast('Exam not found', "danger");
                    return;
                }

                const examData = examDoc.data();
                const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', examData.subjectId));
                const subjectData = subjectDoc.exists() ? subjectDoc.data() : {};

                const studentsSnap = await window.getDocs(window.query(window.collection(window.db, 'students'),
                    window.where('class', '==', subjectData.class),
                    window.where('division', '==', subjectData.division)));

                if (studentsSnap.empty) {
                    showToast('No students found for this exam', "warning");
                    return;
                }

                let csv = 'Enrollment,Name';

                if (examData.examType === 'standard') {
                    examData.criteria.forEach(criterion => {
                        csv += `,${escapeCSV(criterion.name)} (Max: ${criterion.maxMarks})`;
                    });
                } else if (examData.examType === 'ca') {
                    examData.courseOutcomes.forEach(co => {
                        co.criteria.forEach(criterion => {
                            csv += `,${co.name}-${criterion.name} (Max: ${criterion.maxMarks})`;
                        });
                    });
                }
                csv += '\n';

                studentsSnap.forEach(docSnap => {
                    const student = docSnap.data();
                    csv += `${student.enrollment},${escapeCSV(student.name)}`;

                    if (examData.examType === 'standard') {
                        examData.criteria.forEach(() => csv += ',');
                    } else if (examData.examType === 'ca') {
                        examData.courseOutcomes.forEach(co => {
                            co.criteria.forEach(() => csv += ',');
                        });
                    }
                    csv += '\n';
                });

                (function () { const _wb = XLSX.utils.book_new(); const _rows = csv.trim().split('\n').map(r => r.split(',')); XLSX.utils.book_append_sheet(_wb, XLSX.utils.aoa_to_sheet(_rows), 'Data'); XLSX.writeFile(_wb, `template_${examData.name}_${Date.now()}.xlsx`); })();
                showToast('Blank template downloaded!\n\nFill in the marks and upload to import.', "success");
            } catch (error) {
                showToast('Error: ' + error.message, 'danger');
            }
        }
        async function loadCoordinatorsDropdown() {
            const select = document.getElementById('coordEmail');
            if (!select) return;

            try {
                const snapshot = await window.getDocs(window.query(
                    window.collection(window.db, 'users'),
                    window.where('role', '==', 'coordinator'),
                    window.where('approved', '==', true)
                ));

                select.innerHTML = '<option value="">Select Coordinator</option>';
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const option = document.createElement('option');
                    option.value = data.email;
                    option.textContent = `${data.name} (${data.email}) - ${data.department || 'No Dept'}`;
                    select.appendChild(option);
                });
            } catch (error) { /* silent */ }
        }
        async function loadTeachersDropdown() {
            const select = document.getElementById('assignTeacherEmail');
            if (!select) return;

            try {
                const snapshot = await window.getDocs(window.query(
                    window.collection(window.db, 'users'),
                    window.where('role', '==', 'teacher'),
                    window.where('approved', '==', true)
                ));

                select.innerHTML = '<option value="">Select Teacher</option>';
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const option = document.createElement('option');
                    option.value = data.email;
                    option.textContent = `${data.name} (${data.email}) - ${data.department || 'No Dept'}`;
                    select.appendChild(option);
                });
            } catch (error) { /* silent */ }
        }
        function fillCoordinatorEmail() {
            const select = document.getElementById('coordEmail');
            const manual = document.getElementById('coordEmailManual');
            if (select && manual && select.value) {
                manual.value = select.value;
            }
        }

        function fillTeacherEmail() {
            const select = document.getElementById('assignTeacherEmail');
            const manual = document.getElementById('assignTeacherEmailManual');
            if (select && manual && select.value) {
                manual.value = select.value;
            }
        }
        async function loadAllStudentsResults() {
            const coordExamId = document.getElementById('resultsExam')?.value;
            const teacherExamId = document.getElementById('teacherResultsExam')?.value;
            const examId = teacherExamId || coordExamId;
            const container = teacherExamId
                ? document.getElementById('teacherResultsContainer')
                : document.getElementById('resultsTable');
            if (!examId || !container) {
                if (container) container.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">Please select an exam to view results</p>';
                return;
            }

            container.innerHTML = '<div style="padding: 20px; text-align: center;"><div class="spinner"></div>Loading all students...</div>';

            try {
                const examDoc = await window.getDoc(window.doc(window.db, 'exams', examId));
                if (!examDoc.exists()) {
                    container.innerHTML = '<p style="padding: 20px; text-align: center; color: red;">Exam not found</p>';
                    return;
                }
                const examData = examDoc.data();
                const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', examData.subjectId));
                const subjectData = subjectDoc.exists() ? subjectDoc.data() : {};
                if (!subjectData.class) {
                    container.innerHTML = '<div class="alert alert-warning">Subject class/division data is missing. Please check the subject configuration.</div>';
                    return;
                }
                let studentsSnap;
                if (subjectData.division) {
                    studentsSnap = await window.getDocs(window.query(
                        window.collection(window.db, 'students'),
                        window.where('class', '==', subjectData.class),
                        window.where('division', '==', subjectData.division)
                    ));
                } else {
                    studentsSnap = await window.getDocs(window.query(
                        window.collection(window.db, 'students'),
                        window.where('class', '==', subjectData.class)
                    ));
                }
                const resultsSnap = await window.getDocs(window.query(
                    window.collection(window.db, 'results'),
                    window.where('examId', '==', examId)
                ));
                const resultsMap = {};
                resultsSnap.forEach(doc => {
                    const data = doc.data();
                    resultsMap[data.studentId] = data;
                });
                let html = `
 <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
<div>
<strong>Subject:</strong> ${subjectData.name || 'N/A'} | 
 <strong>Class:</strong> ${subjectData.class || 'N/A'}-${subjectData.division || 'N/A'} | 
 <strong>Total Students:</strong> ${studentsSnap.size}
</div>
<button class="btn btn-success btn-sm" onclick="exportAllStudentsResultsCSV('${examId}')">Export All Results to CSV</button>
</div>
<table>
<thead>
<tr>
<th>Sr. No.</th>
<th>Roll No.</th>
<th>Enrollment</th>
<th>Student Name</th>
<th>Email</th>
<th>Phone</th>`;

                if (examData.examType === 'ca') {
                    examData.courseOutcomes.forEach((co, idx) => {
                        html += `<th>${co.name}<br>Average</th>`;
                    });
                    html += `<th>Overall<br>Average</th><th>Status</th>`;
                } else {
                    examData.criteria.forEach(c => {
                        html += `<th>${c.name}<br>(Max: ${c.maxMarks})</th>`;
                    });
                    html += `<th>Total<br>Marks</th><th>Status</th>`;
                }

                html += `</tr></thead><tbody>`;

                let srNo = 1;
                studentsSnap.forEach(studentDoc => {
                    const student = studentDoc.data();
                    const result = resultsMap[studentDoc.id];

                    html += `<tr>
<td>${srNo}</td>
<td>${student.rollNo || '-'}</td>
<td>${student.enrollment}</td>
<td style="font-weight: 500;">${student.name}</td>
<td style="font-size: 12px;">${student.email || '-'}</td>
<td style="font-size: 12px;">${student.phone || '-'}</td>`;

                    if (result) {
                        if (result.absent) {
                            const absCols = examData.examType === 'ca' ? (examData.courseOutcomes?.length || 0) + 1 : (examData.criteria?.length || 0) + 1;
                            html += `<td colspan="${absCols}" style="text-align:center;background:#f3f4f6;color:#6b7280;font-style:italic;">Absent</td>`;
                            html += `<td><span class="badge badge-secondary">ABSENT</span></td>`;
                        } else if (examData.examType === 'ca') {
                            examData.courseOutcomes.forEach((co, coIdx) => {
                                const coAvg = calculateCOAverageForStudent(result, coIdx, examData);
                                html += `<td><strong style="color:#2196f3;">${(coAvg != null ? coAvg.toFixed(2) : '0.00')}</strong></td>`;
                            });
                            html += `<td style="background:#e3f2fd;"><strong style="font-size:16px;color:#1565c0;">${(result.totalMarks != null ? Number(result.totalMarks).toFixed(2) : '0.00')}</strong></td>`;
                            html += `<td><span class="badge badge-${result.status === 'COMPLETE' ? 'success' : 'warning'}">${result.status || 'INCOMPLETE'}</span></td>`;
                        } else {
                            (result.marks || []).forEach(mark => {
                                html += `<td><strong>${mark !== null && mark !== undefined ? mark : '-'}</strong></td>`;
                            });
                            html += `<td style="background:#e8f5e9;"><strong style="font-size:16px;color:#2e7d32;">${(result.totalMarks != null ? Number(result.totalMarks).toFixed(2) : '0.00')}</strong></td>`;
                            html += `<td><span class="badge badge-${result.status === 'COMPLETE' ? 'success' : 'warning'}">${result.status || 'INCOMPLETE'}</span></td>`;
                        }
                    } else {
                        const colspan = examData.examType === 'ca' ? (examData.courseOutcomes?.length || 5) + 2 : (examData.criteria?.length || 0) + 2;
                        html += `<td colspan="${colspan}" style="text-align:center;color:#999;font-style:italic;">Not Evaluated</td>`;
                    }

                    html += `</tr>`;
                    srNo++;
                });

                html += '</tbody></table>';

                if (studentsSnap.empty) {
                    html = `
 <div style="margin-bottom: 15px;">
<button class="btn btn-success btn-sm" onclick="exportAllStudentsResultsCSV('${examId}')">Export All Results to CSV</button>
</div>
<p style="text-align: center; color: #999; padding: 40px;">No students found for this class/division. Please add students first.</p> `;
                }
                container.innerHTML = html;
            } catch (error) {
                container.innerHTML = `
 <div style="padding: 20px;">
<div style="margin-bottom: 15px;">
<button class="btn btn-success btn-sm" onclick="exportAllStudentsResultsCSV('${examId}')">Export All Results to CSV</button>
</div>
<div style="padding: 20px; text-align: center; color: red; background: #fee; border-radius: 8px;">
<h4>Error Loading Results</h4>
<p><strong>${error.message}</strong></p>
<p style="font-size: 12px; color: #666; margin-top: 10px;">Press F12 to open console for details.<br>Common issues: No students added, class/division mismatch, or Firebase connection error.
</p>
</div>
</div> `;
            }
        }
        function calculateCOAverageForStudent(result, coIndex, examData) {
            if (!result.coMarks || examData.examType !== 'ca') return 0;

            let total = 0;
            let count = 0;
            const co = examData.courseOutcomes[coIndex];
            co.criteria.forEach((criterion, caIndex) => {
                const key = `CO${coIndex + 1}_C${caIndex + 1}`;
                if (result.coMarks[key] !== null && result.coMarks[key] !== undefined) {
                    total += result.coMarks[key];
                    count++;
                }
            });

            return count > 0 ? total / count : 0;
        }
        function calculateCAAverageForStudent(result, caIndex, examData) {
            if (!result.coMarks || examData.examType !== 'ca') return 0;

            let total = 0;
            let count = 0;
            examData.courseOutcomes.forEach((co, coIdx) => {
                const key = `CO${coIdx + 1}_C${caIndex + 1}`;
                if (result.coMarks[key] !== null && result.coMarks[key] !== undefined) {
                    total += result.coMarks[key];
                    count++;
                }
            });

            return count > 0 ? total / count : 0;
        }
        async function exportAllStudentsResultsCSV(examId) {
            if (!examId) {
                showToast('Please select an exam first', "warning");
                return;
            }

            try {
                const examDoc = await window.getDoc(window.doc(window.db, 'exams', examId));
                const examData = examDoc.data();
                const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', examData.subjectId));
                const subjectData = subjectDoc.exists() ? subjectDoc.data() : {};

                let studentsSnap;
                if (subjectData.division) {
                    studentsSnap = await window.getDocs(window.query(
                        window.collection(window.db, 'students'),
                        window.where('class', '==', subjectData.class),
                        window.where('division', '==', subjectData.division)
                    ));
                } else {
                    studentsSnap = await window.getDocs(window.query(
                        window.collection(window.db, 'students'),
                        window.where('class', '==', subjectData.class)
                    ));
                }

                const resultsSnap = await window.getDocs(window.query(
                    window.collection(window.db, 'results'),
                    window.where('examId', '==', examId)
                ));

                const resultsMap = {};
                resultsSnap.forEach(doc => {
                    const data = doc.data();
                    resultsMap[data.studentId] = data;
                });
                let csv = 'Sr. No.,Roll No.,Enrollment,Student Name,Email,Phone,';

                if (examData.examType === 'ca') {
                    examData.courseOutcomes.forEach((co, idx) => {
                        csv += `${co.name} Average,`;
                    });
                    csv += 'Overall Average,Status\n';
                } else {
                    examData.criteria.forEach(c => {
                        csv += `${escapeCSV(c.name)} (Max ${c.maxMarks}),`;
                    });
                    csv += 'Total Marks,Status\n';
                }
                let srNo = 1;
                studentsSnap.forEach(studentDoc => {
                    const student = studentDoc.data();
                    const result = resultsMap[studentDoc.id];

                    csv += `${srNo},${student.rollNo || ''},${student.enrollment},${escapeCSV(student.name)},${student.email || ''},${student.phone || ''},`;

                    if (result) {
                        if (result.absent) {
                            const blanks = examData.examType === 'ca' ? (examData.courseOutcomes?.length || 0) + 1 : (examData.criteria?.length || 0) + 1;
                            csv += ','.repeat(blanks) + 'ABSENT';
                        } else if (examData.examType === 'ca') {
                            (examData.courseOutcomes || []).forEach((co, coIdx) => {
                                const coAvg = calculateCOAverageForStudent(result, coIdx, examData);
                                csv += `${(coAvg != null ? coAvg.toFixed(2) : '0.00')},`;
                            });
                            csv += `${(result.totalMarks != null ? Number(result.totalMarks).toFixed(2) : '0.00')},${result.status}`;
                        } else {
                            (result.marks || []).forEach(mark => {
                                csv += `${mark !== null && mark !== undefined ? mark : ''},`;
                            });
                            csv += `${(result.totalMarks != null ? Number(result.totalMarks).toFixed(2) : '0.00')},${result.status}`;
                        }
                    } else {
                        const blanks = examData.examType === 'ca' ? (examData.courseOutcomes?.length || 0) + 1 : (examData.criteria?.length || 0) + 1;
                        csv += ','.repeat(blanks) + 'Not Evaluated';
                    }

                    csv += '\n';
                    srNo++;
                });

                (function () { const _wb = XLSX.utils.book_new(); const _rows = csv.trim().split('\n').map(r => r.split(',')); XLSX.utils.book_append_sheet(_wb, XLSX.utils.aoa_to_sheet(_rows), 'Data'); XLSX.writeFile(_wb, `results_${examData.name}_all_students_${Date.now()}.xlsx`); })();
                showToast('All students results exported successfully!', 'success');
            } catch (error) {
                showToast('Error exporting: ' + error.message, 'danger');
            }
        }

        function getGradeBadgeColor(grade) {
            if (grade === 'A' || grade === 'A+') return 'success';
            if (grade === 'B' || grade === 'B+') return 'info';
            if (grade === 'C') return 'warning';
            return 'danger';
        }

        // TEACHER ACCOUNT MANAGEMENT

        let _teacherAccountCache = []; // { id, name, email, isActive, examRestricted, dept }

        async function loadTeacherAccountList() {
            const hodDiv = document.getElementById('hodTeacherAccountList');
            const ccDiv = document.getElementById('coordTeacherAccountList');
            const loading = '<p style="color:var(--gray-400);padding:16px 0;text-align:center;">Loading...</p>';
            if (hodDiv) hodDiv.innerHTML = loading;
            if (ccDiv) ccDiv.innerHTML = loading;
            try {
                const userDept = window.currentUser?.department || window.currentUser?.departmentId;
                let teacherQuery = window.query(window.collection(window.db, 'users'), window.where('role', '==', 'teacher'));
                if (userDept) {
                    teacherQuery = window.query(window.collection(window.db, 'users'),
                        window.where('role', '==', 'teacher'),
                        window.where('department', '==', userDept));
                }
                const snap = await window.getDocs(teacherQuery);
                _teacherAccountCache = [];
                snap.forEach(d => {
                    const data = d.data();
                    _teacherAccountCache.push({
                        id: d.id,
                        name: data.name || 'Unknown',
                        email: data.email || '',
                        dept: data.department || '',
                        isActive: data.isActive !== false,
                        examRestricted: data.examRestricted === true,
                        approvalStatus: data.approvalStatus || 'pending'
                    });
                });
                _teacherAccountCache.sort((a, b) => a.name.localeCompare(b.name));
                renderTeacherAccountList('');
            } catch (e) {
                const err = '<p style="color:#dc2626;padding:12px;">Error loading teachers: ' + e.message + '</p>';
                if (hodDiv) hodDiv.innerHTML = err;
                if (ccDiv) ccDiv.innerHTML = err;
            }
        }

        function renderTeacherAccountList(filter) {
            const hodDiv = document.getElementById('hodTeacherAccountList');
            const ccDiv = document.getElementById('coordTeacherAccountList');
            const q = (filter || '').toLowerCase().trim();
            const list = q
                ? _teacherAccountCache.filter(t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.dept.toLowerCase().includes(q))
                : _teacherAccountCache;

            if (list.length === 0) {
                const empty = q
                    ? '<p style="color:var(--gray-400);padding:16px 0;text-align:center;">No teachers match "' + filter + '"</p>'
                    : '<p style="color:var(--gray-400);padding:16px 0;text-align:center;">No teacher accounts found.</p>';
                if (hodDiv) hodDiv.innerHTML = empty;
                if (ccDiv) ccDiv.innerHTML = empty;
                return;
            }

            let on = 0, off = 0, restricted = 0;
            list.forEach(t => { if (t.isActive) on++; else off++; if (t.examRestricted) restricted++; });

            const summary = `<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:#6b7280;margin-bottom:12px;padding:8px 12px;background:#f9fafb;border-radius:6px;">
 <span><strong style="color:#16a34a;">${on}</strong> Active</span>
 <span><strong style="color:#dc2626;">${off}</strong> Disabled</span>
 <span><strong style="color:#f59e0b;">${restricted}</strong> Exam-Restricted</span>
 <span style="color:#d1d5db;">|</span>
 <span><strong>${list.length}</strong> Total</span>
 </div>`;

            const cards = list.map(t => {
                const active = t.isActive;
                const examR = t.examRestricted;
                const statusBadge = active
                    ? '<span class="account-status-on">ON</span>'
                    : '<span class="account-status-off">OFF</span>';
                const examBadge = examR
                    ? '<span style="background:#f59e0b;color:#fff;font-size:10px;padding:2px 6px;border-radius:8px;font-weight:700;margin-left:4px;">EXAM RESTRICTED</span>'
                    : '';
                return `<div class="teacher-account-card${active ? '' : ' disabled'}">
 <div class="teacher-account-info">
 <strong>${t.name}</strong>
 <span>${t.email}${t.dept ? ' &bull; ' + t.dept : ''}</span>
 </div>
 <div class="teacher-account-actions">
 ${statusBadge}${examBadge}
 <button class="btn btn-sm ${active ? 'btn-off' : 'btn-on'}" onclick="toggleTeacherAccount('${t.id}','${t.email}',${active})">${active ? 'Disable' : 'Enable'}</button>
 </div>
 </div>`;
            }).join('');

            const html = summary + cards;
            if (hodDiv) hodDiv.innerHTML = html;
            if (ccDiv) ccDiv.innerHTML = html;
        }

        function filterTeacherAccountList(context) {
            const inputId = context === 'hod' ? 'hodTeacherSearchInput' : 'coordTeacherSearchInput';
            const val = document.getElementById(inputId)?.value || '';
            renderTeacherAccountList(val);
        }

        async function toggleTeacherAccount(userId, email, currentlyActive) {
            const newState = !currentlyActive;
            try {
                await window.updateDoc(window.doc(window.db, 'users', userId), {
                    isActive: newState,
                    accountToggledBy: window.currentUser.uid,
                    accountToggledByName: window.currentUser.name,
                    accountToggledAt: new Date().toISOString()
                });
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: newState ? 'TEACHER_ACCOUNT_ENABLED' : 'TEACHER_ACCOUNT_DISABLED',
                    targetEmail: email,
                    targetUserId: userId,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    performedByRole: window.currentUser.role,
                    timestamp: new Date().toISOString()
                });
                // Update local cache instantly -- no round trip
                const cached = _teacherAccountCache.find(t => t.id === userId);
                if (cached) cached.isActive = newState;
                const searchHod = document.getElementById('hodTeacherSearchInput')?.value || '';
                const searchCoord = document.getElementById('coordTeacherSearchInput')?.value || '';
                renderTeacherAccountList(searchHod || searchCoord);
                // Refresh allUsersList if visible
                if (document.getElementById('allUsersList')?.closest('.section.active')) loadAllUsers();
                // Refresh teacher assignments table if visible
                if (document.getElementById('teacherAssignmentsList')?.closest('.section.active')) loadTeacherAssignments();
                showToast(`${email} account ${newState ? 'enabled' : 'disabled'}.`, newState ? 'success' : 'warning');
            } catch (e) {
                showToast('Error updating account: ' + e.message, 'danger');
            }
        }

        async function setAllTeacherAccounts(makeActive, btn) {
            if (_teacherAccountCache.length === 0) {
                if (btn) { btn.disabled = true; btn.textContent = 'Loading...'; }
                await loadTeacherAccountList();
                if (btn) { btn.disabled = false; btn.textContent = makeActive ? 'All Teachers ON' : 'All Teachers OFF'; }
            }
            const label = makeActive ? 'enable ALL teacher accounts' : 'disable ALL teacher accounts';
            if (!confirm(`Are you sure you want to ${label}? This affects ${_teacherAccountCache.length} teacher(s).`)) return;
            if (btn) { btn.disabled = true; btn.textContent = 'Updating...'; }
            try {
                const updates = _teacherAccountCache.map(t =>
                    window.updateDoc(window.doc(window.db, 'users', t.id), {
                        isActive: makeActive,
                        accountToggledBy: window.currentUser.uid,
                        accountToggledByName: window.currentUser.name,
                        accountToggledAt: new Date().toISOString()
                    })
                );
                await Promise.all(updates);
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: makeActive ? 'ALL_TEACHERS_ENABLED' : 'ALL_TEACHERS_DISABLED',
                    count: _teacherAccountCache.length,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    performedByRole: window.currentUser.role,
                    timestamp: new Date().toISOString()
                });
                _teacherAccountCache.forEach(t => { t.isActive = makeActive; });
                renderTeacherAccountList('');
                if (document.getElementById('allUsersList')?.closest('.section.active')) loadAllUsers();
                if (document.getElementById('teacherAssignmentsList')?.closest('.section.active')) loadTeacherAssignments();
                showToast(`All ${_teacherAccountCache.length} teacher accounts ${makeActive ? 'enabled' : 'disabled'}.`, makeActive ? 'success' : 'warning');
            } catch (e) {
                showToast('Error: ' + e.message, 'danger');
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = makeActive ? 'All Teachers ON' : 'All Teachers OFF'; }
            }
        }

        async function setExamPeriodMode(restrict, btn) {
            if (_teacherAccountCache.length === 0) {
                if (btn) { btn.disabled = true; btn.textContent = 'Loading...'; }
                await loadTeacherAccountList();
                if (btn) { btn.disabled = false; }
            }
            const label = restrict ? 'restrict all teachers for exam period' : 'release exam period restriction';
            if (!confirm(`Are you sure you want to ${label}?`)) return;
            if (btn) { btn.disabled = true; btn.textContent = 'Updating...'; }
            try {
                const updates = _teacherAccountCache.map(t =>
                    window.updateDoc(window.doc(window.db, 'users', t.id), {
                        examRestricted: restrict,
                        isActive: restrict ? false : (t.examRestricted ? true : t.isActive),
                        accountToggledBy: window.currentUser.uid,
                        accountToggledByName: window.currentUser.name,
                        accountToggledAt: new Date().toISOString()
                    })
                );
                await Promise.all(updates);
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: restrict ? 'EXAM_PERIOD_RESTRICT' : 'EXAM_PERIOD_RELEASE',
                    count: _teacherAccountCache.length,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    performedByRole: window.currentUser.role,
                    timestamp: new Date().toISOString()
                });
                _teacherAccountCache.forEach(t => {
                    if (restrict) {
                        t.isActive = false;
                        t.examRestricted = true;
                    } else {
                        // Only restore teachers that were exam-restricted; leave manually-disabled ones disabled
                        if (t.examRestricted) t.isActive = true;
                        t.examRestricted = false;
                    }
                });
                renderTeacherAccountList('');
                if (document.getElementById('allUsersList')?.closest('.section.active')) loadAllUsers();
                showToast(`Exam period mode ${restrict ? 'activated -- all teachers restricted.' : 'released -- all teachers re-enabled.'}`, restrict ? 'warning' : 'success');
            } catch (e) {
                showToast('Error: ' + e.message, 'danger');
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = restrict ? 'Exam Period: Restrict All' : 'Exam Period: Release All'; }
            }
        }

        async function removeTeacherAssignment(assignmentId, teacherEmail) {
            if (!confirm(`Remove ${teacherEmail} from this subject assignment?`)) return;
            try {
                await window.deleteDoc(window.doc(window.db, 'teacher_assignments', assignmentId));
                await window.addDoc(window.collection(window.db, 'audit_logs'), {
                    action: 'REMOVE_TEACHER_ASSIGNMENT',
                    teacherEmail,
                    assignmentId,
                    performedBy: window.currentUser.uid,
                    performedByName: window.currentUser.name,
                    timestamp: new Date().toISOString()
                });
                showToast('Teacher assignment removed.', 'success');
                loadTeacherAssignments();
                loadTeachersDropdown();
            } catch (e) {
                showToast('Error: ' + e.message, 'danger');
            }
        }

        function showToast(message, type, duration) {
            type = type || 'info';
            duration = (duration === undefined) ? 4000 : duration;
            var container = document.getElementById('toast-container');
            if (!container) return;
            var toast = document.createElement('div');
            toast.className = 'toast ' + type;
            var icons = { success: '&#10003;', danger: '&#10005;', warning: '&#9888;', info: '&#8505;' };
            toast.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:8px;color:#fff;font-size:14px;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,.2);animation:_toastSlide .25s ease;margin-bottom:6px;';
            var colors = { success: '#16a34a', danger: '#dc2626', warning: '#d97706', info: '#2563eb' };
            toast.style.background = colors[type] || colors.info;
            toast.innerHTML = '<span style="flex-shrink:0;font-size:15px;">' + (icons[type] || '') + '</span>'
                + '<span style="flex:1;line-height:1.4">' + message + '</span>'
                + '<button onclick="this.parentElement.remove()" style="background:none;border:none;color:rgba(255,255,255,.8);cursor:pointer;font-size:18px;line-height:1;padding:0 0 0 8px;flex-shrink:0;">&times;</button>';
            container.appendChild(toast);
            setTimeout(function () {
                if (toast.parentElement) {
                    toast.style.transition = 'opacity .3s,transform .3s';
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateX(20px)';
                    setTimeout(function () { if (toast.parentElement) toast.remove(); }, 320);
                }
            }, duration);
        }

        // ========================================
        // RESULTS VIEWING & EXPORT FUNCTIONS
        // ========================================

        function showLoader(loaderId) {
            const loader = document.getElementById(loaderId);
            if (loader) loader.style.display = 'flex';
        }

        function hideLoader(loaderId) {
            const loader = document.getElementById(loaderId);
            if (loader) loader.style.display = 'none';
        }

        // HOD: Load Results
        async function loadResultsForHOD() {
            if (!window.currentUser || window.currentUser.role !== 'hod') {
                console.error('Unauthorized: Not HOD');
                return;
            }
            try {
                showLoader('resultsLoader');
                const resultsContainer = document.getElementById('hodResultsContainer');
                if (!resultsContainer) {
                    hideLoader('resultsLoader');
                    return;
                }
                resultsContainer.innerHTML = '';

                const hodDept = window.currentUser.department || window.currentUser.departmentId;
                if (!hodDept) {
                    showToast('Department not assigned to HOD', 'danger');
                    hideLoader('resultsLoader');
                    return;
                }

                const examsQuery = (function () {
                    const yr = document.getElementById('academicYear')?.value || '';
                    const sm = document.getElementById('semester')?.value || '';
                    if (yr && sm) return window.query(window.collection(window.db, 'exams'), window.where('academicYear', '==', yr), window.where('semester', '==', sm), window.where('status', '==', 'FINALIZED'), window.orderBy('createdAt', 'desc'));
                    return window.query(window.collection(window.db, 'exams'), window.where('status', '==', 'FINALIZED'), window.orderBy('createdAt', 'desc'));
                })();
                const examsSnapshot = await window.getDocs(examsQuery)

                if (examsSnapshot.empty) {
                    resultsContainer.innerHTML = '<p class="no-data">No finalized results available in your department.</p>';
                    hideLoader('resultsLoader');
                    return;
                }

                const table = document.createElement('table');
                table.className = 'results-table';
                table.innerHTML = `
 <thead>
 <tr>
 <th>Exam Name</th>
 <th>Subject</th>
 <th>Class</th>
 <th>Division</th>
 <th>Type</th>
 <th>Students</th>
 <th>Finalized</th>
 <th>Actions</th>
 </tr>
 </thead>
 <tbody id="hodResultsTableBody"></tbody>
 `;
                resultsContainer.appendChild(table);

                const tbody = document.getElementById('hodResultsTableBody');
                for (const examDoc of examsSnapshot.docs) {
                    const examData = examDoc.data();
                    const examId = examDoc.id;

                    const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', examData.subjectId));
                    const subjectName = subjectDoc.exists() ? subjectDoc.data().name : 'Unknown';

                    const _subjectDataForRow = subjectDoc.exists() ? subjectDoc.data() : {};
                    const className = _subjectDataForRow.class || 'N/A';
                    const divisionName = _subjectDataForRow.division || 'N/A';

                    const resultsQuery = window.query(
                        window.collection(window.db, 'results'),
                        window.where('examId', '==', examId)
                    );
                    const resultsSnapshot = await window.getDocs(resultsQuery);

                    // BUG FIX: Handle both string and Timestamp types for finalizedAt
                    let finalizedDate = 'N/A';
                    if (examData.finalizedAt) {
                        try {
                            if (typeof examData.finalizedAt === 'string') {
                                finalizedDate = new Date(examData.finalizedAt).toLocaleString();
                            } else if (examData.finalizedAt.toDate) {
                                finalizedDate = examData.finalizedAt.toDate().toLocaleString();
                            }
                        } catch (e) {
                            finalizedDate = 'Invalid Date';
                        }
                    }

                    const row = document.createElement('tr');
                    row.innerHTML = `
 <td>${examData.name || 'N/A'}</td>
 <td>${subjectName}</td>
 <td>${className}</td>
 <td>${divisionName}</td>
 <td><span class="badge badge-${examData.examType === 'standard' ? 'primary' : 'secondary'}">${examData.examType?.toUpperCase() || 'N/A'}</span></td>
 <td>${resultsSnapshot.size}</td>
 <td>${finalizedDate}</td>
 <td class="action-buttons">
 <button class="btn btn-sm btn-info" onclick="viewResultDetails('${examId}')">👁 View</button>
 <button class="btn btn-sm btn-success" onclick="exportResults('${examId}', 'excel')">📊 Excel</button>
 <button class="btn btn-sm btn-danger" onclick="exportResults('${examId}', 'pdf')">📄 PDF</button>
 </td>
 `;
                    tbody.appendChild(row);
                }
            } catch (error) {
                console.error('Error loading HOD results:', error);
                showToast('Failed to load results: ' + error.message, 'danger');
            } finally {
                hideLoader('resultsLoader');
            }
        }

        // Coordinator: Load Results
        async function loadResultsForCoordinator() {
            if (!window.currentUser || window.currentUser.role !== 'coordinator') {
                console.error('Unauthorized: Not Coordinator');
                return;
            }
            try {
                showLoader('resultsLoader');
                const resultsContainer = document.getElementById('coordinatorResultsContainer');
                if (!resultsContainer) {
                    hideLoader('resultsLoader');
                    return;
                }
                resultsContainer.innerHTML = '';

                // Load all finalized exams for current academic year/semester
                const year = document.getElementById('academicYear')?.value || '';
                const sem = document.getElementById('semester')?.value || '';
                let examsQuery;
                if (year && sem) {
                    examsQuery = window.query(
                        window.collection(window.db, 'exams'),
                        window.where('academicYear', '==', year),
                        window.where('semester', '==', sem),
                        window.where('status', '==', 'FINALIZED'),
                        window.orderBy('createdAt', 'desc')
                    );
                } else {
                    examsQuery = window.query(
                        window.collection(window.db, 'exams'),
                        window.where('status', '==', 'FINALIZED'),
                        window.orderBy('createdAt', 'desc')
                    );
                }
                const examsSnapshot = await window.getDocs(examsQuery);
                let allExams = examsSnapshot.docs;

                if (allExams.length === 0) {
                    resultsContainer.innerHTML = '<p class="no-data">No finalized results available for your subjects.</p>';
                    hideLoader('resultsLoader');
                    return;
                }

                const table = document.createElement('table');
                table.className = 'results-table';
                table.innerHTML = `
 <thead>
 <tr>
 <th>Exam Name</th>
 <th>Subject</th>
 <th>Class</th>
 <th>Division</th>
 <th>Type</th>
 <th>Students</th>
 <th>Finalized</th>
 <th>Actions</th>
 </tr>
 </thead>
 <tbody id="coordinatorResultsTableBody"></tbody>
 `;
                resultsContainer.appendChild(table);

                const tbody = document.getElementById('coordinatorResultsTableBody');
                for (const examDoc of allExams) {
                    const examData = examDoc.data();
                    const examId = examDoc.id;

                    const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', examData.subjectId));
                    const subjectName = subjectDoc.exists() ? subjectDoc.data().name : 'Unknown';

                    const _subjectDataForRow = subjectDoc.exists() ? subjectDoc.data() : {};
                    const className = _subjectDataForRow.class || 'N/A';
                    const divisionName = _subjectDataForRow.division || 'N/A';

                    const resultsQuery = window.query(
                        window.collection(window.db, 'results'),
                        window.where('examId', '==', examId)
                    );
                    const resultsSnapshot = await window.getDocs(resultsQuery);

                    // BUG FIX: Handle both string and Timestamp types for finalizedAt
                    let finalizedDate = 'N/A';
                    if (examData.finalizedAt) {
                        try {
                            if (typeof examData.finalizedAt === 'string') {
                                finalizedDate = new Date(examData.finalizedAt).toLocaleString();
                            } else if (examData.finalizedAt.toDate) {
                                finalizedDate = examData.finalizedAt.toDate().toLocaleString();
                            }
                        } catch (e) {
                            finalizedDate = 'Invalid Date';
                        }
                    }

                    const row = document.createElement('tr');
                    row.innerHTML = `
 <td>${examData.name || 'N/A'}</td>
 <td>${subjectName}</td>
 <td>${className}</td>
 <td>${divisionName}</td>
 <td><span class="badge badge-${examData.examType === 'standard' ? 'primary' : 'secondary'}">${examData.examType?.toUpperCase() || 'N/A'}</span></td>
 <td>${resultsSnapshot.size}</td>
 <td>${finalizedDate}</td>
 <td class="action-buttons">
 <button class="btn btn-sm btn-info" onclick="viewResultDetails('${examId}')">👁 View</button>
 <button class="btn btn-sm btn-success" onclick="exportResults('${examId}', 'excel')">📊 Excel</button>
 <button class="btn btn-sm btn-danger" onclick="exportResults('${examId}', 'pdf')">📄 PDF</button>
 </td>
 `;
                    tbody.appendChild(row);
                }
            } catch (error) {
                console.error('Error loading Coordinator results:', error);
                showToast('Failed to load results: ' + error.message, 'danger');
            } finally {
                hideLoader('resultsLoader');
            }
        }

        // View Result Details
        async function viewResultDetails(examId) {
            try {
                showLoader('detailsLoader');

                const examDoc = await window.getDoc(window.doc(window.db, 'exams', examId));
                if (!examDoc.exists()) throw new Error('Exam not found');

                const examData = examDoc.data();

                const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', examData.subjectId));
                const subjectName = subjectDoc.exists() ? subjectDoc.data().name : 'Unknown';
                const _sd = subjectDoc.exists() ? subjectDoc.data() : {};
                const className = _sd.class || 'N/A';
                const divisionName = _sd.division || 'N/A';

                const resultsQuery = window.query(
                    window.collection(window.db, 'results'),
                    window.where('examId', '==', examId),
                    window.orderBy('studentId')
                );
                const resultsSnapshot = await window.getDocs(resultsQuery);

                // BUG FIX: Handle both string and Timestamp types for finalizedAt
                let finalizedDate = 'N/A';
                if (examData.finalizedAt) {
                    try {
                        if (typeof examData.finalizedAt === 'string') {
                            finalizedDate = new Date(examData.finalizedAt).toLocaleString();
                        } else if (examData.finalizedAt.toDate) {
                            finalizedDate = examData.finalizedAt.toDate().toLocaleString();
                        }
                    } catch (e) {
                        finalizedDate = 'Invalid Date';
                    }
                }

                // BUG FIX: Sanitize text to prevent XSS
                const sanitize = (text) => {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                };

                const detailsHTML = `
 <div class="result-details-modal">
 <div class="modal-content">
 <div class="modal-header">
 <h2>Result Details</h2>
 <button class="close-btn" onclick="closeResultDetails()">&times;</button>
 </div>
 <div class="modal-body">
 <div class="exam-info">
 <h3>${sanitize(examData.name)}</h3>
 <p><strong>Subject:</strong> ${sanitize(subjectName)}</p>
 <p><strong>Class:</strong> ${sanitize(className)} - ${sanitize(divisionName)}</p>
 <p><strong>Type:</strong> ${(examData.examType?.toUpperCase() || 'N/A')}</p>
 <p><strong>Total Marks:</strong> ${examData.totalMarks || 'N/A'}</p>
 <p><strong>Finalized:</strong> ${finalizedDate}</p>
 </div>
 <div class="results-table-container">
 <table class="results-detail-table">
 <thead>
 <tr>
 <th>Roll No</th>
 <th>Student Name</th>
 <th>Marks Obtained</th>
 <th>Total Marks</th>
 <th>Percentage</th>
 <th>Grade</th>
 </tr>
 </thead>
 <tbody id="resultDetailTableBody"></tbody>
 </table>
 </div>
 </div>
 <div class="modal-footer">
 <button class="btn btn-secondary" onclick="closeResultDetails()">Close</button>
 </div>
 </div>
 </div>
 `;

                document.body.insertAdjacentHTML('beforeend', detailsHTML);
                const tbody = document.getElementById('resultDetailTableBody');

                for (const resultDoc of resultsSnapshot.docs) {
                    const resultData = resultDoc.data();

                    const studentDoc = await window.getDoc(window.doc(window.db, 'students', resultData.studentId));
                    const studentData = studentDoc.exists() ? studentDoc.data() : {};

                    const marksObtained = resultData.totalMarks || 0;
                    const totalMarks = examData.totalMarks || 100;
                    const percentage = totalMarks > 0 ? ((marksObtained / totalMarks) * 100).toFixed(2) : '0.00';
                    const grade = calculateGrade(parseFloat(percentage));

                    const row = document.createElement('tr');
                    row.innerHTML = `
 <td>${sanitize(studentData.rollNumber || 'N/A')}</td>
 <td>${sanitize(studentData.name || 'Unknown')}</td>
 <td>${marksObtained}</td>
 <td>${totalMarks}</td>
 <td>${percentage}%</td>
 <td><span class="grade-badge grade-${grade}">${grade}</span></td>
 `;
                    tbody.appendChild(row);
                }

            } catch (error) {
                console.error('Error viewing result details:', error);
                showToast('Failed to load result details: ' + error.message, 'danger');
            } finally {
                hideLoader('detailsLoader');
            }
        }

        function closeResultDetails() {
            const modal = document.querySelector('.result-details-modal');
            if (modal) modal.remove();
        }

        // Export Results
        async function exportResults(examId, format) {
            try {
                showLoader('exportLoader');

                const examDoc = await window.getDoc(window.doc(window.db, 'exams', examId));
                if (!examDoc.exists()) throw new Error('Exam not found');

                const examData = examDoc.data();

                const subjectDoc = await window.getDoc(window.doc(window.db, 'subjects', examData.subjectId));
                const subjectName = subjectDoc.exists() ? subjectDoc.data().name : 'Unknown';
                const _sd = subjectDoc.exists() ? subjectDoc.data() : {};
                const className = _sd.class || 'N/A';
                const divisionName = _sd.division || 'N/A';

                const resultsQuery = window.query(
                    window.collection(window.db, 'results'),
                    window.where('examId', '==', examId),
                    window.orderBy('studentId')
                );
                const resultsSnapshot = await window.getDocs(resultsQuery);

                const resultsData = [];

                for (const resultDoc of resultsSnapshot.docs) {
                    const resultData = resultDoc.data();

                    const studentDoc = await window.getDoc(window.doc(window.db, 'students', resultData.studentId));
                    const studentData = studentDoc.exists() ? studentDoc.data() : {};

                    const marksObtained = resultData.totalMarks || 0;
                    const totalMarks = examData.totalMarks || 100;
                    const percentage = ((marksObtained / totalMarks) * 100).toFixed(2);
                    const grade = calculateGrade(percentage);

                    resultsData.push({
                        rollNumber: studentData.rollNumber || 'N/A',
                        studentName: studentData.name || 'Unknown',
                        email: studentData.email || 'N/A',
                        marksObtained: marksObtained,
                        totalMarks: totalMarks,
                        percentage: percentage,
                        grade: grade
                    });
                }

                if (format === 'excel') {
                    exportResultsToExcel(examData, subjectName, className, divisionName, resultsData);
                } else if (format === 'pdf') {
                    exportToProtectedPDF(examData, subjectName, className, divisionName, resultsData);
                }

                showToast(`Results exported successfully as ${format.toUpperCase()}`, 'success');

            } catch (error) {
                console.error('Error exporting results:', error);
                showToast('Failed to export results: ' + error.message, 'danger');
            } finally {
                hideLoader('exportLoader');
            }
        }

        // Excel Export
        function exportResultsToExcel(examData, subjectName, className, divisionName, resultsData) {
            const headerData = [
                ['Academic Evaluation Report'],
                [''],
                ['Exam Name:', examData.name || 'N/A'],
                ['Subject:', subjectName],
                ['Class:', `${className} - ${divisionName}`],
                ['Exam Type:', examData.examType?.toUpperCase() || 'N/A'],
                ['Total Marks:', examData.totalMarks || 'N/A'],
                ['Finalized Date:', examData.finalizedAt ? new Date(examData.finalizedAt).toLocaleString() : 'N/A'],
                ['Total Students:', resultsData.length],
                [''],
                ['Roll No', 'Student Name', 'Email', 'Marks Obtained', 'Total Marks', 'Percentage (%)', 'Grade']
            ];

            const tableData = resultsData.map(result => [
                result.rollNumber,
                result.studentName,
                result.email,
                result.marksObtained,
                result.totalMarks,
                result.percentage,
                result.grade
            ]);

            const wsData = [...headerData, ...tableData];

            if (resultsData.length > 0) {
                const avgPercentage = (resultsData.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / resultsData.length).toFixed(2);
                const maxPercentage = Math.max(...resultsData.map(r => parseFloat(r.percentage)));
                const minPercentage = Math.min(...resultsData.map(r => parseFloat(r.percentage)));
                const passCount = resultsData.filter(r => parseFloat(r.percentage) >= 40).length;
                const failCount = resultsData.length - passCount;

                wsData.push(
                    [''],
                    ['Statistics'],
                    ['Average Percentage:', `${avgPercentage}%`],
                    ['Highest Percentage:', `${maxPercentage}%`],
                    ['Lowest Percentage:', `${minPercentage}%`],
                    ['Pass Count:', passCount],
                    ['Fail Count:', failCount],
                    ['Pass Rate:', `${((passCount / resultsData.length) * 100).toFixed(2)}%`]
                );
            }

            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = [
                { wch: 10 },
                { wch: 25 },
                { wch: 30 },
                { wch: 15 },
                { wch: 12 },
                { wch: 15 },
                { wch: 8 }
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Results');

            const fileName = `${examData.name}_${className}_${divisionName}_Results_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
        }

        // PDF Export with Password Protection
        async function exportToProtectedPDF(examData, subjectName, className, divisionName, resultsData) {
            const password = prompt('Enter a password to protect this PDF (leave blank for no password):');

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('Academic Evaluation Report', 105, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            let yPos = 35;

            doc.text(`Exam Name: ${examData.name || 'N/A'}`, 15, yPos);
            yPos += 7;
            doc.text(`Subject: ${subjectName}`, 15, yPos);
            yPos += 7;
            doc.text(`Class: ${className} - ${divisionName}`, 15, yPos);
            yPos += 7;
            doc.text(`Exam Type: ${examData.examType?.toUpperCase() || 'N/A'}`, 15, yPos);
            yPos += 7;
            doc.text(`Total Marks: ${examData.totalMarks || 'N/A'}`, 15, yPos);
            yPos += 7;
            doc.text(`Finalized Date: ${examData.finalizedAt ? new Date(examData.finalizedAt).toLocaleString() : 'N/A'}`, 15, yPos);
            yPos += 7;
            doc.text(`Total Students: ${resultsData.length}`, 15, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');

            const headers = ['Roll No', 'Student Name', 'Marks', 'Total', '%', 'Grade'];
            const colWidths = [20, 60, 20, 20, 20, 20];
            let xPos = 15;

            headers.forEach((header, i) => {
                doc.text(header, xPos, yPos);
                xPos += colWidths[i];
            });

            yPos += 7;
            doc.line(15, yPos, 195, yPos);
            yPos += 5;

            doc.setFont(undefined, 'normal');

            for (const result of resultsData) {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }

                xPos = 15;
                const rowData = [
                    result.rollNumber,
                    result.studentName.substring(0, 25),
                    result.marksObtained.toString(),
                    result.totalMarks.toString(),
                    result.percentage,
                    result.grade
                ];

                rowData.forEach((data, i) => {
                    doc.text(data, xPos, yPos);
                    xPos += colWidths[i];
                });

                yPos += 6;
            }

            if (resultsData.length > 0) {
                yPos += 10;

                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setFont(undefined, 'bold');
                doc.text('Statistics', 15, yPos);
                yPos += 7;
                doc.setFont(undefined, 'normal');

                const avgPercentage = (resultsData.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / resultsData.length).toFixed(2);
                const maxPercentage = Math.max(...resultsData.map(r => parseFloat(r.percentage)));
                const minPercentage = Math.min(...resultsData.map(r => parseFloat(r.percentage)));
                const passCount = resultsData.filter(r => parseFloat(r.percentage) >= 40).length;
                const failCount = resultsData.length - passCount;

                doc.text(`Average Percentage: ${avgPercentage}%`, 15, yPos);
                yPos += 6;
                doc.text(`Highest Percentage: ${maxPercentage}%`, 15, yPos);
                yPos += 6;
                doc.text(`Lowest Percentage: ${minPercentage}%`, 15, yPos);
                yPos += 6;
                doc.text(`Pass Count: ${passCount}`, 15, yPos);
                yPos += 6;
                doc.text(`Fail Count: ${failCount}`, 15, yPos);
                yPos += 6;
                doc.text(`Pass Rate: ${((passCount / resultsData.length) * 100).toFixed(2)}%`, 15, yPos);
            }

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 290);
                if (password) {
                    doc.text(`Protected Document - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
                } else {
                    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
                }
                doc.text(`Evaluator System © ${new Date().getFullYear()}`, 195, 290, { align: 'right' });
            }

            if (password && password.trim() !== '') {
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setTextColor(200, 200, 200);
                    doc.setFontSize(40);
                    doc.text('CONFIDENTIAL', 105, 150, {
                        align: 'center',
                        angle: 45
                    });
                }

                alert(`PDF generated with CONFIDENTIAL watermark.\n\nPassword: ${password}\n\nNote: Please use Adobe Acrobat to add password protection for maximum security.`);
            }

            const fileName = `${examData.name}_${className}_${divisionName}_Results_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            if (password && password.trim() !== '') {
                setTimeout(() => {
                    console.log(`To add password protection:
1. Open the PDF in Adobe Acrobat
2. Go to Tools → Protect → Encrypt → Encrypt with Password
3. Set password: ${password}
4. Save the protected PDF`);
                }, 1000);
            }
        }

        // ========================================
        // END RESULTS VIEWING & EXPORT FUNCTIONS
        // ========================================

        // ========================================
        // QUESTION BANK FUNCTIONS
        // ========================================

        /**
         * Add a single question to the question bank
         */
        async function addQuestion() {
            const subjectId = document.getElementById('qbSubjectSelect').value;
            const unit = parseInt(document.getElementById('qbUnit').value);
            const marks = parseInt(document.getElementById('qbMarks').value);
            const difficulty = document.getElementById('qbDifficulty').value;
            const questionText = document.getElementById('qbQuestionText').value.trim();

            const validation = validateForm(
                { subject: subjectId, unit, questionText },
                {
                    subject: { required: true },
                    unit: { required: true, custom: (v) => v >= 1 && v <= 10, customMessage: 'Unit must be between 1 and 10' },
                    questionText: { required: true, minLength: 10 }
                }
            );

            if (!validation.valid) {
                showToast(validation.errors.join(', '), 'danger');
                return;
            }

            try {
                await addDoc(collection(window.db, 'questions'), {
                    subjectId,
                    unit,
                    marks,
                    difficulty,
                    text: questionText,
                    createdAt: new Date().toISOString(),
                    createdBy: window.currentUser.email
                });

                showToast('Question added successfully!', 'success');
                document.getElementById('qbQuestionText').value = '';
                await logAuditEvent('ADD_QUESTION', { subjectId, unit, marks });
                loadQuestions();
            } catch (error) {
                console.error('Error adding question:', error);
                showToast('Failed to add question', 'danger');
            }
        }

        /**
         * Download Question Bank Excel template
         */
        function downloadQuestionBankTemplate() {
            try {
                const headers = ['subjectId', 'unit', 'marks', 'difficulty', 'questionText'];
                const sampleData = [
                    {
                        'subjectId': '(use the Firestore document ID of the subject)',
                        'unit': '1',
                        'marks': '2',
                        'difficulty': 'medium',
                        'questionText': 'Sample question text here'
                    }
                ];

                // Use sample data instead of empty template
                exportToExcel(sampleData, 'question_bank_template', 'Template');
                showToast('Template downloaded with sample data', 'success');
            } catch (error) {
                console.error('Error downloading template:', error);
                showToast('Failed to download template', 'danger');
            }
        }

        /**
         * Import questions from Excel file
         */
        async function importQuestionsFromExcel() {
            const fileInput = document.getElementById('qbImportFile');

            if (!fileInput) {
                console.error('File input element not found');
                showToast('Upload interface not found', 'danger');
                return;
            }

            const file = fileInput.files[0];

            if (!file) {
                showToast('Please select an Excel file', 'warning');
                return;
            }

            // Validate file type
            if (!file.name.match(/\.(xlsx|xls)$/i)) {
                showToast('Please select a valid Excel file (.xlsx or .xls)', 'danger');
                return;
            }

            try {
                await importFromExcel(file, async (data) => {
                    let successCount = 0;
                    let errorCount = 0;
                    const errors = [];

                    for (let i = 0; i < data.length; i++) {
                        const row = data[i];
                        try {
                            // Validate required fields
                            if (!row.subjectId || row.subjectId.toString().trim() === '') {
                                errors.push(`Row ${i + 2}: Missing subjectId`);
                                errorCount++;
                                continue;
                            }
                            if (!row.unit) {
                                errors.push(`Row ${i + 2}: Missing unit`);
                                errorCount++;
                                continue;
                            }
                            if (!row.questionText || row.questionText.toString().trim() === '') {
                                errors.push(`Row ${i + 2}: Missing questionText`);
                                errorCount++;
                                continue;
                            }

                            // Parse and validate unit
                            const unitNum = parseInt(row.unit);
                            if (isNaN(unitNum) || unitNum < 1) {
                                errors.push(`Row ${i + 2}: Invalid unit number`);
                                errorCount++;
                                continue;
                            }

                            // Parse marks with validation
                            const marksNum = parseInt(row.marks || 2);
                            if (isNaN(marksNum) || marksNum < 1) {
                                errors.push(`Row ${i + 2}: Invalid marks value`);
                                errorCount++;
                                continue;
                            }

                            // Validate difficulty
                            const validDifficulties = ['easy', 'medium', 'hard'];
                            const difficulty = (row.difficulty || 'medium').toString().toLowerCase();
                            if (!validDifficulties.includes(difficulty)) {
                                errors.push(`Row ${i + 2}: Invalid difficulty (use: easy, medium, or hard)`);
                                errorCount++;
                                continue;
                            }

                            await addDoc(collection(window.db, 'questions'), {
                                subjectId: row.subjectId.toString().trim(),
                                unit: unitNum,
                                marks: marksNum,
                                difficulty: difficulty,
                                text: row.questionText.toString().trim(),
                                createdAt: new Date().toISOString(),
                                createdBy: window.currentUser.email
                            });
                            successCount++;
                        } catch (error) {
                            console.error(`Error importing question at row ${i + 2}:`, error);
                            errors.push(`Row ${i + 2}: ${error.message}`);
                            errorCount++;
                        }
                    }

                    // Show results
                    if (successCount > 0) {
                        showToast(`Successfully imported ${successCount} question(s). ${errorCount} failed.`, 'success');
                    } else {
                        showToast(`Import failed. ${errorCount} error(s) found.`, 'danger');
                    }

                    // Log detailed errors if any
                    if (errors.length > 0 && errors.length <= 10) {
                        console.warn('Import errors:', errors);
                    }

                    fileInput.value = '';
                    await logAuditEvent('BULK_IMPORT_QUESTIONS', { successCount, errorCount });

                    if (successCount > 0) {
                        loadQuestions();
                    }
                }, true /* suppressSuccessToast - callback shows its own result toast */);
            } catch (error) {
                console.error('Import process error:', error);
                showToast('Failed to import Excel file. Please check the file format.', 'danger');
            }
        }

        /**
         * Load and display questions
         */
        async function loadQuestions() {
            const filterSubject = document.getElementById('qbFilterSubject')?.value || '';
            const filterUnit = document.getElementById('qbFilterUnit')?.value || '';
            const container = document.getElementById('questionsList');

            if (!container) return;

            try {
                let q = collection(window.db, 'questions');
                let constraints = [];

                if (filterSubject) {
                    constraints.push(where('subjectId', '==', filterSubject));
                }
                if (filterUnit) {
                    constraints.push(where('unit', '==', parseInt(filterUnit)));
                }

                const snapshot = await getDocs(query(q, ...constraints, orderBy('unit'), orderBy('createdAt', 'desc')));

                if (snapshot.empty) {
                    container.innerHTML = '<div class="alert alert-info">No questions found. Add questions to get started.</div>';
                    return;
                }

                let html = '<table><thead><tr><th>Unit</th><th>Marks</th><th>Difficulty</th><th>Question</th><th>Action</th></tr></thead><tbody>';

                snapshot.forEach(doc => {
                    const q = doc.data();
                    html += `
                 <tr>
                     <td>Unit ${q.unit}</td>
                     <td>${q.marks}M</td>
                     <td><span class="badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}">${q.difficulty}</span></td>
                     <td style="max-width:400px;">${q.text}</td>
                     <td><button class="btn btn-danger btn-sm" onclick="deleteQuestion('${doc.id}')">Delete</button></td>
                 </tr>
             `;
                });

                html += '</tbody></table>';
                container.innerHTML = html;

            } catch (error) {
                console.error('Error loading questions:', error);

                container.innerHTML = '<div class="alert alert-danger">Failed to load questions</div>';
            }
        }

        /**
         * Delete a question
         */
        async function deleteQuestion(questionId) {
            if (!confirm('Are you sure you want to delete this question?')) return;

            try {
                await deleteDoc(doc(window.db, 'questions', questionId));
                showToast('Question deleted successfully', 'success');
                await logAuditEvent('DELETE_QUESTION', { questionId });
                loadQuestions();
            } catch (error) {
                console.error('Error deleting question:', error);
                showToast('Failed to delete question', 'danger');
            }
        }

        /**
         * Export questions to Excel
         */
        async function exportQuestionsToExcel() {
            const filterSubject = document.getElementById('qbFilterSubject')?.value || '';

            if (!filterSubject) {
                const confirmAll = confirm('No subject filter selected. Export ALL questions from the database?');
                if (!confirmAll) {
                    return;
                }
            }

            try {
                let q = collection(window.db, 'questions');
                const constraints = filterSubject ? [where('subjectId', '==', filterSubject)] : [];
                const snapshot = await getDocs(query(q, ...constraints));

                if (snapshot.empty) {
                    showToast('No questions to export', 'warning');
                    return;
                }

                const data = snapshot.docs.map(doc => {
                    const q = doc.data();
                    return {
                        'Question ID': doc.id,
                        'Subject ID': q.subjectId || '',
                        'Unit': q.unit || '',
                        'Marks': q.marks || '',
                        'Difficulty': q.difficulty || '',
                        'Question Text': q.text || '',
                        'Created At': q.createdAt || '',
                        'Created By': q.createdBy || ''
                    };
                });

                const fileName = filterSubject
                    ? `questions_${filterSubject}_${Date.now()}`
                    : `all_questions_${Date.now()}`;

                exportToExcel(data, fileName, 'Questions');
                showToast(`Exported ${data.length} question(s) successfully`, 'success');
            } catch (error) {
                console.error('Error exporting questions:', error);
                showToast('Failed to export questions', 'danger');
            }
        }

        /**
         * Load teachers for a subject for distribution
         */
        async function loadTeachersForDistribution() {
            const subjectId = document.getElementById('distSubject').value;
            const container = document.getElementById('distTeachersList');

            if (!subjectId) {
                container.innerHTML = '<em>Select a subject first</em>';
                return;
            }

            try {
                const snapshot = await getDocs(
                    query(collection(window.db, 'teacher_assignments'), where('subjectId', '==', subjectId))
                );

                if (snapshot.empty) {
                    container.innerHTML = '<div class="alert alert-warning">No teachers assigned to this subject</div>';
                    return;
                }

                const teachers = [...new Set(snapshot.docs.map(d => d.data().teacherEmail))];
                container.innerHTML = `<div style="color:#065f46;font-weight:600;margin-bottom:6px;">${teachers.length} teacher(s) will receive questions:</div>` +
                    teachers.map(t => `<div style="padding:3px 0;color:#374151;">✓ ${t}</div>`).join('') +
                    `<div style="color:#6b7280;font-size:12px;margin-top:6px;">Each teacher gets: ${document.getElementById('distUnits')?.value || '?'} units × ${document.getElementById('distQuestionsPerUnit')?.value || '?'} questions = <strong>${(parseInt(document.getElementById('distUnits')?.value || 0) * parseInt(document.getElementById('distQuestionsPerUnit')?.value || 0)) || '?'} questions each</strong></div>`;

            } catch (error) {
                console.error('Error loading teachers:', error);
                container.innerHTML = '<div class="alert alert-danger">Failed to load teachers</div>';
            }
        }

        /**
         * Distribute questions to teachers
         */
        async function distributeQuestions() {
            const subjectId = document.getElementById('distSubject').value;
            const date = document.getElementById('distDate').value;
            const unitsRaw = document.getElementById('distUnits').value;
            const qpuRaw = document.getElementById('distQuestionsPerUnit').value;
            const marksRaw = document.getElementById('distMarks').value;
            const units = parseInt(unitsRaw);
            const questionsPerUnit = parseInt(qpuRaw);
            const marksType = parseInt(marksRaw) || 2;

            if (!subjectId) { showToast('Please select a subject', 'danger'); return; }
            if (!date) { showToast('Please select an assignment date', 'danger'); return; }
            if (isNaN(units) || units < 1 || units > 10) { showToast('Units must be between 1 and 10', 'danger'); return; }
            if (isNaN(questionsPerUnit) || questionsPerUnit < 1 || questionsPerUnit > 20) { showToast('Questions per unit must be between 1 and 20', 'danger'); return; }

            const btn = document.querySelector('button[onclick="distributeQuestions()"]');
            if (btn) { btn.disabled = true; btn.textContent = 'Distributing...'; }

            try {
                const teacherSnapshot = await getDocs(
                    query(collection(window.db, 'teacher_assignments'), where('subjectId', '==', subjectId))
                );

                if (teacherSnapshot.empty) {
                    showToast('No teachers assigned to this subject. Please assign teachers first.', 'warning');
                    return;
                }

                const teachers = [...new Set(teacherSnapshot.docs.map(d => d.data().teacherEmail))];

                showToast(
                    `Generating ${units} units × ${questionsPerUnit} questions = ${units * questionsPerUnit} questions per teacher for ${teachers.length} teacher(s)...`,
                    'info', 4000
                );

                const result = await generateAndDistributeQuestions({
                    subjectId, units, questionsPerUnit, teachers, marksType, assignmentDate: date
                });

                if (result) {
                    const counts = Object.entries(result).map(([e, qs]) => `${e.split('@')[0]}: ${qs.length}`);
                    showToast(`Distribution complete!\n${counts.join(', ')}`, 'success', 6000);
                    loadDistributionHistory();
                }

            } catch (error) {
                console.error('Error distributing questions:', error);
                showToast('Distribution failed: ' + error.message, 'danger');
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = '🚀 Generate & Distribute Questions'; }
            }
        }

        /**
         * Load distribution history
         */
        async function loadDistributionHistory() {
            const subjectId = document.getElementById('historySubject')?.value;
            const container = document.getElementById('distributionHistory');

            if (!container) return;

            if (!subjectId) {
                container.innerHTML = '<div class="alert alert-info">Select a subject to view history</div>';
                return;
            }

            try {
                const snapshot = await getDocs(
                    query(
                        collection(window.db, 'teacher_question_assignments'),
                        where('subjectId', '==', subjectId),
                        orderBy('assignedAt', 'desc'),
                        limit(50)
                    )
                );

                if (snapshot.empty) {
                    container.innerHTML = '<div class="alert alert-info">No distribution history found</div>';
                    return;
                }

                let html = '<table><thead><tr><th>Date</th><th>Teacher</th><th>Questions</th><th>Units × Per Unit</th><th>Marks</th><th>Assigned At</th></tr></thead><tbody>';

                snapshot.forEach(d_snap => {
                    const d = d_snap.data();
                    const structureInfo = (d.units && d.questionsPerUnit)
                        ? `${d.units} units × ${d.questionsPerUnit}`
                        : '—';
                    html += `
                 <tr>
                     <td><strong>${d.assignmentDate || '—'}</strong></td>
                     <td>${d.teacherEmail || '—'}</td>
                     <td><span class="badge badge-success">${d.totalQuestions || 0}</span></td>
                     <td>${structureInfo}</td>
                     <td>${d.marksType ? d.marksType + 'M' : '—'}</td>
                     <td style="font-size:12px;">${d.assignedAt ? new Date(d.assignedAt).toLocaleString() : '—'}</td>
                 </tr>
             `;
                });

                html += '</tbody></table>';
                container.innerHTML = html;

            } catch (error) {
                console.error('Error loading history:', error);
                container.innerHTML = '<div class="alert alert-danger">Failed to load history</div>';
            }
        }

        /**
         * TEACHER FUNCTIONS - Load assigned questions
         */
        async function loadTeacherQuestionDates() {
            const subjectId = document.getElementById('teacherQuestionsSubject').value;
            const dateSelect = document.getElementById('teacherQuestionsDate');

            if (!subjectId) {
                dateSelect.innerHTML = '<option value="">Choose Date</option>';
                return;
            }

            try {
                // Load dates from usage tracking doc
                const usageDoc = await getDoc(
                    doc(window.db, 'teacherQuestionUsage', `${window.currentUser.email}_${subjectId}`)
                );

                let dates = [];
                if (usageDoc.exists()) {
                    dates = Object.keys(usageDoc.data().byDate || {}).sort().reverse();
                }

                // Also check new collection directly for any dates
                if (dates.length === 0) {
                    const snap = await getDocs(query(
                        collection(window.db, 'teacher_question_assignments'),
                        where('subjectId', '==', subjectId),
                        where('teacherEmail', '==', window.currentUser.email),
                        orderBy('assignmentDate', 'desc')
                    ));
                    dates = [...new Set(snap.docs.map(d => d.data().assignmentDate).filter(Boolean))];
                }

                if (dates.length === 0) {
                    dateSelect.innerHTML = '<option value="">No assignments yet</option>';
                    return;
                }

                dateSelect.innerHTML = '<option value="">Choose Date</option>' +
                    dates.map(d => `<option value="${d}">${d}</option>`).join('');

            } catch (error) {
                console.error('Error loading dates:', error);
                dateSelect.innerHTML = '<option value="">Error loading dates</option>';
            }
        }

        async function loadTeacherAssignedQuestions() {
            const subjectId = document.getElementById('teacherQuestionsSubject').value;
            const date = document.getElementById('teacherQuestionsDate').value;
            const container = document.getElementById('teacherAssignedQuestionsList');

            if (!subjectId || !date) {
                container.innerHTML = '<div class="alert alert-info">Select subject and date</div>';
                return;
            }

            try {
                const questions = await getTeacherAssignedQuestions(window.currentUser.email, subjectId, date);

                if (questions.length === 0) {
                    container.innerHTML = '<div class="alert alert-info">No questions assigned for this date</div>';
                    return;
                }

                // Group questions by unit for clearer display
                const byUnit = {};
                questions.forEach(q => {
                    const u = q.unit || '?';
                    if (!byUnit[u]) byUnit[u] = [];
                    byUnit[u].push(q);
                });
                const unitKeys = Object.keys(byUnit).sort((a, b) => parseInt(a) - parseInt(b));

                let html = `<div style="background:#d1fae5;border:1px solid #6ee7b7;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
             <strong style="color:#065f46;">Your Question Paper for ${date}</strong><br>
             <span style="color:#047857;">${questions.length} questions across ${unitKeys.length} unit(s)</span>
         </div>`;

                unitKeys.forEach(unit => {
                    const uqs = byUnit[unit];
                    html += `<div style="background:#f9fafb;border:2px solid #e5e7eb;border-radius:8px;padding:14px;margin-bottom:12px;">
                 <div style="font-weight:700;color:#1d4ed8;margin-bottom:10px;font-size:14px;">
                     Unit ${unit} — ${uqs.length} question(s) (${uqs[0]?.marks || '?'} marks each)
                 </div>
                 <table style="width:100%;"><thead><tr>
                     <th style="width:40px;">#</th>
                     <th>Question</th>
                     <th style="width:80px;">Difficulty</th>
                 </tr></thead><tbody>`;
                    uqs.forEach((q, i) => {
                        const diffColor = q.difficulty === 'easy' ? '#16a34a' : q.difficulty === 'hard' ? '#dc2626' : '#d97706';
                        html += `<tr>
                     <td style="color:#9ca3af;">${i + 1}</td>
                     <td style="font-size:14px;line-height:1.5;">${q.text || '—'}</td>
                     <td><span style="background:${diffColor};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;">${q.difficulty || 'medium'}</span></td>
                 </tr>`;
                    });
                    html += '</tbody></table></div>';
                });
                container.innerHTML = html;

            } catch (error) {
                console.error('Error loading assigned questions:', error);
                container.innerHTML = '<div class="alert alert-danger">Failed to load questions</div>';
            }
        }

        async function exportTeacherQuestionsToExcel() {
            const subjectId = document.getElementById('teacherQuestionsSubject')?.value;
            const date = document.getElementById('teacherQuestionsDate')?.value;

            if (!subjectId || !date) {
                showToast('Please select both subject and date', 'warning');
                return;
            }

            try {
                const questions = await getTeacherAssignedQuestions(window.currentUser.email, subjectId, date);

                if (questions.length === 0) {
                    showToast('No questions to export', 'warning');
                    return;
                }

                const data = questions.map((q, i) => ({
                    'No': i + 1,
                    'Unit': `Unit ${q.unit}`,
                    'Marks': `${q.marks}M`,
                    'Difficulty': q.difficulty || 'medium',
                    'Question': q.text || ''
                }));

                exportToExcel(data, `my_questions_${date}`, 'Questions');
                showToast(`Exported ${questions.length} question(s) successfully`, 'success');
            } catch (error) {
                console.error('Error exporting questions:', error);
                showToast('Failed to export questions', 'danger');
            }
        }

        // Make functions globally available

        function exportSubjectsExcel() {
            const year = document.getElementById('academicYear').value;
            const semester = document.getElementById('semester').value;
            if (!year || !semester) { showToast('Select academic year and semester', 'warning'); return; }
            window.getDocs(window.query(window.collection(window.db, 'subjects'),
                window.where('academicYear', '==', year), window.where('semester', '==', semester)))
                .then(snap => {
                    if (snap.empty) { showToast('No subjects to export', 'warning'); return; }
                    const data = snap.docs.map(d => {
                        const s = d.data();
                        return { 'Code': s.code || '', 'Name': s.name || '', 'Class': s.class || '', 'Division': s.division || '', 'Year': s.academicYear || '', 'Sem': s.semester || '' };
                    });
                    exportToExcel(data, `subjects_${year}_${semester}_${Date.now()}`, 'Subjects');
                    showToast('Subjects exported', 'success');
                }).catch(e => showToast('Export failed: ' + e.message, 'danger'));
        }

        function exportExamsExcel() {
            const year = document.getElementById('academicYear').value;
            const semester = document.getElementById('semester').value;
            if (!year || !semester) { showToast('Select academic year and semester', 'warning'); return; }
            window.getDocs(window.query(window.collection(window.db, 'exams'),
                window.where('academicYear', '==', year), window.where('semester', '==', semester)))
                .then(snap => {
                    if (snap.empty) { showToast('No exams to export', 'warning'); return; }
                    const data = snap.docs.map(d => {
                        const e = d.data();
                        return { 'Name': e.name || '', 'Type': e.examType || '', 'Max Marks': e.totalMarks || '', 'Status': e.status || '', 'Year': e.academicYear || '', 'Sem': e.semester || '' };
                    });
                    exportToExcel(data, `exams_${year}_${semester}_${Date.now()}`, 'Exams');
                    showToast('Exams exported', 'success');
                }).catch(e => showToast('Export failed: ' + e.message, 'danger'));
        }

        function exportCoordinatorsExcel() {
            window.getDocs(window.collection(window.db, 'coordinator_assignments'))
                .then(snap => {
                    if (snap.empty) { showToast('No coordinators to export', 'warning'); return; }
                    const data = snap.docs.map(d => {
                        const c = d.data();
                        return { 'Department': c.department || '', 'Email': c.email || '', 'Assigned': c.assignedAt ? new Date(c.assignedAt).toLocaleDateString() : '' };
                    });
                    exportToExcel(data, `coordinators_${Date.now()}`, 'Coordinators');
                    showToast('Coordinators exported', 'success');
                }).catch(e => showToast('Export failed: ' + e.message, 'danger'));
        }

        function exportUsersExcel() {
            const roleFilter = document.getElementById('userFilterRole')?.value || '';
            let q = roleFilter
                ? window.query(window.collection(window.db, 'users'), window.where('role', '==', roleFilter))
                : window.collection(window.db, 'users');
            window.getDocs(q).then(snap => {
                if (snap.empty) { showToast('No users to export', 'warning'); return; }
                const data = snap.docs.map(d => {
                    const u = d.data();
                    return { 'Name': u.name || '', 'Email': u.email || '', 'Role': u.role || '', 'Department': u.department || '', 'Status': u.isActive ? 'Active' : 'Inactive', 'Approved': u.approved ? 'Yes' : 'No' };
                });
                exportToExcel(data, `users_${roleFilter || 'all'}_${Date.now()}`, 'Users');
                showToast('Users exported', 'success');
            }).catch(e => showToast('Export failed: ' + e.message, 'danger'));
        }

        function exportAuditLogsExcel() {
            const filter = document.getElementById('auditFilter')?.value || '';
            let q = filter
                ? window.query(window.collection(window.db, 'audit_logs'), window.where('action', '==', filter), window.orderBy('timestamp', 'desc'), window.limit(500))
                : window.query(window.collection(window.db, 'audit_logs'), window.orderBy('timestamp', 'desc'), window.limit(500));
            window.getDocs(q).then(snap => {
                if (snap.empty) { showToast('No audit logs to export', 'warning'); return; }
                const data = snap.docs.map(d => {
                    const a = d.data();
                    return { 'Timestamp': a.timestamp ? new Date(a.timestamp).toLocaleString() : '', 'Action': a.action || '', 'Performed By': a.performedByName || a.performedBy || '', 'Role': a.performedByRole || '', 'Details': JSON.stringify(a.details || {}) };
                });
                exportToExcel(data, `audit_logs_${filter || 'all'}_${Date.now()}`, 'Audit Logs');
                showToast('Audit logs exported', 'success');
            }).catch(e => showToast('Export failed: ' + e.message, 'danger'));
        }

        function exportResultsExcel() {
            const examId = document.getElementById('resultsExam')?.value || document.getElementById('teacherResultsExam')?.value || '';
            if (!examId) { showToast('Please select an exam first', 'warning'); return; }
            window.getDocs(window.query(window.collection(window.db, 'results'), window.where('examId', '==', examId)))
                .then(snap => {
                    if (snap.empty) { showToast('No results to export', 'warning'); return; }
                    const data = snap.docs.map(d => {
                        const r = d.data();
                        return { 'Student': r.studentName || r.studentId || '', 'Enrollment': r.enrollment || '', 'Total': r.totalMarks || 0, 'Max': r.maxMarks || 0, '%': r.percentage || 0, 'Grade': r.grade || '' };
                    });
                    exportToExcel(data, `results_${examId}_${Date.now()}`, 'Results');
                    showToast('Results exported', 'success');
                }).catch(e => showToast('Export failed: ' + e.message, 'danger'));
        }

        async function importResultsFromExcel() {
            const examId = document.getElementById('importExamSelect').value;
            const fileInput = document.getElementById('resultsExcelFile');
            if (!examId) { showToast('Please select an exam first', 'danger'); return; }
            if (!fileInput.files || !fileInput.files[0]) { showToast('Please select an Excel file', 'danger'); return; }
            const file = fileInput.files[0];
            if (!file.name.match(/\.(xlsx|xls)$/i)) { showToast('Please select a valid Excel file', 'danger'); return; }
            try {
                const examDoc = await window.getDoc(window.doc(window.db, 'exams', examId));
                if (!examDoc.exists()) { showToast('Exam not found', 'danger'); return; }
                const examData = examDoc.data();
                if (examData.status === 'FINALIZED') { showToast('Cannot import for finalized exams', 'danger'); return; }
                await importFromExcel(file, async (rows) => {
                    let ok = 0, fail = 0;
                    for (const row of rows) {
                        const enrollment = String(row['Enrollment'] || row['enrollment'] || row[Object.keys(row)[0]] || '').trim();
                        if (!enrollment) { fail++; continue; }
                        const studentSnap = await window.getDocs(window.query(window.collection(window.db, 'students'), window.where('enrollment', '==', enrollment)));
                        if (studentSnap.empty) { fail++; continue; }
                        const studentDoc = studentSnap.docs[0];
                        const marks = [];
                        if (examData.examType === 'standard' && examData.criteria) {
                            for (let j = 0; j < examData.criteria.length; j++) {
                                const v = row[`Mark${j + 1}`] ?? row[examData.criteria[j].name] ?? null;
                                marks.push(v !== null && v !== '' ? parseFloat(v) : null);
                            }
                        }
                        const total = marks.reduce((s, m) => s + (m !== null ? m : 0), 0);
                        const pct = examData.totalMarks ? (total / examData.totalMarks) * 100 : 0;
                        const resultData = { examId, studentId: studentDoc.id, enrollment, studentName: studentDoc.data().name || '', marks, totalMarks: total, percentage: Math.round(pct * 100) / 100, grade: calculateGrade(pct), status: marks.some(m => m === null) ? 'INCOMPLETE' : 'COMPLETE', importedAt: new Date().toISOString(), importedBy: window.currentUser?.uid || '' };
                        const existing = await window.getDocs(window.query(window.collection(window.db, 'results'), window.where('examId', '==', examId), window.where('studentId', '==', studentDoc.id)));
                        if (!existing.empty) {
                            await window.updateDoc(window.doc(window.db, 'results', existing.docs[0].id), resultData);
                        } else {
                            await window.addDoc(window.collection(window.db, 'results'), resultData);
                        }
                        ok++;
                    }
                    showToast(`Imported ${ok} results. ${fail} skipped.`, ok > 0 ? 'success' : 'warning');
                    if (ok > 0) { logAuditEvent('IMPORT_RESULTS', { examId, successCount: ok, failCount: fail }); }
                }, true);
                fileInput.value = '';
            } catch (e) { console.error(e); showToast('Import failed: ' + e.message, 'danger'); }
        }

        async function importCoordinatorResultsFromExcel() {
            const examId = document.getElementById('coordImportExamSelect').value;
            const fileInput = document.getElementById('coordResultsExcelFile');
            if (!examId) { showToast('Please select an exam first', 'danger'); return; }
            if (!fileInput.files || !fileInput.files[0]) { showToast('Please select an Excel file', 'danger'); return; }
            const file = fileInput.files[0];
            if (!file.name.match(/\.(xlsx|xls)$/i)) { showToast('Please select a valid Excel file', 'danger'); return; }
            try {
                const examDoc = await window.getDoc(window.doc(window.db, 'exams', examId));
                if (!examDoc.exists()) { showToast('Exam not found', 'danger'); return; }
                const examData = examDoc.data();
                if (examData.status === 'FINALIZED') { showToast('Cannot import for finalized exams', 'danger'); return; }
                await importFromExcel(file, async (rows) => {
                    let ok = 0, fail = 0;
                    for (const row of rows) {
                        const enrollment = String(row['Enrollment'] || row['enrollment'] || row[Object.keys(row)[0]] || '').trim();
                        if (!enrollment) { fail++; continue; }
                        const studentSnap = await window.getDocs(window.query(window.collection(window.db, 'students'), window.where('enrollment', '==', enrollment)));
                        if (studentSnap.empty) { fail++; continue; }
                        const studentDoc = studentSnap.docs[0];
                        const marks = [];
                        if (examData.examType === 'standard' && examData.criteria) {
                            for (let j = 0; j < examData.criteria.length; j++) {
                                const v = row[`Mark${j + 1}`] ?? row[examData.criteria[j].name] ?? null;
                                marks.push(v !== null && v !== '' ? parseFloat(v) : null);
                            }
                        }
                        const total = marks.reduce((s, m) => s + (m !== null ? m : 0), 0);
                        const pct = examData.totalMarks ? (total / examData.totalMarks) * 100 : 0;
                        const resultData = { examId, studentId: studentDoc.id, enrollment, studentName: studentDoc.data().name || '', marks, totalMarks: total, percentage: Math.round(pct * 100) / 100, grade: calculateGrade(pct), status: marks.some(m => m === null) ? 'INCOMPLETE' : 'COMPLETE', importedAt: new Date().toISOString(), importedBy: window.currentUser?.uid || '' };
                        const existing = await window.getDocs(window.query(window.collection(window.db, 'results'), window.where('examId', '==', examId), window.where('studentId', '==', studentDoc.id)));
                        if (!existing.empty) {
                            await window.updateDoc(window.doc(window.db, 'results', existing.docs[0].id), resultData);
                        } else {
                            await window.addDoc(window.collection(window.db, 'results'), resultData);
                        }
                        ok++;
                    }
                    showToast(`Imported ${ok} results. ${fail} skipped.`, ok > 0 ? 'success' : 'warning');
                    if (ok > 0) { logAuditEvent('COORD_IMPORT_RESULTS', { examId, successCount: ok, failCount: fail }); }
                }, true);
                fileInput.value = '';
            } catch (e) { console.error(e); showToast('Import failed: ' + e.message, 'danger'); }
        }

        window.addQuestion = addQuestion;
        window.downloadQuestionBankTemplate = downloadQuestionBankTemplate;
        window.importQuestionsFromExcel = importQuestionsFromExcel;
        window.loadQuestions = loadQuestions;
        window.deleteQuestion = deleteQuestion;
        window.exportQuestionsToExcel = exportQuestionsToExcel;
        window.loadTeachersForDistribution = loadTeachersForDistribution;
        window.distributeQuestions = distributeQuestions;
        window.loadDistributionHistory = loadDistributionHistory;
        window.loadTeacherQuestionDates = loadTeacherQuestionDates;
        window.loadTeacherAssignedQuestions = loadTeacherAssignedQuestions;
        window.exportSubjectsExcel = exportSubjectsExcel;
        window.exportExamsExcel = exportExamsExcel;
        window.exportCoordinatorsExcel = exportCoordinatorsExcel;
        window.exportUsersExcel = exportUsersExcel;
        window.exportAuditLogsExcel = exportAuditLogsExcel;
        window.exportResultsExcel = exportResultsExcel;
        window.importResultsFromExcel = importResultsFromExcel;
        window.importCoordinatorResultsFromExcel = importCoordinatorResultsFromExcel;

        window.exportTeacherQuestionsToExcel = exportTeacherQuestionsToExcel;

        // ========================================
        // END QUESTION BANK FUNCTIONS
        // ========================================

        document.addEventListener('DOMContentLoaded', function () {
            if (window.__portalMode === 'local' && typeof window.renderPortalModeNotice === 'function') {
                window.renderPortalModeNotice();
            }
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    login();
                });
            }
            const signupBtn = document.getElementById('signupBtn');
            if (signupBtn) {
                signupBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    signup();
                });
            }
            const resetPasswordBtn = document.getElementById('resetPasswordBtn');
            if (resetPasswordBtn) {
                resetPasswordBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    sendPasswordReset();
                });
            }
            const showSignupLink = document.getElementById('showSignupLink');
            if (showSignupLink) {
                showSignupLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleAuth();
                });
            }

            const showLoginLink = document.getElementById('showLoginLink');
            if (showLoginLink) {
                showLoginLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleAuth();
                });
            }
            const forgotPasswordLink = document.getElementById('forgotPasswordLink');
            if (forgotPasswordLink) {
                forgotPasswordLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    showForgotPassword();
                });
            }
            const backToLoginLink = document.getElementById('backToLoginLink');
            if (backToLoginLink) {
                backToLoginLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    showLogin();
                });
            }
            document.getElementById('loginPassword')?.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    login();
                }
            });

            document.getElementById('signupPassword')?.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    signup();
                }
            });

            document.getElementById('resetEmail')?.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    sendPasswordReset();
                }
            });
        });

