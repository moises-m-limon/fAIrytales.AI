from flask import Flask, request, jsonify, send_file, g
from flask_cors import CORS
import requests
from openai import OpenAI
import os
from dotenv import load_dotenv
import re

load_dotenv()

API_KEY = os.getenv("API_KEY")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://192.0.0.2:3000"}})

INVOKE_URL_IMAGES = "https://ai.api.nvidia.com/v1/genai/nvidia/consistory"


def get_subject(prompt):
    summary_pattern = r"(?<=Summary:\s).*"
    scene_prompt_1_pattern = r"(?<=Scene Prompt 1:\s).*"
    scene_prompt_2_pattern = r"(?<=Scene Prompt 2:\s).*"
    subjects_pattern = r"(?<=Subjects:\s).*"

    client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=API_KEY
    )
    completion = client.chat.completions.create(
        model="rakuten/rakutenai-7b-chat",
        messages=[{"role": "system", "content": "You are an expert in grammar and text analysis. Your task is \
                   to:Summarize the given text in 10 words or less (focusing on the main idea).\
                   Extract two descriptive scene prompts based on vivid or key moments in the text.\
                   Identify the two main primary subjects from the text (e.g., key entities).\
                   Return the output in the following format: Summary: [10-word summary]\
                   Scene Prompt 1: [First scene prompt]\
                   Scene Prompt 2: [Second scene prompt]\
                   Subjects: [Subject 1], [Subject 2]"}, {
            "role": "user", "content": prompt}],
        temperature=0.0,
        top_p=0.7,
        max_tokens=200,
    )
    summary = re.search(
        summary_pattern, completion.choices[0].message.content).group(0)
    scene_prompt_1 = re.search(
        scene_prompt_1_pattern, completion.choices[0].message.content).group(0)
    scene_prompt_2 = re.search(
        scene_prompt_2_pattern, completion.choices[0].message.content).group(0)
    subjects = re.search(
        subjects_pattern, completion.choices[0].message.content).group(0)
    return (summary, scene_prompt_1, scene_prompt_2, subjects)


@app.route('/generate-images', methods=['POST'])
def generate_images():
    try:
        user_input = request.json.get("prompt", "").strip()
        if not user_input:
            return jsonify({"error": "subject_prompt is required."}), 400

        print(user_input)
        g.response = get_subject(user_input)
        payload = {
            "mode": "init",
            "subject_prompt": g.response[0],
            "subject_tokens": str.split(g.response[3], ","),
            "subject_seed": 43,
            "style_prompt": "An old story illustration",
            "scene_prompt1": g.response[1],
            "scene_prompt2": g.response[2],
            "negative_prompt": "",
            "cfg_scale": 5,
            "same_initial_noise": False
        }

        # Define the headers for NVIDIA API
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Accept": "application/json",
        }

        response = requests.post(
            INVOKE_URL_IMAGES, headers=headers, json=payload)
        response.raise_for_status()  # Raise an error if the request fails

        # Get the response data
        data = response.json()

        # Process the images and return them as base64 strings
        images = []
        for img_data in data.get('artifacts', []):
            img_base64 = img_data["base64"]
            images.append(img_base64)

        return jsonify({"images": images})

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/generate-text', methods=['POST'])
def generate_text():
    try:
        user_input = request.json.get("prompt", "").strip()
        if not user_input:
            return jsonify({"error": "prompt is required."}), 400

        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=API_KEY
        )

        response = client.chat.completions.create(
            model="writer/palmyra-creative-122b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a creative writer. Generate a short story consisting of two parts. "
                        "Each part should be 3-4 sentences long. Ensure that the second part includes "
                        "a conclusion that ties the story together. Format the output as follows:\n"
                        "PART 1: [First part of the story]\n"
                        "PART 2: [Second part of the story, with a conclusion]"
                    ),
                },
                {"role": "user", "content": user_input},
            ],
            temperature=0.5,
            top_p=1,
            max_tokens=1024,
        )
        generated_text = response.choices[0].message.content
        print(generated_text)

        # Use regex to extract PART 1 and PART 2
        matches = re.findall(r"PART 1:(.*?)(?:PART 2:|$)(.*)", generated_text, re.DOTALL)
        if matches:
            part_1, part_2 = matches[0]
            part_1 = part_1.strip()  # Clean up extra spaces
            part_2 = part_2.strip()  # Clean up extra spaces

            # Return the parts as JSON
            return jsonify({"PART 1": part_1, "PART 2": part_2})
        else:
            # If parsing fails, return the raw output for debugging
            return jsonify({"error": "Failed to parse generated text.", "raw_output": generated_text}), 500

    except Exception as e:
        print(f"Unhandled error: {e}")
        return jsonify({"error": "Internal server error.", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
