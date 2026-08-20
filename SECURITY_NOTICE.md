# Security Notice & Administrator Action Guide

This document contains critical manual actions that **must** be taken by the project administrator to ensure complete security.

---

## 1. 🔴 CRITICAL: Rotate Firebase Service Account Key (SEC-01)

A Firebase Admin SDK service account key file (`service-account.json`) was previously present in the repository root. Although it is now excluded by `.gitignore`, the private key itself **must be revoked and rotated immediately in the Google Cloud / Firebase Console**:

### Steps to Rotate:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select the project: **`evaluator-489d3`**.
3. Click the ⚙️ (Gear icon) next to Project Overview → **Project settings**.
4. Go to the **Service accounts** tab.
5. Under **Firebase Admin SDK**, find the active private key (Key ID ending in `...0a`).
6. Click **Generate new private key** (save it in a secure password manager or server environment, NEVER inside frontend web roots).
7. Delete / Revoke the old compromised private key.

---

## 2. 🟠 Zombie Firebase Authentication Accounts Cleanup (BUG-10 / MED-10)

Because this web application operates entirely client-side using the Firebase JavaScript SDK, user deletions performed by the HOD or Coordinator remove the user's Firestore document (which disables their app access). However, deleting the underlying Firebase Authentication account requires the server-side Admin SDK.

### Recommendation for Administrator:
1. Periodically check the **Firebase Console → Authentication → Users** tab.
2. Cross-reference with the active users list in the HOD dashboard.
3. Delete any orphaned or rejected authentication accounts directly from the Firebase Console.

---

## 3. 🟡 Firestore Security Rules Review (SEC-02 / SEC-04)

All client-side role validation has been strengthened with Firestore database re-verification. To enforce strict backend security at the database layer, ensure your **Firestore Security Rules** in Firebase Console are configured to validate caller roles:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isHOD() {
      return request.auth != null && getUserData().role == 'hod';
    }
    
    function isCoordinator() {
      return request.auth != null && (getUserData().role == 'coordinator' || isHOD());
    }
    
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if isHOD() || request.auth.uid == userId;
    }
    
    match /audit_logs/{logId} {
      allow read: if isHOD();
      allow create: if request.auth != null;
    }
    
    match /subjects/{subjectId} {
      allow read: if request.auth != null;
      allow write: if isCoordinator();
    }
    
    match /exams/{examId} {
      allow read: if request.auth != null;
      allow write: if isCoordinator();
    }
    
    match /results/{resultId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```
