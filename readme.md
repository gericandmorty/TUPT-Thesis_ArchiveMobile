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
Open `api.js` and update the `API_BASE_URL` to match your local network IP (where the backend is running):
```javascript
const API_BASE_URL = 'http://YOUR_LOCAL_IP:5000';
```

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

## 🤝 Contribution

This project is part of a 4th-year Thesis at TUP Taguig. For inquiries regarding access or contributions, please contact the repository administrator.
