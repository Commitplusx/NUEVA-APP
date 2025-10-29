import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (username: string, role: UserRole) => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.log(error);
        if (error.message === 'Invalid login credentials') {
          setError('Email o contraseña incorrectos. Por favor, inténtalo de nuevo.');
        } else {
          setError(error.message);
        }
      } else if (data.user) {
        // For simplicity, we'll assume a user is either an admin or a user based on their email.
        // In a real app, you would have a more robust role management system.
        const role = data.user.email.endsWith('@admin.com') ? 'admin' : 'user';
        onLogin(data.user.email, role);
      }
    } catch (error) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col h-full bg-gray-50 justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
        <p className="text-base text-gray-500 mt-1">Ingresa a tu cuenta para continuar</p>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="mt-8">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-300 disabled:opacity-50"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
        <button
          onClick={() => onLogin('Guest User', 'guest')}
          className="w-full py-3 mt-4 bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:bg-gray-600 transition-all duration-300"
        >
          Continuar como Invitado
        </button>
      </div>

      <div className="text-center mt-4">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
          Volver al inicio
        </button>
      </div>
    </div>
  );
};
