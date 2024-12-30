import { Switch, Route } from "wouter";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Cart from "@/pages/Cart";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Dashboard from "@/pages/Dashboard";
import LearnMore from "@/pages/LearnMore";

function App() {
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
            <Route path="/dashboard" component={Dashboard} />
          </Switch>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;