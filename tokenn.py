import os
from livekit import api
from dotenv import load_dotenv

load_dotenv()

def generate_token(identity: str, room: str) -> str:
    API_KEY = os.getenv("LIVEKIT_API_KEY")
    API_SECRET = os.getenv("LIVEKIT_API_SECRET")

    token = api.AccessToken(API_KEY, API_SECRET)\
        .with_identity(identity)\
        .with_name(identity)\
        .with_grants(api.VideoGrants(room_join=True, room=room))

    jwt = token.to_jwt()   # ✅ no ttl for older versions
    return jwt

if __name__ == "__main__":
    print(generate_token("user-1", "test-room"))
