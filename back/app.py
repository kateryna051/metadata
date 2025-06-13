from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymediainfo import MediaInfo
import os
import pandas as pd
import uuid
from werkzeug.utils import secure_filename
from mysql.connector import connect, Error
from argon2 import PasswordHasher

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
GENERATED_FOLDER = "generated"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(GENERATED_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# MySQL config
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "kateryna",
    "database": "video_metadata_db"
}

ph = PasswordHasher()

def get_db_connection():
    try:
        connection = connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def test_db_connection():
    connection = get_db_connection()
    if connection:
        print("✅ Successfully connected to MySQL database.")
        connection.close()
    else:
        print("❌ Failed to connect to MySQL database.")
# Create users table (run once)
def create_users_table():
    connection = get_db_connection()
    if not connection:
        return
    cursor = connection.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL
        )
    """)
    connection.commit()
    cursor.close()
    connection.close()

create_users_table()
test_db_connection() 
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    password_hash = ph.hash(password)

    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, password_hash))
        connection.commit()
    except Error as e:
        cursor.close()
        connection.close()
        if "Duplicate entry" in str(e):
            return jsonify({"error": "Username already exists"}), 409
        return jsonify({"error": "Database error"}), 500

    cursor.close()
    connection.close()
    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if user is None:
        return jsonify({"error": "Invalid username or password"}), 401

    try:
        ph.verify(user["password_hash"], password)
    except:
        return jsonify({"error": "Invalid username or password"}), 401

    # For simplicity, just return success message 
    return jsonify({"message": "Login successful"}), 200

@app.route("/upload", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    metadata = extract_metadata(filepath)
    return jsonify(metadata)

@app.route("/generate_excel", methods=["POST"])
def generate_excel():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    df = pd.json_normalize(data)
    filename = f"{uuid.uuid4().hex}_metadata.xlsx"
    filepath = os.path.join(GENERATED_FOLDER, filename)
    df.to_excel(filepath, index=False)

    return jsonify({"filename": filename})

@app.route("/download_excel/<filename>", methods=["GET"])
def download_excel(filename):
    filepath = os.path.join(GENERATED_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
    return send_file(filepath, as_attachment=True)

def extract_metadata(filepath):
    media_info = MediaInfo.parse(filepath)
    result = []
    for track in media_info.tracks:
        if track.track_type in ["General", "Video", "Audio"]:
            data = track.to_data()
            data["track_type"] = track.track_type
            result.append(data)
    return result

if __name__ == "__main__":
    app.run(debug=True)
