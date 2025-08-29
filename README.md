# Menu Scraper

A Next.js application for extracting and processing menu data from various file formats using OCR and AI processing.

## Features

- **File Upload & Processing**: Support for PDF and image files
- **OCR Extraction**: Text extraction from images and PDFs using Tesseract.js and PDF.js
- **AI-Powered Processing**: LLM integration for intelligent menu data extraction and structuring
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first approach with responsive components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **File Processing**: Tesseract.js (OCR), PDF.js (PDF parsing)
- **AI Processing**: OpenAI GPT models via API
- **State Management**: React hooks and custom hooks
- **Build Tool**: Next.js with App Router

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd menu-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```env
NEXT_PUBLIC_OPENAI_API_KEY=your_actual_openai_api_key_here
NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_OPENAI_API_KEY` | Your OpenAI API key | Yes | - |
| `NEXT_PUBLIC_OPENAI_API_BASE_URL` | OpenAI API endpoint | No | `https://api.openai.com/v1` |
| `NEXT_PUBLIC_OPENAI_MODEL` | GPT model to use | No | `gpt-4o-mini` |

**Note**: These environment variables are prefixed with `NEXT_PUBLIC_` because the LLM service runs client-side in the browser.

## Usage

### File Upload
1. Navigate to the main page
2. Upload a PDF or image file containing menu data
3. The system will extract text using OCR
4. The extracted text is sent to the LLM for intelligent processing
5. View the structured menu data results

### Processing Flow

1. **File Upload**: Upload PDF or image files
2. **Text Extraction**: OCR extracts raw text using existing services
3. **LLM Processing**: Client-side AI processing using OpenAI API
4. **Results Display**: Structured menu data with products and categories

## Architecture

The application follows a clean architecture pattern:

- **Server Components**: Pages and layouts use SSR by default
- **Client Components**: Only when interactivity is required
- **Custom Hooks**: Client-side state management and service calls
- **Services**: File processing, OCR, and client-side LLM integration

## File Structure

```
app/
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── services/               # Business logic services
├── types/                  # TypeScript type definitions
public/
└── prompts/                # LLM meta prompts (accessible via fetch)
```

## Development

### Adding New Features
- Follow the established patterns for server/client components
- Keep business logic in services
- Use custom hooks for client-side state management
- Maintain clean separation between concerns

### Code Quality
- Use TypeScript for type safety
- Follow existing naming conventions
- Keep components focused and single-purpose
- Write meaningful commit messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the established patterns
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 