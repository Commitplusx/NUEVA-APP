import { useState, useEffect } from 'react';
import { getServiceRequests } from '../services/api';
import { supabase } from '../services/supabase';
import { ServiceRequest } from '../types';

export const useServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getServiceRequests();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching service requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // Real-time subscription
    const subscription = supabase
      .channel('service_requests_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests',
        },
        (payload) => {
          console.log('Real-time update:', payload);
          if (payload.eventType === 'INSERT') {
            setRequests((prev) => [payload.new as ServiceRequest, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRequests((prev) =>
              prev.map((req) => (req.id === payload.new.id ? (payload.new as ServiceRequest) : req))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { requests, loading };
};
