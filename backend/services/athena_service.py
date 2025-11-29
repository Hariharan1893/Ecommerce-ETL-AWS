# services/athena_service.py

import time
import boto3
import traceback
from botocore.config import Config
import os

# ---------------------------------------------------------
# Load environment variables (AWS credentials & settings)
# ---------------------------------------------------------
AWS_REGION = os.getenv("AWS_REGION")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

ATHENA_DB = os.getenv("ATHENA_DB", "ecom")
BUCKET_NAME = os.getenv("BUCKET_NAME")

# Athena writes query results into this S3 location
ATHENA_OUTPUT = f"s3://{BUCKET_NAME}/athena/"

# boto3 client config
BOTO_CONFIG = Config(
    retries={"max_attempts": 5, "mode": "standard"}
)

# Athena client
athena = boto3.client(
    "athena",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    config=BOTO_CONFIG,
    verify=False
)

# ---------------------------------------------------------
# Run Athena Query (blocking)
# ---------------------------------------------------------
def run_athena_query(query, database=ATHENA_DB, output=ATHENA_OUTPUT, poll_seconds=1):
    """
    Executes an Athena SQL query and waits until completion.

    Returns:
        list[dict]: Parsed result rows (each row is a dict of columnName: value)
    """

    try:
        # Start execution
        resp = athena.start_query_execution(
            QueryString=query,
            QueryExecutionContext={"Database": database},
            ResultConfiguration={"OutputLocation": output}
        )

        exec_id = resp["QueryExecutionId"]

        # ---------------------------------------------
        # Poll for completion (SUCCEEDED / FAILED)
        # ---------------------------------------------
        while True:
            status_resp = athena.get_query_execution(QueryExecutionId=exec_id)
            state = status_resp["QueryExecution"]["Status"]["State"]

            if state in ("SUCCEEDED", "FAILED", "CANCELLED"):
                break

            time.sleep(poll_seconds)

        # ---------------------------------------------
        # If query succeeded → fetch rows
        # ---------------------------------------------
        if state == "SUCCEEDED":
            results = athena.get_query_results(QueryExecutionId=exec_id)

            rows = results.get("ResultSet", {}).get("Rows", [])

            # no data except header
            if len(rows) <= 1:
                return []

            # extract column names
            headers = [col.get("VarCharValue") for col in rows[0].get("Data", [])]

            output_rows = []

            # parse each row
            for r in rows[1:]:
                cols = r.get("Data", [])
                row_dict = {}

                for i, cell in enumerate(cols):
                    row_dict[headers[i]] = (
                        cell.get("VarCharValue")
                        if cell and "VarCharValue" in cell
                        else None
                    )

                output_rows.append(row_dict)

            return output_rows

        # ---------------------------------------------
        # FAILED or CANCELLED → raise detailed error
        # ---------------------------------------------
        reason = status_resp["QueryExecution"]["Status"].get("StateChangeReason", "")
        stats = status_resp["QueryExecution"].get("Statistics", {})

        raise Exception(
            f"Athena query failed: state={state} "
            f"reason={reason} executionId={exec_id} stats={stats}"
        )

    except Exception as e:
        print("=== Athena query error ===")
        print("Query:", query)
        print("Exception:", str(e))
        traceback.print_exc()
        raise


# ---------------------------------------------------------
# Get Latest runId from cleaned table
# ---------------------------------------------------------
def get_latest_runid():
    """
    Fetches the latest runId from the cleaned orders table.

    Returns:
        str | None: Latest runId, or None if no rows found.
    """

    query = """
    SELECT runId
    FROM ecom.orders_cleaned
    WHERE runId IS NOT NULL
    ORDER BY runId DESC
    LIMIT 1;
    """

    rows = run_athena_query(query)

    if not rows:
        return None

    return rows[0].get("runId")
