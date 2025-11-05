from flask import Flask, jsonify
from tokenn import generate_token

app = Flask(__name__)

@app.route("/token/<identity>")
def get_token(identity):
    room_name = "test-room"
    try:
        token = generate_token(identity, room_name)
        return jsonify({"token": token, "room": room_name})
    except Exception as e:
        print("❌ SERVER ERROR:", e)   # print error in terminal
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
