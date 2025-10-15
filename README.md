# Family Business Inventory Management System

A complete web-based inventory management system built with React and Node.js.

## Features

- ✅ User Authentication (Login/Logout)
- ✅ Dashboard with statistics and low stock alerts
- ✅ Inventory Management (Add, Edit, Delete items)
- ✅ Excel Import functionality
- ✅ Price Comparison tool
- ✅ Jobs Management (Create and track projects)
- ✅ Responsive design for mobile and desktop

## Tech Stack

**Frontend:**
- React.js 18
- React Router for navigation
- Axios for API calls
- Lucide React for icons

**Backend:**
- Node.js with Express
- SQLite database (better-sqlite3)
- JWT authentication
- Bcrypt for password hashing
- Multer for file uploads
- SheetJS for Excel processing

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Initialize Database

```bash
npm run init-db
```

This will create the database with sample data and a default admin user:
- Username: `admin`
- Password: `admin123`

### Step 3: Start Backend Server

```bash
npm start
```

The backend will run on http://localhost:5000

### Step 4: Install Frontend Dependencies

Open a new terminal window:

```bash
cd frontend
npm install
```

### Step 5: Start Frontend Development Server

```bash
npm start
```

The frontend will run on http://localhost:3000 and automatically open in your browser.

## Default Login Credentials

- **Username:** admin
- **Password:** admin123

## Usage

### Dashboard
- View inventory statistics
- See low stock alerts
- Quick access to common actions

### Inventory
- Add new items manually
- Import items from Excel/CSV files
- Edit and delete existing items
- Search and filter inventory

### Price Comparison
- Select multiple items to compare
- View price statistics (lowest, highest, average)
- See detailed comparisons side-by-side

### Jobs
- Create new jobs for projects
- Track job status (Active, Completed, Cancelled)
- View job details and associated parts

## Excel Import Format

Your Excel file should include these columns:
- **Item Name** (required)
- **Quantity** (required)
- **Unit Price** (required)
- Category (optional)
- Supplier (optional)
- Location (optional)
- Description (optional)
- SKU (optional)

## Deployment

### Building for Production

#### Backend:
```bash
cd backend
# Set NODE_ENV to production in .env file
# Deploy to your hosting provider
```

#### Frontend:
```bash
cd frontend
npm run build
```

The build folder will contain the optimized production files.

### Recommended Hosting Options

**For Complete Solution:**
1. **Heroku** - Easy deployment, includes database
2. **DigitalOcean App Platform** - $5-10/month
3. **Railway** - Modern deployment platform
4. **Render** - Free tier available

**For Domain:**
1. **Namecheap** - $8-12/year
2. **Google Domains** - $12/year
3. **GoDaddy** - $10-15/year

### Deployment Steps:

1. **Choose a hosting provider** from the recommendations above
2. **Register a domain name** (optional but recommended)
3. **Deploy backend:**
   - Upload backend code to hosting provider
   - Set environment variables
   - Run database initialization
4. **Build and deploy frontend:**
   - Run `npm run build` in frontend folder
   - Upload build folder or configure hosting for React apps
5. **Configure domain** to point to your hosted application

### Environment Variables for Production

Create a `.env` file in the backend folder:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-very-long-random-secret-key-here-change-this
```

**IMPORTANT:** Change the JWT_SECRET to a long random string for security!

## Project Structure

```
inventory-management-system/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Auth middleware
│   │   ├── server.js        # Express server
│   │   └── initDatabase.js  # Database setup
│   ├── uploads/             # Uploaded Excel files
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── App.js
    │   └── index.js
    ├── public/
    └── package.json
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- GET `/api/auth/me` - Get current user

### Inventory
- GET `/api/inventory` - Get all items
- GET `/api/inventory/:id` - Get single item
- POST `/api/inventory` - Create new item
- PUT `/api/inventory/:id` - Update item
- DELETE `/api/inventory/:id` - Delete item
- POST `/api/inventory/import` - Import from Excel
- POST `/api/inventory/compare` - Compare items

### Jobs
- GET `/api/jobs` - Get all jobs
- GET `/api/jobs/:id` - Get job details
- POST `/api/jobs` - Create new job
- PUT `/api/jobs/:id` - Update job
- DELETE `/api/jobs/:id` - Delete job
- POST `/api/jobs/:id/items` - Add items to job

## Troubleshooting

### Backend won't start
- Make sure you ran `npm run init-db` first
- Check that port 5000 is not in use
- Verify all dependencies are installed

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check the proxy setting in frontend/package.json
- Clear browser cache and reload

### Excel import not working
- Verify your Excel file has required columns
- Check file format (.xlsx, .xls, or .csv)
- Ensure file size is under 10MB

## Support

For issues or questions, check:
1. Make sure all dependencies are installed
2. Verify database was initialized properly
3. Check console for error messages
4. Ensure both frontend and backend are running

## License

This project is for family business use.

## Future Enhancements

- Barcode scanning
- Email notifications for low stock
- Advanced reporting
- Mobile app
- Multi-location support
- Purchase order management
