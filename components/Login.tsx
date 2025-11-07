import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';
import { useAppContext } from '../context/AppContext';
import { UserIcon, LockIcon } from './icons'; // Import icons

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
          navigate('/'); // Navigate to home on successful admin registration
        } else {
          navigate('/'); // Navigate home on successful user registration
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
          navigate('/restaurants'); // Navigate to home on successful admin login
        } else {
          navigate('/restaurants'); // Navigate home on successful user login
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
      className="flex justify-center items-center h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form flex flex-col gap-y-2 bg-white p-6 shadow-2xl rounded-3xl w-full max-w-md transform transition-all duration-300 hover:scale-105 overflow-y-auto max-h-[90vh]">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</h1>
          <p className="text-md text-gray-600 mt-1">{isRegistering ? 'Crea una cuenta nueva para acceder a nuestros servicios' : 'Ingresa a tu cuenta para continuar'}</p>
        </div>

        {error && <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-3 text-sm font-medium border border-red-200"
        >{error}</motion.p>}

        <div className="space-y-4">
          <div className="inputForm relative border border-gray-300 rounded-xl h-[55px] flex items-center transition-all duration-200 ease-in-out focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <UserIcon className="absolute left-4 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-12 pr-4 rounded-xl border-none w-full h-full focus:outline-none bg-transparent text-gray-800 placeholder-gray-500"
            />
          </div>
          <div className="inputForm relative border border-gray-300 rounded-xl h-[55px] flex items-center transition-all duration-200 ease-in-out focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-500">
            <LockIcon className="absolute left-4 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-12 pr-4 rounded-xl border-none w-full h-full focus:outline-none bg-transparent text-gray-800 placeholder-gray-500"
            />
          </div>
          {isRegistering && (
            <div className="inputForm relative border border-gray-300 rounded-xl h-[55px] flex items-center transition-all duration-200 ease-in-out focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <LockIcon className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Confirmar Contraseña"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input pl-12 pr-4 rounded-xl border-none w-full h-full focus:outline-none bg-transparent text-gray-800 placeholder-gray-500"
              />
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={isRegistering ? handleRegisterSubmit : handleLoginSubmit}
            disabled={loading}
            className="button-submit bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl h-[55px] w-full cursor-pointer transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {loading ? (isRegistering ? 'Registrando...' : 'Iniciando sesión...') : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
          </button>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="btn w-full h-[45px] rounded-xl flex justify-center items-center font-medium gap-x-2.5 border border-gray-300 bg-white text-gray-700 text-base cursor-pointer transition-all duration-300 ease-in-out hover:border-blue-500 hover:text-blue-600 hover:shadow-md"
          >
            {isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}
          </button>
          <button
            onClick={() => { onLogin('Guest User', 'guest'); navigate('/'); }}
            className="btn w-full h-[45px] rounded-xl flex justify-center items-center font-medium gap-x-2.5 border border-gray-300 bg-white text-gray-700 text-base cursor-pointer transition-all duration-300 ease-in-out hover:border-blue-500 hover:text-blue-600 hover:shadow-md"
          >
            Continuar como Invitado
          </button>
        </div>
      </div>
    </motion.div>
  );
};
