# Inventory System - Two Section Setup Instructions

## Overview
Your inventory system now has TWO separate sections:
1. **Main Shop Inventory** - For your auto body shop parts
2. **Tire Shop Inventory** - For your tire shop supplies

## Setup Steps

### Step 1: Add the section column to the database
Run this command from the backend directory:

```bash
cd backend
node src/addInventorySections.js
```

This will add a new `section` column to your inventory_items table.

### Step 2: Import the Tire Shop inventory
To import your FINAL Supplies Table.xlsx into the Tire Shop section:

```bash
node src/importTireShop.js
```

**Note:** This script will automatically:
- Read the Excel file from your Desktop
- Import all items with `section = 'Tire Shop'`
- Show you a summary of successful/failed imports

### Step 3: Restart your servers

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend  
npm start
```

## What Changed

### Backend Changes:
1. ✅ Added `section` column to database
2. ✅ Updated API routes to filter by section
3. ✅ Created migration script (`addInventorySections.js`)
4. ✅ Created tire shop import script (`importTireShop.js`)

### Frontend Changes:
1. ✅ Added section tabs (Main Shop / Tire Shop)
2. ✅ Items filtered by active section
3. ✅ New items automatically go to the active section
4. ✅ Can move items between sections in edit modal

## Using the System

### Viewing Inventory:
- Click "Main Shop Inventory" tab to see auto body parts
- Click "Tire Shop Inventory" tab to see tire shop supplies
- Each section has independent search and filtering

### Adding Items:
1. Switch to the section you want (Main Shop or Tire Shop)
2. Click "Add Item"
3. Item will automatically be added to the active section

### Editing Items:
- Click the edit button on any item
- You can change the section in the edit modal dropdown

### Current Data:
- **Main Shop**: Contains your FinalParts.xlsx data (already imported)
- **Tire Shop**: Will contain FINAL Supplies Table.xlsx data (after running Step 2)

## File Locations

**Migration Scripts:**
- `/backend/src/addInventorySections.js` - Adds section column
- `/backend/src/importTireShop.js` - Imports tire shop data

**Updated Files:**
- `/backend/src/routes/inventory.js` - API routes with section filtering
- `/frontend/src/pages/Inventory.js` - UI with two section tabs
- `/frontend/src/pages/Inventory.css` - Styling for section tabs

## Troubleshooting

### If the Excel import fails:
The script tries multiple column name variations. Make sure your Excel has columns like:
- Item Name / item_name / Name
- Quantity / quantity / Qty
- Unit Price / unit_price / Price

### If you see database errors:
Run the migration script again:
```bash
node src/addInventorySections.js
```

### To check what sections exist:
Query the database:
```sql
SELECT DISTINCT section FROM inventory_items;
```

## Next Steps

1. Run the migration (Step 1)
2. Import your tire shop data (Step 2)
3. Restart both servers (Step 3)
4. Visit http://localhost:3000/inventory
5. Toggle between Main Shop and Tire Shop tabs!

---

**Need help?** All your existing inventory items are still there, they're just now in the "Main Shop" section by default.
