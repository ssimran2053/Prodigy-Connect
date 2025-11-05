# Prodigy-Connect
CSC 131 Computer Software Engineering - Fall 2025

A community-centered platform connecting service seekers with local service providers. Built for students, freelancers, and small business owners to find and offer services in their local community.

## Project Overview
Prodigy Connect helps students, freelancers, and self-employed individuals connect with people who need their services. The platform provides secure accounts, job postings, messaging, reviews, scheduling, and location-based search.

## Team Members
- Simranpal Singh
- Eligio Campos 
- Shamsuddin Malik Zada
- Sachin Tomy
- Ranvir Malhi

## Features
1. User Accounts - Register as Seeker, Provider, or Admin
2. Job Postings - Seekers post jobs, Providers respond
3. Reviews & Ratings - Rate and review service providers
4. Favorites - Save interesting job postings
5. Messaging - In-app messaging between users
6. Search & Filters - Find jobs and providers easily
7. Calendar - Schedule and manage appointments
8. Map - Find providers near you

## Tech Stack
- Frontend: Angular, HTML/CSS, TypeScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Tools: WebStorm, DataGrip, GitHub, Discord

---

## VS Code Setup Guide

Follow these steps to get the **Prodigy-Connect** server running locally on your machine.

### 1. Prerequisites

Make sure you have the following installed:
* **Git**
* **Visual Studio Code (VS Code)**
* **Node.js** (LTS version recommended)

### 2. Clone the Repository

Open your terminal or Git Bash and clone the repository.

```bash
git clone [https://github.com/ssimran2053/Prodigy-Connect.git](https://github.com/ssimran2053/Prodigy-Connect.git)
```

Then, navigate into the project directory:
```bash
cd Prodigy-Connect
```

### 3. Install Dependencies

Once inside the project folder, install all necessary Node.js packages (Express, Mongoose, Nodemon, etc.).
```bash
npm Install
```

### 4. Configure Environment Variables (.env)

The project requires a .env file for configuration, which is kept secret and is not committed to Git.

Find the .env.example file in the root directory.

Duplicate this file and rename the copy to .env (removing the .example suffix).

Open the new .env file and replace the placeholder values with the usernames, passwords, or credintals provided to you. (Will be in the Discord in the Resources section)

### 5. Run the Server

Start the backend server using the development script. This uses Nodemon to automatically restart the server whenever you save a file.
```bash
npm run dev
```

### 6. Verify the Connection
Check your terminal. If the setup is correct, you should see messages confirming the database and server status:

MongoDB Connected: <cluster host name>

Server started at http://localhost:5001

You can verify the running server by navigating to http://localhost:5001 in your web browser.


