import { useQuery } from '@tanstack/react-query';
import { fetchCakes } from '../api';
import { CakeCard } from '../components/CakeCard';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function Catalog() {
  const [search, setSearch] = useState('');
  
  const { data: cakes, isLoading, error } = useQuery({
    queryKey: ['cakes', search],
    queryFn: () => fetchCakes(search)
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 items-center text-center">
        <h1 className="font-bold text-4xl">Our Delicious Cakes</h1>
        <p className="text-muted max-w-[600px]">
          Discover the best hand-crafted cakes for your special occasions. From rich chocolate truffles to classic vanilla beans.
        </p>

        <div className="flex items-center bg-surface border border-border rounded-md px-4 py-2 mt-4 w-full max-w-[400px]">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search cakes..." 
            className="w-full bg-surface border-none outline-none ml-2 px-1 font-sans"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-border rounded-md h-[350px] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-surface border border-border rounded text-primary">
          Failed to load cakes. Please try again later.
        </div>
      ) : cakes?.length === 0 ? (
        <div className="text-center p-8 text-muted">
          No cakes found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cakes?.map((cake) => (
            <CakeCard key={cake.id} cake={cake} />
          ))}
        </div>
      )}
    </div>
  );
}
