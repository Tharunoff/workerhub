# WorkerHub - Industrial Worker Marketplace

WorkerHub is a full-stack application that connects skilled industrial workers with employers. Built with Spring Boot (backend) and React (frontend), it provides a platform for worker registration, job posting, and booking management.

## Prerequisites

Before you begin, ensure you have the following installed:
- Java JDK 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.8 or higher

## Setup Instructions

### 1. Database Setup

1. Install MySQL if you haven't already
2. Log in to MySQL and create a new database:
   ```sql
   CREATE DATABASE workerhubdb;
   ```
3. Update MySQL credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```
   (The default file uses username='root' and password='Tharun@2025')

### 2. Backend Setup

1. Navigate to the project root directory:
   ```bash
   cd workerhub
   ```

2. Install Maven dependencies:
   ```bash
   mvn clean install
   ```

3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on http://localhost:8080

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd src/main/frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will start on http://localhost:3000

## Features

- **Worker Registration**: Skilled workers can create profiles with their expertise
- **Employer Registration**: Companies can register to post jobs and hire workers
- **Job Posting**: Employers can post job requirements
- **Worker Search**: Search workers by skill, location, and rate
- **Booking System**: Schedule and manage worker bookings
- **Dashboard**: Separate dashboards for workers and employers

## Project Structure

```
workerhub/
├── src/
│   ├── main/
│   │   ├── java/           # Backend Java code
│   │   │   └── com/workerhub/
│   │   │       ├── auth/   # Authentication components
│   │   │       └── config/ # Configuration classes
│   │   ├── frontend/       # React frontend
│   │   │   ├── src/       # React source code
│   │   │   └── public/    # Static assets
│   │   └── resources/     # Application properties
│   └── test/              # Test files
└── pom.xml               # Maven configuration
```

## Configuration Options

### Backend Configuration
- Database settings: `src/main/resources/application.properties`
- CORS settings: `com.workerhub.config.WebConfig`
- Server port: Default is 8080, can be changed in application.properties

### Frontend Configuration
- API proxy: Configured in package.json
- Environment variables: Create .env file in frontend directory if needed

## Common Issues and Solutions

1. **MySQL Connection Issues**
   - Verify MySQL is running
   - Check credentials in application.properties
   - Ensure database exists

2. **Port Conflicts**
   - Backend port can be changed in application.properties
   - Frontend port can be changed by setting PORT environment variable

3. **CORS Issues**
   - Check WebConfig.java for CORS configuration
   - Verify frontend proxy settings in package.json

## Development Workflow

1. Make backend changes in Java files
2. Spring Boot DevTools will auto-reload changes
3. Make frontend changes in React files
4. React will hot-reload changes automatically

## Building for Production

1. Build the frontend:
   ```bash
   cd src/main/frontend
   npm run build
   ```

2. Build the backend:
   ```bash
   mvn clean package
   ```

3. The complete application will be packaged as a JAR file in the target directory

## Security Notes

1. Change default database credentials
2. Update CORS settings for production
3. Configure proper authentication for production use
4. Use environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.