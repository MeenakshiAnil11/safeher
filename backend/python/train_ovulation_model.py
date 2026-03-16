

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

# CONFIG
DATA_CSV = "python/data/fertility_tracking_data.csv"
SAVE_MODEL_PATH = "python/models/ovulation_model.h5"
SCALER_PATH = "python/models/feature_scaler.pkl"
RANDOM_SEED = 42

np.random.seed(RANDOM_SEED)
tf.random.set_seed(RANDOM_SEED)

def load_and_preprocess_data(file_path):
    """Load and preprocess fertility tracking data"""
    print("📂 Loading data...")
    df = pd.read_csv(file_path)
    print(f"✅ Loaded {len(df)} records")
    
    # Basic cleaning
    df = df.dropna(subset=['cycle_day'])  # at least cycle_day must exist
    
    # Encode cervical mucus (already encoded in synthetic data, but double-check)
    if 'cervical_mucus_encoded' not in df.columns:
        def encode_mucus(x):
            mapping = {'none':0, 'dry':1, 'sticky':2, 'creamy':3, 'watery':4, 'egg-white':5}
            return mapping.get(str(x).lower(), 0)
        df['cervical_mucus_encoded'] = df['cervical_mucus'].apply(encode_mucus)
    
    # Encode ovulation test
    if 'ovulation_test_encoded' not in df.columns:
        if 'ovulation_test' in df.columns:
            df['ovulation_test_encoded'] = df['ovulation_test'].apply(
                lambda v: 1 if str(v).lower() in ['positive','peak','+'] else 0
            )
        else:
            df['ovulation_test_encoded'] = 0
    
    # BBT numeric
    df['bbt'] = pd.to_numeric(df['bbt'], errors='coerce')
    df['bbt'] = df['bbt'].fillna(df['bbt'].mean())
    
    return df

def prepare_features_with_window(df, window=7):
    """
    Prepare features using rolling window approach
    Features:
    - Rolling BBT mean and std (window days)
    - Current BBT
    - Current cervical mucus
    - Current ovulation test
    - Cycle day
    - Intercourse
    - Energy/stress/sleep
    """
    print("🔧 Preparing features with rolling window...")
    
    WINDOW = window
    feat_rows = []
    label_rows = []
    
    # Group by cycle to create windows
    df['cycle_id'] = df.groupby(['cycle_day']).ngroup()  # Simple grouping
    
    unique_cycles = df['cycle_id'].unique()
    
    for cycle_id in unique_cycles:
        cycle_data = df[df['cycle_id'] == cycle_id].sort_values('cycle_day')
        
        if len(cycle_data) < 3:
            continue  # Skip very short cycles
        
        bbt_vals = cycle_data['bbt'].ffill().fillna(cycle_data['bbt'].mean())
        mucus_vals = cycle_data['cervical_mucus_encoded']
        lh_vals = cycle_data['ovulation_test_encoded']
        days = cycle_data['cycle_day'].astype(int).tolist()
        
        # Use fertile as label (simplified - marks fertile window)
        if 'fertile' in cycle_data.columns:
            labels = cycle_data['fertile']
        elif 'is_ovulation_day' in cycle_data.columns:
            labels = cycle_data['is_ovulation_day']
        else:
            labels = pd.Series([0] * len(cycle_data))
        
        if isinstance(labels, pd.Series):
            labels = labels.tolist()
        
        for idx in range(len(cycle_data)):
            # Take previous WINDOW days (including current)
            start = max(0, idx - WINDOW + 1)
            window_bbt = bbt_vals.iloc[start:idx+1].values
            
            # Pad if needed
            if len(window_bbt) < WINDOW:
                pad = np.full(WINDOW - len(window_bbt), bbt_vals.iloc[idx])
                window_bbt = np.concatenate([pad, window_bbt])
            
            # Build feature vector
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
    
    # Fill any remaining NaN
    X_df = X_df.ffill().fillna(0)
    
    print(f"📊 Feature matrix shape: {X_df.shape}")
    print(f"📊 Positive samples: {y.sum()} ({y.mean()*100:.1f}%)")
    
    return X_df, y

def create_model(input_dim):
    """
    Create a neural network model for ovulation prediction
    
    Architecture matches user specifications:
    - Input layer
    - Dense layers with dropout for regularization
    - Output layer (sigmoid for binary classification)
    """
    
    model = Sequential([
        Dense(64, activation='relu', input_shape=(input_dim,)),
        Dropout(0.3),
        Dense(32, activation='relu'),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dropout(0.1),
        Dense(1, activation='sigmoid')
    ])
    
    # Compile model
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC(name='auc')]
    )
    
    return model

def train_model(X_df, y, epochs=100, batch_size=32, validation_split=0.2):
    """Train the ovulation prediction model"""
    
    print("\n🔧 Preparing data...")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_df.values, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )
    
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    
    # Normalize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save scaler for later use
    os.makedirs('../ml_models', exist_ok=True)
    joblib.dump(scaler, SCALER_PATH)
    print(f"✅ Scaler saved to {SCALER_PATH}")
    
    # Create model
    print("\n🧠 Creating model...")
    model = create_model(X_train_scaled.shape[1])
    
    # Display model architecture
    model.summary()
    
    # Define callbacks
    callbacks = [
        EarlyStopping(
            patience=8,
            restore_best_weights=True,
            monitor='val_loss'
        ),
        ModelCheckpoint(
            SAVE_MODEL_PATH,
            save_best_only=True,
            monitor='val_loss'
        )
    ]
    
    # Train model
    print("\n🚀 Training model...")
    history = model.fit(
        X_train_scaled, y_train,
        validation_data=(X_test_scaled, y_test),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate model
    print("\n📊 Evaluating model...")
    loss, acc, auc = model.evaluate(X_test_scaled, y_test, verbose=0)
    print(f"Test loss: {loss:.4f}, acc: {acc:.4f}, auc: {auc:.4f}")
    
    # Additional metrics
    y_pred_proba = model.predict(X_test_scaled)
    y_pred = (y_pred_proba > 0.5).astype(int)
    
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred))
    
    print("\n📊 Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    
    print("\n✅ Model saved to", SAVE_MODEL_PATH)
    
    return model, scaler, history, X_df.columns.tolist()

def save_scaler_as_json(scaler):
    """Save scaler parameters as JSON for Node.js compatibility"""
    try:
        scaler_params = {
            'mean': scaler.mean_ if hasattr(scaler, 'mean_') else list(scaler.center_),
            'scale': scaler.scale_ if hasattr(scaler, 'scale_') else list(scaler.scale)
        }
        
        # Convert numpy arrays to lists
        if hasattr(scaler_params['mean'], 'tolist'):
            scaler_params['mean'] = scaler_params['mean'].tolist()
        if hasattr(scaler_params['scale'], 'tolist'):
            scaler_params['scale'] = scaler_params['scale'].tolist()
        
        import json
        os.makedirs('models', exist_ok=True)
        
        json_path = 'models/feature_scaler.json'
        with open(json_path, 'w') as f:
            json.dump(scaler_params, f)
        
        print(f"✅ Scaler saved as JSON to {json_path}")
    except Exception as e:
        print(f"⚠️  Could not save scaler as JSON: {e}")

def save_feature_names(feature_columns):
    """Save feature column names for later use"""
    joblib.dump(feature_columns, 'python/models/feature_columns.pkl')
    print("✅ Feature names saved")

def main():
    """Main training pipeline"""
    print("=" * 60)
    print("🎯 Ovulation Prediction Model Training")
    print("=" * 60)
    
    # Step 1: Load and preprocess data
    df = load_and_preprocess_data(DATA_CSV)
    
    # Step 2: Prepare features with rolling window
    X_df, y = prepare_features_with_window(df, window=7)
    
    # Step 3: Train model
    model, scaler, history, feature_columns = train_model(X_df, y, epochs=100)
    
    # Step 4: Save scaler as JSON for Node.js
    save_scaler_as_json(scaler)
    
    # Step 5: Save feature names
    save_feature_names(feature_columns)
    
    print("\n" + "=" * 60)
    print("✅ Training complete!")
    print("=" * 60)
    print(f"\n📁 Model files saved:")
    print(f"   - {SAVE_MODEL_PATH}")
    print(f"   - {SCALER_PATH}")
    print(f"   - python/models/feature_scaler.json (for Node.js)")
    print(f"   - python/models/feature_columns.pkl")
    print("\n📝 Next steps:")
    print("   1. Test the model with: python prediction_api.py")
    print("   2. Start Python API service")
    print("   3. Test Node.js integration")
    print("   4. Optional: Convert to TFJS: python convert_to_tfjs.py")

if __name__ == "__main__":
    main()

