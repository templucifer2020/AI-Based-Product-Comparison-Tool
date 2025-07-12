# Product Analysis Application

## Overview

This is a full-stack web application that analyzes product images using AI to extract detailed information about ingredients, safety ratings, and user sentiment. The application allows users to upload product images, get AI-powered analysis, and compare products side-by-side.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for client-side bundling
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with JSON responses
- **File Upload**: Multer middleware for handling multipart/form-data
- **Development**: Hot reload with Vite integration in development mode

### AI Integration
- **Service**: Google Gemini AI (via @google/genai)
- **Purpose**: Analyze product images to extract ingredients, safety information, and generate user sentiment analysis
- **Model**: Gemini 2.5 Pro with structured JSON output

## Key Components

### Data Storage
- **Current Implementation**: In-memory storage using Map data structure
- **Database Schema**: Drizzle ORM with PostgreSQL schema definitions
- **Migration Support**: Drizzle Kit for database migrations
- **Future Ready**: Configuration exists for PostgreSQL with Neon Database

### Database Schema
```typescript
- products table with fields:
  - id (serial primary key)
  - name, brand, category (text)
  - ingredients (JSON array of ProductIngredient objects)
  - usage instructions, warnings (text)
  - expiry date, time left (optional text)
  - recommended/not recommended for (text)
  - user sentiment (JSON object with pros/cons/review summary)
  - image URL (optional)
  - created timestamp
```

### File Upload System
- **Storage**: Memory-based upload with 10MB file size limit
- **Validation**: Image files only (JPEG, PNG, WebP)
- **Processing**: Direct buffer processing for AI analysis
- **Security**: File type validation and size restrictions

### UI Components
- **Product Cards**: Display analyzed product information with safety ratings
- **Product Comparison**: Side-by-side comparison of multiple products
- **File Upload**: Drag-and-drop interface with file preview
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Data Flow

1. **Image Upload**: Users drag/drop or select product images
2. **AI Analysis**: Images sent to Gemini AI for structured analysis
3. **Data Extraction**: AI extracts product name, ingredients, safety ratings, usage instructions
4. **Storage**: Analyzed data stored in memory (ready for database persistence)
5. **Display**: Products shown in cards with detailed ingredient analysis
6. **Comparison**: Users can compare multiple products side-by-side

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI integration
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **drizzle-orm**: Database ORM
- **@neondatabase/serverless**: PostgreSQL database driver
- **multer**: File upload handling

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Production bundling

## Deployment Strategy

### Build Process
1. **Client Build**: Vite builds React app to `dist/public`
2. **Server Build**: ESBuild bundles server code to `dist/index.js`
3. **Static Assets**: Client assets served from `dist/public`

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY`: Google AI API key
- `NODE_ENV`: Environment mode (development/production)

### Production Setup
- **Server**: Express.js serves both API and static files
- **Database**: PostgreSQL with Drizzle ORM migrations
- **AI Service**: Google Gemini API integration
- **Static Files**: Served directly by Express in production

### Development Features
- **Hot Reload**: Vite middleware integration
- **Error Overlay**: Runtime error display
- **Development Banner**: Replit development indicators
- **TypeScript Checking**: Full type safety across stack

## Architecture Decisions

### Memory vs Database Storage
- **Current**: In-memory storage for rapid development
- **Future**: PostgreSQL ready with complete schema
- **Rationale**: Quick prototyping with easy migration path

### AI-First Approach
- **Choice**: Google Gemini for structured output
- **Alternative**: OpenAI GPT models
- **Rationale**: Native JSON schema support and competitive pricing

### Component Architecture
- **Choice**: Radix UI + Tailwind CSS
- **Alternative**: Material-UI or Ant Design
- **Rationale**: Headless components provide maximum customization

### State Management
- **Choice**: TanStack Query for server state
- **Alternative**: Redux Toolkit or Zustand
- **Rationale**: Optimized for API interactions with built-in caching