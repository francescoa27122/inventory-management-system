# Quick Start Guide - 5 Minutes to Running App

## Step-by-Step Instructions

### 1. Open Terminal/Command Prompt

**On Mac:**
- Press Command + Space, type "Terminal", press Enter

**On Windows:**
- Press Windows key, type "cmd", press Enter

### 2. Navigate to Backend Folder

```bash
cd Desktop/inventory-management-system/backend
```

### 3. Install Backend Dependencies

```bash
npm install
```

Wait for it to complete (2-3 minutes)

### 4. Initialize Database

```bash
npm run init-db
```

You should see: ✅ Database initialization complete!

### 5. Start Backend Server

```bash
npm start
```

You should see: 🚀 Server running on port 5000

**Keep this terminal window open!**

### 6. Open New Terminal/Command Prompt Window

Open a second terminal window (don't close the first one)

### 7. Navigate to Frontend Folder

```bash
cd Desktop/inventory-management-system/frontend
```

### 8. Install Frontend Dependencies

```bash
npm install
```

Wait for it to complete (2-3 minutes)

### 9. Start Frontend

```bash
npm start
```

The browser should automatically open to http://localhost:3000

### 10. Login

Use these credentials:
- **Username:** admin
- **Password:** admin123

## That's It! 🎉

You now have a fully functional inventory management system running!

## What's Next?

1. **Explore the Dashboard** - See your inventory summary
2. **Add Items** - Click "Add Item" to create new inventory
3. **Import Excel** - Upload your existing inventory spreadsheet
4. **Create Jobs** - Track projects and assign parts
5. **Compare Prices** - Select items to compare

## Stopping the Application

To stop the application:
1. Go to each terminal window
2. Press `Ctrl + C` (or `Command + C` on Mac)

## Starting Again Later

You don't need to reinstall! Just run:

**Terminal 1 (Backend):**
```bash
cd Desktop/inventory-management-system/backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd Desktop/inventory-management-system/frontend
npm start
```

## Need Help?

Check the main README.md file for:
- Hosting information
- Troubleshooting
- Customization options
- Domain and hosting recommendations

## Recommended Next Steps

1. **Change Admin Password** - Add this feature in the UI
2. **Add Your Inventory** - Start adding your actual items
3. **Create User Accounts** - Add accounts for family members
4. **Plan Deployment** - Review hosting options in README
5. **Get a Domain** - Choose from Namecheap, Google Domains, etc.

---

**Remember:** Keep both terminal windows running for the app to work!
