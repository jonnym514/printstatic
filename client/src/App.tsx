import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import { CartProvider } from "./contexts/CartContext";
import { MarketingProvider } from "./contexts/MarketingContext";
import MarketingDashboard from "./pages/MarketingDashboard";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import FAQ from "./pages/FAQ";
import RefundPolicy from "./pages/RefundPolicy";
import Terms from "./pages/Terms";
import AdminFiles from "./pages/AdminFiles";
import Bundles from "./pages/Bundles";
import AgentDashboard from "./pages/AgentDashboard";
import PinterestAgent from "./pages/PinterestAgent";
import Rewards from "./pages/Rewards";
import Referral from "./pages/Referral";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Privacy from "./pages/Privacy";
import CookieBanner from "./components/CookieBanner";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/marketing" component={MarketingDashboard} />
      <Route path="/order-success" component={OrderSuccess} />
      <Route path="/orders" component={Orders} />
      <Route path="/faq" component={FAQ} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/terms" component={Terms} />
      <Route path="/admin/files" component={AdminFiles} />
      <Route path="/bundles" component={Bundles} />
      <Route path="/agent" component={AgentDashboard} />
      <Route path="/agent/pinterest" component={PinterestAgent} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/referral" component={Referral} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <MarketingProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <CookieBanner />
            </TooltipProvider>
          </CartProvider>
        </MarketingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
