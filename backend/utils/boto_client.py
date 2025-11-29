import boto3
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

AWS_REGION = os.getenv("AWS_REGION")

# -------------------------------------------------------
# Return an S3 client for the configured AWS region
# -------------------------------------------------------
def get_s3_client():
    """
    Creates and returns a boto3 S3 client using
    the region specified in environment variables.

    The region expected here is typically:
        ap-southeast-2  (Sydney)

    Returns:
        boto3.client("s3")
    """
    return boto3.client("s3", region_name=AWS_REGION)
