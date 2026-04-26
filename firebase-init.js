// ============================================================
// firebase-init.js  -  Firebase initialization (Universal Compatibility Mode)
// ============================================================

// This file uses the Firebase "Compat" SDK which allows the application
// to run directly from the file system (file://) without a local server.

(function() {
    // Suppress harmless Firestore host override warnings specifically
    const _originalWarn = console.warn;
    console.warn = function(...args) {
        const msg = args.join(' ');
        if (msg.includes('overriding the original host') || msg.includes('use {merge: true}')) {
            return;
        }
        _originalWarn.apply(console, args);
    };

    console.log("Evaluator v1.0.9: Initializing Firebase...");
    const firebaseConfig = {
        apiKey: "AIzaSyDu2YZVzf5WEOqgpMxm6byrhaV-v6nalwA",
        authDomain: "evaluator-489d3.firebaseapp.com",
        projectId: "evaluator-489d3",
        storageBucket: "evaluator-489d3.firebasestorage.app",
        messagingSenderId: "782149514798",
        appId: "1:782149514798:web:95591dc116d44916d9d1bf",
        measurementId: "G-7VE1LG2PF1"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    // Initialize Analytics if the library is loaded
    if (typeof firebase.analytics === 'function') {
        firebase.analytics();
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    // Secondary Firebase instance for admin actions (prevents HOD logout)
    let secondaryAuth = null;
    try {
        const secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");
        secondaryAuth = secondaryApp.auth();
        // Crucial: Set persistence to NONE so this instance doesn't overwrite 
        // the main auth session in localStorage/IndexedDB.
        secondaryAuth.setPersistence(firebase.auth.Auth.Persistence.NONE);
    } catch (e) {
        console.error("Secondary app init error:", e);
    }
    window.secondaryAuth = secondaryAuth;

    // Initialize Firestore with settings merging to avoid host override warnings
    try {
        db.settings({ 
            experimentalForceLongPolling: true
        });
    } catch (e) {
        if (!e.message.includes('already been used') && !e.message.includes('settings')) {
            console.warn("Firestore settings check:", e.message);
        }
    }

    // Global references for app.js
    window.auth = auth;
    window.db = db;
    window.currentUser = null;
    window.__portalMode = 'firebase';

    // ============================================================
    // MODULAR SHIM GLOBALS (Translation layer for app.js)
    // ============================================================
    window.doc = (dbRef, collectionName, docId) => {
        if (!docId) return dbRef.doc(collectionName);
        return dbRef.collection(collectionName).doc(docId);
    };
    window.collection = (dbRef, collectionName) => dbRef.collection(collectionName);

    const wrapDoc = (doc) => {
        if (!doc) return doc;
        return new Proxy(doc, {
            get(target, prop) {
                if (prop === 'exists') return () => !!target.exists;
                let val = target[prop];
                if (typeof val === 'function') return val.bind(target);
                return val;
            }
        });
    };

    const wrapQuery = (snap) => {
        if (!snap) return snap;
        return new Proxy(snap, {
            get(target, prop) {
                if (prop === 'docs') return target.docs.map(d => wrapDoc(d));
                let val = target[prop];
                if (typeof val === 'function') return val.bind(target);
                return val;
            }
        });
    };

    window.getDoc = async (docRef) => {
        const snap = await docRef.get();
        return wrapDoc(snap);
    };

    window.getDocs = async (queryRef) => {
        const snap = await queryRef.get();
        return wrapQuery(snap);
    };
    // ============================================================
    // OFFLINE SYNC MANAGER
    // ============================================================
    const OfflineSyncManager = {
        QUEUE_KEY: 'evaluator_pending_sync',
        
        getQueue() {
            try {
                return JSON.parse(localStorage.getItem(this.QUEUE_KEY) || '[]');
            } catch (e) {
                return [];
            }
        },
        
        saveQueue(queue) {
            localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
            this.updateUI();
        },

        updateUI() {
            const queue = this.getQueue();
            const btns = document.querySelectorAll('.sync-btn');
            btns.forEach(btn => {
                if (queue.length > 0) {
                    btn.classList.remove('hidden');
                    btn.textContent = `Sync (${queue.length} Pending)`;
                } else {
                    btn.classList.add('hidden');
                }
            });
        },
        
        addToQueue(operation, path, data, options = null) {
            const queue = this.getQueue();
            // Check for duplicate updates to the same path to prevent bloat
            if (operation === 'updateDoc' || operation === 'setDoc') {
                const existingIdx = queue.findIndex(item => item.path === path && (item.operation === 'updateDoc' || item.operation === 'setDoc'));
                if (existingIdx !== -1) {
                    queue[existingIdx].data = { ...queue[existingIdx].data, ...data };
                    queue[existingIdx].timestamp = new Date().toISOString();
                    this.saveQueue(queue);
                    return;
                }
            }

            queue.push({
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                operation,
                path,
                data,
                options,
                timestamp: new Date().toISOString()
            });
            this.saveQueue(queue);
            console.log(`[Sync] Operation ${operation} queued for ${path}`);
            if (typeof window.showToast === 'function') {
                window.showToast('Work saved locally. Will sync when online.', 'info', 3000);
            }
        },
        
        async processQueue() {
            if (!navigator.onLine) {
                if (typeof window.showToast === 'function' && this.getQueue().length > 0) {
                    window.showToast('You are offline. Cannot sync yet.', 'warning');
                }
                return;
            }
            
            const queue = this.getQueue();
            if (queue.length === 0) return;
            
            console.log(`[Sync] Processing ${queue.length} pending operations...`);
            const remaining = [];
            let successCount = 0;
            
            for (const item of queue) {
                try {
                    let ref;
                    if (item.operation === 'addDoc') {
                        ref = window.db.collection(item.path);
                        await ref.add(item.data);
                    } else {
                        ref = window.db.doc(item.path);
                        if (item.operation === 'setDoc') {
                            await ref.set(item.data, item.options || {});
                        } else if (item.operation === 'updateDoc') {
                            await ref.update(item.data);
                        } else if (item.operation === 'deleteDoc') {
                            await ref.delete();
                        }
                    }
                    successCount++;
                    console.log(`[Sync] Success: ${item.operation} on ${item.path}`);
                } catch (e) {
                    console.error(`[Sync] Failed: ${item.operation} on ${item.path}`, e);
                    // Keep in queue if it's a network error, remove if it's a permanent error (e.g. permission)
                    if (e.code === 'unavailable' || e.code === 'deadline-exceeded' || !navigator.onLine) {
                        remaining.push(item);
                    }
                }
            }
            
            this.saveQueue(remaining);
            if (successCount > 0 && typeof window.showToast === 'function') {
                window.showToast(`Synced ${successCount} pending updates to database.`, 'success');
            }
            this.updateUI();
        }
    };
    window.OfflineSyncManager = OfflineSyncManager;

    // Listen for online event
    window.addEventListener('online', () => {
        console.log('[Sync] Back online! Triggering sync...');
        setTimeout(() => OfflineSyncManager.processQueue(), 2000);
    });

    // Run once on load and when dashboards are shown
    setTimeout(() => OfflineSyncManager.updateUI(), 1000);
    setTimeout(() => OfflineSyncManager.processQueue(), 5000);

    window.setDoc = async (docRef, data, options) => {
        if (navigator.onLine) {
            try {
                return await docRef.set(data, options || {});
            } catch (e) {
                if (e.code === 'unavailable') {
                    OfflineSyncManager.addToQueue('setDoc', docRef.path, data, options);
                    return;
                }
                throw e;
            }
        } else {
            OfflineSyncManager.addToQueue('setDoc', docRef.path, data, options);
        }
    };

    window.addDoc = async (collRef, data) => {
        if (navigator.onLine) {
            try {
                return await collRef.add(data);
            } catch (e) {
                if (e.code === 'unavailable') {
                    OfflineSyncManager.addToQueue('addDoc', collRef.path, data);
                    return;
                }
                throw e;
            }
        } else {
            OfflineSyncManager.addToQueue('addDoc', collRef.path, data);
        }
    };

    window.updateDoc = async (docRef, data) => {
        if (navigator.onLine) {
            try {
                return await docRef.update(data);
            } catch (e) {
                if (e.code === 'unavailable') {
                    OfflineSyncManager.addToQueue('updateDoc', docRef.path, data);
                    return;
                }
                throw e;
            }
        } else {
            OfflineSyncManager.addToQueue('updateDoc', docRef.path, data);
        }
    };

    window.deleteDoc = async (docRef) => {
        if (navigator.onLine) {
            try {
                return await docRef.delete();
            } catch (e) {
                if (e.code === 'unavailable') {
                    OfflineSyncManager.addToQueue('deleteDoc', docRef.path, null);
                    return;
                }
                throw e;
            }
        } else {
            OfflineSyncManager.addToQueue('deleteDoc', docRef.path, null);
        }
    };
    
    window.query = (ref, ...constraints) => {
        let q = ref;
        constraints.forEach(constraint => { if (typeof constraint === 'function') q = constraint(q); });
        return q;
    };
    window.where = (field, op, value) => (q) => q.where(field, op === '==' ? '==' : op, value);
    window.orderBy = (field, direction) => (q) => q.orderBy(field, direction || 'asc');
    window.limit = (num) => (q) => q.limit(num);

    window.signInWithEmailAndPassword = (authRef, email, password) => authRef.signInWithEmailAndPassword(email, password);
    window.createUserWithEmailAndPassword = (authRef, email, password) => authRef.createUserWithEmailAndPassword(email, password);
    window.signOut = (authRef) => authRef.signOut();
    window.sendPasswordResetEmail = (authRef, email) => authRef.sendPasswordResetEmail(email);
    window.sendEmailVerification = (user) => user.sendEmailVerification();
    window.onAuthStateChanged = (authRef, callback) => authRef.onAuthStateChanged(callback);

    // Also export as plain globals for app.js standard calls
    Object.assign(window, {
        doc: window.doc,
        collection: window.collection,
        getDoc: window.getDoc,
        getDocs: window.getDocs,
        setDoc: window.setDoc,
        addDoc: window.addDoc,
        updateDoc: window.updateDoc,
        deleteDoc: window.deleteDoc,
        query: window.query,
        where: window.where,
        orderBy: window.orderBy,
        limit: window.limit,
        signOut: window.signOut,
        signInWithEmailAndPassword: window.signInWithEmailAndPassword,
        createUserWithEmailAndPassword: window.createUserWithEmailAndPassword,
        onAuthStateChanged: window.onAuthStateChanged,
        sendPasswordResetEmail: window.sendPasswordResetEmail,
        sendEmailVerification: window.sendEmailVerification
    });


    // ============================================================
    // APP LOGIC
    // ============================================================

    let idleTimer;
    const IDLE_TIMEOUT = 30 * 60 * 1000;

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (window.currentUser) {
                if (typeof window.showToast === 'function') window.showToast('Session expired due to inactivity. Please login again.', 'warning', 5000);
                window.logout();
            }
        }, IDLE_TIMEOUT);
    }

    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keypress', resetIdleTimer);
    document.addEventListener('click', resetIdleTimer);
    document.addEventListener('scroll', resetIdleTimer);
    document.addEventListener('touchstart', resetIdleTimer);

    resetIdleTimer();
    window.resetIdleTimer = resetIdleTimer;
    window.failedLoginAttempts = new Map();

    window.logFailedLogin = async function(email, errorCode) {
        try {
            await window.addDoc(window.collection(window.db, 'failed_logins'), {
                email: email,
                errorCode: errorCode,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
            const attempts = (window.failedLoginAttempts.get(email) || 0) + 1;
            window.failedLoginAttempts.set(email, attempts);
            return attempts;
        } catch (error) {
            // Permission errors are expected if rules block unauthenticated writes to failed_logins
            if (!error.message.includes('permissions')) {
                console.error('Error logging failed login:', error);
            }
            return 0;
        }
    };

    window.clearFailedAttempts = async function(email) {
        window.failedLoginAttempts.delete(email);
    };

    window.lockAccount = async function(email) {
        try {
            const userQuery = await window.getDocs(
                window.query(window.collection(window.db, 'users'), window.where('email', '==', email))
            );
            if (!userQuery.empty) {
                const docId = userQuery.docs[0].id;
                await window.updateDoc(window.doc(window.db, 'users', docId), {
                    isLocked: true,
                    lockedAt: new Date().toISOString(),
                    lockReason: 'Too many failed login attempts'
                });
            }
        } catch (error) {
            console.error('Error locking account:', error);
        }
    };

    window.logSecurityEvent = async function(eventType, details = {}) {
        try {
            const severity = ['UNAUTHORIZED_ROLE_CREATION_ATTEMPT', 'SELF_ROLE_CHANGE_ATTEMPT',
                'UNAUTHORIZED_ACCESS_ATTEMPT', 'DATA_TAMPERING_ATTEMPT'].includes(eventType)
                ? 'HIGH' : 'MEDIUM';
            await window.addDoc(window.collection(window.db, 'security_events'), {
                type: eventType,
                details: details,
                userId: window.currentUser?.uid || 'anonymous',
                userName: window.currentUser?.name || 'Anonymous',
                userRole: window.currentUser?.role || 'none',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                severity: severity
            });
        } catch (error) {
            console.error('Error logging security event:', error);
        }
    };

    window.exportToExcel = function(data, filename, sheetName = 'Sheet1') {
        try {
            if (!data || data.length === 0) { window.showToast('No data to export', 'warning'); return; }
            if (typeof XLSX === 'undefined') { window.showToast('Excel library not loaded.', 'danger'); return; }
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, `${filename}.xlsx`);
            window.showToast('Excel file downloaded', 'success');
        } catch (error) {
            window.showToast('Export failed: ' + error.message, 'danger');
        }
    };

    window.importFromExcel = function(file, callback) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function (e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    await callback(jsonData);
                    window.showToast(`Processed ${jsonData.length} records`, 'success');
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };

    window.generateAndDistributeQuestions = async function(params) {
        const { subjectId, units, questionsPerUnit, teachers, marksType, assignmentDate } = params;
        try {
            const qSnap = await window.getDocs(window.query(window.collection(window.db, 'questions'), window.where('subjectId', '==', subjectId)));
            const questionBank = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            if (questionBank.length === 0) {
                throw new Error('Question bank is empty for this subject. Please add or import questions first.');
            }

            const distribution = {};
            const targetMarks = parseInt(marksType);
            const usedInThisBatch = new Set();

            // Shuffle entire bank once to ensure randomness
            const shuffledBank = window.shuffle(questionBank);

            teachers.forEach(email => {
                distribution[email] = [];
                // We try to pick questions unit by unit as requested
                for (let u = 1; u <= units; u++) {
                    const pool = shuffledBank.filter(q => 
                        parseInt(q.unit) === u && 
                        parseInt(q.marks) === targetMarks && 
                        !usedInThisBatch.has(q.id)
                    );
                    
                    const needed = questionsPerUnit;
                    const picked = pool.slice(0, needed);
                    
                    picked.forEach(q => {
                        usedInThisBatch.add(q.id);
                        distribution[email].push(q);
                    });
                }
            });

            const totalAssigned = Object.values(distribution).reduce((sum, list) => sum + list.length, 0);
            if (totalAssigned === 0) {
                throw new Error(`Zero questions assigned. Check if your bank has questions for Marks: ${targetMarks} in Units 1-${units}.`);
            }

            // Save assignments
            const batchPromises = Object.entries(distribution).map(([email, questions]) => {
                return window.setDoc(window.doc(window.db, 'teacher_question_assignments', `${subjectId}_${email}_${assignmentDate}`), {
                    subjectId,
                    teacherEmail: email,
                    questions,
                    totalQuestions: questions.length,
                    units,
                    questionsPerUnit,
                    marksType,
                    assignedAt: new Date().toISOString(),
                    assignmentDate
                });
            });

            await Promise.all(batchPromises);
            window.showToast(`Successfully distributed ${totalAssigned} questions to ${teachers.length} teachers!`, 'success');
            return distribution;
        } catch (error) {
            console.error('Distribution Error:', error);
            window.showToast(error.message, 'danger');
            return null;
        }
    };

    window.shuffle = function(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    window.updateLiveTotal = function (studentId) {
        const inputs = document.querySelectorAll(`[data-student="${studentId}"]`);
        let total = 0; let maxTotal = 0; let allFilled = true;
        inputs.forEach(input => {
            const val = parseFloat(input.value); const max = parseFloat(input.max);
            if (isNaN(val) || input.value === '') allFilled = false; else total += val;
            if (!isNaN(max)) maxTotal += max;
        });
        const container = document.getElementById(`live-total-${studentId}`);
        if (container && allFilled) {
            const pct = window.calculatePercentage(total, maxTotal);
            container.innerHTML = `<div style="background:#f0f9ff;padding:10px;border-radius:6px;border:1px solid #bae6fd;margin-top:10px;">
                <strong>Live Total:</strong> ${window.formatMarks(total)} / ${maxTotal} | <strong>Percentage:</strong> ${pct}%
            </div>`;
        }
    };

    window.logAuditEvent = async function(action, details = {}) {
        try {
            await window.addDoc(window.collection(window.db, 'audit_logs'), {
                action: action,
                performedBy: window.currentUser?.uid || 'anonymous',
                performedByName: window.currentUser?.name || 'Anonymous',
                performedByRole: window.currentUser?.role || 'none',
                timestamp: new Date().toISOString(),
                details: details,
                userAgent: navigator.userAgent
            });
        } catch (error) {
            console.error('Error logging audit event:', error);
        }
    };

    // Shared Helper functions
    window.roundMarks = (val) => {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : Math.round(n * 100) / 100;
    };
    
    window.formatMarks = (val, dec = 2) => window.roundMarks(val).toFixed(dec);
    
    window.calculatePercentage = (obt, tot) => {
        if (!tot || tot <= 0) return 0;
        return window.roundMarks((obt / tot) * 100);
    };

    window.setupEvaluationHelpers = function () {
        const inputs = document.querySelectorAll('.eval-input');
        inputs.forEach(input => {
            input.addEventListener('input', function () {
                const val = parseFloat(this.value);
                const max = parseFloat(this.max);
                if (val > max) {
                    this.style.borderColor = '#ef4444';
                    window.showToast(`Value cannot exceed ${max}`, 'warning', 2000);
                } else {
                    this.style.borderColor = '#10b981';
                }
                if (window.updateLiveTotal) window.updateLiveTotal(this.dataset.student);
            });
        });
    };

    // Auth State Observer
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userSnap = await window.getDoc(window.doc(window.db, 'users', user.uid));
            if (userSnap.exists()) {
                const userData = userSnap.data();
                window.currentUser = { ...userData, uid: user.uid };
                if (window.showDashboard) window.showDashboard(userData.role);
            }
        } else {
            window.currentUser = null;
            const authCont = document.getElementById('authContainer');
            if (authCont) authCont.style.display = 'block';
            if (window.hideAllDashboards) window.hideAllDashboards();
        }
    });

})();
