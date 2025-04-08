# TAMS - Transport Agencies Management System

## Description
TAMS (Transport Agencies Management System) is a comprehensive web platform designed to digitize and streamline operations for transport agencies. The system features role-based dashboards for Administrators, Operations Managers, and Fuel Managers, enabling effective monitoring and management of transport operations including vehicle tracking, driver management, shift scheduling, and fuel consumption monitoring.

## Key Features

### Agency Management
- User role management (Admin, Fleet Manager, Fuel Manager)
- Vehicle information tracking and dashboard
- Driver profiles and performance monitoring
- Shift scheduling and management
- Package tracking and delivery management
- Real-time operational analytics

### Data Visualization
- Vehicle and driver status distribution
- Daily shift activity tracking
- Fuel consumption trends
- Top utilized vehicles and most active drivers reports
- Interactive data filtering and export capabilities

## System Architecture

TAMS is built using a modern technology stack:

- **Frontend**: React.js with Next.js, Tailwind CSS, Shadcn UI, ANT Design
- **State Management**: Redux
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token) with bcryptjs
- **Email Services**: Nodemailer, Resend
- **Data Visualization**: Chart.js
- **Data Export**: xlsx library

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/mnshimiyimana/TAMS-project
cd agency_system     # For Frontend
cd Backend           # For Backend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create `.env` files in both frontend and backend directories with the necessary configuration parameters.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## User Interfaces

### Login and Registration
- Secure authentication system
- Password reset functionality
- User profile management

### Role-Based Dashboards
- Agency Administrator: Complete system oversight, agency and user management
- Operations Manager: Driver, vehicle, shift, and package management
- Fuel Manager: Fuel consumption tracking and reporting

## Design and Documentation

### Design Files
[Figma Design](https://www.figma.com/design/5SRZjQWpoCjwKKEMFl5Bh0/Agencies-Management-System?node-id=5-293&t=1eySzK1MvcRmY3u4-0)

## Deployment

The application is deployed on:
- Frontend: [Vercel](http://tams-project.vercel.app/)
- Backend: [Render](https://tams-project.onrender.com/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Maureen Tuyitetere NSHIMIYIMANA
