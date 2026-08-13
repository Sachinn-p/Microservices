import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCake, fetchRatings, submitRating, addToBasket } from '../api';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/Button';
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function CakeDetail() {
  const { id } = useParams();
  const userId = useUser();
  const queryClient = useQueryClient();
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');

  const { data: cake, isLoading: cakeLoading } = useQuery({
    queryKey: ['cake', id],
    queryFn: () => fetchCake(id),
    enabled: !!id
  });

  const { data: ratingsData, isLoading: ratingsLoading } = useQuery({
    queryKey: ['ratings', id],
    queryFn: () => fetchRatings(id),
    enabled: !!id
  });

  const basketMutation = useMutation({
    mutationFn: () => addToBasket({ userId, cakeId: id, quantity: 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['basket', userId] })
  });

  const ratingMutation = useMutation({
    mutationFn: () => submitRating({ userId, cakeId: id, score, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', id] });
      setComment('');
      setScore(5);
    }
  });

  if (cakeLoading) return <div className="bg-border rounded-md h-[400px] animate-pulse" />;
  if (!cake) return <div className="text-center p-8">Cake not found</div>;

  return (
    <div className="flex flex-col gap-8">
      <Link to="/" className="text-muted hover:text-main hover:bg-border px-4 py-2 rounded self-start flex items-center gap-2 font-semibold transition-colors">
        <ArrowLeft size={20} /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-border h-[400px] rounded-lg flex items-center justify-center w-full overflow-hidden shadow-sm">
          {cake.imageUrl ? (
            <img src={cake.imageUrl} alt={cake.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-muted">No Image</span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase text-primary font-semibold tracking-wider">{cake.category}</span>
          <h1 className="font-bold text-4xl leading-tight">{cake.name}</h1>
          <p className="text-muted text-lg">{cake.description}</p>
          <div className="font-bold text-3xl mt-4">₹{cake.price.toFixed(2)}</div>

          <Button 
            variant="primary" 
            className="mt-4 py-4 text-lg" 
            onClick={() => basketMutation.mutate()}
            disabled={basketMutation.isPending}
          >
            <ShoppingCart size={20} />
            {basketMutation.isPending ? 'Adding...' : 'Add to Basket'}
          </Button>
        </div>
      </div>

      <div className="mt-8 border border-border bg-surface p-6 rounded-lg shadow-sm">
        <h2 className="font-bold flex items-center gap-2 mb-6 text-2xl">
          <Star className="text-primary" /> Reviews ({ratingsData?.totalRatings || 0})
        </h2>

        {ratingsData?.averageScore > 0 && (
          <div className="mb-6 flex items-baseline gap-2">
            <span className="font-bold text-primary text-4xl">{ratingsData.averageScore.toFixed(1)}</span>
            <span className="text-muted"> / 5 Average Score</span>
          </div>
        )}

        <div className="flex flex-col gap-4 mb-8">
          {ratingsLoading ? (
            <div className="bg-border rounded-md h-[100px] animate-pulse" />
          ) : ratingsData?.ratings?.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first to review!</p>
          ) : (
            ratingsData?.ratings?.map((r) => (
              <div key={r.id} className="border border-border p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2 font-bold text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill={i < r.score ? 'currentColor' : 'none'} />
                  ))}
                  <span className="text-main ml-2 text-sm font-normal">{r.userId}</span>
                </div>
                <p>{r.comment}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); ratingMutation.mutate(); }} className="flex flex-col gap-4 border-t border-border pt-6">
          <h3 className="font-bold text-xl">Write a Review</h3>
          <div className="flex flex-col gap-2">
            <label htmlFor="score" className="font-semibold text-sm">Rating (1-5)</label>
            <select 
              id="score" 
              value={score} 
              onChange={e => setScore(Number(e.target.value))}
              className="p-2 border border-border rounded bg-surface font-sans"
            >
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="comment" className="font-semibold text-sm">Comment</label>
            <textarea 
              id="comment" 
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="p-3 border border-border rounded bg-surface font-sans resize-y"
              rows={3}
              placeholder="What did you think about this cake?"
              required
            />
          </div>
          <Button type="submit" disabled={ratingMutation.isPending || !comment.trim()} className="self-start">
            {ratingMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </div>
    </div>
  );
}
