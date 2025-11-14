import { renderHook, waitFor, act } from '@testing-library/react';
import { useRestaurants } from './useRestaurants';
import { supabase } from '../services/supabase';

// Mockear el cliente de Supabase
jest.mock('../services/supabase', () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
      remove: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

// Mock de datos
const mockRestaurantsPage1 = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `Restaurant ${String.fromCharCode(65 + i)}`,
  image_url: '',
}));
const mockRestaurantsPage2 = Array.from({ length: 2 }, (_, i) => ({
  id: i + 9,
  name: `Restaurant ${String.fromCharCode(65 + i + 8)}`,
  image_url: '',
}));
const mockCategories = [{ id: 1, name: 'Pizza' }];
const mockRestaurantCategories = [{ restaurant_id: 1, category_id: 1 }];
const mockMenuItems = [{ id: 1, restaurant_id: 1, name: 'Margherita' }];

const fromMock = supabase.from as jest.Mock;

describe('useRestaurants', () => {
  beforeEach(() => {
    fromMock.mockClear();
  });

  const mockSupabaseResponse = (table: string, data: any) => {
    const mock = {
      select: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({ data, error: null }),
      ilike: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data, error: null }),
    };
    if (table === 'restaurants') return mock;
    if (table === 'categories') return { select: jest.fn().mockResolvedValue({ data, error: null }) };
    if (table === 'restaurant_categories') return { select: jest.fn().mockResolvedValue({ data, error: null }) };
    if (table === 'menu_items') return { select: jest.fn().mockResolvedValue({ data, error: null }) };
    return mock;
  };

  it('should fetch initial restaurants and denormalize them', async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'restaurants') return mockSupabaseResponse(table, mockRestaurantsPage1);
      if (table === 'categories') return mockSupabaseResponse(table, mockCategories);
      if (table === 'restaurant_categories') return mockSupabaseResponse(table, mockRestaurantCategories);
      if (table === 'menu_items') return mockSupabaseResponse(table, mockMenuItems);
      return mockSupabaseResponse(table, []);
    });

    const { result } = renderHook(() => useRestaurants({}));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.restaurants).toHaveLength(8);
    expect(result.current.restaurants[0].name).toBe('Restaurant A');
    expect(result.current.restaurants[0].categories).toEqual([{ id: 1, name: 'Pizza' }]);
    expect(result.current.restaurants[0].menu).toEqual([{ id: 1, restaurant_id: 1, name: 'Margherita', imageUrl: '' }]);
  });

  it('should handle pagination with loadMore', async () => {
    let page = 0;
    fromMock.mockImplementation((table: string) => {
      if (table === 'restaurants') {
        const data = page === 0 ? mockRestaurantsPage1 : mockRestaurantsPage2;
        page++;
        return mockSupabaseResponse(table, data);
      }
      if (table === 'categories') return mockSupabaseResponse(table, mockCategories);
      if (table === 'restaurant_categories') return mockSupabaseResponse(table, mockRestaurantCategories);
      if (table === 'menu_items') return mockSupabaseResponse(table, mockMenuItems);
      return mockSupabaseResponse(table, []);
    });

    const { result } = renderHook(() => useRestaurants({}));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.restaurants).toHaveLength(8);

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.loadingMore).toBe(false));
    expect(result.current.restaurants).toHaveLength(10);
    expect(result.current.restaurants[9].name).toBe('Restaurant J');
  });

  it('should filter by search query on the server', async () => {
    const ilikeMock = jest.fn().mockReturnThis();
    const rangeMock = jest.fn().mockResolvedValue({ data: [{ id: 5, name: 'Search Res' }], error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === 'restaurants') {
        return {
          select: jest.fn().mockReturnThis(),
          ilike: ilikeMock,
          order: jest.fn().mockReturnThis(),
          range: rangeMock,
        };
      }
      return mockSupabaseResponse(table, []);
    });

    const { rerender } = renderHook(({ searchQuery }) => useRestaurants({ searchQuery }), {
      initialProps: { searchQuery: '' },
    });

    rerender({ searchQuery: 'Search' });

    await waitFor(() => {
      expect(ilikeMock).toHaveBeenCalledWith('name', '%Search%');
      expect(rangeMock).toHaveBeenCalled();
    });
  });

  it('should filter by category on the server', async () => {
    const inMock = jest.fn().mockReturnThis();
    const rangeMock = jest.fn().mockResolvedValue({ data: [{ id: 1, name: 'Restaurant A' }], error: null });

    fromMock.mockImplementation((table: string) => {
      if (table === 'restaurant_categories') return { select: jest.fn().mockReturnThis(), in: inMock };
      if (table === 'restaurants') {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(), // Assuming this `in` is for restaurant IDs
          order: jest.fn().mockReturnThis(),
          range: rangeMock,
        };
      }
      return mockSupabaseResponse(table, []);
    });

    const { rerender } = renderHook(({ filters }) => useRestaurants({ filters }), {
      initialProps: { filters: { categories: [] } },
    });

    rerender({ filters: { categories: ['1'] } });

    await waitFor(() => {
      expect(inMock).toHaveBeenCalledWith('category_id', [1]);
      expect(rangeMock).toHaveBeenCalled();
    });
  });
});
