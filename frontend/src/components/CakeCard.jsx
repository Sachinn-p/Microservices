import { Link } from 'react-router-dom';
import { Button } from './Button';
import { ShoppingCart } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToBasket } from '../api';
import { useUser } from '../contexts/UserContext';

export function CakeCard({ cake }) {
  const userId = useUser();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => addToBasket({ userId, cakeId: cake.id, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['basket', userId] });
    }
  });

  return (
    <div className="bg-surface rounded shadow hover:-translate-y-[2px] hover:shadow-lg transition-all duration-200 flex flex-col h-full overflow-hidden">
      <div className="bg-border h-[200px] flex items-center justify-center">
        <span className="text-muted">No Image</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase text-primary font-semibold">{cake.category}</span>
          <span className="font-bold">${cake.price.toFixed(2)}</span>
        </div>
        <Link to={`/cake/${cake.id}`} className="hover:text-primary">
          <h3 className="font-bold text-main text-xl mb-2">{cake.name}</h3>
        </Link>
        <p className="text-muted text-sm mb-4 flex-1">{cake.description}</p>
        <div className="flex gap-2 mt-auto">
          <Link 
            to={`/cake/${cake.id}`} 
            className="flex-1 bg-surface border border-border text-main hover:bg-[#fafafa] px-4 py-2 rounded font-semibold transition-all duration-200 flex items-center justify-center"
          >
            Details
          </Link>
          <Button 
            variant="primary" 
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            aria-label="Add to basket"
          >
            <ShoppingCart size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
