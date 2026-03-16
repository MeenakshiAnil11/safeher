"""
Generate synthetic fertility tracking data for training
This creates realistic ovulation prediction data based on BBT and cycle patterns
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_synthetic_fertility_data(num_cycles=20, records_per_cycle=28):
    """
    Generate synthetic fertility tracking data
    
    Parameters:
    - num_cycles: Number of menstrual cycles to simulate
    - records_per_cycle: Days per cycle (typically 28-32)
    
    Returns:
    - DataFrame with synthetic fertility data
    """
    
    data = []
    start_date = datetime(2023, 1, 1)
    
    for cycle in range(num_cycles):
        # Vary cycle length slightly (26-32 days)
        cycle_length = random.choice([26, 27, 28, 29, 30, 31, 32])
        
        # Ovulation typically occurs around day 14 (but varies)
        ovulation_day = random.randint(12, 17)
        
        for day in range(1, cycle_length + 1):
            date = start_date + timedelta(days=cycle * 30 + day - 1)
            
            # Initialize with base values
            bbt = 36.5 + random.uniform(-0.3, 0.3)  # Base BBT
            cervical_mucus = "dry"
            cervical_position = "low"
            
            # Determine fertility status based on cycle day
            is_fertile = (ovulation_day - 5 <= day <= ovulation_day + 1)
            is_ovulation_day = (day == ovulation_day)
            
            # Adjust BBT based on cycle phase
            if day < ovulation_day:
                # Follicular phase - lower BBT
                bbt = 36.2 + random.uniform(-0.2, 0.2)
            elif day == ovulation_day:
                # Ovulation - slight dip then rise
                bbt = 36.0 + random.uniform(-0.1, 0.1)
            elif day == ovulation_day + 1:
                # Post-ovulation - temperature rise
                bbt = 36.6 + random.uniform(0, 0.3)
            else:
                # Luteal phase - elevated BBT
                bbt = 36.7 + random.uniform(-0.1, 0.3)
            
            # Cervical mucus changes during fertile window
            if is_fertile:
                if day == ovulation_day:
                    cervical_mucus = random.choice(["watery", "egg-white"])
                    cervical_position = random.choice(["high", "soft", "open"])
                elif ovulation_day - 2 <= day < ovulation_day:
                    cervical_mucus = random.choice(["creamy", "watery"])
                    cervical_position = "medium"
                elif day > ovulation_day:
                    cervical_mucus = "dry"
                    cervical_position = "low"
            else:
                cervical_mucus = "dry"
                cervical_position = "low"
            
            # Ovulation test results
            if day == ovulation_day:
                ovulation_test = "positive"
            elif ovulation_day - 2 <= day < ovulation_day:
                ovulation_test = random.choice(["negative", "peak"])
            else:
                ovulation_test = "negative"
            
            # Symptoms vary by cycle phase
            if day < ovulation_day:
                mood = random.choice(["happy", "calm", "energetic", "neutral"])
                energy = random.randint(7, 10)
            elif day == ovulation_day:
                mood = random.choice(["happy", "energetic", "calm"])
                energy = random.randint(8, 10)
            else:
                mood = random.choice(["tired", "neutral", "happy", "anxious"])
                energy = random.randint(5, 8)
            
            # Stress and sleep
            stress = random.randint(1, 8)
            sleep_hours = random.uniform(6, 9)
            sleep_quality = random.choice(["good", "excellent"]) if sleep_hours >= 7 else random.choice(["fair", "good"])
            
            # Intercourse is more likely during fertile window
            intercourse = random.choice([True, False, False]) if is_fertile else random.choice([True, False, False, False, False])
            
            # Cervical mucus encoding for ML
            mucus_encoded = {
                "dry": 0,
                "sticky": 1,
                "creamy": 2,
                "watery": 3,
                "egg-white": 4
            }
            
            # Phase encoding
            if day <= 5:
                phase = "menstrual"
            elif day < ovulation_day:
                phase = "follicular"
            elif day == ovulation_day or day == ovulation_day + 1:
                phase = "ovulatory"
            else:
                phase = "luteal"
            
            # Target: fertile window (5 days before ovulation + ovulation day + 1 day after)
            fertile = 1 if is_fertile else 0
            
            data.append({
                "date": date.strftime("%Y-%m-%d"),
                "cycle_day": day,
                "bbt": round(bbt, 2),
                "cervical_mucus": cervical_mucus,
                "cervical_mucus_encoded": mucus_encoded[cervical_mucus],
                "cervical_position": cervical_position,
                "ovulation_test": ovulation_test,
                "ovulation_test_encoded": 1 if ovulation_test in ["positive", "peak"] else 0,
                "intercourse": 1 if intercourse else 0,
                "mood": mood,
                "energy": energy,
                "stress": stress,
                "sleep_hours": round(sleep_hours, 1),
                "sleep_quality": sleep_quality,
                "phase": phase,
                "fertile": fertile,  # Target variable for ML
                "is_ovulation_day": 1 if is_ovulation_day else 0  # Secondary target
            })
    
    df = pd.DataFrame(data)
    return df

def main():
    """Generate and save synthetic fertility data"""
    print("Generating synthetic fertility tracking data...")
    
    # Generate data
    df = generate_synthetic_fertility_data(num_cycles=30, records_per_cycle=28)
    
    # Save to CSV
    output_file = "python/data/fertility_tracking_data.csv"
    df.to_csv(output_file, index=False)
    print(f"✅ Generated {len(df)} records")
    print(f"✅ Saved to: {output_file}")
    
    # Display statistics
    print("\n📊 Data Statistics:")
    print(f"Total records: {len(df)}")
    print(f"Fertile days: {df['fertile'].sum()} ({df['fertile'].mean()*100:.1f}%)")
    print(f"Ovulation days: {df['is_ovulation_day'].sum()}")
    print(f"\nBBT range: {df['bbt'].min():.2f}°C - {df['bbt'].max():.2f}°C")
    print(f"Average BBT: {df['bbt'].mean():.2f}°C")
    
    # Display cycle phases
    print("\n📈 Cycle Phase Distribution:")
    print(df['phase'].value_counts())
    
    # Display cervical mucus distribution
    print("\n💧 Cervical Mucus Distribution:")
    print(df['cervical_mucus'].value_counts())

if __name__ == "__main__":
    main()

