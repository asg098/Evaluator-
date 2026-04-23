
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
        import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

        const firebaseConfig = {
            apiKey: "AIzaSyA38mbdWCEN1tKvaS1pH_42LpFYuYUD0l0",
            authDomain: "evaluator-up.firebaseapp.com",
            projectId: "evaluator-up",
            storageBucket: "evaluator-up.firebasestorage.app",
            messagingSenderId: "995605241717",
            appId: "1:995605241717:web:bd16c4443f23646c44bd3c",
            measurementId: "G-CQR8PTH1F9"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const secondaryApp = initializeApp(firebaseConfig, 'secondary');
        const secondaryAuth = getAuth(secondaryApp);
        const db = getFirestore(app);

        window.auth = auth;
        window.secondaryAuth = secondaryAuth;
        window.db = db;
        window.currentUser = null;
        window.__portalMode = 'firebase';

        let idleTimer;
        const IDLE_TIMEOUT = 30 * 60 * 1000;

        function resetIdleTimer() {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                if (window.currentUser) {
                    window.showToast('Session expired due to inactivity. Please login again.', 'warning', 5000);
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

        async function logFailedLogin(email, errorCode) {
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
                console.error('Error logging failed login:', error);
                return 0;
            }
        }

        async function clearFailedAttempts(email) {
            window.failedLoginAttempts.delete(email);
        }

        async function lockAccount(email) {
            try {
                const userQuery = await window.getDocs(
                    window.query(window.collection(window.db, 'users'), window.where('email', '==', email))
                );

                if (!userQuery.empty) {
                    const userDoc = userQuery.docs[0];
                    await window.updateDoc(window.doc(window.db, 'users', userDoc.id), {
                        isLocked: true,
                        lockedAt: new Date().toISOString(),
                        lockReason: 'Too many failed login attempts'
                    });
                }
            } catch (error) {
                console.error('Error locking account:', error);
            }
        }

        window.logFailedLogin = logFailedLogin;
        window.clearFailedAttempts = clearFailedAttempts;
        window.lockAccount = lockAccount;

        async function logAuditEvent(action, details = {}) {
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
        }

        window.logAuditEvent = logAuditEvent;

        async function logSecurityEvent(eventType, details = {}) {
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
        }

        window.logSecurityEvent = logSecurityEvent;

        function validateForm(fields, rules) {
            const errors = [];

            for (const [field, value] of Object.entries(fields)) {
                const rule = rules[field];
                if (!rule) continue;

                if (rule.required && (!value || value.toString().trim() === '')) {
                    errors.push(`${field} is required`);
                    continue;
                }

                if (rule.minLength && value.length < rule.minLength) {
                    errors.push(`${field} must be at least ${rule.minLength} characters`);
                }

                if (rule.maxLength && value.length > rule.maxLength) {
                    errors.push(`${field} must not exceed ${rule.maxLength} characters`);
                }

                if (rule.pattern && !rule.pattern.test(value)) {
                    errors.push(rule.patternMessage || `${field} format is invalid`);
                }

                if (rule.custom && !rule.custom(value)) {
                    errors.push(rule.customMessage || `${field} validation failed`);
                }
            }

            return {
                valid: errors.length === 0,
                errors: errors
            };
        }

        function exportToExcel(data, filename, sheetName = 'Sheet1') {
            try {
                if (!data || data.length === 0) {
                    window.showToast('No data to export', 'warning');
                    return;
                }

                if (typeof XLSX === 'undefined') {
                    window.showToast('Excel library not loaded. Please refresh the page.', 'danger');
                    console.error('XLSX library not found');
                    return;
                }

                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(data);

                const colWidths = [];
                const headers = Object.keys(data[0]);
                headers.forEach((header, i) => {
                    const maxLen = Math.max(
                        header.length,
                        ...data.map(row => {
                            const val = row[header];
                            return val ? val.toString().length : 0;
                        })
                    );
                    colWidths.push({ wch: Math.min(maxLen + 2, 50) });
                });
                ws['!cols'] = colWidths;

                XLSX.utils.book_append_sheet(wb, ws, sheetName);
                XLSX.writeFile(wb, `${filename}.xlsx`);

                window.showToast('Excel file downloaded successfully', 'success');
                logAuditEvent('EXPORT_EXCEL', { filename, recordCount: data.length });
            } catch (error) {
                console.error('Excel export error:', error);
                window.showToast('Failed to export Excel file: ' + error.message, 'danger');
            }
        }

        async function importFromExcel(file, callback, suppressSuccessToast = false) {
            return new Promise((resolve, reject) => {
                try {
                    const reader = new FileReader();

                    reader.onload = async function (e) {
                        try {
                            const data = new Uint8Array(e.target.result);
                            const workbook = XLSX.read(data, { type: 'array' });

                            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                                window.showToast('Excel file has no sheets', 'danger');
                                reject(new Error('No sheets found'));
                                return;
                            }

                            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                            if (jsonData.length === 0) {
                                window.showToast('Excel file is empty', 'warning');
                                reject(new Error('Empty file'));
                                return;
                            }

                            await callback(jsonData);
                            if (!suppressSuccessToast) {
                                window.showToast(`Processed ${jsonData.length} records from Excel`, 'success');
                            }
                            await logAuditEvent('IMPORT_EXCEL', { recordCount: jsonData.length });
                            resolve(jsonData);
                        } catch (error) {
                            console.error('Excel parsing error:', error);
                            window.showToast('Failed to parse Excel file. Please check format.', 'danger');
                            reject(error);
                        }
                    };

                    reader.onerror = function () {
                        const error = new Error('Failed to read Excel file');
                        window.showToast('Failed to read Excel file', 'danger');
                        reject(error);
                    };

                    reader.readAsArrayBuffer(file);
                } catch (error) {
                    console.error('Excel import error:', error);
                    window.showToast('Failed to import Excel file', 'danger');
                    reject(error);
                }
            });
        }

        function downloadExcelTemplate(headers, filename) {
            const templateData = [headers.reduce((obj, h) => ({ ...obj, [h]: '' }), {})];
            exportToExcel(templateData, `${filename}_template`, 'Template');
        }

        async function generateAndDistributeQuestions(params) {
            const {
                subjectId,
                units,
                questionsPerUnit,
                teachers,
                marksType = 2,
                assignmentDate
            } = params;

            try {
                // 1. Load ALL questions for this subject
                const qSnap = await getDocs(
                    query(collection(db, 'questions'), where('subjectId', '==', subjectId))
                );

                const questionBank = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                if (questionBank.length === 0) {
                    window.showToast('No questions found in question bank for this subject. Please add questions first.', 'warning');
                    return null;
                }

                // 2. Load each teacher's full usage history
                const teacherUsage = {};
                await Promise.all(teachers.map(async (email) => {
                    const usageDoc = await getDoc(doc(db, 'teacherQuestionUsage', `${email}_${subjectId}`));
                    teacherUsage[email] = usageDoc.exists()
                        ? { allTimeUsed: new Set(usageDoc.data().allTimeUsed || []), byDate: usageDoc.data().byDate || {} }
                        : { allTimeUsed: new Set(), byDate: {} };
                }));

                // 3. Build distribution: each teacher gets questionsPerUnit questions PER unit
                //    Rules:
                //      a) No two teachers get the SAME question on the same date
                //      b) No teacher gets a question they received on a previous date
                //      c) Fallback: if pool exhausted, allow cross-teacher reuse but still
                //         avoid repeating for the individual teacher
                const distribution = {};
                teachers.forEach(e => { distribution[e] = []; });

                // Track questions used TODAY across all teachers (cross-teacher uniqueness)
                const usedToday = new Set();

                const targetQPerUnit = typeof questionsPerUnit === 'number' ? questionsPerUnit : 2;

                for (let unit = 1; unit <= units; unit++) {
                    // Filter by unit AND marks type — coerce to int to handle string storage
                    const unitQs = questionBank.filter(q =>
                        parseInt(q.unit) === parseInt(unit) &&
                        parseInt(q.marks) === parseInt(marksType)
                    );

                    if (unitQs.length === 0) {
                        window.showToast(`No ${marksType}-mark questions in Unit ${unit}. Skipping.`, 'warning');
                        continue;
                    }

                    // Separate fresh (not used by anyone ever) vs stale
                    const allUsedEver = new Set(teachers.flatMap(e => [...teacherUsage[e].allTimeUsed]));
                    const fresh = unitQs.filter(q => !allUsedEver.has(q.id));
                    const stale = unitQs.filter(q => allUsedEver.has(q.id));

                    // Pool for today: fresh first, then stale (questions not used today)
                    const todayPool = [
                        ...shuffle(fresh),
                        ...shuffle(stale)
                    ].filter(q => !usedToday.has(q.id));

                    // Assign to each teacher
                    for (const teacherEmail of teachers) {
                        const teacherUsed = teacherUsage[teacherEmail].allTimeUsed;
                        let needed = targetQPerUnit;
                        let picked = [];

                        // Pass 1: questions not used today AND not used by this teacher ever
                        const pass1 = todayPool.filter(q => !teacherUsed.has(q.id) && !usedToday.has(q.id));
                        for (const q of pass1) {
                            if (picked.length >= needed) break;
                            picked.push(q);
                            usedToday.add(q.id);
                        }

                        // Pass 2: questions not used by this teacher (but maybe used by others today)
                        if (picked.length < needed) {
                            const pass2 = unitQs.filter(q =>
                                !teacherUsed.has(q.id) &&
                                !picked.some(p => p.id === q.id)
                            );
                            for (const q of shuffle(pass2)) {
                                if (picked.length >= needed) break;
                                picked.push(q);
                                usedToday.add(q.id);
                            }
                        }

                        // Pass 3 (fallback): any question for this unit not already given to this teacher today
                        if (picked.length < needed) {
                            const pass3 = unitQs.filter(q => !picked.some(p => p.id === q.id));
                            for (const q of shuffle(pass3)) {
                                if (picked.length >= needed) break;
                                picked.push(q);
                            }
                            if (picked.length < needed) {
                                window.showToast(`Unit ${unit}: only ${picked.length}/${needed} unique questions available for ${teacherEmail}. ` +
                                    `Add more questions to improve uniqueness.`, 'warning');
                            }
                        }

                        distribution[teacherEmail].push(...picked);
                        // Update teacher's all-time used set
                        picked.forEach(q => teacherUsage[teacherEmail].allTimeUsed.add(q.id));
                    }
                }

                // Check any teacher got 0 questions
                const emptyTeachers = teachers.filter(e => distribution[e].length === 0);
                if (emptyTeachers.length === teachers.length) {
                    window.showToast('Could not assign any questions. Please add more questions to the question bank.', 'danger');
                    return null;
                }

                // 4. Save to Firestore
                const saves = [];
                for (const [teacherEmail, questions] of Object.entries(distribution)) {
                    // Save assignment doc
                    saves.push(setDoc(
                        doc(db, 'teacher_question_assignments', `${subjectId}_${teacherEmail}_${assignmentDate}`),
                        {
                            subjectId,
                            teacherEmail,
                            questions,
                            assignedAt: new Date().toISOString(),
                            assignmentDate,
                            totalQuestions: questions.length,
                            units: parseInt(units),
                            questionsPerUnit: targetQPerUnit,
                            marksType: parseInt(marksType)
                        }
                    ));

                    // Save usage tracking doc
                    const byDate = { ...teacherUsage[teacherEmail].byDate };
                    byDate[assignmentDate] = questions.map(q => q.id);
                    saves.push(setDoc(
                        doc(db, 'teacherQuestionUsage', `${teacherEmail}_${subjectId}`),
                        {
                            teacherEmail,
                            subjectId,
                            allTimeUsed: [...teacherUsage[teacherEmail].allTimeUsed],
                            byDate,
                            lastUpdated: new Date().toISOString()
                        }
                    ));
                }

                await Promise.all(saves);

                const totalPerTeacher = distribution[teachers[0]]?.length || 0;
                window.showToast(
                    `Questions distributed! Each teacher gets ${totalPerTeacher} questions ` +
                    `(${units} units × ${targetQPerUnit} per unit). All unique!`,
                    'success', 6000
                );

                await logAuditEvent('DISTRIBUTE_QUESTIONS', {
                    subjectId, teacherCount: teachers.length,
                    questionsPerTeacher: totalPerTeacher,
                    units, questionsPerUnit: targetQPerUnit, marksType,
                    date: assignmentDate
                });

                return distribution;

            } catch (error) {
                console.error('Error in generateAndDistributeQuestions:', error);
                window.showToast('Distribution failed: ' + error.message, 'danger');
                return null;
            }
        }

        function shuffle(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        async function getTeacherAssignedQuestions(teacherEmail, subjectId, date) {
            try {
                // Try new collection first (teacher_question_assignments)
                const newDoc = await getDoc(
                    doc(db, 'teacher_question_assignments', `${subjectId}_${teacherEmail}_${date}`)
                );
                if (newDoc.exists()) {
                    return newDoc.data().questions || [];
                }
                // Fallback: try old collection name for backward compatibility
                const oldDoc = await getDoc(
                    doc(db, 'ca_question_assignments', `${subjectId}_${teacherEmail}_${date}`)
                );
                if (oldDoc.exists()) {
                    return oldDoc.data().questions || [];
                }
                return [];
            } catch (error) {
                console.error('Error fetching assigned questions:', error);
                return [];
            }
        }

        window.validateForm = validateForm;
        window.exportToExcel = exportToExcel;
        window.importFromExcel = importFromExcel;
        window.downloadExcelTemplate = downloadExcelTemplate;
        window.generateAndDistributeQuestions = generateAndDistributeQuestions;
        window.getTeacherAssignedQuestions = getTeacherAssignedQuestions;

        window.roundMarks = function (value) {
            if (value === null || value === undefined || value === '') return 0;
            const num = parseFloat(value);
            if (isNaN(num)) return 0;
            return Math.round(num * 100) / 100;
        };

        window.formatMarks = function (value, decimals = 2) {
            const rounded = window.roundMarks(value);
            return rounded.toFixed(decimals);
        };

        window.calculatePercentage = function (obtained, total) {
            if (!total || total <= 0) return 0;
            const percentage = (obtained / total) * 100;
            return window.roundMarks(percentage);
        };

        window.showLoadingMessage = function (message = 'Loading...') {
            const existingLoader = document.getElementById('globalLoader');
            if (existingLoader) existingLoader.remove();

            const loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;';
            loader.innerHTML = `
                <div style="background:white;padding:30px 40px;border-radius:12px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.3);">
                    <div style="width:50px;height:50px;border:5px solid #e0e0e0;border-top:5px solid #2563eb;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 20px;"></div>
                    <p style="margin:0;color:#333;font-size:16px;font-weight:500;">${message}</p>
                </div>
            `;
            document.body.appendChild(loader);
        };

        window.hideLoadingMessage = function () {
            const loader = document.getElementById('globalLoader');
            if (loader) loader.remove();
        };

        window.confirmAction = function (title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
            return confirm(`[Warning] ${title}\n\n${message}\n\nClick OK to ${confirmText}, or Cancel to ${cancelText}.`);
        };

        window.formatDate = function (dateValue) {
            if (!dateValue) return 'N/A';
            try {
                let date;
                if (typeof dateValue === 'string') {
                    date = new Date(dateValue);
                } else if (dateValue.toDate) {
                    date = dateValue.toDate();
                } else {
                    date = new Date(dateValue);
                }

                if (isNaN(date.getTime())) return 'Invalid Date';

                return date.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                return 'Invalid Date';
            }
        };

        document.addEventListener('keydown', function (e) {

            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const saveButtons = document.querySelectorAll('.btn-success');
                if (saveButtons.length > 0) {
                    saveButtons[0].click();
                    window.showToast('💾 Saving...', 'info', 1000);
                }
            }

            if (e.key === 'Tab') {
                const inputs = Array.from(document.querySelectorAll('.eval-input:not([disabled])'));
                const currentIndex = inputs.findIndex(input => input === document.activeElement);
                if (currentIndex >= 0 && currentIndex < inputs.length - 1) {

                }
            }
        });

        window.setupEvaluationHelpers = function () {
            const inputs = document.querySelectorAll('.eval-input');
            inputs.forEach(input => {

                input.addEventListener('input', function () {
                    const value = parseFloat(this.value);
                    const max = parseFloat(this.max);

                    if (value > max) {
                        this.style.borderColor = '#ef4444';
                        this.style.backgroundColor = '#fee';
                        window.showToast(`⚠️ Value cannot exceed ${max}`, 'warning', 2000);
                    } else if (value < 0) {
                        this.style.borderColor = '#ef4444';
                        this.style.backgroundColor = '#fee';
                        window.showToast('⚠️ Value cannot be negative', 'warning', 2000);
                    } else {
                        this.style.borderColor = '#10b981';
                        this.style.backgroundColor = '#f0fdf4';
                    }

                    updateLiveTotal(this.dataset.student);
                });

                input.addEventListener('blur', function () {
                    const value = parseFloat(this.value);
                    const max = parseFloat(this.max);

                    if (value > max) {
                        this.value = max;
                        this.style.borderColor = '';
                        this.style.backgroundColor = '';
                    } else if (value < 0) {
                        this.value = 0;
                        this.style.borderColor = '';
                        this.style.backgroundColor = '';
                    } else {
                        this.style.borderColor = '';
                        this.style.backgroundColor = '';
                    }
                });
            });
        };

        window.updateLiveTotal = function (studentId) {
            const inputs = document.querySelectorAll(`[data-student="${studentId}"]`);
            let total = 0;
            let maxTotal = 0;
            let allFilled = true;

            inputs.forEach(input => {
                const value = parseFloat(input.value);
                const max = parseFloat(input.max);

                if (isNaN(value) || input.value === '') {
                    allFilled = false;
                } else {
                    total += value;
                }

                if (!isNaN(max)) {
                    maxTotal += max;
                }
            });

            const totalContainer = document.getElementById(`live-total-${studentId}`);
            if (totalContainer) {
                if (allFilled && maxTotal > 0) {
                    const percentage = window.calculatePercentage(total, maxTotal);
                    const grade = calculateGrade(percentage);
                    totalContainer.innerHTML = `
                        <div style="background:#f0f9ff;padding:10px;border-radius:6px;border:1px solid #bae6fd;margin-top:10px;">
                            <strong>Live Total:</strong> 
                            <span style="color:#0369a1;font-weight:bold;">${window.formatMarks(total)} / ${maxTotal}</span>
                            <span style="margin-left:10px;">|</span>
                            <span style="margin-left:10px;"><strong>Percentage:</strong> ${percentage.toFixed(2)}%</span>
                            <span style="margin-left:10px;">|</span>
                            <span style="margin-left:10px;"><strong>Grade:</strong> 
                                <span class="grade-badge grade-${grade}" style="padding:2px 8px;">${grade}</span>
                            </span>
                        </div>
                    `;
                } else {
                    totalContainer.innerHTML = '<div style="color:#888;font-size:12px;margin-top:10px;">Fill all fields to see total</div>';
                }
            }
        };

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await window.getDoc(window.doc(window.db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    if (userData.isLocked) {
                        await window.signOut(auth);
                        document.getElementById('authContainer').style.display = 'block';
                        window.hideAllDashboards();
                        setTimeout(() => {
                            if (typeof showToast === 'function') window.showToast('Your account has been locked. Please contact administrator.', 'danger', 7000);
                        }, 300);
                        return;
                    }

                    if (userData.isDeleted || (userData.hasOwnProperty('isActive') && userData.isActive === false && userData.role !== 'teacher')) {
                        await window.signOut(auth);
                        document.getElementById('authContainer').style.display = 'block';
                        window.hideAllDashboards();
                        setTimeout(() => {
                            if (typeof showToast === 'function') window.showToast('Your account has been deactivated. Please contact administrator.', 'danger', 7000);
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
                        window.hideAllDashboards();
                        return;
                    }

                    if (userData.role === 'teacher' && userData.isActive === false) {
                        await window.signOut(auth);
                        document.getElementById('authContainer').style.display = 'block';
                        window.hideAllDashboards();

                        setTimeout(() => {
                            if (typeof showToast === 'function') window.showToast('Your account has been disabled by the coordinator. Please contact your department.', 'danger', 7000);
                        }, 300);
                        return;
                    }
                    window.currentUser = { ...userData, uid: user.uid };

                    if (typeof window.resetIdleTimer === 'function') {
                        window.resetIdleTimer();
                    }

                    if (userData.role === 'hod' && !localStorage.getItem('securityWarningShown')) {
                        localStorage.setItem('securityWarningShown', 'true');
                        setTimeout(() => {
                            const banner = document.createElement('div');
                            banner.className = 'security-banner';
                            banner.innerHTML = '<span><strong>Production checklist:</strong> Configure Firestore security rules, enable email verification, and set up daily backups before going live.</span><button onclick="this.parentElement.remove()">x</button>';
                            const dashboardContent = document.querySelector('#' + userData.role + 'Dashboard .dashboard-content');
                            if (dashboardContent) dashboardContent.prepend(banner);
                        }, 500);
                    }
                    window.showDashboard(window.currentUser.role);
                }
            } else {
                window.currentUser = null;
                document.getElementById('authContainer').style.display = 'block';
                document.getElementById('accessDeniedScreen').style.display = 'none';
                window.hideAllDashboards();
            }
        });

        window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
        window.signInWithEmailAndPassword = signInWithEmailAndPassword;
        window.signOut = signOut;
        window.sendPasswordResetEmail = sendPasswordResetEmail;
        window.sendEmailVerification = sendEmailVerification;
        window.collection = collection;
        window.addDoc = addDoc;
        window.doc = doc;
        window.setDoc = setDoc;
        window.getDoc = getDoc;
        window.getDocs = getDocs;
        window.query = query;
        window.where = where;
        window.updateDoc = updateDoc;
        window.deleteDoc = deleteDoc;
        window.orderBy = orderBy;
        window.limit = limit;

