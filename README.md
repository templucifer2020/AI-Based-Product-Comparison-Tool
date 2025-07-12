# ProductInsight AI - Local Setup Guide

A responsive web application that uses Gemini AI to analyze product images and provide detailed ingredient analysis with side-by-side comparison functionality.

## Features

- **AI-Powered Analysis**: Upload product images and get detailed ingredient breakdowns
- **Safety Ratings**: Get safety assessments for each ingredient
- **Product Comparison**: Compare multiple products side-by-side
- **User Sentiment Analysis**: AI-generated pros, cons, and review summaries
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Google AI API Key** (Gemini)
   - Get your free API key from: https://ai.google.dev/
   - You'll need this to enable AI-powered product analysis

## Quick Start

1. **Extract the files** to your desired location
2. **Open terminal/command prompt** in the project folder
3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up your API key**:
   - Create a file named `.env` in the project root
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

5. **Start the application**:
   ```bash
   npm run dev
   ```

6. **Open your browser** to: http://localhost:5000

## Environment Variables

Create a `.env` file in the project root with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

## Usage

1. **Upload Images**: Drag and drop or click to select product images
2. **Analyze**: Click "Analyze Products" to process images with AI
3. **Review Results**: View detailed ingredient analysis and safety ratings
4. **Compare Products**: Add products to comparison view for side-by-side analysis

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- Maximum file size: 10MB per image
- Maximum files: 10 images at once

## Troubleshooting

### Common Issues

**"No images provided" error**:
- Make sure you've selected images before clicking analyze
- Check that images are in supported formats

**"Failed to analyze image" error**:
- Verify your GEMINI_API_KEY is correct in the .env file
- Make sure you replaced 'your_gemini_api_key_here' with your actual API key
- Ensure the API key is valid (test it at https://ai.google.dev/)
- Check that the .env file is in the project root directory
- Ensure images are clear and contain readable product information
- Check your internet connection

**"Method doesn't allow unregistered callers" error**:
- This means your API key is not being recognized
- Double-check that your .env file contains: GEMINI_API_KEY=your_actual_api_key
- Make sure there are no extra spaces or quotes around the API key
- Restart the application after updating the .env file

**App won't start**:
- Make sure Node.js is installed: `node --version`
- Try deleting node_modules and running `npm install` again
- Check that port 5000 is not being used by another application

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify your API key is valid
3. Ensure images are clear and contain product labels
4. Make sure your internet connection is stable

## Technical Details

- **Frontend**: React 18 with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **AI Service**: Google Gemini 2.5 Pro
- **File Upload**: Drag & drop with preview
- **Storage**: In-memory (products cleared on restart)

## License

This project is for educational and personal use.