# FobZim 🇿🇼

**FobZim connects Zimbabwean creators and brands with trends and campaigns.**

A mobile app platform designed to empower Zimbabwe's content creator economy by connecting creators with brand opportunities, trending topics, and community insights.

---

## 🚀 MVP Features (Phase 1)

### Core Features
- **Home Feed**: Local trending content and creator spotlight
- **Creator Directory**: Discover rising Zimbabwean content creators
- **Brand Campaigns**: Find paid collaboration opportunities
- **Trending Topics**: Stay updated with Zimbabwe's hottest trends
- **Creator Tips**: Daily guidance for content creators

### Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **UI Framework**: React Native Paper (Material Design 3)
- **Navigation**: React Navigation 6
- **State Management**: Zustand with AsyncStorage persistence
- **Forms**: React Hook Form
- **Language**: TypeScript
- **Theme**: Zimbabwe flag-inspired color palette

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- For device testing: Expo Go app

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FobZim
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - **Mobile**: Scan QR code with Expo Go
   - **Android Emulator**: Press `a` 
   - **iOS Simulator**: Press `i` (macOS only)
   - **Web**: Press `w`

---

## 📁 Project Structure

```
FobZim/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   │   ├── Home/           # Home feed & dashboard
│   │   ├── Creators/       # Creator discovery
│   │   ├── Campaigns/      # Brand campaigns & applications
│   │   ├── Trends/         # Trending topics
│   │   └── Profile/        # User profile & settings
│   ├── navigation/         # Navigation setup
│   ├── data/              # Types & mock data
│   ├── store/             # Zustand state management
│   ├── theme/             # Design system & colors
│   ├── services/          # API services (future)
│   ├── hooks/             # Custom hooks (future)
│   └── utils/             # Utility functions (future)
├── assets/                # Images, icons, fonts
├── App.tsx               # Root component
└── app.json             # Expo configuration
```

---

## 🎨 Design System

### Colors (Zimbabwe Theme)
- **Primary**: `#006400` (Zimbabwe flag green)
- **Secondary**: `#FFD700` (Zimbabwe flag gold)
- **Accent**: `#DC143C` (Zimbabwe flag red)
- **Background**: `#F5F7FA` (Light gray)
- **Surface**: `#FFFFFF` (White)

### Typography & Spacing
- Consistent spacing system (4, 8, 16, 24, 32, 48, 64px)
- Material Design 3 typography scales
- Responsive design tokens

---

## 📱 Current Status

### ✅ Completed
- [x] Project setup with Expo & TypeScript
- [x] Zimbabwe-themed design system
- [x] Navigation with bottom tabs
- [x] State management with Zustand + persistence
- [x] Mock data for creators, campaigns, trends
- [x] Basic screen placeholders
- [x] App successfully runs and compiles

### 🚧 In Progress
- [ ] UI Components (CreatorCard, TrendItem, PostPreview)
- [ ] Home screen with real content
- [ ] Creators screen with filtering
- [ ] Campaign application flow
- [ ] Profile management

### 📋 Next Steps
1. Build shared UI components
2. Implement full Home screen functionality
3. Add creator discovery with search/filter
4. Campaign application form with validation
5. Trends screen with categories
6. Profile editing and saved items
7. Polish UI/UX and responsiveness
8. Testing across devices

---

## 🔮 Future Enhancements (Phase 2+)

### Backend Integration
- User authentication & profiles
- Real-time data from APIs
- Push notifications for campaigns
- Analytics and insights

### Advanced Features
- Creator verification system  
- In-app messaging for brand collaborations
- Payment processing for campaigns
- Content calendar and scheduling
- Social media account linking
- Creator portfolio showcases

### Monetization
- Premium creator memberships
- Featured campaign placements
- Commission on successful collaborations
- Creator tool partnerships

---

## 🧪 Testing

```bash
# Run the app in development
npx expo start

# Test on different platforms
npx expo start --android
npx expo start --ios
npx expo start --web
```

### Manual Testing Checklist
- [ ] Tab navigation works smoothly
- [ ] Store persists data across app restarts
- [ ] Loading states display correctly  
- [ ] Theme colors applied consistently
- [ ] Responsive on different screen sizes

---

## 🚀 Deployment

### Development Build
```bash
# Install EAS CLI
npm install -g @expo/cli

# Configure for builds
npx expo prebuild --clean
```

### Production Deployment
```bash
# Build for app stores
eas build --platform all

# Submit to stores
eas submit --platform all
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

- **Project Lead**: [Your Name]
- **Email**: [your.email@example.com]
- **GitHub**: [github.com/yourusername/FobZim]

---

**Built with ❤️ for the Zimbabwe creator community**