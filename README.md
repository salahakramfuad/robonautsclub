# Robonauts Club - Website Documentation

A modern, full-stack web application for **Robonauts Club**, Bangladesh's premier youth robotics and STEM education platform. This Next.js-based platform enables event management, booking system, and comprehensive SEO optimization for maximum visibility in Bangladesh and worldwide.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables & Credentials](#environment-variables--credentials)
- [Storage Solutions](#storage-solutions)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Robonauts Club website is a comprehensive event management and booking platform that allows:
- **Event Creation & Management**: Create, edit, and delete robotics/STEM events
- **Public Event Discovery**: Browse and filter upcoming and past events
- **Booking System**: Allow users to register for events with email confirmations
- **Image Upload**: Cloudinary integration for optimized AVIF image storage
- **SEO Optimization**: Full SEO implementation for top search rankings
- **Admin Dashboard**: Secure admin interface for event management

## 🛠 Tech Stack

### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Icons** - Additional icon sets
- **Date-fns** - Date manipulation library

### Backend & Services
- **Next.js API Routes** - Server-side API endpoints
- **Server Actions** - Next.js server-side data mutations
- **Firebase Authentication** - User authentication
- **Firebase Firestore** - Database (NoSQL)
- **Firebase Admin SDK** - Server-side Firebase operations

### Storage & Media
- **Cloudinary** - Image upload and optimization (AVIF format)
- **Firebase Storage** - Alternative image storage (if needed)

### Email Service
- **Resend** - Transactional email service

### Additional Libraries
- **Leaflet & React Leaflet** - Interactive maps
- **XLSX** - Excel file export for bookings
- **CLSX & Tailwind Merge** - Dynamic className utilities

## ✨ Features

### Public Features
- 🏠 **Homepage**: Showcase of services and courses
- 📅 **Events Page**: Browse all events (upcoming and past)
- 📝 **Event Details**: Detailed event information with booking form
- 📧 **Email Confirmations**: Automatic booking confirmation emails
- 🔍 **SEO Optimized**: Full metadata, structured data, sitemap
- 📱 **Responsive Design**: Mobile-first, fully responsive

### Admin Features
- 🔐 **Secure Dashboard**: Protected admin routes
- ➕ **Event Management**: Create, edit, delete events
- 📊 **Booking Management**: View and export event bookings
- 🖼️ **Image Upload**: Direct image upload with AVIF conversion
- 🏷️ **Tags System**: Categorize events with tags
- 📧 **Email Notifications**: Send booking confirmations

### SEO Features
- 📄 **Dynamic Metadata**: Page-specific SEO optimization
- 🗺️ **Sitemap**: Auto-generated XML sitemap
- 🤖 **Robots.txt**: Search engine crawling configuration
- 📊 **Structured Data**: JSON-LD schema for rich snippets
- 🌍 **Geographic SEO**: Bangladesh and Dhaka location targeting
- 🌐 **Social Media**: Open Graph and Twitter Cards

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **pnpm** (recommended) or npm/yarn
- **Git**

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd robonautsclub
   ```

2. **Install dependencies**
```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory (see [Environment Variables](#environment-variables--credentials) section)

4. **Run the development server**
   ```bash
pnpm dev
# or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables & Credentials

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

#### Firebase Configuration (Client-side)
```env
# Firebase Client SDK Configuration
# Get these from Firebase Console > Project Settings > General > Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Firebase Admin SDK (Server-side)
**Option 1: Environment Variables (Recommended for Production)**
```env
# Firebase Admin SDK - Service Account Credentials
# Get these from Firebase Console > Project Settings > Service Accounts
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Option 2: JSON File (Alternative for Development)**
- Download service account JSON from Firebase Console
- Save as `lib/firebase-service-account.json`
- **Note**: This file is gitignored and should NOT be committed

#### Cloudinary Configuration
```env
# Cloudinary Image Upload Service
# Format: cloudinary://api_key:api_secret@cloud_name
# Get this from Cloudinary Dashboard > Settings > Product Environment Credentials
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

#### Email Service (Resend)
```env
# Resend API for sending emails
# Get your API key from https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here

# Optional: Custom from email (defaults to onboarding@resend.dev)
RESEND_FROM_EMAIL=noreply@robonautsclub.com
```

#### Site Configuration
```env
# Your production website URL (for SEO and absolute URLs)
NEXT_PUBLIC_SITE_URL=https://robonautsclub.com
```

### Complete .env.local Example

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://robonautsclub.com

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyExample...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=robonautsclub.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=robonautsclub
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=robonautsclub.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=robonautsclub
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@robonautsclub.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Cloudinary
CLOUDINARY_URL=cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@dvxxa4sho

# Resend Email Service
RESEND_API_KEY=re_1234567890abcdefghijklmnop
RESEND_FROM_EMAIL=noreply@robonautsclub.com
```

## 🗄️ Storage Solutions

### Firebase Firestore
- **Purpose**: Primary database for events, bookings, and user data
- **Collections**:
  - `events` - Event information (title, date, description, image, tags, etc.)
  - `bookings` - Event registrations with user details
- **Access**: Server-side via Firebase Admin SDK, Client-side via Firebase Client SDK

### Cloudinary
- **Purpose**: Image storage and optimization
- **Features**:
  - Automatic AVIF format conversion
  - Image optimization
  - CDN delivery
  - Folder organization (`events/` folder)
- **Max File Size**: 5MB
- **Allowed Formats**: JPEG, PNG, WebP, GIF
- **Upload Location**: Server-side API route (`/api/upload-image`)

### Firebase Storage (Optional)
- Available if needed for additional file storage
- Configured but not actively used (images use Cloudinary)

## 📁 Project Structure

```
robonautsclub/
├── app/                          # Next.js App Router
│   ├── about/                   # About page
│   │   ├── layout.tsx          # About page metadata
│   │   ├── MapClient.tsx       # Interactive map component
│   │   └── page.tsx            # About page content
│   ├── api/                     # API routes
│   │   └── upload-image/       # Cloudinary image upload endpoint
│   ├── dashboard/               # Admin dashboard (protected)
│   │   ├── events/             # Event management
│   │   │   ├── [id]/          # Individual event management
│   │   │   ├── CreateEventForm.tsx
│   │   │   ├── EditEventForm.tsx
│   │   │   └── page.tsx
│   │   ├── actions.ts          # Server actions for dashboard
│   │   └── layout.tsx          # Dashboard layout
│   ├── events/                  # Public events pages
│   │   ├── [id]/              # Event detail page
│   │   │   ├── BookingForm.tsx
│   │   │   ├── EventImage.tsx
│   │   │   └── page.tsx
│   │   ├── actions.ts          # Public server actions
│   │   └── page.tsx            # Events listing page
│   ├── login/                   # Login page
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Homepage
│   ├── robots.ts               # Robots.txt generation
│   └── sitemap.ts              # Sitemap generation
├── components/                   # React components
│   ├── CourseCard.tsx          # Course/Event card component
│   ├── FAQAccordion.tsx        # FAQ component
│   ├── Feed.tsx                # Homepage feed
│   ├── Footer.tsx              # Site footer
│   ├── Hero.tsx                # Hero section
│   ├── Navbar.tsx              # Navigation bar
│   ├── OrganizationSchema.tsx  # SEO structured data
│   └── StructuredData.tsx      # Reusable structured data
├── lib/                          # Utility libraries
│   ├── auth.ts                 # Authentication utilities
│   ├── cloudinary.ts           # Cloudinary configuration
│   ├── email.ts                # Email service (Resend)
│   ├── firebase-admin.ts       # Firebase Admin SDK setup
│   ├── firebase.ts             # Firebase Client SDK setup
│   ├── seo.ts                  # SEO utilities and schemas
│   └── utils.ts                # General utilities
├── types/                        # TypeScript type definitions
│   ├── booking.ts              # Booking type
│   └── event.ts                # Event type
├── public/                       # Static assets
│   ├── images/                 # Image assets
│   └── ...
├── middleware.ts                 # Next.js middleware (auth protection)
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## 💻 Development

### Available Scripts

```bash
# Development server
pnpm dev          # Start development server on http://localhost:3000

# Production build
pnpm build        # Build the application for production
pnpm start        # Start production server

# Code quality
pnpm lint         # Run ESLint
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow TypeScript and ESLint rules
   - Write descriptive commit messages

3. **Test locally**
   ```bash
   pnpm dev
   ```

4. **Build test**
   ```bash
   pnpm build
   ```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub/GitLab/Bitbucket**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   - Add all variables from `.env.local` to Vercel project settings
   - For `FIREBASE_ADMIN_PRIVATE_KEY`, ensure proper escaping of newlines

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch

### Other Platforms

#### Netlify
- Use Next.js build command: `next build`
- Output directory: `.next`
- Add all environment variables in Netlify dashboard

#### Self-Hosted (VPS/Server)
- Build the application: `pnpm build`
- Run production server: `pnpm start`
- Use PM2 or similar process manager
- Configure reverse proxy (Nginx/Apache)
- Set up SSL certificate (Let's Encrypt)

### Environment Variables for Production

⚠️ **Important**: Never commit `.env.local` to version control. Always set environment variables in your hosting platform's dashboard.

## 🔧 Troubleshooting

### Firebase Issues

**Problem**: Firebase not initializing
- ✅ Check all `NEXT_PUBLIC_FIREBASE_*` variables are set
- ✅ Verify Firebase project is active
- ✅ Ensure Firestore database is enabled

**Problem**: Admin SDK not working
- ✅ Check `FIREBASE_ADMIN_*` variables or JSON file exists
- ✅ Verify service account has proper permissions
- ✅ Ensure private key includes `\n` escape sequences

### Cloudinary Issues

**Problem**: Image upload failing
- ✅ Verify `CLOUDINARY_URL` is correctly formatted
- ✅ Check image file size (max 5MB)
- ✅ Verify file type is allowed (JPEG, PNG, WebP, GIF)

### Email Issues

**Problem**: Emails not sending
- ✅ Verify `RESEND_API_KEY` is set
- ✅ Check Resend account has verified domain (for custom from email)
- ✅ Verify API key has proper permissions

### Build Issues

**Problem**: Build failing
- ✅ Clear `.next` folder: `rm -rf .next`
- ✅ Clear node_modules: `rm -rf node_modules && pnpm install`
- ✅ Check TypeScript errors: `pnpm build`
- ✅ Verify all environment variables are set

### SEO Issues

**Problem**: Metadata not showing
- ✅ Verify `NEXT_PUBLIC_SITE_URL` is set
- ✅ Check metadata in page source (View Page Source)
- ✅ Validate structured data with [Google Rich Results Test](https://search.google.com/test/rich-results)

## 📝 Additional Notes

### Security
- 🔒 Never commit `.env.local` or `firebase-service-account.json`
- 🔒 Keep API keys secure and rotate regularly
- 🔒 Use environment variables in production
- 🔒 Admin routes are protected by middleware

### Performance
- ⚡ Images are optimized with Cloudinary (AVIF format)
- ⚡ Next.js automatic code splitting
- ⚡ Server-side rendering for better SEO
- ⚡ Static generation where possible

### Browser Support
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Resend Documentation](https://resend.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

Robonauts Club

## 👥 Contributors

[Add contributor information]

## 📞 Support

For support, email info@robonautsclub.com or contact the development team.

---
