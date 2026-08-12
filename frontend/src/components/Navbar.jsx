import { Link } from 'react-router-dom';
import { ShoppingCart, Bell, Cake } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import { fetchBasket } from '../api';

export function Navbar() {
  const userId = useUser();
  
  const { data: basket } = useQuery({
    queryKey: ['basket', userId],
    queryFn: () => fetchBasket(userId)
  });

  const itemCount = basket?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <nav className="bg-surface border-b border-border p-4 sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary hover:-translate-y-0.5 transition-transform text-xl">
          <Cake size={24} /> Cake Delight
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/notifications" className="p-2 rounded font-semibold transition-colors flex items-center justify-center gap-2 text-muted hover:text-main hover:bg-border" aria-label="Notifications">
            <Bell size={20} />
          </Link>
          <Link to="/basket" className="p-2 rounded font-semibold transition-colors flex items-center justify-center gap-2 bg-surface border border-border text-main hover:bg-[#fafafa]" aria-label="Basket">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="bg-primary text-white rounded-full px-1.5 text-xs">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
