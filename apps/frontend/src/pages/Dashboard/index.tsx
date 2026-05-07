import { useAuthStore } from '@/stores/authStore';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
      <p className="text-gray-500 mt-1">
        Bem-vindo, <span className="font-medium">{user?.name}</span>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {[
          { label: 'Total de pedidos', value: '0' },
          { label: 'Total em compras', value: 'R$ 0,00' },
          { label: 'Economia gerada', value: 'R$ 0,00', accent: 'text-emerald-600' },
          { label: 'Porcentagem de economia', value: '0%', accent: 'text-primary' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border p-5">
            <div className="text-sm text-gray-500">{card.label}</div>
            <div className={`text-3xl font-semibold mt-2 ${card.accent ?? 'text-gray-900'}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border rounded-xl p-6 text-sm text-gray-600">
        Páginas adicionais (Requisições, Fornecedores, Produtos, etc.) ainda não foram implementadas — esqueleto pronto para expansão.
      </div>
    </div>
  );
}
