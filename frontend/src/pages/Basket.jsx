import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBasket, checkoutBasket, updateBasketItemQuantity, removeBasketItem, fetchCakes } from '../api';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/Button';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Cake } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Basket() {
  const userId = useUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: basket, isLoading } = useQuery({
    queryKey: ['basket', userId],
    queryFn: () => fetchBasket(userId)
  });

  const { data: cakes } = useQuery({
    queryKey: ['cakes'],
    queryFn: () => fetchCakes()
  });

  const checkoutMutation = useMutation({
    mutationFn: () => checkoutBasket(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['basket', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      navigate('/notifications');
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ cakeId, quantity }) => updateBasketItemQuantity(userId, cakeId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['basket', userId] })
  });

  const removeMutation = useMutation({
    mutationFn: (cakeId) => removeBasketItem(userId, cakeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['basket', userId] })
  });

  if (isLoading) return <div className="bg-border rounded-md h-[400px] animate-pulse" />;

  const items = basket?.items || [];
  const totalAmount = items.reduce((acc, item) => acc + (item.quantity * 20.0), 0);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <h1 className="font-bold flex items-center gap-3 text-3xl">
        <ShoppingBag className="text-primary" size={32} /> Your Basket
      </h1>

      {items.length === 0 ? (
        <div className="text-center p-16 bg-surface border border-border rounded-xl shadow-sm flex flex-col items-center justify-center gap-6">
          <div className="bg-background w-20 h-20 rounded-full flex items-center justify-center text-border border border-border">
            <ShoppingBag size={32} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-lg font-medium text-main mb-2">Your basket is currently empty</p>
            <p className="text-muted">Looks like you haven't added any delicious cakes yet.</p>
          </div>
          <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all">
            Browse Cakes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {items.map((item) => {
              const cake = cakes?.find(c => c.id === item.cakeId);
              const cakeName = cake ? cake.name : `Cake #${item.cakeId}`;
              
              return (
              <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-surface border border-border rounded-xl shadow-sm gap-4 transition-all hover:border-gray-300 group">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-[80px] h-[80px] bg-background border border-border rounded-lg shrink-0 flex items-center justify-center text-muted overflow-hidden">
                    {cake?.imageUrl ? (
                      <img src={cake.imageUrl} alt={cakeName} className="w-full h-full object-cover" />
                    ) : (
                      <Cake size={32} strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-main text-lg leading-tight">
                      {cakeName} <span className="text-muted text-sm font-normal">(ID: {item.cakeId})</span>
                    </h3>
                    <p className="text-muted text-sm font-medium">${(20.0).toFixed(2)} each</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end border-t border-border sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  {/* Quantity Control Pill */}
                  <div className="flex items-center border border-border rounded-full bg-background overflow-hidden h-10 shadow-sm shrink-0">
                    <button 
                      onClick={() => updateQuantityMutation.mutate({ cakeId: item.cakeId, quantity: item.quantity - 1 })}
                      disabled={updateQuantityMutation.isPending || removeMutation.isPending}
                      className="px-3 h-full hover:bg-surface text-muted hover:text-main transition-colors flex items-center justify-center disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-semibold text-main text-sm">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantityMutation.mutate({ cakeId: item.cakeId, quantity: item.quantity + 1 })}
                      disabled={updateQuantityMutation.isPending || removeMutation.isPending}
                      className="px-3 h-full hover:bg-surface text-muted hover:text-main transition-colors flex items-center justify-center disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="font-bold text-main text-lg w-20 text-right shrink-0">
                    ${(item.quantity * 20.0).toFixed(2)}
                  </div>

                  {/* Delete Button */}
                  <button 
                    onClick={() => removeMutation.mutate(item.cakeId)}
                    disabled={updateQuantityMutation.isPending || removeMutation.isPending}
                    className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-full transition-all disabled:opacity-50 ml-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              );
            })}
          </div>

          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 flex flex-col gap-6 h-fit lg:sticky top-[90px]">
            <h2 className="font-bold text-xl">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span className="font-medium text-main">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="font-medium text-main">Free</span>
              </div>
            </div>
            
            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-bold text-xl mb-6">
                <span>Total</span>
                <span className="text-primary">${totalAmount.toFixed(2)}</span>
              </div>
              
              <Button 
                variant="primary" 
                className="w-full py-3.5 text-base shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all" 
                onClick={() => checkoutMutation.mutate()}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? 'Processing...' : 'Checkout Securely'}
                {!checkoutMutation.isPending && <ArrowRight size={18} className="ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
