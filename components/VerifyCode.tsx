import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';
import { useAppContext } from '../context/AppContext';
import { MailIcon, LockIcon } from './icons';

export const VerifyCode: React.FC = () => {
  const [email, setEmail] = useState('');
  const [obfuscatedEmail, setObfuscatedEmail] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { handleLogin: onLogin } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const obfuscateEmail = (email: string) => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (!domain) return email; // Not a valid email format

    if (user.length <= 4) {
      return `${user.substring(0, 1)}***@${domain}`;
    }
    const firstTwo = user.substring(0, 2);
    const lastTwo = user.substring(user.length - 2);
    return `${firstTwo}***${lastTwo}@${domain}`;
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      setObfuscatedEmail(obfuscateEmail(emailFromUrl));
    }
  }, [location.search]);

  const handleVerifySubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !token) {
        setError('Por favor, ingresa tu correo y el código de verificación.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: 'signup',
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        const role = data.user.email.endsWith('@admin.com') ? 'admin' : 'user';
        onLogin(data.user.email, role);
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/restaurants');
        }
      } else {
        setError('No se pudo verificar el código. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      setError('Ocurrió un error inesperado al verificar el código.');
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
            <h1 className="text-3xl font-bold text-gray-800">Verificar Cuenta</h1>
            <p className="text-gray-500 mt-2">Ingresa el código enviado a <span className="font-medium text-gray-700">{obfuscatedEmail}</span>.</p>
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
                value={obfuscatedEmail}
                disabled
                onChange={() => {}}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none cursor-not-allowed"
              />
            </div>
            <div className="relative">
              <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Código de Verificación"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleVerifySubmit}
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              {loading ? 'Verificando...' : 'Verificar y Continuar'}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
