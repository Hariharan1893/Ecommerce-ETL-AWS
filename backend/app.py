# app.py

from flask import Flask, jsonify
from flask_cors import CORS

# Internal service imports
from services.s3_service import generate_presigned_upload_url
from services.athena_service import run_athena_query, get_latest_runid

# ---------------------------------------------------------
# Flask App Initialization
# ---------------------------------------------------------
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})


# ---------------------------------------------------------
# Health Check / Running Check
# ---------------------------------------------------------
@app.route("/running-check")
def home():
    """Simple endpoint to verify backend is online."""
    return {"status": "Backend is running..."}


# ---------------------------------------------------------
# Generate Presigned S3 URL for CSV Upload
# ---------------------------------------------------------
@app.route("/upload-url", methods=["GET"])
def get_upload_url():
    """Returns a presigned URL used by frontend to upload CSV directly to S3."""
    return jsonify(generate_presigned_upload_url())


# ---------------------------------------------------------
# Analytics API — Daily Revenue
# ---------------------------------------------------------
@app.get("/analytics/daily-revenue")
def daily_revenue():
    """
    Returns day-wise revenue for the latest ETL run (ordered by date).
    Data comes from Athena table: ecom.orders_cleaned
    """
    runid = get_latest_runid()
    if not runid:
        return jsonify([])

    query = f"""
    SELECT 
        date(from_iso8601_timestamp(orderDate)) AS day,
        SUM(totalAmount) AS revenue
    FROM ecom.orders_cleaned
    WHERE runId = '{runid}'
    GROUP BY 1
    ORDER BY 1 ASC;
    """

    try:
        res = run_athena_query(query)
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------
# Analytics API — Top Products
# ---------------------------------------------------------
@app.get("/analytics/top-products")
def top_products():
    """
    Returns top-selling products (sum of qty) for the latest ETL run.
    Sorted by units sold (descending).
    """
    runid = get_latest_runid()
    if not runid:
        return jsonify([])

    query = f"""
    SELECT 
        productName, 
        SUM(qty) AS units
    FROM ecom.orders_cleaned
    WHERE runId = '{runid}'
    GROUP BY productName
    ORDER BY units DESC
    LIMIT 10;
    """

    try:
        res = run_athena_query(query)
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------
# Analytics API — Daily Order Count
# ---------------------------------------------------------
@app.get("/analytics/order-count")
def order_count():
    """
    Returns total orders per day for the latest ETL run.
    Useful for operational dashboards and traffic trend charts.
    """
    runid = get_latest_runid()
    if not runid:
        return jsonify([])

    query = f"""
    SELECT 
        date(from_iso8601_timestamp(orderDate)) AS day, 
        COUNT(*) AS orders
    FROM ecom.orders_cleaned
    WHERE runId = '{runid}'
    GROUP BY 1
    ORDER BY 1 ASC;
    """

    try:
        res = run_athena_query(query)
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------
# Local Development Server
# ---------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
