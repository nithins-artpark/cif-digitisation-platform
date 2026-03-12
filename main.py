import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")  # from .env
base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

response = requests.post(
    f"{base_url}/chat/completions",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    },
    json={
        "model": "openai/gpt-4o-mini",
        "messages": [
            {"role": "user", "content": "Give me 2 lines about dengue prevention."}
        ],
    },
    timeout=30,
)

response.raise_for_status()
print(response.json()["choices"][0]["message"]["content"])
