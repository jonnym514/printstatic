/**
 * Admin File Upload Page — /admin/files
 * Allows the store owner to upload PDF files for each product.
 * Files are stored in S3 and linked to product IDs in the database.
 * Only accessible to admin users.
 */

import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PRODUCT_CATALOG } from "@shared/products";
import { Upload, Trash2, FileText, CheckCircle, AlertCircle, Loader2, Lock } from "lucide-react";
import { getLoginUrl } from "@/const";

const CATEGORIES = Array.from(new Set(PRODUCT_CATALOG.map((p) => p.category)));

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadState {
  status: UploadStatus;
  message: string;
}

export default function AdminFiles() {
  const { user, isAuthenticated, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const utils = trpc.useUtils();

  // Fetch all uploaded files
  const { data: allFiles, isLoading: filesLoading } = trpc.files.getAllFiles.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Upload mutation
  const uploadMutation = trpc.files.uploadFile.useMutation({
    onSuccess: () => {
      utils.files.getAllFiles.invalidate();
    },
  });

  // Delete mutation
  const deleteMutation = trpc.files.deleteFile.useMutation({
    onSuccess: () => {
      utils.files.getAllFiles.invalidate();
    },
  });

  const handleFileSelect = async (productId: string, file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.includes("pdf") && !file.type.includes("zip") && !file.type.includes("octet-stream")) {
      setUploadStates((prev) => ({
        ...prev,
        [productId]: { status: "error", message: "Please upload a PDF or ZIP file." },
      }));
      return;
    }

    // Validate file size (50 MB max)
    if (file.size > 50 * 1024 * 1024) {
      setUploadStates((prev) => ({
        ...prev,
        [productId]: { status: "error", message: "File must be under 50 MB." },
      }));
      return;
    }

    setUploadStates((prev) => ({
      ...prev,
      [productId]: { status: "uploading", message: `Uploading ${file.name}…` },
    }));

    try {
      // Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Strip the data URL prefix (e.g. "data:application/pdf;base64,")
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await uploadMutation.mutateAsync({
        productId,
        fileName: file.name,
        fileData: base64,
        mimeType: file.type || "application/pdf",
        fileSize: file.size,
      });

      setUploadStates((prev) => ({
        ...prev,
        [productId]: { status: "success", message: `${file.name} uploaded successfully!` },
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStates((prev) => ({
          ...prev,
          [productId]: { status: "idle", message: "" },
        }));
      }, 3000);
    } catch (err: any) {
      setUploadStates((prev) => ({
        ...prev,
        [productId]: {
          status: "error",
          message: err?.message || "Upload failed. Please try again.",
        },
      }));
    }

    // Reset the file input
    if (fileInputRefs.current[productId]) {
      fileInputRefs.current[productId]!.value = "";
    }
  };

  const handleDelete = async (fileId: number, fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
    await deleteMutation.mutateAsync({ id: fileId });
  };

  // Group files by product ID
  const filesByProduct: Record<string, typeof allFiles> = {};
  if (allFiles) {
    for (const file of allFiles) {
      if (!filesByProduct[file.productId]) filesByProduct[file.productId] = [];
      filesByProduct[file.productId]!.push(file);
    }
  }

  // Filter products by category
  const filteredProducts =
    selectedCategory === "All"
      ? PRODUCT_CATALOG
      : PRODUCT_CATALOG.filter((p) => p.category === selectedCategory);

  // Auth guard
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
          <Lock className="w-12 h-12 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Admin Access Required</h1>
          <p className="text-muted-foreground text-center max-w-md">
            {isAuthenticated
              ? "Your account does not have admin access."
              : "Please sign in with your Manus account to access the admin panel."}
          </p>
          {!isAuthenticated && (
            <a
              href={getLoginUrl()}
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold text-sm rounded-sm hover:bg-primary hover:text-white transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Sign In
            </a>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  const totalFiles = allFiles?.length ?? 0;
  const productsWithFiles = Object.keys(filesByProduct).length;
  const productsWithoutFiles = PRODUCT_CATALOG.length - productsWithFiles;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <Lock className="w-3 h-3" />
            Admin Panel
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Product File Manager</h1>
          <p className="text-muted-foreground">
            Upload the PDF or ZIP files customers will receive after purchase. Each product can have multiple files.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="border border-border rounded-xl p-5 bg-card">
            <div className="text-3xl font-bold text-foreground">{PRODUCT_CATALOG.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Products</div>
          </div>
          <div className="border border-border rounded-xl p-5 bg-card">
            <div className="text-3xl font-bold text-primary">{productsWithFiles}</div>
            <div className="text-sm text-muted-foreground mt-1">Products with Files</div>
          </div>
          <div className="border border-border rounded-xl p-5 bg-card">
            <div className={`text-3xl font-bold ${productsWithoutFiles > 0 ? "text-destructive" : "text-primary"}`}>
              {productsWithoutFiles}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Missing Files</div>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product list */}
        {filesLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const productFiles = filesByProduct[product.id] ?? [];
              const state = uploadStates[product.id] ?? { status: "idle", message: "" };
              const hasFiles = productFiles.length > 0;

              return (
                <div
                  key={product.id}
                  className={`border rounded-xl p-6 bg-card transition-colors ${
                    hasFiles ? "border-primary/30" : "border-border"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {product.category}
                        </span>
                        {hasFiles ? (
                          <span className="flex items-center gap-1 text-xs text-primary font-medium">
                            <CheckCircle className="w-3 h-3" />
                            {productFiles.length} file{productFiles.length !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                            <AlertCircle className="w-3 h-3" />
                            No files
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground text-lg leading-tight">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{product.description}</p>
                      <p className="text-sm font-bold text-primary mt-1">${product.price.toFixed(2)}</p>

                      {/* Existing files */}
                      {productFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {productFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50"
                            >
                              <FileText className="w-4 h-4 text-primary shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{file.fileName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {file.fileSize ? formatBytes(file.fileSize) : "Unknown size"} ·{" "}
                                  {new Date(file.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDelete(file.id, file.fileName)}
                                disabled={deleteMutation.isPending}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Delete file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Upload area */}
                    <div className="md:w-64 shrink-0">
                      <input
                        ref={(el) => { fileInputRefs.current[product.id] = el; }}
                        type="file"
                        accept=".pdf,.zip"
                        className="hidden"
                        id={`file-input-${product.id}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(product.id, file);
                        }}
                      />

                      <label
                        htmlFor={`file-input-${product.id}`}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                          state.status === "uploading"
                            ? "border-primary/50 bg-primary/5 cursor-not-allowed"
                            : "border-border hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {state.status === "uploading" ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-xs text-primary font-medium text-center">{state.message}</span>
                          </>
                        ) : state.status === "success" ? (
                          <>
                            <CheckCircle className="w-6 h-6 text-primary" />
                            <span className="text-xs text-primary font-medium text-center">{state.message}</span>
                          </>
                        ) : state.status === "error" ? (
                          <>
                            <AlertCircle className="w-6 h-6 text-destructive" />
                            <span className="text-xs text-destructive font-medium text-center">{state.message}</span>
                            <span className="text-xs text-muted-foreground">Click to try again</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium text-center">
                              Upload PDF or ZIP
                            </span>
                            <span className="text-xs text-muted-foreground/60 text-center">Max 50 MB</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary footer */}
        <div className="mt-12 p-6 rounded-xl bg-muted/30 border border-border">
          <h3 className="font-semibold text-foreground mb-2">Upload Guide</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• Upload <strong>PDF</strong> files for planners, templates, wall art, and invitations.</li>
            <li>• Use <strong>ZIP</strong> files when a product includes multiple files (e.g. Canva templates + instructions).</li>
            <li>• You can upload <strong>multiple files per product</strong> — customers will receive all of them.</li>
            <li>• Files are stored securely in S3 and served via <strong>time-limited download links</strong>.</li>
            <li>• Customers can re-download from their <strong>Order History</strong> page at any time.</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
