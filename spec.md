# SWORD MC Store

## Current State
- Website has Home, Ranks, Coins, Login, Register, Admin Dashboard, and Content Editor pages
- Admin access requires Internet Identity (II) login + hardcoded username `arpit20102010` / password `arpit2010`
- II popup causes "connecting error" issues for the admin
- Admin Dashboard shows orders with approve/reject/delete actions
- Content Editor allows editing ranks, coins, server IP, Discord link

## Requested Changes (Diff)

### Add
- New dedicated **Admin Login Page** (`AdminLoginPage`) accessible via a secret URL or button
- This page has a single password field -- if the user types `arpit2010` and submits, they get full admin access
- No Internet Identity popup required for this admin entry path
- Admin Panel accessible after password entry: shows Orders Dashboard + Editor access (same AdminDashboard and ContentEditorPage)
- A new route `"adminlogin"` added to App.tsx Page type and routing

### Modify
- App.tsx: Add `"adminlogin"` to Page type, add route rendering for `AdminLoginPage`
- App.tsx: When admin password is verified locally (no II needed), set `isAdmin = true` and navigate to `"admin"`
- AdminDashboard header: Add back-navigation to `"adminlogin"` instead of requiring II logout
- HomePage (or nav): Add a hidden/subtle link (e.g. small "Admin" text in footer or nav) that navigates to `"adminlogin"`

### Remove
- Nothing removed -- existing Login page stays for regular players

## Implementation Plan
1. Create `AdminLoginPage.tsx` -- simple password form, on correct password (`arpit2010`) set admin flag and go to admin dashboard
2. Add `"adminlogin"` to Page type in App.tsx
3. Add state for `adminPasswordVerified` in App.tsx; when true, render AdminDashboard without II check
4. Pass `setAdminPasswordVerified` callback to AdminLoginPage
5. Update App.tsx routing: `page === "adminlogin"` renders AdminLoginPage
6. Update App.tsx: `page === "admin"` renders AdminDashboard if `isAdmin || adminPasswordVerified`
7. Update App.tsx: `page === "editor"` renders ContentEditorPage if `isAdmin || adminPasswordVerified`
8. Add subtle "ADMIN" link in HomePage footer area
9. Add deterministic `data-ocid` markers to all new interactive elements
