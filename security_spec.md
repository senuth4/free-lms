# Security Spec

## Data Invariants
- Teachers, courses, ads, subjects, subcategories can be read by anyone.
- Only authenticated users (admins) can modify any data.
- Admins are authenticated via Google Auth and their emails must be verified. We will only allow a hardcoded set of admin emails or assume any authenticated user with a specific email is admin. Since the system has no user verification, we will implement an `admins` collection and verify existence or just allow any authenticated user for this prototype, but security rules must be tight. For simplicity and following the guidelines, `isAdmin()` checks if `/databases/$(database)/documents/admins/$(request.auth.uid)` exists.
- All documents require strict schema validation on creation and updates.

## Dirty Dozen Payloads
- T1: Create course anonymously (Fail)
- T2: Create course with missing title (Fail)
- T3: Update course title as non-admin (Fail)
- ...

