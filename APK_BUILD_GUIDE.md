# APK Build Guide for आपली शाळा (Aapli Shala)

## Overview
This guide will help you build an Android APK from the React web application using Capacitor.

## Prerequisites

### System Requirements
- **Operating System:** Linux (Ubuntu 20.04+), macOS, or Windows 10+
- **RAM:** Minimum 8GB, Recommended 16GB
- **Storage:** At least 10GB free space
- **Internet:** Stable connection for downloading dependencies

### Required Software

#### 1. Node.js and pnpm
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm
```

#### 2. Java Development Kit (JDK) 17
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y openjdk-17-jdk

# Verify installation
java -version
javac -version
```

#### 3. Android SDK
```bash
# Create Android SDK directory
mkdir -p ~/android-sdk/cmdline-tools
cd ~/android-sdk/cmdline-tools

# Download Android Command Line Tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip

# Extract tools
unzip commandlinetools-linux-11076708_latest.zip
mv cmdline-tools latest

# Set environment variables (add to ~/.bashrc or ~/.zshrc)
export ANDROID_HOME=~/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Reload environment
source ~/.bashrc
```

#### 4. Install Android SDK Components
```bash
# Accept licenses and install components
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

## Step-by-Step APK Build Process

### Step 1: Prepare the Project
```bash
# Navigate to the frontend directory
cd aapli-shala/frontend

# Install dependencies
pnpm install

# Build the React application
pnpm run build
```

### Step 2: Configure Capacitor
```bash
# Verify Capacitor configuration
cat capacitor.config.json

# Should show:
# {
#   "appId": "com.aaplishala.app",
#   "appName": "आपली शाळा",
#   "webDir": "dist"
# }
```

### Step 3: Sync with Android Platform
```bash
# Sync web assets to Android project
npx cap sync android

# This will:
# - Copy built web assets to Android project
# - Update Android project configuration
# - Install Capacitor plugins
```

### Step 4: Build the APK
```bash
# Navigate to Android project
cd android

# Build debug APK
./gradlew assembleDebug

# For release APK (requires signing)
./gradlew assembleRelease
```

### Step 5: Locate the APK
```bash
# Debug APK location
ls -la app/build/outputs/apk/debug/app-debug.apk

# Release APK location (if built)
ls -la app/build/outputs/apk/release/app-release.apk
```

## APK Signing (For Production)

### Generate Keystore
```bash
# Create a keystore for signing
keytool -genkey -v -keystore aapli-shala-release-key.keystore \
  -alias aapli-shala -keyalg RSA -keysize 2048 -validity 10000

# Follow prompts to set passwords and information
```

### Configure Gradle for Signing
Create `android/app/build.gradle` signing configuration:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('path/to/aapli-shala-release-key.keystore')
            storePassword 'your-store-password'
            keyAlias 'aapli-shala'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Build Signed APK
```bash
cd android
./gradlew assembleRelease
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Gradle Download Timeout
```bash
# Increase timeout in gradle.properties
echo "org.gradle.daemon=true" >> android/gradle.properties
echo "org.gradle.configureondemand=true" >> android/gradle.properties
echo "org.gradle.parallel=true" >> android/gradle.properties
```

#### 2. Android SDK Not Found
```bash
# Verify ANDROID_HOME is set
echo $ANDROID_HOME

# Verify SDK components are installed
sdkmanager --list_installed
```

#### 3. Java Version Issues
```bash
# Check Java version
java -version

# Set JAVA_HOME if needed
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

#### 4. Permission Denied on gradlew
```bash
# Make gradlew executable
chmod +x android/gradlew
```

#### 5. Build Tools Version Issues
```bash
# Update build tools version in android/app/build.gradle
android {
    compileSdkVersion 34
    buildToolsVersion "34.0.0"
    ...
}
```

## APK Installation and Testing

### Install APK on Device
```bash
# Enable USB debugging on Android device
# Connect device via USB

# Install APK
adb install app/build/outputs/apk/debug/app-debug.apk

# Or transfer APK to device and install manually
```

### Testing Checklist
- [ ] App launches successfully
- [ ] Initial setup flow works
- [ ] Principal login functions
- [ ] Teacher login functions
- [ ] Dashboard navigation works
- [ ] Add teacher functionality works
- [ ] Calendar module functions
- [ ] Data persists between app restarts
- [ ] App works in portrait and landscape modes
- [ ] Back button navigation works correctly

## Performance Optimization

### Reduce APK Size
```bash
# Enable ProGuard/R8 in android/app/build.gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Optimize Web Assets
```bash
# In frontend directory
# Build with production optimizations
pnpm run build

# Verify bundle size
ls -lh dist/assets/
```

## Distribution Options

### 1. Direct APK Distribution
- Share the APK file directly with users
- Users need to enable "Install from unknown sources"
- Suitable for internal/testing distribution

### 2. Google Play Store
- Requires Google Play Console account ($25 one-time fee)
- Need to create app listing and upload signed APK
- Requires compliance with Play Store policies

### 3. Alternative App Stores
- Amazon Appstore
- Samsung Galaxy Store
- F-Droid (for open source apps)

## Maintenance and Updates

### Updating the App
1. Make changes to React code
2. Build new version: `pnpm run build`
3. Sync with Capacitor: `npx cap sync android`
4. Build new APK: `./gradlew assembleDebug`
5. Distribute updated APK

### Version Management
Update version in:
- `frontend/package.json`
- `android/app/build.gradle` (versionCode and versionName)

## Security Considerations

### APK Security
- Always sign release APKs
- Keep keystore file secure
- Use strong passwords
- Enable ProGuard for code obfuscation

### App Permissions
Review permissions in `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Support and Resources

### Official Documentation
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [React Documentation](https://react.dev)

### Community Resources
- [Capacitor Community](https://github.com/capacitor-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/capacitor)
- [Ionic Forum](https://forum.ionicframework.com)

---

**Note:** Building Android APKs requires significant system resources and time. Ensure you have a stable internet connection and sufficient system resources before starting the build process.

