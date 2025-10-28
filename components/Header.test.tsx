import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('renders the header with the logo and menu button', () => {
    render(<Header />);
    
    // Check for the logo text
    expect(screen.getByText('ESTRELLA')).toBeInTheDocument();
    
    // Check for the menu button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
