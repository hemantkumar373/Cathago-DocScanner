# Credit-Based Document Scanning System

## Overview
The Document Scanning and Matching System is a self-contained web application designed to allow users to efficiently scan, manage, and match documents. The system includes a built-in credit system that provides users with a daily limit of 20 free scans, with the option to request additional credits. This project aims to enhance document management through user-friendly features and AI-powered document matching capabilities.

## Bonus Features
- Automated credit reset at midnight (local time).
- User activity logs to track scans and credit requests.
- Admin dashboard for approving credits and viewing analytics.
- Multi-user support to handle multiple users on the same local server.

## Admin Access
- Email: admin@gmail.com
- Password: admin123

## Features

### Credit System:
- Each user gets 20 free scans per day (auto-reset at midnight).
- Users must request additional credits if they exceed their limit.
- Admins can approve or deny credit requests.
- Each document scan deducts 1 credit from the user’s balance.

### Document Scanning & Matching:
- Users upload a plain text file for scanning.
- System scans and compares it against existing stored documents.
- Returns similar documents based on basic text similarity algorithms.

### Smart Analytics Dashboard:
- Track the number of scans per user per day.
- Identify most common scanned document topics.
- View top users by scans and credit usage.
- Generate credit usage statistics for admins

### Daily Free Credits:
- Every user starts with 20 free credits at midnight (local server reset).
- If credits are exhausted, the user must wait till the next day or request admin approval for more credits.

### Admin Credit Management:
- Users can submit a request for additional credits.
- Admin can approve or deny requests.
- Admin can manually adjust user credit balances.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js (Express)
- **Database**: SQLite
- **File Storage**: Stored documents locally
- **Authentication**: Basic username-password login (hashed passwords)
- **Text Matching Logic**: Custom algorithm using Levenshtein distance, word frequency

## Setup Instructions

### Backend Setup
- Navigate to the backend directory:
   ```bash
   cd backend
   ```
- Install the required dependencies:
   ```bash
   npm install
   ```

- Start the backend server using:
   ```bash
   npm run dev
   ```
- The backend server will run on `http://localhost:3000`.

### Frontend Setup
- Open the frontend directory in Visual Studio Code:
   ```bash
   cd ../frontend
   code .
   ```
- Install the Live Server extension for Visual Studio Code if you haven't already.
- Open the `index.html` file in the frontend directory.
- Right-click on the `index.html` file and select "Open with Live Server".
- The frontend will be accessible at `http://localhost:5500` (or another port if specified).

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contribution Guidelines
We welcome contributions! Please fork the repository and submit a pull request for any changes.
Ensure your code follows the project's coding standards and includes appropriate tests.

## Contact
For questions or support, please contact [kumarhemant3002@gmail.com].