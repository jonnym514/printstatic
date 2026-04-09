/**
 * Print Static — Pinterest Marketing Agent
 * Admin-only page to connect Pinterest, map products to boards,
 * and run the fully automated AI pin generation + posting agent.
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Link2,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Clock,
  Unlink,
  Plus,
  Trash2,
  Play,
  ArrowLeft,
} from "lucide-react";

// Pinterest SVG icon
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

// All products from the catalog with their board category
const ALL_PRODUCTS = [
  { id: "weekly-planner", name: "Weekly Planner Bundle", category: "Planners" },
  { id: "budget-planner", name: "Budget Planner Spreadsheet", category: "Planners" },
  { id: "habit-tracker", name: "Habit Tracker", category: "Planners" },
  { id: "goal-workbook", name: "Goal Setting Workbook", category: "Planners" },
  { id: "meal-planner", name: "Meal Planner", category: "Planners" },
  { id: "journal-bundle", name: "Journal Bundle", category: "Planners" },
  { id: "resume-bundle", name: "Resume Bundle", category: "Productivity" },
  { id: "wall-art-geometric", name: "Geometric Wall Art", category: "Wall Art" },
  { id: "typography-quotes", name: "Typography Quote Prints", category: "Wall Art" },
  { id: "wedding-invite", name: "Wedding Invitation Suite", category: "Templates" },
  { id: "birthday-invite", name: "Birthday Party Invitation", category: "Templates" },
  { id: "business-card", name: "Business Card Template", category: "Templates" },
  { id: "kids-activity", name: "Kids Activity Sheets", category: "Templates" },
  { id: "social-calendar", name: "Social Media Content Calendar", category: "Productivity" },
  { id: "instagram-templates", name: "Instagram Post Templates Pack", category: "Productivity" },
  { id: "notion-template", name: "Notion Productivity Dashboard", category: "Productivity" },
  { id: "brand-kit", name: "Brand Identity Kit", category: "Productivity" },
];

interface BoardMapping {
  boardId: string;
  boardName: string;
  productIds: string[];
}

interface PinResult {
  productId: string;
  productName: string;
  status: "posted" | "failed" | "skipped";
  pinId?: string;
  error?: string;
}

export default function PinterestAgent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [boardMappings, setBoardMappings] = useState<BoardMapping[]>([]);
  const [runResults, setRunResults] = useState<PinResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Handle Pinterest OAuth callback params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pinterestStatus = params.get("pinterest");
    const username = params.get("username");
    const msg = params.get("msg");

    if (pinterestStatus === "connected") {
      toast.success(`Pinterest connected! @${username}`);
      window.history.replaceState({}, "", "/agent/pinterest");
      statusQuery.refetch();
    } else if (pinterestStatus === "denied") {
      toast.error("Pinterest authorization was denied.");
      window.history.replaceState({}, "", "/agent/pinterest");
    } else if (pinterestStatus === "error") {
      toast.error(`Pinterest connection failed: ${msg ?? "unknown error"}`);
      window.history.replaceState({}, "", "/agent/pinterest");
    }
  }, []);

  // tRPC queries
  const statusQuery = trpc.pinterest.getStatus.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const authUrlQuery = trpc.pinterest.getAuthUrl.useQuery(
    { origin: typeof window !== "undefined" ? window.location.origin : "" },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const boardsQuery = trpc.pinterest.getBoards.useQuery(undefined, {
    enabled: statusQuery.data?.connected === true,
  });

  const statsQuery = trpc.pinterest.getPinStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const pinHistoryQuery = trpc.pinterest.getPinHistory.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const disconnectMutation = trpc.pinterest.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Pinterest disconnected.");
      statusQuery.refetch();
      boardsQuery.refetch();
    },
    onError: (err) => toast.error(`Disconnect failed: ${err.message}`),
  });

  const postProductsMutation = trpc.pinterest.postProducts.useMutation({
    onSuccess: (data) => {
      setRunResults(data.results as PinResult[]);
      setIsRunning(false);
      toast.success(`Agent complete: ${data.posted} pins posted, ${data.failed} failed.`);
      statsQuery.refetch();
      pinHistoryQuery.refetch();
    },
    onError: (err) => {
      setIsRunning(false);
      toast.error(`Agent failed: ${err.message}`);
    },
  });

  // Auth guard
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Admin Access Required</h2>
            <p className="text-muted-foreground">This page is only accessible to store admins.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isConnected = statusQuery.data?.connected;
  const boards = boardsQuery.data ?? [];
  const stats = statsQuery.data;

  // Add a board mapping slot
  const addBoardMapping = () => {
    if (boards.length === 0) return;
    setBoardMappings((prev) => [
      ...prev,
      { boardId: boards[0].id, boardName: boards[0].name, productIds: [] },
    ]);
  };

  const updateBoardMapping = (index: number, field: keyof BoardMapping, value: string | string[]) => {
    setBoardMappings((prev) => {
      const updated = [...prev];
      if (field === "boardId") {
        const board = boards.find((b) => b.id === value);
        updated[index] = {
          ...updated[index],
          boardId: value as string,
          boardName: board?.name ?? "",
        };
      } else if (field === "productIds") {
        updated[index] = { ...updated[index], productIds: value as string[] };
      }
      return updated;
    });
  };

  const removeBoardMapping = (index: number) => {
    setBoardMappings((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleProduct = (mappingIndex: number, productId: string) => {
    setBoardMappings((prev) => {
      const updated = [...prev];
      const ids = updated[mappingIndex].productIds;
      updated[mappingIndex] = {
        ...updated[mappingIndex],
        productIds: ids.includes(productId)
          ? ids.filter((id) => id !== productId)
          : [...ids, productId],
      };
      return updated;
    });
  };

  const addAllProducts = (mappingIndex: number) => {
    setBoardMappings((prev) => {
      const updated = [...prev];
      updated[mappingIndex] = {
        ...updated[mappingIndex],
        productIds: ALL_PRODUCTS.map((p) => p.id),
      };
      return updated;
    });
  };

  const runAgent = () => {
    const validMappings = boardMappings.filter((m) => m.productIds.length > 0);
    if (validMappings.length === 0) {
      toast.error("Add at least one board mapping with products selected.");
      return;
    }
    setIsRunning(true);
    setRunResults(null);
    postProductsMutation.mutate({ boardMappings: validMappings });
  };

  const totalProducts = boardMappings.reduce((sum, m) => sum + m.productIds.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-10 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/agent")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <PinterestIcon className="w-8 h-8 text-[#E60023]" />
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Pinterest Marketing Agent
            </h1>
            <p className="text-sm text-muted-foreground">
              Automatically generate AI pin images and post them to your Pinterest boards
            </p>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Pins", value: stats.total, icon: BarChart3 },
              { label: "Posted", value: stats.posted, icon: CheckCircle2, color: "text-green-600" },
              { label: "Failed", value: stats.failed, icon: XCircle, color: "text-red-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="border border-border rounded-sm p-4 bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${color ?? "text-primary"}`} />
                  <span className="text-xs text-muted-foreground font-mono">{label}</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Connection section */}
        <section className="border border-border rounded-sm p-6 bg-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              Pinterest Account
            </h2>
            {isConnected && (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
              </Badge>
            )}
          </div>

          {statusQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" /> Checking connection…
            </div>
          ) : isConnected ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground">
                Connected as{" "}
                <span className="font-semibold text-primary">
                  @{statusQuery.data?.username ?? "unknown"}
                </span>
              </p>
              {statusQuery.data?.connectedAt && (
                <p className="text-xs text-muted-foreground">
                  Connected on {new Date(statusQuery.data.connectedAt).toLocaleDateString()}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Unlink className="w-3 h-3 mr-1.5" />
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your Pinterest Business account to enable automated pin posting.
              </p>
              {!process.env.PINTEREST_APP_ID && authUrlQuery.error ? (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-sm text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Pinterest App ID not configured. Add{" "}
                    <code className="font-mono bg-amber-100 px-1 rounded">PINTEREST_APP_ID</code> and{" "}
                    <code className="font-mono bg-amber-100 px-1 rounded">PINTEREST_APP_SECRET</code> in
                    Settings → Secrets.
                  </span>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    const url = authUrlQuery.data?.url;
                    if (url) {
                      window.location.href = url;
                    } else {
                      toast.error("Could not generate Pinterest auth URL. Check your API credentials.");
                    }
                  }}
                  disabled={authUrlQuery.isLoading}
                  className="bg-[#E60023] hover:bg-[#c0001d] text-white"
                >
                  <PinterestIcon className="w-4 h-4 mr-2" />
                  Connect Pinterest Account
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Board mappings section — only shown when connected */}
        {isConnected && (
          <section className="border border-border rounded-sm p-6 bg-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Board Mappings
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={addBoardMapping}
                disabled={boards.length === 0}
              >
                <Plus className="w-3 h-3 mr-1.5" />
                Add Board
              </Button>
            </div>

            {boardsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading boards…
              </div>
            ) : boards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No boards found on your Pinterest account. Create boards on Pinterest first.
              </p>
            ) : boardMappings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p>No board mappings yet.</p>
                <p className="mt-1">Click "Add Board" to map products to a Pinterest board.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {boardMappings.map((mapping, idx) => (
                  <div key={idx} className="border border-border rounded-sm p-4 bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-primary" />
                        <select
                          value={mapping.boardId}
                          onChange={(e) => updateBoardMapping(idx, "boardId", e.target.value)}
                          className="text-sm font-medium bg-transparent border-none outline-none text-foreground cursor-pointer"
                        >
                          {boards.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {mapping.productIds.length} products
                        </Badge>
                        <button
                          onClick={() => addAllProducts(idx)}
                          className="text-xs text-primary hover:underline"
                        >
                          All
                        </button>
                        <button
                          onClick={() => removeBoardMapping(idx)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Product selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {ALL_PRODUCTS.map((product) => {
                        const selected = mapping.productIds.includes(product.id);
                        return (
                          <button
                            key={product.id}
                            onClick={() => toggleProduct(idx, product.id)}
                            className={`text-left px-2.5 py-1.5 rounded-sm text-xs border transition-colors ${
                              selected
                                ? "bg-primary/10 border-primary/40 text-primary font-medium"
                                : "bg-background border-border text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {product.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Run agent button */}
        {isConnected && boardMappings.length > 0 && (
          <section className="border border-border rounded-sm p-6 bg-card mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-foreground">Run Agent</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  The agent will generate AI pin images and post {totalProducts} pin
                  {totalProducts !== 1 ? "s" : ""} to Pinterest.
                </p>
              </div>
              <Button
                onClick={runAgent}
                disabled={isRunning || totalProducts === 0}
                className="bg-[#E60023] hover:bg-[#c0001d] text-white min-w-[140px]"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running…
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Post All Pins
                  </>
                )}
              </Button>
            </div>

            {isRunning && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 animate-pulse" />
                Generating AI images and posting pins… This may take a few minutes.
              </div>
            )}
          </section>
        )}

        {/* Run results */}
        {runResults && (
          <section className="border border-border rounded-sm p-6 bg-card mb-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Agent Run Results
            </h2>
            <div className="space-y-1.5">
              {runResults.map((result) => (
                <div
                  key={result.productId}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0"
                >
                  <span className="text-foreground">{result.productName}</span>
                  <div className="flex items-center gap-2">
                    {result.status === "posted" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 text-xs">Posted</span>
                        {result.pinId && (
                          <a
                            href={`https://www.pinterest.com/pin/${result.pinId}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View →
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 text-xs">Failed: {result.error}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pin history */}
        {pinHistoryQuery.data && pinHistoryQuery.data.length > 0 && (
          <section className="border border-border rounded-sm p-6 bg-card">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Pin History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 text-xs text-muted-foreground font-medium">Product</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium">Board</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium">Status</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium">Date</th>
                    <th className="pb-2 text-xs text-muted-foreground font-medium">Pin</th>
                  </tr>
                </thead>
                <tbody>
                  {pinHistoryQuery.data.map((pin) => (
                    <tr key={pin.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2 text-foreground">{pin.productId}</td>
                      <td className="py-2 text-muted-foreground">{pin.boardName ?? pin.boardId}</td>
                      <td className="py-2">
                        {pin.status === "posted" ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Posted</Badge>
                        ) : pin.status === "failed" ? (
                          <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Failed</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Pending</Badge>
                        )}
                      </td>
                      <td className="py-2 text-muted-foreground text-xs">
                        {new Date(pin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        {pin.pinId && (
                          <a
                            href={`https://www.pinterest.com/pin/${pin.pinId}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-xs hover:underline"
                          >
                            View →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
