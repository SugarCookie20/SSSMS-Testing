# SSSMS Academic Portal

A modular, centralized academic management system for the SSSMS College of Architecture. Built with a microservices-ready architecture using **Spring Boot 4**, **Java 25**, and **React**.

## Tech Stack

*   **Backend:** Java 25 (LTS), Spring Boot 4.0.0
*   **Frontend:** React 18, Vite
*   **Database:** MySQL 8.0
*   **Infrastructure:** Docker & Docker Compose

---

## Prerequisites

To run this project, you **do not** need to install Java, Node.js, or MySQL on your machine. You only need:

1.  **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Must be installed and running).
2.  **Git** (To clone the repository).

---

## Quick Start Guide

Follow these steps to get the project running in under 5 minutes.

### 1. Clone the Repository
Open your terminal/command prompt and run:
```bash
git clone https://github.com/rush4n/SSSMS-Academic-Portal.git
cd sssms-portal
```

### 2. Run with Docker
Start the entire stack (Database + Backend + Frontend) with one command:
```bash
docker-compose up --build
```
*Note: The first run may take a few minutes as it downloads Java 25 images and dependencies.*

### 3. Verify Installation
Once the logs stop moving rapidly, access the services:

| Service | URL / Address | Description |
| :--- | :--- | :--- |
| **Frontend** | [http://localhost:5173](http://localhost:5173) | The React User Interface |
| **Backend** | [http://localhost:8080](http://localhost:8080) | Spring Boot API |
| **Database** | `localhost:3307` | MySQL Database (External Port) |

---

## Default Credentials

The project comes pre-configured with the following development credentials:

*   **Database Host:** `localhost` (Port 3307)
*   **Database Name:** `sssms_portal_db`
*   **Username:** `root`
*   **Password:** `root_password`

---

## Development Workflow

Since the project uses Docker Volumes, you can edit code locally and see changes instantly.

*   **Frontend Changes:** Edit files in `frontend/src`. The browser at `localhost:5173` will hot-reload automatically.
*   **Backend Changes:** Edit Java files in `backend/src`. To apply changes, open a new terminal and run:
    ```bash
    docker-compose restart backend
    ```

---

## Stopping the Project

To stop the containers and free up ports:
Press `Ctrl + C` in the running terminal, or run:
```bash
docker-compose down
```

## Troubleshooting

**"Port is already allocated" error?**
Ensure you don't have another MySQL instance running on your computer. If `localhost:3307` is taken, edit `docker-compose.yml` and change the port mapping.

**"Java version not found"?**
Ensure you are using `docker-compose up --build` to force Docker to fetch the specific Java 25 images defined in the configuration.
```
