import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { updateProfile } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { UserIcon, LockIcon, MailIcon, ArrowRightIcon, PhoneIcon } from './icons';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
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

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user) {
        await updateProfile({
          user_id: data.user.id,
          full_name: fullName,
          phone: phone,
        });
        navigate(`/verify-code?email=${email}`);
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
          setError('Email o contraseña incorrectos.');
        } else {
          setError(error.message);
        }
      } else if (data.user) {
        const role = data.user.email?.endsWith('@admin.com') ? 'admin' : 'user';
        onLogin(data.user.email || '', role);
        if (role === 'admin') {
          navigate('/admin');
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
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side - Branding (Desktop) - Minimalist Solid Color */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black flex-col justify-between p-16 text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-black tracking-tighter mb-2">
            Estrella<span className="text-orange-500">Express</span>
          </h1>
          <p className="text-xl text-gray-400 font-light tracking-wide">Tu antojo, en minutos.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-8"
        >
          <blockquote className="text-3xl font-medium leading-snug text-gray-200">
            "Simplicidad y velocidad en cada entrega."
          </blockquote>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8 bg-white p-8 lg:p-0"
        >
          <div className="text-center lg:text-left">
            <motion.h2
              layout
              key={isRegistering ? 'reg-title' : 'login-title'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black text-gray-900 tracking-tight mb-2"
            >
              {isRegistering ? 'Únete a nosotros' : '¡Hola de nuevo!'}
            </motion.h2>
            <motion.p layout className="text-gray-500 text-lg">
              {isRegistering
                ? 'Crea tu cuenta y empieza a pedir.'
                : 'Ingresa tus datos para continuar.'}
            </motion.p>
          </div>

          {error && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="space-y-5">
            <AnimatePresence mode='wait'>
              {isRegistering && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                    <input
                      type="text"
                      placeholder="Nombre Completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  <div className="relative group">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                    <input
                      type="tel"
                      placeholder="Teléfono"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout className="relative group">
              <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
              />
            </motion.div>

            <motion.div layout className="relative group">
              <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
              />
            </motion.div>

            <AnimatePresence>
              {isRegistering && (
                <motion.div
                  key="confirm-password"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden pt-1"
                >
                  <div className="relative group">
                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                    <input
                      type="password"
                      placeholder="Confirmar Contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div layout className="space-y-4 pt-4">
            <motion.button
              layout
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={isRegistering ? handleRegisterSubmit : handleLoginSubmit}
              disabled={loading}
              className="w-full py-4 bg-black text-white font-bold rounded-2xl shadow-lg hover:bg-gray-900 transition-all flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </motion.button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">O continúa con</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onLogin('Guest User', 'guest'); navigate('/'); }}
              className="w-full py-4 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-2xl hover:border-gray-300 transition-all flex items-center justify-center gap-2"
            >
              Acceder como Invitado
            </motion.button>

            <p className="text-center text-gray-500 mt-8 font-medium">
              {isRegistering ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-2 font-bold text-orange-600 hover:text-orange-700 transition-colors hover:underline"
              >
                {isRegistering ? 'Inicia Sesión' : 'Regístrate'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
