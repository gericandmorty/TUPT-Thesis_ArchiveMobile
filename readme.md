# TUPT Thesis Archive - Mobile Application

A premium, institutional-grade mobile application designed for the Technological University of the Philippines Taguig. This app serves as a centralized, digital repository for thesis papers, dissertations, and capstone projects, enabling students and faculty to access academic excellence with ease.

---

## 🚀 Key Features

- **Smart Search Engine**: Semantic search capabilities to find any thesis by title, abstract, or author in milliseconds.
- **AI Recommendation Engine**: Powered by advanced algorithms to suggest thesis titles and research directions based on departmental interests.
- **Document Analysis**: Automated metadata extraction from uploaded PDFs (Title, Authors, Abstract).
- **Advanced Filtering**: Narrow down research by academic year, department, or research type with a high-performance UI.
- **Secure Authentication**: Institutional login and registration system with secure session management.
- **Premium UI/UX**: Modern interface featuring glassmorphism, sophisticated gradients, and staggered entrance animations for a high-end feel.

---

## 🛠️ Technical Stack

- **Framework**: React Native with [Expo](https://expo.dev/) (SDK 54)
- **Navigation**: React Navigation (Stack)
- **Styling**: Vanilla React Native StyleSheet with `expo-linear-gradient`
- **Icons**: Ionicons (@expo/vector-icons)
- **Storage**: @react-native-async-storage/async-storage for session persistence
- **Backend API**: Node.js / Express (connected via `api.js`)

---

## 📋 Prerequisites

1.  **Node.js**: LTS version recommended.
2.  **Expo Go App**: Install on your physical iOS or Android device from the App Store or Play Store.
3.  **Backend Server**: Ensure the TUPT-Thesis backend is running and accessible.

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/gericandmorty/TUPT-Thesis_ArchiveMobile.git
cd mobile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Endpoint

> **Important**: `api.js` is **gitignored** and must be created manually.

Create a file named `api.js` in the project root (`mobile/api.js`) with the following content:

```javascript
const API_BASE_URL = 'https://your-backend-url.com';
export default API_BASE_URL;
```

Replace the URL with your backend's address:
- **Local development**: `http://YOUR_LOCAL_IP:5000`
- **Production (Render)**: `https://your-app-name.onrender.com`

### Required Backend API Endpoints

The mobile app depends on the following backend endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | User login (ID, birthdate, password) |
| `POST` | `/auth/register` | User registration |
| `POST` | `/auth/forgot-password` | Password reset (ID, birthdate, new password) |
| `GET` | `/thesis/search` | Search theses by query, year, category, type |
| `GET` | `/thesis/count` | Get total thesis count |
| `GET` | `/thesis/years` | Get available academic years for filtering |
| `GET` | `/thesis/categories` | Get available departments for filtering |
| `GET` | `/thesis/department-counts` | Get thesis counts grouped by department |
| `GET` | `/thesis/:id` | Get single thesis details |
| `POST` | `/thesis/recommendations` | AI-generated thesis title recommendations |
| `GET` | `/user/profile` | Get user profile |
| `PUT` | `/user/profile` | Update user profile |
| `POST` | `/user/profile-photo` | Upload profile photo |
| `GET` | `/user/ai-history` | Get AI recommendation history |
| `POST` | `/user/ai-history` | Save AI recommendation |
| `DELETE` | `/user/ai-history/:id` | Delete specific AI history entry |
| `DELETE` | `/user/ai-history` | Clear all AI history |
| `POST` | `/user/analyze` | Analyze uploaded research document |
| `POST` | `/user/theses` | Submit a new thesis |
| `GET` | `/user/theses` | Get user's submitted theses |
| `POST` | `/user/analysis-drafts` | Save analysis draft |
| `GET` | `/user/analysis-drafts` | Get all analysis drafts |

### 4. Start the Application
```bash
npm start
# OR
npx expo start
```

### 5. Running on Device
Scan the QR code displayed in the terminal using:
- **Android**: Expo Go App (Scan QR)
- **iOS**: Camera App (Scan QR)

---

## 📂 Project Structure

- `assets/`: Images, logos, and local static files.
- `Pages/`: Main application screens (Home, Search, Auth, documents, etc.).
  - `Navigation/`: Header and Menu components.
  - `Search/`: Search result lists and filter modals.
- `api.js`: Centralized API configuration.
- `App.js`: Entry point and navigation stack configuration.

---

## 📥 Downloads

Download the latest APK build from Google Drive:

🔗 **[Download APK (Google Drive)](https://drive.google.com/drive/folders/1ihnITLykvm60CUUKOiEGjTRATi5Smj0v?usp=drive_link)**

---

## 🤝 Contribution

This project is part of a 4th-year Thesis at TUP Taguig. For inquiries regarding access or contributions, please contact the repository administrator.
