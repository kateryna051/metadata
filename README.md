
## 🗄️ MySQL Database Setup

Run the following SQL commands to create the database and `users` table:

```sql
CREATE DATABASE IF NOT EXISTS video_metadata_db;
USE video_metadata_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

⚙️ Backend Setup (back/)
Navigate to the back/ directory:
cd back
Install required Python packages:
pip install flask flask-cors pymediainfo pandas mysql-connector-python argon2-cffi
Run the backend server:
python app.py
By default, it runs at: http://127.0.0.1:5000/

🖼️ Frontend Setup (frontik/)
Navigate to the frontend directory:
cd frontik
Install dependencies:
npm install
Start the development server:
npm run start
By default, it runs at: http://localhost:3000/

🔐 Features
✅ User registration and secure password hashing (Argon2)

✅ Login authentication

📤 Upload video files

📊 Extract video/audio/general metadata

📄 Export metadata to Excel

💾 Download generated .xlsx files

📝 API Endpoints
Method	Endpoint	Description
POST	/register	Register a new user
POST	/login	Login with username/password
POST	/upload	Upload a video file
POST	/generate_excel	Convert metadata to Excel
GET	/download_excel/<name>	Download the generated Excel file

🛠️ Notes
Videos are uploaded to the uploads/ folder.

Excel files are saved to the generated/ folder.

Ensure pymediainfo is working correctly by installing MediaInfo CLI:

Download MediaInfo CLI

Ensure it's in your system PATH.

