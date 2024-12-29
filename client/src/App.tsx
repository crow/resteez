import { Switch, Route } from "wouter";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Dashboard from "@/pages/Dashboard";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/dashboard" component={Dashboard} />
          </Switch>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
