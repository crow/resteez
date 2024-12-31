import { Switch, Route } from "wouter";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Cart from "@/pages/Cart";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Dashboard from "@/pages/Dashboard";
import LearnMore from "@/pages/LearnMore";
import Login from "@/pages/Login";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/learn-more" component={LearnMore} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout/success" component={CheckoutSuccess} />
            <Route path="/login" component={Login} />
            <Route path="/dashboard" component={Dashboard} />
          </Switch>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;