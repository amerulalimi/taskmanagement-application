Task Management Application
===========================

### Prerequisites
- **Docker Desktop** installed and running (Docker Engine must be running).
- **Docker Compose** (included with recent Docker Desktop versions).

### Project Structure (high level)
- `back-end/` – Flask API + MySQL integration.
- `front-end/` – React / Vite client.
- `docker-compose.yaml` – Orchestrates backend, frontend, and database.

### 1. Configuration

- Backend environment file is already provided at `back-end/.env` and wired to the MySQL container.
- You may optionally change these values in `back-end/.env`:
  - `DB_USER`, `DB_PASSWORD`, `DB_NAME` – database credentials.
  - `JWT_SECRET_KEY` – secret for signing JWTs.

> Note: Inside Docker, the backend connects to the database using `DB_HOST=mysql`, which matches the database service name in `docker-compose.yaml`. Do **not** change this unless you know what you are doing.

### 2. Running the application with Docker

From the project root (this folder):

```bash
docker compose up --build
```

What this does:
- Builds the **backend** image from `back-end/Dockerfile`.
- Starts the **MySQL** database (`db` service) and creates the `assessment` database.
- Starts the **Flask backend** (`flask-backend`).
- Starts the **React frontend** (`react-frontend`).

On first run, give MySQL 10–20 seconds to initialize. The backend will automatically create the tables via `db.create_all()` on startup.

To run containers in the background:

```bash
docker compose up --build -d
```

To stop:

```bash
docker compose down
```

### 3. Accessing the application

- **Frontend (UI)**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

The frontend is configured to talk to the backend within the same Docker network, and CORS is set to allow `http://localhost:5173`.

### 4. Common issues

- **MySQL connection errors**  
  Usually mean the database container is not ready yet. Try:
  - Wait a few more seconds.
  - Restart the stack:
    ```bash
    docker compose down
    docker compose up --build
    ```

- **Port already in use**  
  If ports `5000`, `5173`, or `3306` are already used by other processes, stop those processes or change the exposed ports in `docker-compose.yaml`.

### 5. Running backend locally (without Docker) – optional

If you prefer to run only the backend locally:
1. Create and activate a Python virtual environment.
2. Install dependencies:
   ```bash
   cd back-end
   pip install -r requirements.txt
   ```
3. Ensure you have a MySQL server running and update `back-end/.env`:
   - Set `DB_HOST=localhost` (and matching user/password/database).
4. Run the backend:
   ```bash
   flask run --host=0.0.0.0 --port=5000
   ```

> Recommended for assessment: use the **Docker** approach so backend, frontend, and database are started consistently with a single command.

### 6. Production database with Amazon Aurora MySQL

For production, you should use a managed MySQL-compatible database such as **Amazon Aurora MySQL** instead of the Docker MySQL container.

- Create an **Aurora MySQL** cluster in AWS:
  - Engine: Aurora MySQL Compatible
  - Create a writer endpoint (cluster endpoint), database name (e.g. `assessment`), username, and password.
  - Make sure your compute stack (ECS/EKS/EC2) can reach the Aurora cluster in the same VPC/subnets/security groups.

- Set the following environment variables for the backend (for example in ECS task definition, EC2 user data, or GitHub Actions deploy step):
  - `DB_USER` – Aurora DB username.
  - `DB_PASSWORD` – Aurora DB password.
  - `DB_HOST` – Aurora **cluster endpoint** (e.g. `my-aurora-cluster.cluster-xxxxxxxxxxxx.us-east-1.rds.amazonaws.com`).
  - `DB_NAME` – database name (e.g. `assessment`).
  - `JWT_SECRET_KEY` – strong secret for JWT.

The backend builds the connection string from these values:

```python
user = os.getenv("DB_USER")
password = urllib.parse.quote_plus(os.getenv("DB_PASSWORD"))
host = os.getenv("DB_HOST")
db_name = os.getenv("DB_NAME")

SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{user}:{password}@{host}/{db_name}"
```

This means switching from Docker MySQL to Aurora only requires pointing `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` to the Aurora cluster.

### 7. CI/CD with GitHub Actions and AWS ECR

This project includes a GitHub Actions workflow at `.github/workflows/ci-cd.yml` that:

- Runs on each **push** to `main`/`master`.
- Builds **backend** and **frontend** Docker images.
- If the build succeeds, **pushes** both images to your existing AWS ECR repositories.
- If any step fails, the workflow stops and nothing is pushed.

#### 7.1. Required GitHub secrets

In your GitHub repository settings, create these **secrets**:

- `AWS_REGION` – e.g. `ap-southeast-1`.
- `AWS_ACCOUNT_ID` – your AWS account ID.
- `AWS_ROLE_TO_ASSUME` – ARN of an IAM role that GitHub Actions can assume for ECR access (with `ecr:*` permissions as needed).
- `ECR_BACKEND_REPOSITORY` – name of the existing ECR repo for the backend image (e.g. `task-backend`).
- `ECR_FRONTEND_REPOSITORY` – name of the existing ECR repo for the frontend image (e.g. `task-frontend`).

The workflow will:

- Log in to ECR.
- Build and tag images as:
  - `AWS_ACCOUNT_ID.dkr.ecr.<region>.amazonaws.com/<backend-repo>:latest`
  - `AWS_ACCOUNT_ID.dkr.ecr.<region>.amazonaws.com/<backend-repo>:<GITHUB_SHA>`
  - `AWS_ACCOUNT_ID.dkr.ecr.<region>.amazonaws.com/<frontend-repo>:latest`
  - `AWS_ACCOUNT_ID.dkr.ecr.<region>.amazonaws.com/<frontend-repo>:<GITHUB_SHA>`
- Push all these tags to the configured repositories.

#### 7.2. Typical deployment flow (high level)

1. **Push code** to `main`/`master`.
2. GitHub Actions workflow builds and pushes updated images to ECR.
3. Your deployment layer (e.g. ECS service, Kubernetes Deployment, or EC2-based Docker compose setup) is configured to:
   - Pull the latest image from ECR.
   - Provide the Aurora MySQL environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET_KEY`).
4. Application starts and connects to Aurora MySQL as configured above.
