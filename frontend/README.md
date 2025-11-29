# E-Commerce ETL Dashboard - Frontend (Next.js)

This is the frontend UI for the E-Commerce ETL Pipeline project.  
It provides interfaces for uploading CSV order files and viewing processed analytics dashboards.

---

## 1. Overview

This application is built using **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Recharts**.  
It interacts with a **Flask backend** that generates S3 presigned URLs and queries AWS Athena for analytics.

---

## 2. Tech Stack

| Layer     | Technology               |
| --------- | ------------------------ |
| Framework | Next.js 14+ (App Router) |
| Language  | TypeScript               |
| Styling   | Tailwind CSS             |
| Charts    | Recharts                 |
| Fonts     | Geist (via next/font)    |
| Runtime   | Node.js                  |

---

## 3. Installation

Clone the repo and install dependencies:

```
git clone <your-repo-url>
cd frontend
npm install
```

## 4. Environment Variables

Create a .env.local file:

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000
```

This value must point to your Flask backend.

## 5. Running the Development Server

Start Next.js:

`npm run dev`

Open the application: http://localhost:3000

## 6. Features

#### Upload Page

- Select and upload CSV files to S3 via presigned URLs

- Shows live upload status

- Triggers AWS Step Functions ETL workflow

- Navigation to dashboard

#### Dashboard

- Daily revenue line chart

- Top-selling products bar chart

- Daily order volume area chart

- Real-time Athena results fetched through Flask

#### Global UI Features

- Responsive layout

- Minimalistic design using Tailwind CSS

- Consistent typography using Geist

- Clean and simple component structure

## 7. Key Dependencies

#### Core Packages

```
next
react
react-dom
typescript
tailwindcss
```

#### Charts

`recharts`

## 8. Useful Commands

#### Start development server:

`npm run dev`

#### Build production bundle:

`npm run build`

#### Run production build:

`npm start`

#### Lint code:

`npm run lint`

## 9. Backend Endpoints

These are the required Flask backend routes:

#### Route Description

`/upload-url` - Returns S3 presigned URL

`/analytics/daily-revenue` - Athena daily revenue query

`/analytics/top-products` - Athena product summary

`/analytics/order-count` - Athena orders-per-day query

Ensure the backend is running before accessing the dashboard.

## 10. Deployment

You can deploy this frontend using:

- Vercel (recommended)

- Netlify

- AWS Amplify

- Any Node.js server

#### Deploy to Vercel:

`vercel`

## 12. License

This project is intended for educational and internal use only.
