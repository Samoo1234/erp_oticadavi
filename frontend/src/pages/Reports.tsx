import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Download,
  Calendar,
  Filter,
  Eye,
  FileText,
  PieChart,
  Activity
} from 'lucide-react';

const mockDashboardData = {
  period: 'month',
  sales: {
    total: 127,
    revenue: 45680.50,
    averageTicket: 359.69,
    dailySales: [
      { date: '2024-01-01', count: 3, revenue: 1200.00 },
      { date: '2024-01-02', count: 5, revenue: 2100.00 },
      { date: '2024-01-03', count: 4, revenue: 1800.00 },
      { date: '2024-01-04', count: 6, revenue: 2500.00 },
      { date: '2024-01-05', count: 7, revenue: 3200.00 },
      { date: '2024-01-06', count: 8, revenue: 3800.00 },
      { date: '2024-01-07', count: 9, revenue: 4200.00 },
      { date: '2024-01-08', count: 6, revenue: 2800.00 },
      { date: '2024-01-09', count: 5, revenue: 2200.00 },
      { date: '2024-01-10', count: 7, revenue: 3100.00 },
      { date: '2024-01-11', count: 8, revenue: 3600.00 },
      { date: '2024-01-12', count: 9, revenue: 4100.00 },
      { date: '2024-01-13', count: 10, revenue: 4500.00 },
      { date: '2024-01-14', count: 8, revenue: 3800.00 },
      { date: '2024-01-15', count: 7, revenue: 3200.00 },
      { date: '2024-01-16', count: 6, revenue: 2800.00 },
      { date: '2024-01-17', count: 8, revenue: 3500.00 },
      { date: '2024-01-18', count: 9, revenue: 4000.00 },
      { date: '2024-01-19', count: 7, revenue: 3200.00 },
      { date: '2024-01-20', count: 5, revenue: 2300.00 }
    ]
  },
  products: {
    topProducts: [
      { product: { name: 'Óculos Ray-Ban Aviator', sku: 'RB-AV-001' }, totalQuantity: 45, totalRevenue: 20250.00, salesCount: 23 },
      { product: { name: 'Lentes Progressivas Essilor', sku: 'ESS-PRO-001' }, totalQuantity: 38, totalRevenue: 12160.00, salesCount: 19 },
      { product: { name: 'Óculos de Grau Oakley', sku: 'OK-GRAU-001' }, totalQuantity: 32, totalRevenue: 12160.00, salesCount: 16 },
      { product: { name: 'Estojo para Óculos', sku: 'EST-001' }, totalQuantity: 89, totalRevenue: 2225.00, salesCount: 45 }
    ],
    salesByCategory: [
      { category: 'oculos_sol', totalQuantity: 67, totalRevenue: 30150.00 },
      { category: 'lentes', totalQuantity: 45, totalRevenue: 14400.00 },
      { category: 'oculos_grau', totalQuantity: 38, totalRevenue: 14440.00 },
      { category: 'acessorios', totalQuantity: 89, totalRevenue: 2225.00 }
    ]
  },
  clients: {
    topClients: [
      { client: { name: 'Ana Oliveira', email: 'ana@email.com' }, totalSales: 8, totalSpent: 12800.00 },
      { client: { name: 'João Silva', email: 'joao@email.com' }, totalSales: 6, totalSpent: 7200.00 },
      { client: { name: 'Maria Santos', email: 'maria@email.com' }, totalSales: 5, totalSpent: 4500.00 },
      { client: { name: 'Pedro Costa', email: 'pedro@email.com' }, totalSales: 4, totalSpent: 3600.00 }
    ]
  },
  inventory: {
    stats: { totalProducts: 156, totalStock: 2340, totalValue: 187500.00 },
    lowStockProducts: [
      { product: { name: 'Óculos de Grau Oakley', sku: 'OK-GRAU-001' }, currentStock: 2, minStock: 3, location: 'Loja Principal' },
      { product: { name: 'Lentes Progressivas Essilor', sku: 'ESS-PRO-001' }, currentStock: 5, minStock: 10, location: 'Loja Principal' }
    ]
  },
  prescriptions: {
    active: 89,
    expired: 12
  }
};

const categoryLabels = {
  oculos_grau: 'Óculos de Grau',
  oculos_sol: 'Óculos de Sol',
  lentes: 'Lentes',
  acessorios: 'Acessórios',
  servicos: 'Serviços'
};

export const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(mockDashboardData);

  const periods = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mês' },
    { value: 'quarter', label: 'Este Trimestre' },
    { value: 'year', label: 'Este Ano' }
  ];

  const reports = [
    { value: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { value: 'sales', label: 'Vendas', icon: ShoppingCart },
    { value: 'inventory', label: 'Estoque', icon: Package },
    { value: 'clients', label: 'Clientes', icon: Users }
  ];

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // Aqui seria feita a requisição para buscar dados do período
  };

  const handleReportChange = (report: string) => {
    setSelectedReport(report);
  };

  const handleExport = (format: string) => {
    // Implementar exportação
    console.log(`Exportando relatório ${selectedReport} em formato ${format}`);
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }: any) => (
    <div className="card">
      <div className="card-content">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-8 w-8 text-${color}-500`} />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ml-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Vendas"
          value={dashboardData.sales.total}
          icon={ShoppingCart}
          trend="up"
          trendValue="+12%"
          color="blue"
        />
        <StatCard
          title="Faturamento"
          value={`R$ ${dashboardData.sales.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend="up"
          trendValue="+8%"
          color="green"
        />
        <StatCard
          title="Ticket Médio"
          value={`R$ ${dashboardData.sales.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          trend="down"
          trendValue="-2%"
          color="purple"
        />
        <StatCard
          title="Clientes Ativos"
          value={dashboardData.clients.topClients.length}
          icon={Users}
          trend="up"
          trendValue="+5%"
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas Diárias */}
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas Diárias (Últimos 20 dias)</h3>
            <div className="h-64 flex items-end space-x-1">
              {dashboardData.sales.dailySales.slice(-20).map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-t"
                    style={{ height: `${(day.revenue / 5000) * 200}px` }}
                    title={`${day.date}: R$ ${day.revenue.toFixed(2)}`}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vendas por Categoria */}
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas por Categoria</h3>
            <div className="space-y-3">
              {dashboardData.products.salesByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {categoryLabels[category.category as keyof typeof categoryLabels] || category.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(category.totalRevenue / 30000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      R$ {category.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products and Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Produtos */}
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Produtos</h3>
            <div className="space-y-3">
              {dashboardData.products.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.product.name}</p>
                    <p className="text-xs text-gray-500">{product.product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      R$ {product.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">{product.totalQuantity} vendas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Clientes */}
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Clientes</h3>
            <div className="space-y-3">
              {dashboardData.clients.topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{client.client.name}</p>
                    <p className="text-xs text-gray-500">{client.client.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      R$ {client.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">{client.totalSales} compras</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="card">
        <div className="card-content">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas de Estoque</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <Package className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Produtos com Estoque Baixo</p>
                <p className="text-xs text-yellow-600">{dashboardData.inventory.lowStockProducts.length} produtos</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <FileText className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">Prescrições Expiradas</p>
                <p className="text-xs text-red-600">{dashboardData.prescriptions.expired} prescrições</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSalesReport = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-content">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Relatório de Vendas</h3>
          <p className="text-sm text-gray-500 mb-4">
            Análise detalhada das vendas do período selecionado
          </p>
          <div className="flex space-x-2">
            <button className="btn btn-outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </button>
            <button className="btn btn-outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-content">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Relatório de Estoque</h3>
          <p className="text-sm text-gray-500 mb-4">
            Análise do estoque atual e produtos com baixa disponibilidade
          </p>
          <div className="flex space-x-2">
            <button className="btn btn-outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </button>
            <button className="btn btn-outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClientsReport = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-content">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Relatório de Clientes</h3>
          <p className="text-sm text-gray-500 mb-4">
            Análise do comportamento e valor dos clientes
          </p>
          <div className="flex space-x-2">
            <button className="btn btn-outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </button>
            <button className="btn btn-outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios e Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Análise de dados e relatórios gerenciais
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="input"
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="card">
        <div className="card-content">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {reports.map((report) => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.value}
                    onClick={() => handleReportChange(report.value)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedReport === report.value
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {report.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'dashboard' && renderDashboard()}
      {selectedReport === 'sales' && renderSalesReport()}
      {selectedReport === 'inventory' && renderInventoryReport()}
      {selectedReport === 'clients' && renderClientsReport()}
    </div>
  );
};
