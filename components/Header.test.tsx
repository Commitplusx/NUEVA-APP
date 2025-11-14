import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';
import { useAppContext } from '../context/AppContext';

// Mockear el hook useAppContext
jest.mock('../context/AppContext', () => ({
  useAppContext: jest.fn(),
}));

const mockedUseAppContext = useAppContext as jest.Mock;

describe('Header', () => {
  beforeEach(() => {
    // Proporcionar valores de mock por defecto para cada prueba
    mockedUseAppContext.mockReturnValue({
      user: 'Test User',
      cartItemCount: 3,
      isCartAnimating: false,
      toggleSidebar: jest.fn(),
    });
  });

  it('renders the header with user info and cart count', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Verificar que el nombre de usuario (o un saludo) se renderiza
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    
    // Verificar que el contador del carrito se muestra
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders the menu button', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    // Verificar que el botón de menú (o de usuario) está presente
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
