# Quick Start Guide

## Get Your Inventory System Running in 5 Minutes

### Step 1: Open Terminal

On Mac: Press `Cmd + Space`, type "Terminal", press Enter

### Step 2: Navigate to Backend Folder

```bash
cd /Users/francescoassalone/Desktop/inventory-management-system/backend
```

### Step 3: Install Backend Dependencies

```bash
npm install
```

Wait for it to complete (may take 2-3 minutes)

### Step 4: Initialize Database

```bash
npm run init-db
```

You should see: ✅ Database initialization complete!

### Step 5: Start Backend Server

```bash
npm start
```

You should see: 🚀 Server running on port 5000

**Keep this terminal window open!**

### Step 6: Open New Terminal Window

Press `Cmd + N` or open another Terminal window

### Step 7: Navigate to Frontend Folder

```bash
cd /Users/francescoassalone/Desktop/inventory-management-system/frontend
```

### Step 8: Install Frontend Dependencies

```bash
npm install
```

Wait for it to complete (may take 3-5 minutes)

### Step 9: Start Frontend Server

```bash
npm start
```

Your browser will automatically open to http://localhost:3000

### Step 10: Login

Use these default credentials:
- **Username:** admin
- **Password:** admin123

---

## You're Done! 🎉

You can now:
- ✅ Add inventory items
- ✅ Import Excel files
- ✅ Compare prices
- ✅ Create and manage jobs
- ✅ Track your family business inventory

---

## Troubleshooting

**Problem:** "npm: command not found"
- **Solution:** Install Node.js from https://nodejs.org

**Problem:** Port 5000 already in use
- **Solution:** Stop other applications using port 5000, or change the PORT in backend/.env

**Problem:** Page won't load
- **Solution:** Make sure BOTH terminal windows are still running (backend and frontend)

---

## Next Steps

1. **Change your password** after first login
2. **Add your inventory items** or import from Excel
3. **Create users** for other family members
4. **When ready to go online**, see DEPLOYMENT_GUIDE.md

---

## Stopping the Application

To stop the servers:
1. Go to each terminal window
2. Press `Ctrl + C`
3. Type `Y` if asked to confirm

## Starting Again Later

Just repeat Steps 5 and 9:
1. Terminal 1: `cd backend` then `npm start`
2. Terminal 2: `cd frontend` then `npm start`
