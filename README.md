# Project Name

[![codecov](https://codecov.io/gh/shakayet/AutoParts-E-commerce-Marketplace/branch/main/graph/badge.svg)](https://codecov.io/gh/shakayet/AutoParts-E-commerce-Marketplace)

This is a template project for backend development using Typescript, Node.js, Express, Mongoose, Bcrypt, JWT, AWS SES, Multer, ESLint, and Prettier. The aim is to reduce setup time for new backend projects.

## Features

- **Authentication API:** Complete authentication system using JWT for secure token-based authentication and bcrypt for password hashing.
- **File Upload:** Implemented using Multer with efficient file handling and short-term storage.
- **Unified Image Pipeline:** All uploaded images are preprocessed (resized/compressed/converted) via a dedicated `StorageService` before being pushed to AWS S3, and CloudFront is used for delivery. Lifecycle management ensures that replaced or deleted assets are cleaned up from the bucket automatically.
- **Data Validation:** Robust data validation using Zod and Mongoose schemas.
- **Code Quality:** Ensured code readability and quality with ESLint and Prettier.
- **Email Service:** Transactional emails (OTP, password reset, notifications) sent through AWS SES v3 SDK with exponential-backoff retries, logging, and HTML+plain text multipart content.
- **File Handling:** Efficient file deletion using `fs.unlink`.
- **Environment Configuration:** Easy configuration using a `.env` file.
- **Logging:** Logging with Winston and file rotation using DailyRotateFile.
- **API Request Logging:** Logging API requests using Morgan.

## Tech Stack

- Typescript
- Node.js
- Express
- Mongoose
- Bcrypt
- JWT
- AWS SES (email delivery) + AWS S3 (file storage) via @aws-sdk v3
- Multer
- ESLint
- Prettier
- Winston
- Daily-winston-rotate-file
- Morgen
- Socket

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Ensure you have the following installed:

- Node.js
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/your-repository.git
   cd your-repository
   ```

2. **Install dependencies:**

   Using npm:

   ```bash
   npm install
   ```

   Using yarn:

   ```bash
   yarn install
   ```

3. **Create a `.env` file:**

   In the root directory of the project, create a `.env` file and add the following variables. Adjust the values according to your setup.

   ```env
   # Basic
   NODE_ENV=development
   DATABASE_URL=mongodb://127.0.0.1:27017/project_name
   IP_ADDRESS=192.0.0.0
   PORT=5000

   # Bcrypt
   BCRYPT_SALT_ROUNDS=12

   # JWT
   JWT_SECRET=jwt_secret
   JWT_EXPIRE_IN=1d

   # Email (AWS SES - sender address/domain must be verified in SES)
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME="Your Brand Name"

   # AWS credentials (used by both SES for email and S3 for file storage)
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   AWS_BUCKET=your-s3-bucket-name
   ```

4. **Run the project:**

   Using npm:

   ```bash
   npm run dev
   ```

   Using yarn:

   ```bash
   yarn run dev
   ```

### Running the Tests

Explain how to run the automated tests for this system.

```bash
npm test
```

# AUTOPASS E-COMMERCE
