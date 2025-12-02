import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import PostDetail from "./pages/PostDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AdminUsers from "./pages/AdminUsers";
import RSSFeeds from "./pages/RSSFeeds";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/aden" element={<CategoryPage category="أخبار عدن" title="أخبار عدن" />} />
        <Route path="/local" element={<CategoryPage category="أخبار محلية" title="أخبار محلية" />} />
        <Route path="/reports" element={<CategoryPage category="أخبار وتقارير" title="أخبار وتقارير" />} />
        <Route path="/press" element={<CategoryPage category="اليمن في الصحافة" title="اليمن في الصحافة" />} />
        <Route path="/intl" element={<CategoryPage category="شؤون دولية" title="شؤون دولية" />} />
        <Route path="/economy" element={<CategoryPage category="اقتصاد" title="اقتصاد" />} />
        <Route path="/opinions" element={<CategoryPage category="آراء واتجاهات" title="آراء واتجاهات" />} />
        <Route path="/culture" element={<CategoryPage category="ثقافة وفن" title="ثقافة وفن" />} />
        <Route path="/tech" element={<CategoryPage category="علوم وتكنولوجيا" title="علوم وتكنولوجيا" />} />
        <Route path="/health" element={<CategoryPage category="صحة" title="صحة" />} />
        <Route path="/sports" element={<CategoryPage category="رياضة" title="رياضة" />} />
        <Route path="/misc" element={<CategoryPage category="منوعات" title="منوعات" />} />
        <Route path="/video" element={<CategoryPage category="فيديو" title="فيديو الجنوب فويس" />} />
        <Route path="/rss-feeds" element={<RSSFeeds />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
