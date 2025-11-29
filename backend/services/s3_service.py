import time
import uuid
from utils.boto_client import get_s3_client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

BUCKET_NAME = os.getenv("BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION")

# -------------------------------------------------------------
# Generate a presigned S3 PUT URL for CSV upload
# -------------------------------------------------------------
def generate_presigned_upload_url():
    """
    Generates a unique S3 file key and returns
    a presigned PUT URL so the frontend can upload directly.

    Returns:
        dict:{
            "uploadUrl": <signed_url>,
            "fileKey": <s3_path>
        }
    """

    # Initialize S3 client
    s3 = get_s3_client()

    # ---------------------------------------------
    # Create unique file name
    # Format: uploads/orders_<timestamp>_<random>.csv
    # ---------------------------------------------
    timestamp = int(time.time())
    random_id = uuid.uuid4().hex[:6]

    file_key = f"uploads/orders_{timestamp}_{random_id}.csv"

    # ---------------------------------------------
    # Generate a presigned PUT URL
    # ---------------------------------------------
    presigned_url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": BUCKET_NAME,
            "Key": file_key,
            "ContentType": "text/csv"
        },
        ExpiresIn=300  # URL valid for 5 minutes
    )

    # Debug prints (optional)
    print("Bucket:", BUCKET_NAME)
    print("Region:", AWS_REGION)

    # Return data for the frontend
    return {
        "uploadUrl": presigned_url,
        "fileKey": file_key
    }
