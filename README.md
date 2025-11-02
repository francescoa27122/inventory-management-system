# Inventory Management System

A full-stack inventory and job management system built for automotive shops, featuring separate tracking for Tire Shop and Body Shop sections.

## 🚀 Features

### Inventory Management
- **Dual Section Tracking** - Separate inventory for Tire Shop and Body Shop
- **Real-time Search** - Quick filtering of inventory items
- **CSV Import** - Bulk import inventory data
- **Price Tracking** - Automatic pricing for all parts
- **Low Stock Alerts** - Dashboard alerts for items below threshold
- **Category Management** - Organized part categorization

### Jobs Management
- **Job Creation** - Track customer jobs with details
- **Part Assignment** - Link inventory items to specific jobs
- **Part Status Tracking** - Monitor if parts are Ordered, Ordering, or Received
- **Cost Calculation** - Automatic job cost totaling
- **Job Status** - Active, Completed, and Cancelled states
- **Document Ready** - Frontend prepared for file uploads

### Dashboard
- **Inventory Overview** - Total items and value by section
- **Low Stock Monitoring** - Color-coded alerts (Critical, Warning, Low)
- **Active Jobs Count** - Quick view of current workload
- **Section Values** - Separate Tire Shop and Body Shop totals

### User Interface
- **Dark Mode** - Eye-friendly dark theme with toggle
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, professional interface
- **Status Badges** - Color-coded visual indicators

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Lucide React icons
- CSS3 with CSS variables

### Backend
- Node.js
- Express.js
- Better-sqlite3 database
- JWT authentication
- RESTful API

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/inventory-management-system.git
cd inventory-management-system
```

### 2. Setup Backend
```bash
cd backend
npm install
npm run init-db
npm start
```
Backend will run on `http://localhost:3001`

### 3. Setup Frontend
```bash
cd frontend
npm install
npm start
```
Frontend will run on `http://localhost:3000`

## 🔐 Default Login

**Username:** `admin`  
**Password:** `admin123`

## 📁 Project Structure

```
inventory-management-system/
├── backend/
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Auth middleware
│   │   └── server.js     # Express server
│   ├── scripts/          # Utility scripts
│   └── database.sqlite   # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── context/      # React context
│   └── public/
└── README.md
```

## 🎨 Features in Detail

### Inventory Section Tabs
- Switch between Tire Shop and Body Shop inventory
- Independent tracking and management
- Section-specific low stock alerts

### Job Management
- Create jobs with customer information
- Assign parts with quantity tracking
- Monitor part ordering status
- View total job costs
- Delete completed or cancelled jobs

### Dashboard Analytics
- Tire Shop inventory value
- Body Shop inventory value
- Low stock items table with status indicators
- Active jobs counter

### Dark Mode
- Toggle between light and dark themes
- Persistent preference storage
- Smooth color transitions
- Optimized for reduced eye strain

## 🔧 Configuration

### Environment Variables

Create `.env` file in backend directory:
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key-here
```

### Database

The system uses SQLite for easy setup. Database schema includes:
- Users
- Inventory Items
- Jobs
- Job Items
- Import Logs

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Inventory
- `GET /api/inventory` - Get all items
- `GET /api/inventory/:id` - Get single item
- `POST /api/inventory` - Create item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- `POST /api/inventory/import` - CSV import

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:id/items` - Add parts to job
- `DELETE /api/jobs/:jobId/items/:itemId` - Remove part from job

## 🚧 Future Enhancements

- [ ] File upload for job documents/photos
- [ ] PDF invoice generation
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Multi-user roles and permissions
- [ ] Backup and restore functionality
- [ ] Mobile app

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is [MIT](LICENSE) licensed.

## 👤 Author

**Your Name**
- GitHub: [@francescoa27122](https://github.com/francescoa27122)

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for automotive shop management
- Optimized for real-world use

---

Made with ❤️ for efficient inventory management
