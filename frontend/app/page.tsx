"use client";

import { useState } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function HomePage() {
  // -------------------------------
  // Local state variables
  // -------------------------------
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Backend API URL (default: local Flask server)
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

  // -------------------------------
  // Handle file selection
  // -------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setStatus("idle");
    setMessage(selected ? `Selected file: ${selected.name}` : "");
  };

  // -------------------------------
  // Upload file to S3 using a presigned URL
  // -------------------------------
  const handleUpload = async () => {
    try {
      // Validate file selection
      if (!file) {
        setStatus("error");
        setMessage("Please choose a CSV file before uploading.");
        return;
      }

      setIsUploading(true);
      setStatus("uploading");
      setMessage("Requesting upload URL from backend…");

      // Step 1 — Get presigned URL from Flask backend
      const res = await fetch(`${apiBaseUrl}/upload-url`);
      if (!res.ok) throw new Error("Failed to fetch upload URL.");

      const data: { uploadUrl: string; fileKey: string } = await res.json();

      // Step 2 — Upload file directly to S3 using the presigned URL
      setMessage("Uploading file to S3…");

      const putRes = await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "text/csv" }
      });

      if (!putRes.ok) {
        throw new Error(`Upload failed with status ${putRes.status}.`);
      }

      // Success
      setStatus("success");
      setMessage(
        `Upload successful! ETL pipeline initiated for: ${data.fileKey}`
      );
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Dynamic status color for UI
  const statusColor =
    status === "success"
      ? "text-emerald-500"
      : status === "error"
      ? "text-red-500"
      : status === "uploading"
      ? "text-amber-500"
      : "text-slate-400";

  // -------------------------------------------------------------------
  // JSX UI Section
  // -------------------------------------------------------------------
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full">

        {/* --------------------- */}
        {/* Header Section        */}
        {/* --------------------- */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            Upload Sales Data for Weekly Insights
          </h1>

          <p className="text-sm sm:text-base text-slate-400">
            Import your raw <span className="font-mono">.csv</span> order file to trigger
            the automated AWS ETL workflow. Your data will be validated,
            transformed, and prepared for analytics dashboards.
          </p>
        </header>

        {/* --------------------- */}
        {/* Upload Section       */}
        {/* --------------------- */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl shadow-black/40 p-6 sm:p-8 backdrop-blur">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center">

            {/* --------------------- */}
            {/* Left Side (Form)     */}
            {/* --------------------- */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">
                Import Your Orders Dataset
              </h2>

              <p className="text-sm text-slate-400 mb-4">
                Your file is uploaded securely to S3 using a presigned URL.
                The AWS Step Functions ETL workflow then cleans, validates,
                and loads the data into your analytics layer.
              </p>

              {/* File picker + Button */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-300">
                    Upload your weekly order export (.csv)
                  </span>

                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm
                               file:mr-4 file:rounded-lg file:border-0
                               file:bg-emerald-500/90 file:px-4 file:py-2 file:text-sm file:font-medium
                               hover:file:bg-emerald-400 cursor-pointer
                               text-slate-300"
                  />
                </label>

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium
                             bg-emerald-500 hover:bg-emerald-400
                             disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed
                             transition-colors"
                >
                  {isUploading ? (
                    <>
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-100 border-t-transparent" />
                      Processing…
                    </>
                  ) : (
                    "Start ETL Processing"
                  )}
                </button>
              </div>
            </div>

            {/* --------------------------- */}
            {/* Right Side (Status Panel)  */}
            {/* --------------------------- */}
            <div className="w-full sm:w-64 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-sm space-y-2">
              <p className="text-xs font-semibold text-slate-400">
                ETL Pipeline Status
              </p>

              <p className={`text-sm font-medium ${statusColor}`}>
                {status === "idle" && "Awaiting file upload…"}
                {status === "uploading" && "Uploading file & initializing ETL…"}
                {status === "success" && "File uploaded. ETL is running in AWS."}
                {status === "error" && "Upload failed."}
              </p>

              {message && (
                <p className="mt-1 text-xs text-slate-300 whitespace-pre-wrap wrap-break-words">
                  {message}
                </p>
              )}

              <hr className="border-slate-800 my-2" />

              <p className="text-[11px] leading-relaxed text-slate-500">
                After ETL completes, your dataset will be available in Athena
                and visualized inside the analytics dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------- */}
        {/* Dashboard Navigation Link  */}
        {/* --------------------------- */}
        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="inline-block px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 rounded-xl 
                      text-sm font-medium transition-colors"
          >
            View Analytics Dashboard →
          </a>
        </div>

        {/* --------------------------- */}
        {/* Footer                     */}
        {/* --------------------------- */}
        <footer className="mt-6 text-center text-xs text-slate-500">
          Powered by a serverless stack: Flask API · S3 Presigned Uploads ·
          Step Functions ETL · DynamoDB · Athena Data Lake.
        </footer>
      </div>
    </main>
  );
}
