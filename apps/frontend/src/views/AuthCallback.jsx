import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Esta página vive en /auth/callback
// El backend redirige aquí tras el OAuth con ?token=xxx
// También maneja ?error=xxx si algo falló
const AuthCallback = () => {
  const [params] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      navigate('/login?error=' + error, { replace: true });
      return;
    }

    if (token) {
      loginWithToken(token).then(() => {
        // Redirigir al perfil o a la URL previa guardada
        const returnTo = sessionStorage.getItem('returnTo') || '/profile';
        sessionStorage.removeItem('returnTo');
        navigate(returnTo, { replace: true });
      });
    } else {
      navigate('/', { replace: true });
    }
  }, []);

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
        </div>
        <p className="font-mono text-sm text-on-surface-variant tracking-widest uppercase">
          Verificando identidad...
        </p>
      </div>
    </main>
  );
};

export default AuthCallback;
