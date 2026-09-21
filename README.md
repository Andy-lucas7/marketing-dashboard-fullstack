# 📊 Data-Driven Marketing Dashboard (Full-Stack Data Engineering) 

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Project-blue?style=for-the-badge)](https://marketing-dashboard-fullstack.vercel.app/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#) 
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](#) 
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](#) 

> **A production-ready Full-Stack application showcasing Data Engineering (ETL), High-Performance Backend APIs, and Advanced Frontend UI/UX.** 

This project is a comprehensive portfolio piece built to demonstrate the ability to architect modern web applications from the database layer up to the client interface. It simulates a realistic SaaS product used by marketing teams to track Ad Spends, Revenue, and Campaign ROAS across multiple platforms (Google, Facebook, TikTok). 

## 📸 Sneak Peek 

![Dashboard Preview](./assets/liveDemo.gif) 

--- 

## 💡 Business Value 
Beyond the code, this architecture solves real business problems: 
- **Centralized Insights:** Eliminates manual CSV exports by automating data pipelines from multiple ad sources. 
- **Real-Time Decision Making:** Sub-second API responses allow media buyers to quickly identify unprofitable campaigns and adjust budgets on the fly. 
- **Scalability:** Designed to handle hundreds of thousands of daily metric rows without degrading frontend performance. 

--- 

## 🚀 Key Features 

### 1. Data Engineering & ETL Pipeline 
- **Automated Data Ingestion:** A Python script (`etl_pipeline.py`) acts as an ETL worker, extracting simulated ad platform data, transforming it using **Pandas**, and loading it into a Data Warehouse. 
- **Relational Integrity:** Uses **PostgreSQL** with strict Foreign Keys between `campaigns` and `daily_metrics`. 
- **Time-Series Optimization:** Database schema includes precise indexes on dates and platform columns to ensure lightning-fast aggregations. 

### 2. High-Performance Backend API 
- **FastAPI Framework:** The backend (`main.py`) exposes asynchronous REST endpoints. 
- **SQLAlchemy & Raw SQL:** Executes complex relational `GROUP BY` and `JOIN` queries directly on the database to aggregate data, preventing over-fetching. 
- **CRUD Operations:** Includes endpoints to mutate campaign states, mimicking real database write operations. 

### 3. Advanced Frontend (Next.js) 
- **Complex State Management:** Implements **Global Cross-Filtering**. Clicking on a specific platform recalculates the entire dashboard (KPIs, Area Chart, and Data Grid) in real-time. 
- **Optimistic UI:** Features an interactive Data Grid. Editing a campaign updates the React state instantly while firing a background request to the FastAPI server. 
- **Zero Layout Shift (Skeletons):** Professional loading states using `animate-pulse` and fixed-height constraints. 
- **Premium Visualization:** Recharts integrations with custom Glassmorphism tooltips and SVG Glow effects. 

--- 

## ⚙️ How to Run Locally 

### Prerequisites 
- Python 3.10+ 
- Node.js 18+ 
- A PostgreSQL Database URL (e.g., Supabase, Neon) 

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

## 👨‍💻 About the Developer
I specialize in Data Engineering and Full-Stack Development, bridging the gap between raw data pipelines and polished user interfaces. This project demonstrates my ability to not just paint a UI, but to design the underlying database schema, write the pipelines that feed it, build the APIs that serve it, and engineer the React state that consumes it.

**Let's build something great together:**
- 💼 [Upwork Profile](https://www.upwork.com/freelancers/~01fb241aecf1b7b085?mp_source=share)
- 🌐 [LinkedIn](https://www.linkedin.com/in/lucas-andrey7/)
- ✉️ [Email](mailto:lucasandrey109@gmail.com)
