import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta
import random

# Substitua pela sua URL com a senha real
DB_URI = "postgresql://postgres.zvqnwxjotdtactrqotov:dashboard255521@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

def run_etl():
    print("🚀 Starting Data Ingestion Pipeline...")
    engine = create_engine(DB_URI)
    
    # 1. Garante que o Schema existe e limpa as tabelas com CASCADE
    with engine.connect() as conn:
        with open('schema.sql', 'r') as file:
            conn.execute(text(file.read()))
            
        # O CASCADE apaga os dados respeitando a Foreign Key, sem destruir a tabela
        conn.execute(text("TRUNCATE TABLE campaigns, daily_metrics RESTART IDENTITY CASCADE;"))
        conn.commit()
    
    # 2. EXTRACT / GENERATE: Simulate API extractions from Ad Platforms
    platforms = ['Google', 'Facebook', 'TikTok']
    campaigns_data = []
    
    for i in range(1, 36):
        campaigns_data.append({
            'id': i,
            'name': f"Campaign {i} - {random.choice(['Retargeting', 'Awareness', 'Promo', 'Conversion'])}",
            'platform': platforms[i % 3],
            'status': 'Active' if random.random() > 0.2 else 'Paused',
            'budget': round(random.uniform(50, 500), 2),
            'target_cpa': round(random.uniform(10, 30), 2)
        })
        
    df_campaigns = pd.DataFrame(campaigns_data)
    print(f"✅ Generated {len(df_campaigns)} campaigns.")
    
    # 3. TRANSFORM: Generate Historical Daily Metrics (Last 365 Days)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    date_range = pd.date_range(start=start_date, end=end_date)
    
    metrics_data = []
    
    for date in date_range:
        for camp in campaigns_data:
            if camp['status'] == 'Paused' and random.random() > 0.3:
                continue
                
            spend = round(random.uniform(0.1, 1.0) * camp['budget'], 2)
            roas_mult = 3.5 if camp['platform'] == 'Google' else 2.8 if camp['platform'] == 'Facebook' else 1.5
            revenue = round(spend * roas_mult * random.uniform(0.7, 1.3), 2)
            
            impressions = int(spend * random.uniform(10, 50))
            clicks = int(impressions * random.uniform(0.01, 0.05))
            conversions = int(clicks * random.uniform(0.05, 0.2))
            
            metrics_data.append({
                'campaign_id': camp['id'],
                'date': date.date(),
                'spend': spend,
                'revenue': revenue,
                'impressions': impressions,
                'clicks': clicks,
                'conversions': conversions
            })
            
    df_metrics = pd.DataFrame(metrics_data)
    print(f"✅ Transformed {len(df_metrics)} rows of time-series daily metrics.")
    
    # 4. LOAD: Bulk insert into PostgreSQL (Usando 'append' para não deletar os índices)
    print("⏳ Loading data into PostgreSQL warehouse...")
    df_campaigns.to_sql('campaigns', engine, if_exists='append', index=False)
    df_metrics.to_sql('daily_metrics', engine, if_exists='append', index=False)
    
    print("🎉 ETL Pipeline completed successfully!")

if __name__ == "__main__":
    run_etl()
