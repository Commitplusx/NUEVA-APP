import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { updateProfile } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { UserIcon, LockIcon, MailIcon, ArrowRightIcon } from './icons';

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
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full text-white">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Estrella Express</h1>
            <p className="mt-2 text-lg text-gray-300">Tu comida favorita, más rápido que nunca.</p>
          </div>

          <div className="space-y-6">
            <blockquote className="text-2xl font-medium leading-relaxed">
              "La mejor manera de pedir comida. Rápido, confiable y siempre delicioso."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-700 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400">+2k usuarios felices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isRegistering ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
            </h2>
            <p className="mt-2 text-gray-500">
              {isRegistering
                ? 'Ingresa tus datos para comenzar a pedir.'
                : 'Ingresa tus credenciales para acceder.'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </motion.div>
          )}

          <div className="space-y-5">
            {isRegistering && (
              <div className="grid grid-cols-1 gap-5">
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Nombre Completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium text-gray-900 placeholder-gray-400 shadow-sm"
                  />
                </div>
                <div className="relative group">
                  <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium text-gray-900 placeholder-gray-400 shadow-sm"
                  />
                </div>
              </div>
            )}

            <div className="relative group">
              <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium text-gray-900 placeholder-gray-400 shadow-sm"
              />
            </div>

            <div className="relative group">
              <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium text-gray-900 placeholder-gray-400 shadow-sm"
              />
            </div>

            {isRegistering && (
              <div className="relative group">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="password"
                  placeholder="Confirmar Contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium text-gray-900 placeholder-gray-400 shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <button
              onClick={isRegistering ? handleRegisterSubmit : handleLoginSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            <button
              onClick={() => { onLogin('Guest User', 'guest'); navigate('/'); }}
              className="w-full py-3.5 bg-white border-2 border-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2"
            >
              Acceder como Invitado
            </button>

            <p className="text-center text-sm text-gray-500 mt-8">
              {isRegistering ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-2 font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                {isRegistering ? 'Inicia Sesión' : 'Regístrate'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
