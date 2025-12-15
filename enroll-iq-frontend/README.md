# Enroll IQ - Smart Enrollment Platform

A modern Next.js application for scholarship enrollment and university application management.

## Features

- **Personal Details Form**: Comprehensive form for applicant information including tribal details
- **Document Upload**: Upload required documents (Form 16, Caste Certificate, Marksheets)
- **University Selection**: Searchable dropdown with 200+ universities worldwide
- **Fees Verification**: Verify fees against official university pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles and CSS animations
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main application page
├── components/
│   ├── Header.tsx       # Navigation header
│   ├── Stepper.tsx      # Step indicator
│   ├── FormInput.tsx    # Reusable input component
│   ├── FormSelect.tsx   # Reusable select component
│   ├── FileUpload.tsx   # File upload with drag & drop
│   ├── SearchableSelect.tsx  # Searchable dropdown
│   └── steps/
│       ├── PersonalDetails.tsx
│       ├── UploadDocuments.tsx
│       └── UniversityDetails.tsx
└── data/
    └── universities.ts  # Hardcoded university data
```

## License

This project is for pilot/demo purposes.

