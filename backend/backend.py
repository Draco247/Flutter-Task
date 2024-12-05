from flask import Flask, request, jsonify
from openai import OpenAI, OpenAIError
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_KEY'))
app = Flask(__name__)
CORS(app)

# In-memory cache for generated images
image_cache = {}

@app.route("/generate_image", methods=["POST"])
def generate_image():
    data = request.json
    story_segment = data.get("scene_description")
    style = data.get("style", "")

    if not story_segment:
        return jsonify({"error": "Scene description is required"}), 400

    prompt = f"{story_segment} in {style} style" if style else story_segment

    # Check if the image has already been generated for this prompt
    cache_key = f"{prompt}"
    if cache_key in image_cache:
        return jsonify({"image_url": image_cache[cache_key]})

    try:
        response = client.images.generate(
            prompt=prompt,
            model="dall-e-3",
            n=1,
            size="1024x1024"
        )
        image_url = response.data[0].url
        image_cache[cache_key] = image_url  # Cache the generated image URL
        return jsonify({"image_url": image_url})

    except OpenAIError as e:
        return jsonify({"error": f"OpenAI API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
