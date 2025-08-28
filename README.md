# Menu Scraper - Applova

A production-ready web application for automatically extracting products from restaurant menus using AI-powered image and PDF processing.

## Features

- **Menu Upload**: Support for PDF, JPG, PNG files up to 10MB
- **Drag & Drop Interface**: Intuitive file upload with visual feedback
- **Product Extraction**: Automatically extract product names, prices, and variants
- **Menu Review**: Review and edit extracted products before finalizing
- **Responsive Design**: Mobile-friendly interface built with modern UI components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui components with Tailwind CSS
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom animations

## Project Structure

```
app/
├── page.tsx              # Home page (main menu upload interface)
├── menu-review/          # Menu review and editing interface
│   └── page.tsx
├── layout.tsx            # Root layout with metadata
└── globals.css           # Global styles
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Usage

1. **Upload Menu**: Drag and drop or select a menu file (PDF, JPG, PNG)
2. **Review Products**: The system will extract products and display them for review
3. **Edit Details**: Modify product names, prices, and variants as needed
4. **Save Products**: Finalize and save the extracted product data

## Production Build

```bash
npm run build
npm start
```

## License

© 2024 Applova. All rights reserved. 