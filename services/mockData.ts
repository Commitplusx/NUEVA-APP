
import { Restaurant } from '../types';
import { SaltIcon, ChickenIcon, OnionIcon, GarlicIcon, PeppersIcon, GingerIcon, BroccoliIcon } from '../components/icons';

export const restaurants: Restaurant[] = [
  {
    id: 1,
    name: 'Rose Garden Restaurant',
    category: 'Burger - Chiken - Riche - Wings',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
    rating: 4.7,
    deliveryFee: 'Free',
    deliveryTime: '20 min',
    menu: [
      { 
        id: 101, 
        name: 'Pizza Margherita', 
        description: 'Salsa de tomate, mozzarella fresca, albahaca y un toque de aceite de oliva.', 
        price: 150, 
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2069&auto=format&fit=crop',
        rating: 4.8,
        reviews: 120,
        ingredients: [
          { name: 'Tomate', icon: PeppersIcon },
          { name: 'Queso', icon: SaltIcon },
          { name: 'Albahaca', icon: BroccoliIcon },
        ]
      },
      { 
        id: 102, 
        name: 'Chicken Thai Biriyani', 
        description: 'Un exquisito plato de arroz con pollo marinado en especias tailandesas y un toque picante.', 
        price: 260, 
        imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8da7?q=80&w=1974&auto=format&fit=crop',
        rating: 4.9,
        reviews: 215,
        isPopular: true,
        ingredients: [
          { name: 'Pollo', icon: ChickenIcon },
          { name: 'Arroz', icon: SaltIcon },
          { name: 'Cebolla', icon: OnionIcon },
          { name: 'Ajo', icon: GarlicIcon },
          { name: 'Jengibre', icon: GingerIcon },
          { name: 'Chile', icon: PeppersIcon },
        ]
      },
    ],
  },
  {
    id: 4,
    name: 'Burger Joint',
    category: 'Burger - Americana',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop',
    rating: 4.8,
    deliveryFee: '$20',
    deliveryTime: '25 min',
    menu: [
        { 
          id: 401, 
          name: 'Classic Cheeseburger', 
          description: 'Carne de res premium, queso americano derretido, lechuga fresca y tomate jugoso.', 
          price: 190, 
          imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop',
          rating: 4.7,
          reviews: 350,
          isPopular: true,
          ingredients: [
            { name: 'Carne', icon: ChickenIcon },
            { name: 'Queso', icon: SaltIcon },
            { name: 'Cebolla', icon: OnionIcon },
            { name: 'Lechuga', icon: BroccoliIcon },
          ]
        },
        { 
          id: 402, 
          name: 'Bacon Burger', 
          description: 'Nuestra clásica hamburguesa con queso, elevada con tiras de tocino crujiente.', 
          price: 220, 
          imageUrl: 'https://images.unsplash.com/photo-1606132923582-e006274b3573?q=80&w=1974&auto=format&fit=crop',
          rating: 4.8,
          reviews: 280,
           ingredients: [
            { name: 'Carne', icon: ChickenIcon },
            { name: 'Queso', icon: SaltIcon },
            { name: 'Tocino', icon: PeppersIcon },
            { name: 'Cebolla', icon: OnionIcon },
          ]
        },
        { 
          id: 403, 
          name: 'Papas Fritas', 
          description: 'Papas a la francesa doradas a la perfección, crujientes por fuera y suaves por dentro.', 
          price: 60, 
          imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=2070&auto=format&fit=crop',
          rating: 4.5,
          reviews: 500,
          ingredients: [
            { name: 'Papa', icon: BroccoliIcon },
            { name: 'Sal', icon: SaltIcon },
          ]
        },
      ],
  },
];
