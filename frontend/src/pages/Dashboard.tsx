import React from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff
} from 'lucide-react';

const stats = [
  {
    name: 'Total de Clientes',
    value: '2,847',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'Produtos em Estoque',
    value: '1,234',
    change: '+5%',
    changeType: 'positive',
    icon: Package,
  },
  {
    name: 'Vendas do Mês',
    value: 'R$ 45,231',
    change: '+8.2%',
    changeType: 'positive',
    icon: ShoppingCart,
  },
  {
    name: 'Receita Total',
    value: 'R$ 89,400',
    change: '-2.4%',
    changeType: 'negative',
    icon: DollarSign,
  },
];

const recentSales = [
  { id: 1, client: 'João Silva', product: 'Óculos Ray-Ban', amount: 'R$ 450,00', status: 'Concluída' },
  { id: 2, client: 'Maria Santos', product: 'Lentes Progressivas', amount: 'R$ 320,00', status: 'Processando' },
  { id: 3, client: 'Pedro Costa', product: 'Óculos Oakley', amount: 'R$ 280,00', status: 'Concluída' },
  { id: 4, client: 'Ana Oliveira', product: 'Lentes Fotossensíveis', amount: 'R$ 180,00', status: 'Pendente' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão geral do seu negócio
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'positive' ? (
                          <TrendingUp className="h-4 w-4 flex-shrink-0 self-center" />
                        ) : (
                          <TrendingDown className="h-4 w-4 flex-shrink-0 self-center" />
                        )}
                        <span className="sr-only">
                          {stat.changeType === 'positive' ? 'Aumentou' : 'Diminuiu'} por
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Sales */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Vendas Recentes</h3>
          <p className="card-description">
            Últimas vendas realizadas
          </p>
        </div>
        <div className="card-content">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sale.status === 'Concluída' 
                          ? 'bg-green-100 text-green-800'
                          : sale.status === 'Processando'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Prescrições Pendentes
                </h3>
                <p className="text-sm text-gray-500">
                  12 prescrições aguardando processamento
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Estoque Baixo
                </h3>
                <p className="text-sm text-gray-500">
                  8 produtos com estoque abaixo do mínimo
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Vendas Hoje
                </h3>
                <p className="text-sm text-gray-500">
                  R$ 2,340 em vendas realizadas hoje
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
