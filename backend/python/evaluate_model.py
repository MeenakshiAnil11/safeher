"""
Enhanced model evaluation script
Adds ROC-AUC, precision, recall, and confusion matrix analysis
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.metrics import roc_auc_score, precision_score, recall_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import joblib

# Load data
def load_data(file_path="python/data/fertility_tracking_data.csv"):
    print("📂 Loading data...")
    df = pd.read_csv(file_path)
    print(f"✅ Loaded {len(df)} records")
    return df

def load_and_preprocess(file_path):
    """Load and preprocess data (matches train_ovulation_model.py)"""
    df = pd.read_csv(file_path)
    df = df.dropna(subset=['cycle_day'])
    
    # Encode features
    if 'cervical_mucus_encoded' not in df.columns:
        def encode_mucus(x):
            mapping = {'none':0, 'dry':1, 'sticky':2, 'creamy':3, 'watery':4, 'egg-white':5}
            return mapping.get(str(x).lower(), 0)
        df['cervical_mucus_encoded'] = df['cervical_mucus'].apply(encode_mucus)
    
    if 'ovulation_test_encoded' not in df.columns:
        if 'ovulation_test' in df.columns:
            df['ovulation_test_encoded'] = df['ovulation_test'].apply(
                lambda v: 1 if str(v).lower() in ['positive','peak','+'] else 0
            )
        else:
            df['ovulation_test_encoded'] = 0
    
    df['bbt'] = pd.to_numeric(df['bbt'], errors='coerce')
    df['bbt'] = df['bbt'].fillna(df['bbt'].mean())
    
    return df

def prepare_features_with_window(df, window=7):
    """Prepare features with rolling window"""
    print("🔧 Preparing features with rolling window...")
    
    WINDOW = window
    feat_rows = []
    label_rows = []
    
    df['cycle_id'] = df.groupby(['cycle_day']).ngroup()
    unique_cycles = df['cycle_id'].unique()
    
    for cycle_id in unique_cycles:
        cycle_data = df[df['cycle_id'] == cycle_id].sort_values('cycle_day')
        
        if len(cycle_data) < 3:
            continue
        
        bbt_vals = cycle_data['bbt'].ffill().fillna(cycle_data['bbt'].mean())
        mucus_vals = cycle_data['cervical_mucus_encoded']
        lh_vals = cycle_data['ovulation_test_encoded']
        days = cycle_data['cycle_day'].astype(int).tolist()
        
        if 'fertile' in cycle_data.columns:
            labels = cycle_data['fertile']
        elif 'is_ovulation_day' in cycle_data.columns:
            labels = cycle_data['is_ovulation_day']
        else:
            labels = pd.Series([0] * len(cycle_data))
        
        if isinstance(labels, pd.Series):
            labels = labels.tolist()
        
        for idx in range(len(cycle_data)):
            start = max(0, idx - WINDOW + 1)
            window_bbt = bbt_vals.iloc[start:idx+1].values
            
            if len(window_bbt) < WINDOW:
                pad = np.full(WINDOW - len(window_bbt), bbt_vals.iloc[idx])
                window_bbt = np.concatenate([pad, window_bbt])
            
            feat = {
                'bbt_mean_window': np.nanmean(window_bbt),
                'bbt_std_window': np.nanstd(window_bbt) if not np.isnan(np.nanstd(window_bbt)) else 0,
                'bbt_current': bbt_vals.iloc[idx],
                'mucus_current': mucus_vals.iloc[idx] if idx < len(mucus_vals) else 0,
                'lh_current': lh_vals.iloc[idx] if idx < len(lh_vals) else 0,
                'day_in_cycle': days[idx],
                'intercourse': cycle_data.iloc[idx]['intercourse'] if 'intercourse' in cycle_data.columns else 0,
                'energy': cycle_data.iloc[idx]['energy'] if 'energy' in cycle_data.columns else 5,
                'stress': cycle_data.iloc[idx]['stress'] if 'stress' in cycle_data.columns else 5,
                'sleep_hours': cycle_data.iloc[idx]['sleep_hours'] if 'sleep_hours' in cycle_data.columns else 7
            }
            
            feat_rows.append(feat)
            label_rows.append(labels[idx] if idx < len(labels) else 0)
    
    X_df = pd.DataFrame(feat_rows)
    y = np.array(label_rows)
    X_df = X_df.ffill().fillna(0)
    
    print(f"📊 Feature matrix: {X_df.shape}")
    print(f"📊 Positive samples: {y.sum()} ({y.mean()*100:.1f}%)")
    
    return X_df, y

def evaluate_model():
    """Train and evaluate model with detailed metrics"""
    print("=" * 60)
    print("🎯 Model Evaluation with Advanced Metrics")
    print("=" * 60)
    
    # Load data
    df = load_and_preprocess("python/data/fertility_tracking_data.csv")
    
    # Prepare features
    X_df, y = prepare_features_with_window(df, window=7)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_df.values, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n📊 Dataset split:")
    print(f"   Training: {len(X_train)} samples")
    print(f"   Testing: {len(X_test)} samples")
    print(f"   Positive class in test: {y_test.sum()} ({y_test.mean()*100:.1f}%)")
    
    # Load existing model or train new one
    model_path = 'python/models/ovulation_model.h5'
    
    if tf.keras.utils.get_file is None or not __import__('os').path.exists(model_path):
        print("\n⚠️  Model file not found. Training new model...")
        import sys
        sys.path.insert(0, '.')
        from train_ovulation_model import train_model
        model, scaler, history, feature_columns = train_model(X_df, y, epochs=50)
    else:
        print("\n📂 Loading existing model...")
        model = tf.keras.models.load_model(model_path)
    
    # Make predictions
    print("\n🔮 Making predictions...")
    y_pred_proba = model.predict(X_test)[:, 0]
    y_pred = (y_pred_proba >= 0.5).astype(int)
    
    # Calculate metrics
    auc = roc_auc_score(y_test, y_pred_proba)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    # Additional metrics
    accuracy = (tp + tn) / (tp + tn + fp + fn) if (tp + tn + fp + fn) > 0 else 0
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    # Print results
    print("\n" + "=" * 60)
    print("📊 Evaluation Metrics")
    print("=" * 60)
    print(f"✅ Accuracy:   {accuracy*100:.2f}%")
    print(f"✅ AUC-ROC:    {auc:.4f}")
    print(f"✅ Precision:  {precision*100:.2f}%")
    print(f"✅ Recall:     {recall*100:.2f}%")
    print(f"✅ Specificity: {specificity*100:.2f}%")
    print(f"✅ F1 Score:   {f1_score:.4f}")
    
    print("\n📊 Confusion Matrix:")
    print(f"              Predicted")
    print(f"            Neg    Pos")
    print(f"Actual Neg  {tn:4d}   {fp:4d}")
    print(f"        Pos  {fn:4d}   {tp:4d}")
    
    print(f"\n📈 Classification Report:")
    print(f"   True Negatives:  {tn}")
    print(f"   False Positives: {fp}")
    print(f"   False Negatives: {fn}")
    print(f"   True Positives:  {tp}")
    
    # ROC-AUC interpretation
    if auc >= 0.9:
        auc_interp = "Excellent 🟢"
    elif auc >= 0.8:
        auc_interp = "Good 🟡"
    elif auc >= 0.7:
        auc_interp = "Fair 🟠"
    else:
        auc_interp = "Poor 🔴"
    
    print(f"\n🎯 AUC Interpretation: {auc_interp}")
    print(f"   AUC-ROC = {auc:.4f}")
    
    return {
        'accuracy': accuracy,
        'auc': auc,
        'precision': precision,
        'recall': recall,
        'f1': f1_score,
        'specificity': specificity,
        'confusion_matrix': cm
    }

if __name__ == "__main__":
    evaluate_model()

