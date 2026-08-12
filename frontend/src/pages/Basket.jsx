import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBasket, checkoutBasket } from '../api';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/Button';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Basket() {
  const userId = useUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: basket, isLoading } = useQuery({
    queryKey: ['basket', userId],
    queryFn: () => fetchBasket(userId)
  });

  const checkoutMutation = useMutation({
    mutationFn: () => checkoutBasket(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['basket', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      navigate('/notifications');
    }
  });

  if (isLoading) return <div className="bg-border rounded-md h-[400px] animate-pulse" />;

  const items = basket?.items || [];
  const totalAmount = items.reduce((acc, item) => acc + (item.quantity * 20.0), 0);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <h1 className="font-bold flex items-center gap-3 text-3xl">
        <ShoppingBag className="text-primary" size={32} /> Your Basket
      </h1>

      {items.length === 0 ? (
        <div className="text-center p-12 bg-surface border border-border rounded-lg shadow-sm">
          <p className="text-muted mb-6">Your basket is currently empty.</p>
          <Link to="/" className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary-hover shadow hover:-translate-y-[1px] transition-all">
            Browse Cakes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4 md:col-span-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-[60px] h-[60px] bg-border rounded" />
                  <div>
                    <h3 className="font-bold text-main">Cake ID: {item.cakeId}</h3>
                    <p className="text-muted text-sm">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="font-bold text-main text-lg">${(item.quantity * 20.0).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-lg shadow-sm p-6 flex flex-col gap-4 h-fit md:sticky top-[90px]">
            <h2 className="font-bold text-xl mb-2">Order Summary</h2>
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted">Subtotal</span>
              <span className="font-bold">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span className="text-primary">${totalAmount.toFixed(2)}</span>
            </div>
            <Button 
              variant="primary" 
              className="mt-4 py-3" 
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending}
            >
              {checkoutMutation.isPending ? 'Processing...' : 'Checkout'}
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
