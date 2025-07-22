# Personalized Content Dashboard

A modern, responsive content dashboard built with Next.js 15, TypeScript, Redux Toolkit, and Tailwind CSS. Features real-time content aggregation from multiple APIs, drag-and-drop functionality, dark mode, and comprehensive mobile-responsive design.

## 🚀 Live Demo : [Watch](https://youtu.be/Q-oM9vwqk3c)

**Live URL**: [https://personalised-content-dashboard.vercel.app/](https://personalised-content-dashboard.vercel.app/)



## ✨ Features

### 🎯 Core Features (100% Completed)
- ✅ **Personalized Content Feed** - Multi-source content aggregation with user preferences
- ✅ **Interactive Content Cards** - Rich media display with hover effects and CTAs
- ✅ **Advanced Search** - Real-time search across news, movies, and social content
- ✅ **Drag & Drop** - Touch-friendly content organization with smooth animations
- ✅ **Favorites System** - Persistent save/unsave functionality with Redux storage
- ✅ **Dark Mode** - System-aware theme switching with user preference persistence
- ✅ **Responsive Design** - Mobile-first approach, works flawlessly on all devices

### 🔥 Advanced Features
- ✅ **Real-time API Integration** - NewsData.io, TMDB, and mock social media
- ✅ **State Management** - Redux Toolkit with Redux Persist for data persistence
- ✅ **Performance Optimized** - 197kB bundle size, 12-second build time
- ✅ **Comprehensive Testing** - 17/17 tests passing (100% success rate)
- ✅ **Production Ready** - Deployed on Vercel with automatic CI/CD

## 🛠 Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 15.4.2 | React framework with App Router |
| **Language** | TypeScript | Latest | Type safety and developer experience |
| **State Management** | Redux Toolkit | Latest | Predictable state management |
| **Persistence** | Redux Persist | Latest | State persistence across sessions |
| **Styling** | Tailwind CSS | 4.0 | Utility-first CSS framework |
| **Animation** | Framer Motion | Latest | Smooth transitions and micro-interactions |
| **Drag & Drop** | @dnd-kit | Latest | Touch-friendly drag and drop |
| **Icons** | Heroicons | Latest | Beautiful SVG icons |
| **Testing** | Jest + RTL | Latest | Unit and integration testing |
| **Deployment** | Vercel | Latest | Production hosting and CI/CD |

## ⚡ Quick Start
### 1. clone Repo
```bash
git clone https://github.com/FlashAdking/personal-dashboard.git 
```
### 2. Change Dir
```bash
cd .\personalised-content-dashboard\
```

### 3. Install Dependencies
```bash
npm install
or
yarn install
```


## 🔑 Environment Setup

### 1. Create Environment File
```bash 
touch .env.local
```


### 2. Add Required API Keys
Open `.env.local` and add:

```text
NewsData.io API Key (Primary news source)
NEXT_PUBLIC_NEWSDATA_API_KEY=your_newsdata_api_key_here

TMDB API Key (Movie recommendations)
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here

OMDb API Key (Additional movie search - Optional)
NEXT_PUBLIC_OMDB_API_KEY=your_omdb_api_key_here
```
## 🚀 Running the Project

### Development Mode

```bash 
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build
```bash
npm run build
or
npm start
```


### Happy Development 🙂
