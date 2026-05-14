Full Secure Authentication System

A secure authentication and document management system built with role-based access control, multi-factor authentication, file encryption, and digital signatures.

Features
Authentication
Email and password registration with strong password validation:
Minimum 8 characters
Uppercase and lowercase letters
Numbers
Special characters
Google and GitHub OAuth login
Two-Factor Authentication (2FA) using Google Authenticator
JWT-based session management
Role-Based Access Control (RBAC)

The system implements role-based access control to manage user permissions securely.

User
Upload documents
Download personal documents
Delete personal documents
Verify document integrity
Manager
View all uploaded documents
Delete documents
Verify document integrity
Admin
Full access to all documents
Download and delete any document
Verify document integrity
Manage users and permissions
Secure Document Management
File upload support:
PDF
DOCX
PPT
PPTX
Maximum file size: 5 MB
AES-256 file encryption before storage
SHA-256 hashing for integrity verification
RSA digital signatures for authentication
Security
HTTPS support using SSL/TLS
Encrypted file storage
Password hashing with bcrypt
Secure session management
Getting Started
Prerequisites
Node.js v18 or later
MySQL
npm or yarn
Installation
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
Environment Variables
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-32-character-key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
Generate SSL Certificates
node generate-ssl.js
Database Setup
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'manager', 'user'),
  twofa_secret VARCHAR(255)
);

CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  original_name VARCHAR(255),
  encrypted_name VARCHAR(255),
  hash_value TEXT,
  signature_value TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
Run the Server
# Start the application
node app.js
Server Ports
Protocol	Port
HTTP	3000
HTTPS	3001

HTTPS requires generated SSL certificates.

Project Structure
backend/
├── config/
│   ├── db.js
│   └── passport.js
│
├── controllers/
│   ├── authController.js
│   └── documentController.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── routes/
│   ├── authRoutes.js
│   └── documentRoutes.js
│
├── utils/
│   ├── encryption.js
│   ├── hash.js
│   └── signature.js
│
├── keys/
├── uploads/
├── app.js
└── generate-ssl.js

frontend/
├── js/
├── css/
└── *.html

README.md
Security Workflow
Document Upload Process
User Upload
   ↓
Multer Processing
   ↓
AES-256 Encryption
   ↓
SHA-256 Hash Generation
   ↓
RSA Digital Signature
   ↓
Database Storage
Document Download Process
Request
   ↓
Authentication Check
   ↓
RSA Signature Verification
   ↓
SHA-256 Integrity Verification
   ↓
AES-256 Decryption
   ↓
File Delivery
Two-Factor Authentication Flow
Login
   ↓
Email and Password Verification
   ↓
Google Authenticator Code Verification
   ↓
JWT Token Generation
API Endpoints
Authentication Routes
Method	Endpoint	Description
POST	/api/auth/register	Register a new account
POST	/api/auth/login	User login
POST	/api/auth/verify-2fa	Verify 2FA code
GET	/api/auth/google	Google OAuth login
GET	/api/auth/github	GitHub OAuth login
Document Routes
Method	Endpoint	Description
POST	/api/documents/upload	Upload and encrypt documents
GET	/api/documents	Retrieve documents
GET	/api/documents/download/:id	Download and decrypt document
DELETE	/api/documents/:id	Delete document
GET	/api/documents/verify/:id	Verify document integrity
Usage Guide
Register a new account
Configure Google Authenticator for 2FA
Log in using email, password, and 2FA code
Upload documents securely
Verify document integrity and signature
Download decrypted documents when needed
Demo Notes
Wireshark MITM Demonstration
Protocol	Port	Data Visibility
HTTP	3000	Plain text data may be visible
HTTPS	3001	Encrypted and secure communication