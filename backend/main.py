from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
import pandas as pd
import uvicorn

app = FastAPI(title="Marketing Data API", version="1.0.0")

# CORS Setup for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Connection
DB_URI = "postgresql://postgres.zvqnwxjotdtactrqotov:dashboard255521@aws-0-us-west-2.pooler.supabase.com:6543/postgres"
engine = create_engine(DB_URI)

class CampaignUpdate(BaseModel):
    budget: float
    status: str

@app.get("/api/dashboard-metrics")
def get_dashboard_metrics(range: str = "30d"):
    """
    Fetches and aggregates campaign data and time-series metrics 
    filtered by the provided date range.
    """
    if range not in ["7d", "30d", "12m"]:
        raise HTTPException(status_code=400, detail="Invalid date range")
        
    days = 7 if range == "7d" else 30 if range == "30d" else 365
    start_date = datetime.now() - timedelta(days=days)
    
    with engine.connect() as conn:
        # 1. Fetch Aggregated Campaigns (Joined)
        camp_query = text("""
            SELECT 
                c.id, c.name, c.platform, c.status, c.budget,
                COALESCE(SUM(m.conversions), 0) as conversions,
                CASE WHEN SUM(m.conversions) > 0 THEN SUM(m.spend) / SUM(m.conversions) ELSE 0 END as cpa
            FROM campaigns c
            LEFT JOIN daily_metrics m ON c.id = m.campaign_id AND m.date >= :start_date
            GROUP BY c.id, c.name, c.platform, c.status, c.budget
        """)
        campaigns_df = pd.read_sql(camp_query, conn, params={"start_date": start_date.date()})
        campaigns = campaigns_df.to_dict(orient="records")
        
        # 2. Fetch TimeSeries Data
        ts_query = text("""
            SELECT 
                m.date, c.platform, SUM(m.revenue) as rev, SUM(m.spend) as spend
            FROM daily_metrics m
            JOIN campaigns c ON m.campaign_id = c.id
            WHERE m.date >= :start_date
            GROUP BY m.date, c.platform
            ORDER BY m.date
        """)
        ts_df = pd.read_sql(ts_query, conn, params={"start_date": start_date.date()})
    
    # 3. Process time series into Frontend-friendly format
    time_series = []
    if not ts_df.empty:
        if range == "12m":
            # Group by Month
            ts_df['month'] = pd.to_datetime(ts_df['date']).dt.to_period('M')
            grouped = ts_df.groupby(['month', 'platform'])[['rev', 'spend']].sum().reset_index()
            grouped['date_label'] = grouped['month'].dt.strftime('%b %Y')
            grouped = grouped.sort_values('month')
            unique_labels = grouped['date_label'].unique()
        else:
            # Group by Day
            ts_df['date_label'] = pd.to_datetime(ts_df['date']).dt.strftime('%b %d')
            grouped = ts_df
            unique_labels = grouped['date_label'].unique()
            
        # Pivot into shape expected by Recharts
        for label in unique_labels:
            day_data = grouped[grouped['date_label'] == label]
            entry = {"name": label}
            for plat in ["Google", "Facebook", "TikTok"]:
                plat_data = day_data[day_data['platform'] == plat]
                if not plat_data.empty:
                    entry[plat] = {
                        "rev": float(plat_data['rev'].iloc[0]), 
                        "spend": float(plat_data['spend'].iloc[0])
                    }
                else:
                    entry[plat] = {"rev": 0, "spend": 0}
            time_series.append(entry)

    return {
        "timeSeries": time_series,
        "campaigns": campaigns
    }

@app.put("/api/campaigns/{campaign_id}")
def update_campaign(campaign_id: int, data: CampaignUpdate):
    """
    Simulates a Data Mutation (PUT) from the Frontend Table.
    """
    with engine.connect() as conn:
        conn.execute(
            text("UPDATE campaigns SET budget = :budget, status = :status WHERE id = :id"),
            {"budget": data.budget, "status": data.status, "id": campaign_id}
        )
        conn.commit()
    return {"message": "Campaign updated successfully", "id": campaign_id}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

