/**
 * Testes do componente Button
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../components/ui/Button';

describe('Button Component', () => {
  it('deve renderizar texto corretamente', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    
    fireEvent.click(screen.getByText('Clique'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando disabled=true', () => {
    render(<Button disabled>Desabilitado</Button>);
    expect(screen.getByText('Desabilitado')).toBeDisabled();
  });

  it('deve estar desabilitado quando loading=true', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('deve mostrar texto de carregando quando loading=true', () => {
    render(<Button loading>Original</Button>);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve aplicar variante primary por padrão', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');
  });

  it('deve aplicar variante danger', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('deve aplicar variante success', () => {
    render(<Button variant="success">Success</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-green-600');
  });

  it('deve renderizar ícone à esquerda', () => {
    render(<Button icon={<span data-testid="icon">★</span>}>Com Ícone</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('deve aplicar tamanho small', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-3', 'py-1.5');
  });

  it('deve aplicar tamanho large', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3');
  });
});
