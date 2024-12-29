import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold text-primary">RestEaze</a>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <Package className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}