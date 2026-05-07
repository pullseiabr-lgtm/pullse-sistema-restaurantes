import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';

import { useLogin } from '@/hooks/useAuth';

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  const onSubmit = async (data: LoginForm) => {
    try {
      await login.mutateAsync(data);
      navigate(from, { replace: true });
    } catch {
      /* erro já tratado no toast/feedback */
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <div className="text-3xl font-bold text-primary mb-2">amore</div>
        <p className="text-gray-600 mb-6 text-sm">Acesse sua conta para continuar</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              {...register('email', { required: 'E-mail obrigatório' })}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              {...register('password', { required: 'Senha obrigatória', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          {login.isError && (
            <p className="text-sm text-red-600">
              Falha no login. Verifique e-mail e senha.
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-primary text-white rounded-md py-2 font-medium hover:bg-primary-600 disabled:opacity-50"
          >
            {login.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
