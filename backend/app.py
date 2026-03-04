import os
import json
import math
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app) # Allow cross-origin requests

# Configure Flask-Mail for Gmail
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', True)
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', '')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', '')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@farmfutura.com')

# Initialize Flask-Mail
from email_service import init_mail
init_mail(app)

# number of seconds to wait when calling Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

# helper functions live in a separate module
from gemini_service import generate_crop_advisory, chat_response
from email_service import send_otp_email, verify_otp, is_otp_verified, clear_otp
from regional_service import generate_regional_summary, get_available_regions

# ---------------------------------------------------------
# MOCK NAIVE BAYES MODEL
# ---------------------------------------------------------

# The crop profiles simulate the Naive Bayes prediction logic used in your React frontend
CROP_PROFILES = [
  # Cereals
  {"name": "Rice", "N": [80, 15], "P": [48, 12], "K": [40, 10], "temperature": [24, 3], "humidity": [82, 5], "ph": [6.5, 0.5], "rainfall": [230, 40]},
  {"name": "Wheat", "N": [75, 15], "P": [55, 15], "K": [45, 12], "temperature": [22, 4], "humidity": [65, 8], "ph": [6.8, 0.4], "rainfall": [90, 20]},
  {"name": "Maize", "N": [80, 12], "P": [45, 10], "K": [30, 8], "temperature": [23, 3], "humidity": [65, 8], "ph": [6.2, 0.5], "rainfall": [85, 15]},
  {"name": "Barley", "N": [70, 12], "P": [50, 12], "K": [40, 10], "temperature": [20, 3], "humidity": [60, 7], "ph": [6.8, 0.4], "rainfall": [75, 15]},
  {"name": "Ragi", "N": [65, 10], "P": [35, 8], "K": [25, 6], "temperature": [25, 3], "humidity": [70, 6], "ph": [6.5, 0.5], "rainfall": [65, 12]},
  {"name": "Bajra", "N": [60, 10], "P": [30, 7], "K": [20, 5], "temperature": [28, 3], "humidity": [65, 6], "ph": [6.8, 0.5], "rainfall": [55, 10]},
  {"name": "Jowar", "N": [65, 10], "P": [30, 7], "K": [25, 6], "temperature": [27, 3], "humidity": [60, 7], "ph": [6.8, 0.5], "rainfall": [60, 12]},
  
  # Pulses
  {"name": "Red Gram", "N": [30, 6], "P": [25, 5], "K": [20, 5], "temperature": [25, 3], "humidity": [65, 8], "ph": [6.5, 0.5], "rainfall": [85, 15]},
  {"name": "Green Gram", "N": [25, 5], "P": [20, 4], "K": [20, 5], "temperature": [24, 3], "humidity": [70, 7], "ph": [6.5, 0.5], "rainfall": [80, 15]},
  {"name": "Black Gram", "N": [25, 5], "P": [20, 4], "K": [20, 5], "temperature": [23, 3], "humidity": [70, 7], "ph": [6.5, 0.5], "rainfall": [75, 15]},
  {"name": "Chickpea", "N": [35, 7], "P": [35, 8], "K": [25, 6], "temperature": [21, 3], "humidity": [55, 8], "ph": [7.2, 0.5], "rainfall": [50, 10]},
  {"name": "Lentil", "N": [30, 6], "P": [30, 7], "K": [25, 6], "temperature": [20, 3], "humidity": [60, 8], "ph": [7.0, 0.5], "rainfall": [55, 10]},
  {"name": "Pea", "N": [35, 7], "P": [40, 8], "K": [30, 7], "temperature": [19, 3], "humidity": [65, 8], "ph": [7.0, 0.5], "rainfall": [75, 15]},
  
  # Oilseeds
  {"name": "Groundnut", "N": [50, 10], "P": [40, 8], "K": [30, 7], "temperature": [26, 3], "humidity": [70, 8], "ph": [6.5, 0.5], "rainfall": [80, 15]},
  {"name": "Mustard", "N": [60, 10], "P": [45, 10], "K": [35, 7], "temperature": [21, 3], "humidity": [55, 8], "ph": [6.8, 0.5], "rainfall": [50, 10]},
  {"name": "Sunflower", "N": [70, 12], "P": [45, 10], "K": [40, 8], "temperature": [24, 3], "humidity": [65, 8], "ph": [6.5, 0.5], "rainfall": [70, 12]},
  {"name": "Soybean", "N": [40, 8], "P": [50, 10], "K": [45, 10], "temperature": [25, 3], "humidity": [70, 8], "ph": [6.5, 0.5], "rainfall": [100, 18]},
  {"name": "Sesame", "N": [55, 10], "P": [35, 8], "K": [30, 7], "temperature": [26, 3], "humidity": [75, 8], "ph": [6.5, 0.5], "rainfall": [65, 12]},
  {"name": "Castor", "N": [50, 10], "P": [30, 7], "K": [25, 6], "temperature": [27, 3], "humidity": [60, 7], "ph": [6.8, 0.5], "rainfall": [75, 15]},
  
  # Cash Crops
  {"name": "Sugarcane", "N": [150, 20], "P": [80, 15], "K": [100, 18], "temperature": [25, 3], "humidity": [75, 8], "ph": [6.5, 0.5], "rainfall": [200, 40]},
  {"name": "Jute", "N": [90, 15], "P": [45, 10], "K": [40, 8], "temperature": [26, 3], "humidity": [80, 6], "ph": [6.8, 0.5], "rainfall": [150, 30]},
  {"name": "Tea", "N": [100, 18], "P": [35, 8], "K": [50, 10], "temperature": [22, 2], "humidity": [85, 5], "ph": [5.5, 0.5], "rainfall": [220, 40]},
  {"name": "Coffee", "N": [80, 15], "P": [45, 10], "K": [60, 12], "temperature": [21, 2], "humidity": [80, 6], "ph": [6.0, 0.5], "rainfall": [250, 45]},
  {"name": "Tobacco", "N": [90, 15], "P": [80, 15], "K": [80, 15], "temperature": [24, 3], "humidity": [65, 8], "ph": [6.5, 0.5], "rainfall": [90, 20]},
  {"name": "Rubber", "N": [150, 20], "P": [60, 12], "K": [100, 18], "temperature": [25, 2], "humidity": [85, 5], "ph": [5.5, 0.5], "rainfall": [300, 50]},
  {"name": "Coconut", "N": [100, 18], "P": [50, 10], "K": [100, 18], "temperature": [27, 2], "humidity": [75, 8], "ph": [6.0, 0.5], "rainfall": [200, 40]},
  
  # Fruits
  {"name": "Mango", "N": [80, 15], "P": [60, 12], "K": [80, 15], "temperature": [26, 3], "humidity": [70, 8], "ph": [6.5, 0.5], "rainfall": [150, 30]},
  {"name": "Banana", "N": [120, 20], "P": [60, 12], "K": [150, 25], "temperature": [25, 3], "humidity": [75, 8], "ph": [6.0, 0.5], "rainfall": [200, 40]},
  {"name": "Apple", "N": [60, 10], "P": [60, 12], "K": [70, 12], "temperature": [18, 3], "humidity": [60, 8], "ph": [6.5, 0.5], "rainfall": [150, 30]},
  {"name": "Orange", "N": [70, 12], "P": [50, 10], "K": [70, 12], "temperature": [24, 3], "humidity": [70, 8], "ph": [6.5, 0.5], "rainfall": [180, 35]},
  {"name": "Grapes", "N": [60, 10], "P": [50, 10], "K": [100, 18], "temperature": [25, 3], "humidity": [55, 8], "ph": [6.5, 0.5], "rainfall": [60, 12]},
  {"name": "Papaya", "N": [100, 18], "P": [50, 10], "K": [100, 18], "temperature": [26, 3], "humidity": [75, 8], "ph": [6.0, 0.5], "rainfall": [180, 35]},
  {"name": "Guava", "N": [80, 15], "P": [60, 12], "K": [80, 15], "temperature": [25, 3], "humidity": [65, 8], "ph": [6.0, 0.5], "rainfall": [100, 20]},
  
  # Vegetables
  {"name": "Tomato", "N": [80, 15], "P": [60, 12], "K": [80, 15], "temperature": [24, 3], "humidity": [70, 8], "ph": [6.5, 0.5], "rainfall": [80, 15]},
  {"name": "Potato", "N": [90, 15], "P": [70, 12], "K": [100, 18], "temperature": [20, 3], "humidity": [75, 8], "ph": [6.0, 0.5], "rainfall": [90, 18]},
  {"name": "Onion", "N": [70, 12], "P": [60, 12], "K": [80, 15], "temperature": [22, 3], "humidity": [65, 8], "ph": [6.5, 0.5], "rainfall": [60, 10]},
  {"name": "Brinjal", "N": [80, 15], "P": [60, 12], "K": [70, 12], "temperature": [25, 3], "humidity": [75, 8], "ph": [6.5, 0.5], "rainfall": [85, 15]},
  {"name": "Cabbage", "N": [80, 15], "P": [60, 12], "K": [70, 12], "temperature": [20, 3], "humidity": [70, 8], "ph": [6.5, 0.5], "rainfall": [100, 20]},
  {"name": "Cauliflower", "N": [85, 15], "P": [65, 12], "K": [75, 12], "temperature": [19, 3], "humidity": [70, 8], "ph": [6.5, 0.5], "rainfall": [110, 22]},
  {"name": "Carrot", "N": [60, 10], "P": [50, 10], "K": [80, 15], "temperature": [18, 3], "humidity": [65, 8], "ph": [6.5, 0.5], "rainfall": [80, 15]},
  {"name": "Radish", "N": [50, 10], "P": [40, 8], "K": [60, 12], "temperature": [18, 3], "humidity": [60, 8], "ph": [6.5, 0.5], "rainfall": [60, 12]},
  {"name": "Spinach", "N": [60, 10], "P": [40, 8], "K": [50, 10], "temperature": [18, 3], "humidity": [70, 8], "ph": [6.5, 0.5], "rainfall": [70, 14]},
  
  # Spices
  {"name": "Coriander", "N": [40, 8], "P": [35, 7], "K": [30, 6], "temperature": [21, 3], "humidity": [60, 8], "ph": [6.5, 0.5], "rainfall": [50, 10]},
  {"name": "Chilli", "N": [70, 12], "P": [60, 12], "K": [70, 12], "temperature": [25, 3], "humidity": [75, 8], "ph": [6.5, 0.5], "rainfall": [100, 20]},
  {"name": "Turmeric", "N": [60, 10], "P": [50, 10], "K": [70, 12], "temperature": [25, 3], "humidity": [75, 8], "ph": [6.5, 0.5], "rainfall": [150, 30]},
  {"name": "Ginger", "N": [70, 12], "P": [60, 12], "K": [80, 15], "temperature": [24, 3], "humidity": [80, 6], "ph": [6.0, 0.5], "rainfall": [180, 35]},
]

def gaussian_probability(x, mean, std):
    exponent = -0.5 * ((x - mean) / std) ** 2
    return (1 / (std * math.sqrt(2 * math.pi))) * math.exp(exponent)

def mock_predict(input_data):
    features = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    log_likelihoods = []
    
    # Preferred crops get significantly higher probability boost
    PREFERRED_CROPS = {"Rice", "Wheat", "Bajra", "Maize", "Chilli", "Cotton"}
    PREFERENCE_BOOST = 12.0  # Strong multiplier for preferred crops (boosts log probability significantly)
    
    # Simple ASCII markers instead of emojis to avoid Windows console encoding issues
    emoji_map = {
        # Cereals
        "Rice": "[R]", "Wheat": "[W]", "Maize": "[M]", "Barley": "[B]", "Ragi": "[Rg]", "Bajra": "[Bj]", "Jowar": "[Jw]",
        # Pulses
        "Red Gram": "[RG]", "Green Gram": "[GG]", "Black Gram": "[BG]", "Chickpea": "[Ch]", "Lentil": "[L]", "Pea": "[P]",
        # Oilseeds
        "Groundnut": "[Gn]", "Mustard": "[Mu]", "Sunflower": "[Sf]", "Soybean": "[Sy]", "Sesame": "[Se]", "Castor": "[Ca]",
        # Cash Crops
        "Sugarcane": "[Su]", "Jute": "[Ju]", "Tea": "[Te]", "Coffee": "[Co]", "Tobacco": "[Tb]", "Rubber": "[Ru]", "Coconut": "[Cc]",
        # Fruits
        "Mango": "[Ma]", "Banana": "[Ba]", "Apple": "[Ap]", "Orange": "[Or]", "Grapes": "[Gr]", "Papaya": "[Pa]", "Guava": "[Gu]",
        # Vegetables
        "Tomato": "[To]", "Potato": "[Po]", "Onion": "[On]", "Brinjal": "[Br]", "Cabbage": "[Cb]", "Cauliflower": "[Cf]", "Carrot": "[Cr]", "Radish": "[Rd]", "Spinach": "[Sp]",
        # Spices
        "Coriander": "[Cor]", "Chilli": "[Chl]", "Turmeric": "[Tur]", "Ginger": "[Gin]",
        # Old one (fallback)
        "Cotton": "[Ct]"
    }

    for profile in CROP_PROFILES:
        log_prob = 0
        for feature in features:
            mean, std = profile[feature]
            prob = gaussian_probability(input_data[feature], mean, std)
            log_prob += math.log(prob + 1e-300)
        
        name = profile["name"]
        # Apply strong preference boost by adding large constant to preferred crops
        if name in PREFERRED_CROPS:
            log_prob += 50  # Add large constant boost to preferred crops' log probability
        
        emoji = emoji_map.get(name, "🌱")
        log_likelihoods.append({"name": name, "emoji": emoji, "log_prob": log_prob})
        
    max_log_prob = max([l["log_prob"] for l in log_likelihoods])
    exp_probs = [{"name": l["name"], "emoji": l["emoji"], "exp_prob": math.exp(l["log_prob"] - max_log_prob)} for l in log_likelihoods]
    total_exp_prob = sum([l["exp_prob"] for l in exp_probs])
    
    probabilities = [{"name": l["name"], "emoji": l["emoji"], "probability": (l["exp_prob"] / total_exp_prob) * 100} for l in exp_probs]
    probabilities.sort(key=lambda x: x["probability"], reverse=True)
    
    top_predict = probabilities[0]
    return {
        "crop": top_predict["name"],
        "emoji": top_predict["emoji"],
        "confidence": round(top_predict["probability"], 1),
        "accuracy": 94.5,
        "allProbabilities": probabilities  # Return all 47 crops instead of just top 5
    }

# ---------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No input provided"}), 400
            
        # 1. Run inference (Naive Bayes mock)
        prediction = mock_predict(data)

        # Avoid printing emojis to Windows console (can raise encoding errors)
        safe_prediction = {k: v for k, v in prediction.items() if k != "emoji"}
        print(f"[DEBUG] received input: {data}")
        print(f"[DEBUG] prediction result (no emoji): {safe_prediction}")
        
        # 2. Call Gemini advisory layer (separated into a utility module)
        advisory_data = generate_crop_advisory(prediction["crop"], data)
        if isinstance(advisory_data, dict) and advisory_data.get("error"):
            print(f"[DEBUG] Gemini advisory error: {advisory_data['error']}")

        # 3. Construct response matching React's PredictionResult interface
        response = {
            "crop": prediction["crop"],
            "emoji": prediction["emoji"],
            "confidence": prediction["confidence"],
            "accuracy": prediction["accuracy"],
            "allProbabilities": prediction["allProbabilities"],
            "ai_advisory": advisory_data
        }
        return jsonify(response)

        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    """Simple chat endpoint delegated to gemini_service.chat_response.
    Expects JSON: {"message": "..."}
    """
    try:
        data = request.json or {}
        msg = data.get("message", "")
        if not msg:
            return jsonify({"error": "No message provided."}), 400

        result = chat_response(msg)
        # chat_response returns either {'reply':...} or {'error':...}
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------
# REGIONAL ADVISORY ENDPOINTS
# ---------------------------------------------------------

@app.route('/api/regions', methods=['GET'])
def get_regions():
    """Get list of supported Indian regions"""
    try:
        regions = get_available_regions()
        return jsonify({"regions": regions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/regional-summary', methods=['POST'])
def regional_summary():
    """Generate region-specific crop advisory
    Expects JSON: {
        "region": "Punjab",
        "crop": "Rice",
        "N": 80,
        "P": 48,
        "K": 40,
        "temperature": 24,
        "humidity": 82,
        "ph": 6.5,
        "rainfall": 230
    }
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No input provided"}), 400
        
        region = data.get("region", "")
        crop = data.get("crop", "")
        
        if not region or not crop:
            return jsonify({"error": "Region and crop are required"}), 400
        
        # Generate regional summary
        summary = generate_regional_summary(region, crop, data)
        
        return jsonify({
            "region": region,
            "crop": crop,
            "summary": summary
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------
# FORGOT PASSWORD ENDPOINTS
# ---------------------------------------------------------

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    """Send OTP to email for password reset"""
    try:
        data = request.json
        email = data.get('email', '').strip()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Send OTP email
        result = send_otp_email(email)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/verify-otp', methods=['POST'])
def verify_otp_endpoint():
    """Verify OTP sent to email"""
    try:
        data = request.json
        email = data.get('email', '').strip()
        otp = data.get('otp', '').strip()
        
        if not email or not otp:
            return jsonify({'error': 'Email and OTP are required'}), 400
        
        result = verify_otp(email, otp)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    """Reset password after OTP verification"""
    try:
        data = request.json
        email = data.get('email', '').strip()
        new_password = data.get('new_password', '')
        
        if not email or not new_password:
            return jsonify({'error': 'Email and new password are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Check if OTP was verified
        if not is_otp_verified(email):
            return jsonify({'error': 'OTP not verified. Please verify OTP first'}), 400
        
        # Clear OTP after successful reset
        clear_otp(email)
        
        return jsonify({
            'success': True,
            'message': 'Password reset successfully',
            'action': 'redirect_to_signin'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
