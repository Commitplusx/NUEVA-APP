import { renderHook, waitFor } from '@testing-library/react';
import { useRestaurants } from './useRestaurants';
import { supabase } from '../services/supabase';

// Mockear el cliente de Supabase de una manera más sencilla
jest.mock('../services/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn((query) => {
      // Devolver datos mínimos para las pruebas
      const mockData = {
        'restaurants': [{ id: 1, name: 'Restaurant A' }],
        'categories': [{ id: 1, name: 'Pizza' }],
        'restaurant_categories': [{ restaurant_id: 1, category_id: 1 }],
        'menu_items': [{ id: 1, restaurant_id: 1, name: 'Margherita' }],
      };

      // Simular el comportamiento de 'from'
      const fromTable = (jest.fn() as jest.Mock).mock.calls[0][0] as keyof typeof mockData;

      return {
        ...jest.requireActual('../services/supabase').supabase.from('restaurants'), // Mantener la cadena de llamadas
        range: jest.fn().mockResolvedValue({ data: mockData[fromTable] || [], error: null }),
      };
    }),
  },
}));

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useRestaurants', () => {
  beforeEach(() => {
    (mockedSupabase.from as jest.Mock).mockClear();
  });

  it('should fetch and denormalize restaurants', async () => {
    const { result } = renderHook(() => useRestaurants({ filters: {} }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.restaurants).toHaveLength(1);
    expect(result.current.restaurants[0].name).toBe('Restaurant A');
    expect(result.current.restaurants[0].categories).toBeDefined();
    expect(result.current.restaurants[0].menu).toBeDefined();
  });
});
