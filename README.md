# COMX Backend (NestJS, Prisma, Docker, Railway)

This is a MFB (Micro Finance Bank) backend application built with NestJS, Prisma, Docker, and deployed on Railway. It provides authentication, user management (individual and corporate), and password recovery functionalities.

## 🚀 Technologies Used

- **Node.js** - JavaScript runtime environment
- **NestJS** - Backend framework
- **Prisma** - ORM for database management
- **PostgreSQL** - Relational database
- **Docker** - Containerization for development and deployment
- **Railway** - Cloud deployment platform
- **Swagger** - API Documentation
- **Jest** - Testing framework

## 📂 Project Structure

```
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── prisma/
│   │   └── prisma.service.ts
│   ├── user/
│   │   ├── dto/
│   │   ├── user.controller.ts
│   │   └── user.service.ts
│   ├── main.ts
├── test/
│   └── user.e2e-spec.ts
├── .env
├── .env.test
├── docker-compose.yml
├── Dockerfile
├── package.json
├── yarn.lock
└── README.md
```

## ⚙️ Installation

```bash
# Clone the repo
git clone https://github.com/your-repository/crm-backend.git
cd crm-backend

# Install dependencies
yarn install

# Generate Prisma Client
yarn prisma generate

# Run database migrations
yarn prisma migrate dev --name init
```

## 🛡️ Environment Variables

Set up the following environment variables in your `.env` and `.env.test` files:

```
DATABASE_URL=postgresql://username:password@localhost:5432/comx
JWT_SECRET=your_jwt_secret
PORT=3000
```

On Railway, configure these under Settings > Variables for both `.env` and `.env.test` environments.

## 🐳 Docker Setup

```bash
# Build and run the containers
docker-compose up -d --build

# Stop containers
docker-compose down
```

Docker Compose configuration (`docker-compose.yml`):

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:13
    container_name: crm_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: comx
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

## ☁️ Deployment (Railway)

1. Create a New Project on Railway.
2. Connect your GitHub repository.
3. Add the necessary environment variables.
4. Deploy your project — Railway will build the Docker container and deploy it.

✅ Make sure to use your Railway domain for Swagger documentation instead of localhost:

```
https://your-railway-domain.up.railway.app/api/docs
```

## 📜 API Documentation

The app uses Swagger to generate interactive API documentation.

- Access the docs locally: `http://localhost:3000/api/docs`
- Access in production: `https://your-railway-domain.up.railway.app/api/docs`

## 🔐 Authentication Endpoints

1. **Individual Signup**

   ```http
   POST /auth/signup/individual
   ```

   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john@example.com",
     "password": "password123",
     "phone": "1234567890"
   }
   ```

2. **Corporate Signup**

   ```http
   POST /auth/signup/corporate
   ```

   ```json
   {
     "companyName": "Acme Inc",
     "businessType": "SERVICE",
     "dateOfIncorporation": "2020-01-01",
     "companyEmail": "acme@example.com",
     "password": "secret"
   }
   ```

3. **Login**

   ```http
   POST /auth/login
   ```

   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

   Response:

   ```json
   {
     "access_token": "your_jwt_token"
   }
   ```

4. **Get Current User Profile**

   ```http
   GET /user/me
   ```

   Headers:

   ```
   Authorization: Bearer {access_token}
   ```

## 🔄 OTP & Password Reset Endpoints

1. **Verify Signup OTP**

   ```http
   POST /auth/verify-otp
   ```

   ```json
   {
     "email": "john@example.com",
     "otp": "123456"
   }
   ```

2. **Request Password Reset**

   ```http
   POST /auth/request-password-reset
   ```

   ```json
   {
     "email": "john@example.com"
   }
   ```

3. **Verify Reset Password OTP**

   ```http
   POST /auth/verify-reset-password-otp
   ```

   ```json
   {
     "email": "john@example.com",
     "otp": "654321"
   }
   ```

4. **Reset Password**

   ```http
   PUT /auth/reset-password
   ```

   ```json
   {
     "email": "john@example.com",
     "token": "654321",
     "newPassword": "newPassword123"
   }
   ```

## 🧪 Running Tests

```bash
# Run unit and integration tests
yarn test

# Run end-to-end tests
yarn test:e2e
```

## 🚀 Production Build

```bash
# Build the project
yarn build

# Start the production server
yarn start:prod
```

## 🤝 Contributing

1. Fork the repo
2. Create a new branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is open-source and available under the MIT License.

## 🌟 Acknowledgements

Special thanks to the open-source community and libraries that made this project possible!

Happy Coding! 🚀
