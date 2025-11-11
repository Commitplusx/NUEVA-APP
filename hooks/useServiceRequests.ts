import { useState, useEffect } from 'react';
import { getServiceRequests } from '../services/api';
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
  }, []);

  return { requests, loading };
};
