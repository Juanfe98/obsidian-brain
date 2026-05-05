# Express Project Step-by-Step Guide

This guide creates a clean Express backend project using Node.js, Express, JavaScript ES Modules, layered architecture, middleware, centralized error handling, validation, and a simple JWT authentication example.

---

## 1. What we are building

We will create a small API with this structure:

```txt
express-api/
  src/
    config/
      env.js
    controllers/
      auth.controller.js
      user.controller.js
    errors/
      AppError.js
    middleware/
      auth.middleware.js
      error.middleware.js
      logger.middleware.js
      notFound.middleware.js
      validate.middleware.js
    repositories/
      user.repository.js
    routes/
      auth.routes.js
      user.routes.js
    services/
      auth.service.js
      user.service.js
    utils/
      asyncHandler.js
      jwt.js
    app.js
    server.js
  .env
  .gitignore
  package.json
```

### Responsibility by layer

```txt
server.js       -> Starts the HTTP server
app.js          -> Configures Express, middleware, routes, and error handling
routes/         -> Defines endpoints and maps them to controllers
controllers/    -> Handles HTTP request/response logic
services/       -> Contains business logic
repositories/   -> Handles data access
middleware/     -> Runs reusable logic in the request pipeline
errors/         -> Custom error classes
utils/          -> Shared helpers
config/         -> Environment/configuration logic
```

The main idea is:

> Keep controllers thin, move business logic into services, and isolate data access in repositories.

---

## 2. Initialize the project

```bash
mkdir express-api
cd express-api
npm init -y
```

Install dependencies:

```bash
npm install express dotenv jsonwebtoken bcryptjs zod cors helmet morgan
```

Install dev dependencies:

```bash
npm install -D nodemon
```

Update `package.json`:

```json
{
  "name": "express-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "bcryptjs": "latest",
    "cors": "latest",
    "dotenv": "latest",
    "express": "latest",
    "helmet": "latest",
    "jsonwebtoken": "latest",
    "morgan": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "nodemon": "latest"
  }
}
```

Because we use:

```json
"type": "module"
```

We can use ES Modules syntax:

```js
import express from "express";
export default app;
```

Instead of CommonJS:

```js
const express = require("express");
module.exports = app;
```

---

## 3. Create the folders

```bash
mkdir -p src/config src/controllers src/errors src/middleware src/repositories src/routes src/services src/utils
```

---

## 4. Environment variables

Create `.env`:

```env
PORT=3000
JWT_SECRET=super-secret-dev-key
JWT_EXPIRES_IN=1h
NODE_ENV=development
```

Create `.gitignore`:

```gitignore
node_modules
.env
```

Create `src/config/env.js`:

```js
import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  nodeEnv: process.env.NODE_ENV || "development",
};

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is required");
}
```

### Why this matters

Do not hardcode secrets in code. Use environment variables or a real secret manager in production.

---

## 5. Create the Express app

Create `src/app.js`:

```js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import { loggerMiddleware } from "./middleware/logger.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json({ limit: "1mb" }));

// HTTP request logging
app.use(morgan("dev"));

// Custom logger middleware
app.use(loggerMiddleware);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// 404 handler - must be after routes
app.use(notFoundMiddleware);

// Centralized error handler - must be last
app.use(errorMiddleware);

export default app;
```

Create `src/server.js`:

```js
import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
```

Run the server:

```bash
npm run dev
```

Test:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

## 6. Important concept: middleware

Middleware is a function that runs during the request/response lifecycle.

Normal middleware has this shape:

```js
(req, res, next) => {
  // do something
  next();
}
```

Example `src/middleware/logger.middleware.js`:

```js
export const loggerMiddleware = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};
```

### Why `next()` matters

`next()` tells Express:

> Continue to the next middleware or route handler.

If you forget `next()` and do not send a response, the request will hang.

Example:

```js
app.use((req, res, next) => {
  console.log("Request received");
  next();
});
```

---

## 7. Important concept: route-level middleware

Middleware can run globally:

```js
app.use(loggerMiddleware);
```

Or only for specific routes:

```js
router.get("/me", authMiddleware, getCurrentUser);
```

This means:

```txt
Request -> authMiddleware -> getCurrentUser controller
```

If auth fails, the controller never runs.

---

## 8. Custom error class

Create `src/errors/AppError.js`:

```js
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;

    Error.captureStackTrace?.(this, AppError);
  }
}
```

Why use this?

```txt
Normal Error     -> only message and stack
Custom AppError  -> message, stack, statusCode, code
```

Example:

```js
throw new AppError("User not found", 404, "USER_NOT_FOUND");
```

---

## 9. Centralized error handling

Create `src/middleware/error.middleware.js`:

```js
import { env } from "../config/env.js";

export const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  console.error({
    name: error.name,
    message: error.message,
    statusCode,
    code: error.code,
    stack: error.stack,
  });

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : error.message,
    code: error.code || "INTERNAL_ERROR",
    ...(env.nodeEnv === "development" && { stack: error.stack }),
  });
};
```

### Why error middleware has 4 parameters

Express identifies error middleware because it has this signature:

```js
(error, req, res, next) => {}
```

Normal middleware:

```js
(req, res, next) => {}
```

When you call:

```js
next(error);
```

Express skips normal middleware and jumps to the error handler.

---

## 10. 404 middleware

Create `src/middleware/notFound.middleware.js`:

```js
import { AppError } from "../errors/AppError.js";

export const notFoundMiddleware = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "ROUTE_NOT_FOUND"));
};
```

This catches requests to unknown routes.

---

## 11. Async handler utility

In Express, async errors need to be passed to `next(error)`.

Instead of writing this everywhere:

```js
try {
  // code
} catch (error) {
  next(error);
}
```

Create `src/utils/asyncHandler.js`:

```js
export const asyncHandler = (controller) => {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
};
```

Usage:

```js
router.get("/me", asyncHandler(getCurrentUser));
```

This keeps controllers cleaner.

---

## 12. Validation middleware with Zod

Create `src/middleware/validate.middleware.js`:

```js
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      req.body = validated.body ?? req.body;
      req.params = validated.params ?? req.params;
      req.query = validated.query ?? req.query;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");

        next(new AppError(message, 400, "VALIDATION_ERROR"));
        return;
      }

      next(error);
    }
  };
};
```

### Why validation matters

Never trust client input.

Validate:

```txt
req.body
req.params
req.query
headers when needed
```

---

## 13. Repository layer

For simplicity, we will use an in-memory database.

Create `src/repositories/user.repository.js`:

```js
const users = [];

export const userRepository = {
  async create(user) {
    users.push(user);
    return user;
  },

  async findByEmail(email) {
    return users.find((user) => user.email === email) || null;
  },

  async findById(id) {
    return users.find((user) => user.id === id) || null;
  },

  async findAll() {
    return users;
  },
};
```

In a real app, this would use PostgreSQL, MongoDB, DynamoDB, Prisma, TypeORM, Sequelize, etc.

The service does not need to know how users are stored.

---

## 14. JWT utility

Create `src/utils/jwt.js`:

```js
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};
```

Important:

```txt
signToken   -> creates a JWT
verifyToken -> validates and decodes a JWT
```

---

## 15. Auth service

Create `src/services/auth.service.js`:

```js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../errors/AppError.js";
import { signToken } from "../utils/jwt.js";

export const authService = {
  async register({ name, email, password }) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError("Email already in use", 409, "EMAIL_ALREADY_IN_USE");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    await userRepository.create(user);

    const token = signToken({
      sub: user.id,
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      token,
    };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const token = signToken({
      sub: user.id,
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      token,
    };
  },
};

const sanitizeUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};
```

### Important security detail

Do not return this to clients:

```js
passwordHash
```

Even though it is hashed, it should stay private.

---

## 16. Auth controller

Create `src/controllers/auth.controller.js`:

```js
import { authService } from "../services/auth.service.js";

export const register = async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json(result);
};

export const login = async (req, res) => {
  const result = await authService.login(req.body);

  res.status(200).json(result);
};
```

Notice the controller is thin.

It only does:

```txt
Read request
Call service
Send response
```

It does not contain password hashing, token logic, or database logic.

---

## 17. Auth routes

Create `src/routes/auth.routes.js`:

```js
import { Router } from "express";
import { z } from "zod";
import { register, login } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));

export default router;
```

Endpoints:

```txt
POST /api/auth/register
POST /api/auth/login
```

---

## 18. Auth middleware

Create `src/middleware/auth.middleware.js`:

```js
import { AppError } from "../errors/AppError.js";
import { verifyToken } from "../utils/jwt.js";
import { userRepository } from "../repositories/user.repository.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Missing or invalid authorization header", 401, "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await userRepository.findById(decoded.sub);

    if (!user) {
      throw new AppError("User no longer exists", 401, "UNAUTHORIZED");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
```

### What this does

```txt
1. Reads Authorization header
2. Checks Bearer token format
3. Verifies JWT
4. Finds user
5. Attaches safe user info to req.user
6. Continues to protected route
```

Example header:

```http
Authorization: Bearer <token>
```

---

## 19. User service

Create `src/services/user.service.js`:

```js
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../errors/AppError.js";

export const userService = {
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  async listUsers() {
    const users = await userRepository.findAll();

    return users.map(({ passwordHash, ...safeUser }) => safeUser);
  },
};
```

---

## 20. User controller

Create `src/controllers/user.controller.js`:

```js
import { userService } from "../services/user.service.js";

export const getMe = async (req, res) => {
  const user = await userService.getCurrentUser(req.user.id);

  res.status(200).json({ user });
};

export const listUsers = async (req, res) => {
  const users = await userService.listUsers();

  res.status(200).json({ users });
};
```

---

## 21. User routes

Create `src/routes/user.routes.js`:

```js
import { Router } from "express";
import { getMe, listUsers } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/me", authMiddleware, asyncHandler(getMe));
router.get("/", authMiddleware, asyncHandler(listUsers));

export default router;
```

Protected endpoints:

```txt
GET /api/users/me
GET /api/users
```

---

## 22. Test the API manually

Start server:

```bash
npm run dev
```

Register:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan",
    "email": "juan@example.com",
    "password": "password123"
  }'
```

Response:

```json
{
  "user": {
    "id": "...",
    "name": "Juan",
    "email": "juan@example.com",
    "role": "user",
    "createdAt": "..."
  },
  "token": "..."
}
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

Use the token:

```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 23. Request lifecycle mental model

For this endpoint:

```txt
GET /api/users/me
```

The flow is:

```txt
Request
  -> helmet
  -> cors
  -> express.json
  -> morgan
  -> loggerMiddleware
  -> /api/users route
  -> authMiddleware
  -> getMe controller
  -> userService.getCurrentUser
  -> userRepository.findById
  -> Response
```

If an error happens:

```txt
Error thrown
  -> asyncHandler catches it
  -> next(error)
  -> errorMiddleware
  -> JSON error response
```

---

## 24. Common HTTP status codes

```txt
200 OK                  -> Successful request
201 Created             -> Resource created
204 No Content          -> Successful but no body
400 Bad Request         -> Invalid request data
401 Unauthorized        -> Missing/invalid authentication
403 Forbidden           -> Authenticated but not allowed
404 Not Found           -> Resource not found
409 Conflict            -> Duplicate/conflicting resource
422 Unprocessable Entity -> Valid syntax but invalid business data
500 Internal Server Error -> Unexpected server error
```

---

## 25. Idempotency basics

Idempotency means:

> Repeating the same request multiple times produces the same final server state as doing it once.

Idempotent methods:

```txt
GET
HEAD
PUT
DELETE
OPTIONS
TRACE
```

Usually not idempotent by default:

```txt
POST
PATCH
```

Example:

```http
DELETE /api/users/123
```

Calling it once deletes the user. Calling it multiple times should leave the user deleted. Final state is the same.

---

## 26. Backend error handling rule of thumb

Good pattern:

```txt
Repository -> throws low-level or data errors
Service    -> throws business/domain errors
Controller -> delegates and sends success response
Middleware -> formats error response
```

Avoid this:

```js
// Bad: service deciding HTTP response
res.status(400).json(...)
```

Services should not know about Express `req` and `res`.

Better:

```js
throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
```

Then centralized middleware handles the response.

---

## 27. Security checklist

For a real backend API, remember:

```txt
Validate all input
Hash passwords
Never return passwordHash
Use HTTPS in production
Use secure environment variables
Use rate limiting for public endpoints
Use helmet for security headers
Set correct CORS policy
Avoid exposing stack traces in production
Use short-lived access tokens
Consider refresh tokens for real auth flows
Log enough context for debugging
Do not log passwords, tokens, or secrets
```

Optional dependency for rate limiting:

```bash
npm install express-rate-limit
```

Example:

```js
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many auth attempts. Please try again later.",
});

app.use("/api/auth", authLimiter, authRoutes);
```

---

## 28. Authentication vs authorization

Authentication answers:

```txt
Who are you?
```

Example:

```txt
Login with email/password
Validate JWT
Attach user to req.user
```

Authorization answers:

```txt
What are you allowed to do?
```

Example:

```js
export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      next(new AppError("Forbidden", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
};
```

Usage:

```js
router.get("/admin", authMiddleware, requireRole("admin"), asyncHandler(adminController));
```

---

## 29. Factory function example

A factory centralizes object creation.

Simple example:

```js
export const createUserService = ({ userRepository }) => {
  return {
    async getCurrentUser(userId) {
      return userRepository.findById(userId);
    },
  };
};
```

Why it helps:

```txt
Easier testing
Easier dependency injection
Less hardcoded implementation detail
Cleaner service construction
```

Test example:

```js
const fakeUserRepository = {
  findById: async () => ({ id: "1", name: "Test User" }),
};

const userService = createUserService({
  userRepository: fakeUserRepository,
});
```

---

## 30. Clean code recommendations

### Prefer this

```js
export const getMe = async (req, res) => {
  const user = await userService.getCurrentUser(req.user.id);
  res.status(200).json({ user });
};
```

### Avoid this

```js
export const getMe = async (req, res) => {
  const users = [];
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  delete user.passwordHash;
  res.json(user);
};
```

Why avoid it?

```txt
Controller has data access
Controller has business rules
Controller mutates data directly
Controller manually handles errors
Harder to test
Harder to maintain
```

---

## 31. Interview-ready explanation

A strong answer for Express architecture:

> I usually structure Express apps in layers. Routes map endpoints to controllers. Controllers handle HTTP concerns and delegate business logic to services. Services contain use cases and business rules. Repositories isolate data access. Middleware handles cross-cutting concerns like authentication, validation, logging, and error handling. I also prefer centralized error handling so every endpoint returns errors consistently.

A strong answer for middleware:

> Middleware is code that runs during the request/response lifecycle. It can parse JSON, validate authentication, log requests, validate input, or handle errors. In Express, middleware receives `req`, `res`, and `next`. Error middleware has four parameters: `error`, `req`, `res`, and `next`.

A strong answer for auth:

> Authentication verifies who the user is, commonly through credentials and a session or JWT. Authorization verifies what that user is allowed to access. In an Express API, I usually implement authentication as middleware that validates the token, loads the user, and attaches safe user data to `req.user`.

---

## 32. Final checklist

Before calling the project clean, verify:

```txt
Project has clear folder structure
Routes are thin
Controllers do not contain business logic
Services do not know about Express req/res
Repositories isolate data access
Errors are centralized
Input validation exists
Auth middleware protects private routes
Passwords are hashed
Sensitive fields are not returned
Environment variables are validated
Unknown routes return 404
Server does not expose stack traces in production
```

---

## 33. Complete request example

```txt
POST /api/auth/register
```

Request:

```json
{
  "name": "Juan",
  "email": "juan@example.com",
  "password": "password123"
}
```

Flow:

```txt
Route
  -> validate(registerSchema)
  -> asyncHandler(register)
  -> authController.register
  -> authService.register
  -> userRepository.findByEmail
  -> bcrypt.hash
  -> userRepository.create
  -> signToken
  -> response 201
```

Response:

```json
{
  "user": {
    "id": "generated-id",
    "name": "Juan",
    "email": "juan@example.com",
    "role": "user",
    "createdAt": "2026-05-04T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

---

## 34. What to mention in a senior interview

Mention these naturally:

```txt
Layered architecture
Thin controllers
Centralized error handling
Input validation
Auth as middleware
Clear separation between authentication and authorization
Safe error responses
No secrets in code
No password hashes in responses
Observability/logging
Testability through isolated services and repositories
Avoid blocking the event loop
```

Strong final line:

> My goal is to keep the request pipeline predictable: validate early, authenticate through middleware, keep controllers thin, put business logic in services, isolate persistence in repositories, and send errors through centralized middleware.
