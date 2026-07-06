# Todo List Application

## Technology Stack

- Backend: **Node.js**, **Express.js**, **TypeScript**, **Zod** (validation), **Prisma ORM**, **SQLite**.
- Backend Testing: **Jest**, **Supertest**.
- Frontend: **React.js** (Vite), **TypeScript**, **Tailwind CSS v4**, **Axios**.
- Containerization: **Docker**, **Docker Compose**, **Nginx**.

## Main Directory Structure

- **backend/**: Contains the server-side source code, RESTful API endpoints, and unit tests.
- **frontend/**: Contains the client-side user interface built with React.
- **docker-compose.yml**: Orchestrates the multi-container configuration for the entire application.
- **package.json**: Main package file at the root of the workspace.

## System Prerequisites

To run this application, you must have **Docker** and **Docker Compose** installed and running on your host machine.

---

## How to Run the Application using Docker


1. **Start the containers**:
   Open a terminal at the root directory of the project (where `docker-compose.yml` is located) and run:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   Once the build completes and the services start, open your browser and navigate to:
   - Frontend User Interface: **http://localhost:3000**
   - Backend API: **http://localhost:5000**

3. **Stop the containers**:
   To stop the services, press `Ctrl+C` in the running terminal, or run the following command in a new terminal window at the root folder:
   ```bash
   docker-compose down
   ```

---

## Running Locally (Without Docker)

### Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend/` directory:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```
4. Initialize the database schema:
   ```bash
   npm run prisma:push
   ```
5. Start the development server (with hot-reload):
   ```bash
   npm run dev
   ```
   The backend will be available at **http://localhost:5000**

### Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at **http://localhost:5173**

---

## How to Run Backend Unit Tests

The backend includes a suite of **11 automated unit tests** covering all CRUD operations, input validations, and error handling middleware.

> **Note:** Tests run against an isolated `prisma/test.db` database (auto-configured), so they never affect the development database.

1. Navigate to the **backend** directory:
   ```bash
   cd backend
   ```

2. Run the test command:
   ```bash
   npm run test
   ```

---

## Key Application Features

- **CRUD Operations**: Users can create, read, update, and delete tasks with titles, descriptions, and optional due dates.
- **Dashboard Statistics**: Features a real-time progress bar and counts for completed vs. pending tasks.
- **Theme Switching**: Supports a Light and Dark Mode toggle.
- **Search Debouncing**: Includes a **500ms debounce** logic on the search input to limit unnecessary API requests during typing.
- **Responsive Layout**: Designed to adapt seamlessly to mobile, tablet, and desktop viewports, with wrap layouts preventing elements from overflowing.
