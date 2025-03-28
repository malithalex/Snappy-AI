# from flask import Flask, request, jsonify
# import base64
# from io import BytesIO
# from PIL import Image
# import torch

# app = Flask(__name__)

# # Dummy model inference function
# def predict_camera_adjustment(image: Image.Image, bbox: dict, state: dict):
#     """
#     Dummy function: Replace this with your actual model inference code.
#     Uses the image, bounding box and state information to predict the optimal camera settings.
    
#     :param image: PIL Image captured from the camera.
#     :param bbox: Dictionary with keys x, y, width, height of the detected object.
#     :param state: Additional state data (if any).
#     :return: A dictionary with predicted camera angle, zoom level, and feedback text.
#     """
#     # For demonstration, simply return dummy values.
#     return {
#         "angle": 15,            # optimal camera angle adjustment in degrees
#         "zoom": 1.2,            # optimal zoom level (multiplier)
#         "feedback": "Your shot is slightly off-center. Try rotating your camera 15° to the right and zoom in a bit for a balanced composition."
#     }

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         data = request.get_json()
#         if not data or 'image' not in data or 'bbox' not in data:
#             return jsonify({"error": "Missing required fields: 'image' and 'bbox'"}), 400

#         image_base64 = data['image']
#         bbox = data['bbox']  # expected format: { "x": number, "y": number, "width": number, "height": number }
#         state = data.get("state", {})  # optional extra state data

#         # Decode base64 image to PIL Image
#         image_data = base64.b64decode(image_base64)
#         image = Image.open(BytesIO(image_data)).convert("RGB")

#         # Predict camera adjustment settings
#         prediction = predict_camera_adjustment(image, bbox, state)

#         return jsonify({
#             "success": True,
#             "prediction": prediction
#         })
#     except Exception as e:
#         return jsonify({
#             "success": False,
#             "error": str(e)
#         }), 500

# if __name__ == '__main__':
#     # Run on localhost for testing
#     app.run(host='0.0.0.0', port=5000, debug=True)

from flask import Flask, request, jsonify
import os
import shutil

app = Flask(__name__)
TEMP_FOLDER = "/temp_images"  # Match TEMP_FOLDER from frontend

def run_rl_model(image_path, bbox):
    # Placeholder for your RL model logic
    return {"label": "example", "confidence": 0.95}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    filename = data["filename"]
    bbox = data["bbox"]
    image_path = os.path.join(TEMP_FOLDER, filename)

    if not os.path.exists(image_path):
        return jsonify({"error": "Image not found"}), 404

    # Process the image with your RL model
    prediction = run_rl_model(image_path, bbox)

    # Delete the image after processing
    if os.path.exists(image_path):
        os.remove(image_path)
        print(f"Deleted temp image: {image_path}")

    return jsonify({"status": "success", "prediction": prediction}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)







# from flask import Flask, request, jsonify
# import os
# import cv2
# import numpy as np

# app = Flask(__name__)

# # Define the temp images folder path
# TEMP_IMAGES_DIR = "temp_images"

# # Ensure the temp images folder exists
# if not os.path.exists(TEMP_IMAGES_DIR):
#     os.makedirs(TEMP_IMAGES_DIR)

# @app.route("/predict", methods=["POST"])
# def predict():
#     try:
#         # Get the JSON payload
#         data = request.get_json()
#         filename = data.get("filename")
#         bbox = data.get("bbox")

#         if not filename or not bbox:
#             return jsonify({"error": "Missing filename or bbox"}), 400

#         # Construct the full path to the image
#         image_path = os.path.join(TEMP_IMAGES_DIR, filename)
#         if not os.path.exists(image_path):
#             return jsonify({"error": "Image not found"}), 404

#         # Read the image
#         image = cv2.imread(image_path)
#         if image is None:
#             return jsonify({"error": "Failed to read image"}), 500

#         # For demo: Simulate angle prediction (replace with your RL model)
#         # Here, we just return a dummy angle based on bbox position
#         x, y, width, height = bbox["x"], bbox["y"], bbox["width"], bbox["height"]
#         angle = (x + y) % 360  # Dummy calculation

#         # Delete the image after processing
#         os.remove(image_path)
#         print(f"Deleted temp image: {image_path}")

#         # Return the prediction
#         return jsonify({
#             "status": "success",
#             "angle": angle,
#             "message": f"Position the camera at {angle} degrees for the best shot"
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)