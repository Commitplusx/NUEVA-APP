import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';
import { useAppContext } from '../context/AppContext';
import { UserIcon, LockIcon, MailIcon } from './icons'; // Import MailIcon

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const { handleLogin: onLogin } = useAppContext();
  const navigate = useNavigate();

  const handleRegisterSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        const role = data.user.email.endsWith('@admin.com') ? 'admin' : 'user';
        onLogin(data.user.email, role);
        if (role === 'admin') {
          navigate('/');
        } else {
          navigate('/');
        }
      } else {
        setError('Registro exitoso, por favor verifica tu correo electrónico para activar tu cuenta.');
      }
    } catch (error) {
      setError('Ocurrió un error inesperado al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('Email o contraseña incorrectos. Por favor, inténtalo de nuevo.');
        } else {
          setError(error.message);
        }
      } else if (data.user) {
        const role = data.user.email.endsWith('@admin.com') ? 'admin' : 'user';
        onLogin(data.user.email, role);
        if (role === 'admin') {
          navigate('/restaurants');
        } else {
          navigate('/restaurants');
        }
      }
    } catch (error) {
      setError('Ocurrió un error inesperado al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="flex justify-center items-center min-h-screen bg-gray-100 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md">
        <motion.div
          className="bg-white p-8 shadow-xl rounded-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{isRegistering ? 'Crear Cuenta' : 'Bienvenido'}</h1>
            <p className="text-gray-500 mt-2">{isRegistering ? 'Únete a nuestra comunidad.' : 'Inicia sesión para continuar.'}</p>
          </div>

          {error && <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4 text-sm"
          >{error}</motion.p>}

          <div className="space-y-4">
            <div className="relative">
              <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="relative">
              <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {isRegistering && (
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirmar Contraseña"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={isRegistering ? handleRegisterSubmit : handleLoginSubmit}
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              {loading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
            </button>
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full py-3 text-center text-gray-600 hover:text-orange-500 font-medium"
            >
              {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
            <button
              onClick={() => { onLogin('Guest User', 'guest'); navigate('/'); }}
              className="w-full py-3 text-center text-gray-600 hover:text-orange-500 font-medium"
            >
              Continuar como Invitado
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
