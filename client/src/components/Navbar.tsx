import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="bg-white dark:bg-black">
      <div className="container mx-auto px-8 h-20 flex items-center justify-between">
        <div className="brand-name text-3xl hover:skew-x-2 transition-transform text-primary dark:text-white">
          <Link href="/">resteez</Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="dark:bg-white/10 p-2 rounded-md">
            <ThemeToggle />
          </div>

          <div>
            <Link href="/cart">
              <Button className="button-neo" size="lg">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {isAuthenticated && (
            <div>
              <Link href="/dashboard">
                <Button className="button-neo" size="lg">
                  <Package className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}