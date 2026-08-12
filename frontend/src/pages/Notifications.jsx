import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '../api';
import { useUser } from '../contexts/UserContext';
import { Bell, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Notifications() {
  const userId = useUser();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications(userId),
    refetchInterval: 3000 // poll for new notifications every 3s
  });

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
      <h1 className="font-bold flex items-center gap-3 text-3xl">
        <Bell className="text-primary" size={32} /> Your Notifications
      </h1>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-border rounded-md h-[80px] animate-pulse" />)}
        </div>
      ) : notifications?.length === 0 ? (
        <div className="text-center p-12 bg-surface border border-border rounded-lg shadow-sm">
          <p className="text-muted mb-6">You don't have any notifications yet.</p>
          <Link to="/" className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary-hover shadow hover:-translate-y-[1px] transition-all">
            Browse Cakes
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications?.map((notif) => (
            <div key={notif.id} className="p-4 bg-surface border border-border rounded-lg shadow-sm flex items-start gap-4 hover:-translate-y-[1px] hover:shadow transition-all">
              <div className="bg-primary p-2 rounded-full text-white mt-1">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="font-bold text-main mb-1">Order {notif.status}</p>
                <p className="text-muted">{notif.message}</p>
                <p className="text-muted mt-2 text-xs">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
