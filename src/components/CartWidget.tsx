import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatIDR } from "@/lib/risk-engine";

export const CartWidget = () => {
  const { itemCount, cartTotal } = useCart();

  if (itemCount === 0) return null;

  return (
    <Link
      to="/cart-checkout"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-primary py-3 pl-4 pr-5 text-primary-foreground shadow-elegant transition-smooth hover:scale-105 hover:bg-primary/90"
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm">
          {itemCount}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-medium leading-none text-primary-foreground/80">Keranjang</span>
        <span className="font-display font-bold leading-none">{formatIDR(cartTotal)}</span>
      </div>
    </Link>
  );
};
