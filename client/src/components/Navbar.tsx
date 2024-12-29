import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <nav className="border-[6px] border-black bg-white">
      <div className="container mx-auto px-8 h-20 flex items-center justify-between">
        <Link href="/">
          <a className="brand-name text-3xl hover:skew-x-2 transition-transform">resteez</a>
        </Link>

        <div className="flex items-center gap-6">
          <ThemeToggle />

          <Link href="/cart">
            <Button className="button-neo" size="lg">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button className="button-neo" size="lg">
              <Package className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}