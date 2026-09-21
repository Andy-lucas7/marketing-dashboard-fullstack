# 📊 Data-Driven Marketing Dashboard (Full-Stack Portfolio Project)

> **A complete, production-ready Full-Stack application showcasing Advanced Frontend UI/UX, Data Engineering (ETL), and high-performance Backend APIs.**

This project is a comprehensive portfolio piece built to demonstrate the ability to architect and develop modern web applications from the database layer up to the client interface. It simulates a realistic SaaS product used by marketing teams to track Ad Spends, Revenue, and Campaign ROAS across multiple platforms (Google, Facebook, TikTok).

---

## 🚀 Key Features

### 1. Data Engineering & ETL Pipeline
- **Automated Data Ingestion:** A Python script (`etl_pipeline.py`) that acts as an ETL worker, extracting simulated ad platform data, transforming it using **Pandas**, and loading it into a Data Warehouse.
- **Relational Integrity:** Uses **PostgreSQL** with strict Foreign Keys between `campaigns` and `daily_metrics`. Data truncation and cascading deletes are managed properly.
- **Time-Series Optimization:** Database schema includes precise indexes on dates and platform columns to ensure aggregations over hundreds of thousands of rows run in milliseconds.

### 2. High-Performance Backend API
- **FastAPI Framework:** The backend (`main.py`) exposes asynchronous endpoints using Python's FastAPI.
- **SQLAlchemy & Raw SQL:** Executes complex relational `GROUP BY` and `JOIN` queries directly on the database to aggregate data (e.g., grouping daily metrics into monthly summaries) rather than over-fetching to the client.
- **CRUD Operations:** Includes a `PUT` endpoint to mutate campaign states, mimicking a real database write operation.

### 3. Advanced Frontend (Next.js)
- **Complex State Management:** Implements **Global Cross-Filtering**. Clicking on a specific platform in the Bar Chart recalculates the entire dashboard (KPIs, Area Chart, and Data Grid) in real-time.
- **Optimistic UI (CRUD Simulation):** Features an interactive Data Grid with an action column. Editing a campaign updates the React state instantly while firing a background request to the FastAPI server.
- **Zero Layout Shift (Skeletons):** Professional loading states using `animate-pulse` and fixed-height constraints that perfectly match the loaded components.
- **Premium Visualization:** Recharts integrations with custom Glassmorphism tooltips (`backdrop-blur`) and SVG Glow (`drop-shadow`) effects.

---

## 🏗️ Architecture Stack

**Frontend:**
* [Next.js (App Router)](https://nextjs.org/) & React 18
* [Tailwind CSS](https://tailwindcss.com/) (Styling)
* [Framer Motion](https://www.framer.com/motion/) (Micro-interactions & animations)
* [Recharts](https://recharts.org/) (Data Visualization)
* Lucide React (Icons)

**Backend & Data:**
* [FastAPI](https://fastapi.tiangolo.com/) (REST API)
* [Python 3.x](https://www.python.org/) & [Pandas](https://pandas.pydata.org/) (ETL & Data Transformation)
* [SQLAlchemy](https://www.sqlalchemy.org/) (ORM & Database connection pooling)
* [PostgreSQL](https://www.postgresql.org/) (Supabase/Neon used as the Cloud Data Warehouse)

---

## ⚙️ How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- A PostgreSQL Database URL (e.g., Supabase with Connection Pooler / IPv4 support)

### 1. Setup the Database and Backend
```bash
cd backend
python -m venv venv

# Activate the Virtual Environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Configure Database:**
Open `backend/etl_pipeline.py` and `backend/main.py`. Replace the `DB_URI` string with your actual PostgreSQL connection string. 

*Note: If using Supabase, make sure to use the **Transaction Pooler** string (port 6543) if your local ISP does not support IPv6 direct connections.*

### 2. Run the ETL Pipeline
Run the script to generate and load the mock data into your PostgreSQL instance.
```bash
python etl_pipeline.py
```

### 3. Start the API Server
Leave this running in its own terminal window.
```bash
uvicorn main:app --reload
# API will be available at http://localhost:8000
```

### 4. Start the Next.js Frontend
Open a new terminal window at the root of the project.
```bash
npm install
npm run dev
# Dashboard will be available at http://localhost:3000
```

---

## 👨‍💻 About this Portfolio Project

This project goes beyond typical frontend dashboard tutorials by implementing a **complete data lifecycle**. It proves the capability to not just paint a UI, but to design the underlying database schema, write the pipelines that feed it, build the APIs that serve it, and engineer the React state that consumes it.

**Focus areas demonstrated:**
- Full-Stack Architecture
- API Design & System Integration
- Relational Database Modeling
- UI/UX Design & Data Visualization
