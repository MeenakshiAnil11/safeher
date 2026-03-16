"""
Convert Keras .h5 model to TensorFlow.js format
This allows loading the model directly in Node.js with @tensorflow/tfjs-node
"""

import os
import sys

def convert_model_to_tfjs():
    """
    Convert the trained Keras model to TensorFlow.js format
    
    Requirements:
    - Model file: models/ovulation_model.h5
    - Output: models/tfjs_model/ (folder with model.json + shards)
    """
    
    print("=" * 60)
    print("🔄 Converting Model to TensorFlow.js Format")
    print("=" * 60)
    
    # Check if model exists
    model_path = 'models/ovulation_model.h5'
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        print("Please train the model first: python train_ovulation_model.py")
        return False
    
    # Check if tensorflowjs is installed
    try:
        import tensorflowjs as tfjs
        print("✅ tensorflowjs module found")
    except ImportError:
        print("❌ tensorflowjs not installed")
        print("\nInstall with:")
        print("  pip install tensorflowjs")
        print("\nOr if you have it globally:")
        print("  tensorflowjs_converter --input_format=keras models/ovulation_model.h5 models/tfjs_model")
        return False
    
    # Create output directory
    output_dir = 'models/tfjs_model'
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"\n📂 Input: {model_path}")
    print(f"📂 Output: {output_dir}")
    
    try:
        print("\n🔄 Converting model...")
        
        # Convert model
        tfjs.converters.save_keras_model(
            tf.keras.models.load_model(model_path),
            output_dir
        )
        
        print(f"\n✅ Conversion complete!")
        print(f"📁 TFJS model saved to: {output_dir}/")
        
        # List files
        files = os.listdir(output_dir)
        print(f"\n📄 Files created ({len(files)}):")
        for file in files:
            print(f"   - {file}")
        
        print("\n" + "=" * 60)
        print("✅ TensorFlow.js conversion complete!")
        print("=" * 60)
        print("\n📝 Next steps:")
        print("   1. Install @tensorflow/tfjs-node in Node.js project")
        print("   2. Load model with: tf.loadLayersModel('file://path/to/tfjs_model')")
        print("   3. Use in Node.js ML service")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Conversion failed: {e}")
        return False

if __name__ == "__main__":
    # Add parent directory to path for imports
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    try:
        import tensorflow as tf
        import tensorflowjs as tfjs
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("\nInstall with:")
        print("  pip install tensorflow tensorflowjs")
        sys.exit(1)
    
    convert_model_to_tfjs()

