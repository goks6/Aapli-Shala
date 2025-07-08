# आपली शाळा (Aapli Shala) - School Management Application

## Overview
आपली शाळा is a comprehensive school management application designed specifically for primary schools in Maharashtra, India. The application provides separate interfaces for Principals and Teachers to manage various school activities efficiently.

## 🌐 Live Demo
**Web Application:** https://uujpvxhj.manus.space

## 📱 Features

### Initial Setup
- School information setup (Name, UDISE code, Address, etc.)
- Principal details configuration
- Welcome screen with school information

### Principal Dashboard
- **Calendar Management:** Add holidays, view monthly calendar
- **Teacher Management:** Add, edit, and manage teacher information
- **General Register:** Student information management (coming soon)
- **School Certificate:** Generate leaving certificates (coming soon)
- **School Attendance:** View attendance reports (coming soon)
- **Daily Nutrition:** Manage nutrition program (coming soon)
- **School Results:** View and manage exam results (coming soon)
- **Form A:** Administrative forms (coming soon)
- **Password Management:** Change and reset passwords (coming soon)

### Teacher Dashboard
- **Student Management:** Add and manage student information (coming soon)
- **Daily Homework:** Create and assign homework (coming soon)
- **Daily Attendance:** Mark student attendance (coming soon)
- **Notices:** Send notices to students and parents (coming soon)
- **Calendar:** View school calendar and events (coming soon)
- **Results:** Create and manage exam results (coming soon)

### Authentication
- Separate login for Principals and Teachers
- Mobile number-based authentication
- Password protection with show/hide functionality

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - Modern UI framework
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern component library
- **Lucide React** - Beautiful icons

### Mobile App Framework
- **Capacitor 7.4.1** - Cross-platform native runtime
- **Android Platform** - Native Android app generation

### State Management
- **React Context API** - Global state management
- **Local Storage** - Data persistence

## 📁 Project Structure

```
aapli-shala/
├── frontend/                 # React web application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── modules/     # Feature-specific modules
│   │   │   ├── InitialSetup.jsx
│   │   │   ├── WelcomeScreen.jsx
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── PrincipalDashboard.jsx
│   │   │   └── TeacherDashboard.jsx
│   │   ├── context/         # React Context providers
│   │   │   └── AppContext.jsx
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # Application entry point
│   ├── dist/                # Production build output
│   ├── android/             # Capacitor Android project
│   ├── package.json         # Dependencies and scripts
│   ├── capacitor.config.json # Capacitor configuration
│   └── vite.config.js       # Vite configuration
├── backend/                 # Flask backend (for future API integration)
└── README.md               # This documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Java 17+ (for Android APK building)
- Android SDK (for Android APK building)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd aapli-shala
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   pnpm install
   ```

3. **Start development server:**
   ```bash
   pnpm run dev
   ```

4. **Access the application:**
   Open http://localhost:5173 in your browser

### Building for Production

1. **Build the web application:**
   ```bash
   cd frontend
   pnpm run build
   ```

2. **Build Android APK (requires Android SDK setup):**
   ```bash
   # Sync Capacitor
   npx cap sync android
   
   # Build APK
   cd android
   ./gradlew assembleDebug
   ```

## 📱 Mobile App Setup

### Android APK Generation

To generate an Android APK, you need to set up the Android development environment:

1. **Install Java 17:**
   ```bash
   sudo apt install openjdk-17-jdk
   ```

2. **Download Android Command Line Tools:**
   ```bash
   mkdir -p ~/android-sdk/cmdline-tools
   cd ~/android-sdk/cmdline-tools
   wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
   unzip commandlinetools-linux-11076708_latest.zip
   mv cmdline-tools latest
   ```

3. **Set environment variables:**
   ```bash
   export ANDROID_HOME=~/android-sdk
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
   ```

4. **Install Android SDK components:**
   ```bash
   sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```

5. **Build the APK:**
   ```bash
   cd frontend
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

The APK will be generated at: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## 🎯 Usage Guide

### First Time Setup
1. Open the application
2. Fill in school information (name, UDISE code, address, etc.)
3. Enter principal details
4. Click "पुढे जा" (Next) to proceed

### Principal Login
1. Select "मुख्याध्यापक" (Principal) tab
2. Enter mobile number and password
3. Default credentials: Mobile number as both username and password

### Teacher Login
1. First, principal must add teachers through "शिक्षक जोडा" (Add Teacher)
2. Select "शिक्षक" (Teacher) tab
3. Enter assigned mobile number and password

### Adding Teachers (Principal)
1. Login as Principal
2. Click "शिक्षक जोडा" (Add Teacher)
3. Fill teacher information (name, mobile, class, division)
4. Click "शिक्षक जोडा" (Add Teacher) to save

## 🔧 Configuration

### Capacitor Configuration
The `capacitor.config.json` file contains:
```json
{
  "appId": "com.aaplishala.app",
  "appName": "आपली शाळा",
  "webDir": "dist"
}
```

### Environment Variables
- `ANDROID_HOME`: Path to Android SDK
- `PATH`: Include Android SDK tools

## 🌟 Key Features Implemented

### ✅ Completed Features
- Initial school setup flow
- Principal and Teacher authentication
- Principal dashboard with module navigation
- Teacher dashboard with module navigation
- Add Teacher functionality with validation
- Calendar module with holiday management
- Responsive design for mobile and desktop
- Marathi language interface
- Data persistence using localStorage

### 🚧 Planned Features
- Student management system
- Attendance tracking
- Homework assignment system
- Notice board functionality
- Exam results management
- Report generation
- Parent communication portal

## 🎨 Design Features

### UI/UX Highlights
- **Marathi Language Support:** Complete interface in Marathi
- **Mobile-First Design:** Optimized for mobile devices
- **Intuitive Navigation:** Easy-to-use dashboard layouts
- **Color Scheme:** Professional blue and white theme
- **Icons:** Meaningful icons for each module
- **Responsive Layout:** Works on all screen sizes

### Accessibility
- Clear typography with readable fonts
- High contrast colors
- Touch-friendly button sizes
- Keyboard navigation support

## 🔒 Security Features

- Password masking in login forms
- Role-based access control (Principal vs Teacher)
- Input validation and sanitization
- Secure data storage in localStorage

## 📊 Data Management

### Local Storage Structure
```javascript
// School setup data
localStorage.setItem('schoolSetup', JSON.stringify({
  schoolName: "School Name",
  udiseCode: "12345678901",
  address: "School Address",
  // ... other fields
}));

// User authentication
localStorage.setItem('user', JSON.stringify({
  id: 1,
  mobile: "9123456789",
  role: "principal",
  name: "Principal Name"
}));

// Teachers data
localStorage.setItem('teachers', JSON.stringify([
  {
    id: 1,
    name: "Teacher Name",
    mobile: "9876543210",
    class: "1 ली",
    division: "अ"
  }
]));

// Holidays data
localStorage.setItem('holidays', JSON.stringify([
  {
    id: 1,
    date: "2025-01-26",
    reason: "Republic Day"
  }
]));
```

## 🚀 Deployment

### Web Deployment
The application is deployed at: https://uujpvxhj.manus.space

### Mobile App Distribution
1. Build the APK using the instructions above
2. Distribute the APK file to users
3. Users can install the APK on Android devices
4. For Play Store distribution, additional setup is required

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Write meaningful component names
- Add comments for complex logic

## 📞 Support

For technical support or feature requests:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 📄 License

This project is developed for educational and administrative purposes for primary schools in Maharashtra, India.

## 🙏 Acknowledgments

- Designed for Maharashtra primary schools
- Built with modern web technologies
- Focused on ease of use for educators
- Supports local language (Marathi)

---

**Note:** This application is designed specifically for primary schools in Maharashtra and includes features tailored to the local educational system and language requirements.

