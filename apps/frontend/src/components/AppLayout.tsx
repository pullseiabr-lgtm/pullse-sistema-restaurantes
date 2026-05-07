import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';

import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/requisicoes', label: 'Requisições' },
  { to: '/fornecedores', label: 'Fornecedores' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/lista-de-compra', label: 'Lista de compra' },
  { to: '/estoque', label: 'Estoque' },
  { to: '/configuracoes', label: 'Configurações' },
];

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="flex h-full">
      <aside className="w-64 border-r bg-white px-4 py-6 flex flex-col">
        <div className="text-2xl font-bold text-primary mb-8">amore</div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'px-3 py-2 rounded-md text-sm font-medium',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t pt-4 text-sm">
          <div className="font-medium">{user?.name}</div>
          <div className="text-gray-500 text-xs mb-2">{user?.email}</div>
          <button onClick={logout} className="text-primary hover:underline">
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
