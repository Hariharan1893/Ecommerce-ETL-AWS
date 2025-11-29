# E-Commerce ETL Backend API (Flask)

This backend service provides API endpoints used by the E-Commerce ETL analytics dashboard.  
It supports generating S3 presigned upload URLs and querying AWS Athena for cleaned order data.

---

## Tech Stack

- Python 3
- Flask
- Flask-CORS
- boto3
- AWS S3
- AWS Athena

---

## Environment Variables

Create a `.env` file in the backend folder:

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-southeast-2

BUCKET_NAME=ecom-etl-project-bucket
ATHENA_DB=ecom
```

---

## Setup Instructions

### 1. Create Virtual Environment

`python -m venv ecom-etl-backend-api`

### 2. Activate the Environment

#### Windows:

`ecom-etl-backend-api\Scripts\activate `

#### Mac/Linux:

`source ecom-etl-backend-api/bin/activate `

### 3. Install Dependencies

`pip install -r requirements.txt`

Update requirements:
`pip freeze > requirements.txt`

---

## Running the Server

Start the backend API:  
`python app.py`

Server runs at:  
http://127.0.0.1:5000

---

## API Endpoints

### Health Check

`GET /running-check`

### Generate S3 Presigned Upload URL

`GET /upload-url`

#### Returns:

```json
{
  "uploadUrl": "<presigned-url>",
  "fileKey": "uploads/orders_<timestamp>_<uuid>.csv"
}
```

### Daily Revenue

`GET /analytics/daily-revenue`

### Top Products

`GET /analytics/top-products`

### Order Count Per Day

`GET /analytics/order-count`

Each endpoint queries AWS Athena for the latest processed dataset.

---

## How the Backend Fits into the ETL Workflow

1. Frontend requests /upload-url
2. File uploads directly to S3 using presigned URL
3. AWS Step Functions pipeline processes the file:
   - Validate
   - Clean
   - Write cleaned JSON to S3
4. Athena reads cleaned JSON
5. Frontend dashboard fetches analytics from Flask API

---

## Updating Dependencies

Install a new package:  
`pip install package-name  `

Update requirements:  
`pip freeze > requirements.txt`

---

## Deactivate the Environment

`deactivate`
