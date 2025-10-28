import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: (role: 'admin' | 'user') => void;
  onGuestLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onGuestLogin }) => {
  const [showForm, setShowForm] = useState<'admin' | 'user' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      if (showForm) {
        onLogin(showForm);
      }
    }
  };

  if (showForm) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Iniciar Sesión como {showForm === 'admin' ? 'Administrador' : 'Usuario'}</h1>
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
          >
            Entrar
          </button>
          <button 
            onClick={() => setShowForm(null)} 
            className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-300 transition-colors mt-2"
          >
            Volver
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Bienvenido</h1>
      <div className="w-full max-w-xs space-y-4">
        <button 
          onClick={() => setShowForm('user')} 
          className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        >
          Entrar como Usuario
        </button>
        <button 
          onClick={() => setShowForm('admin')} 
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
        >
          Entrar como Administrador
        </button>
        <button 
          onClick={onGuestLogin} 
          className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-300 transition-colors mt-2"
        >
          Entrar como Invitado
        </button>
      </div>
    </div>
  );
};