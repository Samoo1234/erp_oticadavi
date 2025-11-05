import React, { useState, useEffect, useMemo } from 'react';
import { 
  Warehouse, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  BarChart3,
  Calendar,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

// Tipos
type Product = {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  brand?: string;
  minStock?: number;
};

type InventoryItem = {
  id: string;
  productId: string;
  location: string;
  currentStock: number;
  minStock: number;
  costPrice?: number;
  lastUpdated: string;
  product: Product;
};

type Movement = {
  id: string;
  productId: string;
  movementType: 'in' | 'out' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  movementDate: string;
  user?: {
    name: string;
    email: string;
  };
  product?: {
    name: string;
    sku?: string;
  };
};

const movementTypeLabels = {
  in: 'Entrada',
  out: 'Saída',
  adjustment: 'Ajuste',
  transfer: 'Transferência',
  return: 'Devolução'
};

const movementTypeColors = {
  in: 'bg-green-100 text-green-800',
  out: 'bg-red-100 text-red-800',
  adjustment: 'bg-blue-100 text-blue-800',
  transfer: 'bg-yellow-100 text-yellow-800',
  return: 'bg-purple-100 text-purple-800'
};

const movementTypeIcons = {
  in: ArrowUp,
  out: ArrowDown,
  adjustment: RotateCcw,
  transfer: ArrowUpDown,
  return: RefreshCw
};

export const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    lowStock: false,
    movementType: '',
    dateFrom: '',
    dateTo: ''
  });

  // Estados para estoque
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryTotal, setInventoryTotal] = useState(0);
  const [inventoryLimit] = useState(10);

  // Estados para movimentações
  const [movements, setMovements] = useState<Movement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementsPage, setMovementsPage] = useState(1);
  const [movementsTotal, setMovementsTotal] = useState(0);
  const [movementsLimit] = useState(10);

  // Estados para modais
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

  // Estados para formulários
  const [adjustForm, setAdjustForm] = useState({
    newQuantity: '',
    reason: ''
  });
  const [movementForm, setMovementForm] = useState({
    productId: '',
    movementType: 'in' as Movement['movementType'],
    quantity: '',
    location: '',
    reason: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Buscar estoque do backend
  const fetchInventory = async (search: string = '', page: number = 1) => {
    try {
      setInventoryLoading(true);
      const params: any = { page, limit: inventoryLimit };
      if (search) params.search = search;
      if (filters.location) params.location = filters.location;
      if (filters.lowStock) params.lowStock = 'true';
      
      const res = await api.get('/inventory', { params });
      const payload = res.data?.data;
      setInventory(payload?.inventory || []);
      setInventoryTotal(payload?.pagination?.total || 0);
      setInventoryPage(page);
    } catch (e) {
      console.error('Erro ao carregar estoque', e);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Buscar movimentações do backend
  const fetchMovements = async (page: number = 1) => {
    try {
      setMovementsLoading(true);
      const params: any = { page, limit: movementsLimit };
      if (filters.movementType) params.movementType = filters.movementType;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      
      const res = await api.get('/inventory/movements', { params });
      const payload = res.data?.data;
      setMovements(payload?.movements || []);
      setMovementsTotal(payload?.pagination?.total || 0);
      setMovementsPage(page);
    } catch (e) {
      console.error('Erro ao carregar movimentações', e);
    } finally {
      setMovementsLoading(false);
    }
  };

  // Debounce da busca de estoque
  const debouncedInventorySearch = useMemo(() => {
    let timeout: any;
    return (value: string) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSearchTerm(value);
        fetchInventory(value, 1);
      }, 400);
    };
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchMovements();
  }, []);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory(searchTerm, 1);
    } else {
      fetchMovements(1);
    }
  }, [filters, activeTab]);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const errs: Record<string, string> = {};
    if (!adjustForm.newQuantity) errs.newQuantity = 'Nova quantidade obrigatória';
    if (!adjustForm.reason) errs.reason = 'Motivo obrigatório';
    
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      const response = await api.post('/inventory/adjust', {
        productId: selectedItem.productId,
        location: selectedItem.location,
        newQuantity: parseInt(adjustForm.newQuantity),
        reason: adjustForm.reason
      });

      if (response.data.success) {
        alert('Estoque ajustado com sucesso!');
        setShowAdjustModal(false);
        setAdjustForm({ newQuantity: '', reason: '' });
        setSelectedItem(null);
        fetchInventory(searchTerm, inventoryPage);
      } else {
        alert(response.data.message || 'Erro ao ajustar estoque');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao ajustar estoque';
      alert(msg);
    }
  };

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!movementForm.productId) errs.productId = 'Produto obrigatório';
    if (!movementForm.quantity) errs.quantity = 'Quantidade obrigatória';
    if (!movementForm.location) errs.location = 'Localização obrigatória';
    if (!movementForm.reason) errs.reason = 'Motivo obrigatório';
    
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      const response = await api.post('/inventory/movement', {
        productId: movementForm.productId,
        movementType: movementForm.movementType,
        quantity: parseInt(movementForm.quantity),
        location: movementForm.location,
        reason: movementForm.reason
      });

      if (response.data.success) {
        alert('Movimentação criada com sucesso!');
        setShowMovementModal(false);
        setMovementForm({
          productId: '',
          movementType: 'in',
          quantity: '',
          location: '',
          reason: ''
        });
        fetchInventory(searchTerm, inventoryPage);
        fetchMovements(movementsPage);
      } else {
        alert(response.data.message || 'Erro ao criar movimentação');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao criar movimentação';
      alert(msg);
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      lowStock: false,
      movementType: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock <= 0) return { status: 'out', color: 'bg-red-100 text-red-800', label: 'Sem Estoque' };
    if (currentStock <= minStock) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', label: 'Estoque Baixo' };
    return { status: 'ok', color: 'bg-green-100 text-green-800', label: 'Em Estoque' };
  };

  const getMovementIcon = (type: Movement['movementType']) => {
    const Icon = movementTypeIcons[type];
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          <p className="mt-1 text-sm text-gray-500">
            Controle de estoque e movimentações
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowMovementModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Movimentação
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-4 w-4 mr-2 inline" />
            Estoque ({inventoryTotal})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'movements'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ArrowUpDown className="h-4 w-4 mr-2 inline" />
            Movimentações ({movementsTotal})
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            {activeTab === 'inventory' && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por produto, SKU ou categoria..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => debouncedInventorySearch(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {activeTab === 'inventory' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Localização
                        </label>
                        <input
                          type="text"
                          className="input"
                          placeholder="Ex: Armazém A"
                          value={filters.location}
                          onChange={(e) => setFilters({...filters, location: e.target.value})}
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                            checked={filters.lowStock}
                            onChange={(e) => setFilters({...filters, lowStock: e.target.checked})}
                          />
                          <span className="ml-2 text-sm text-gray-700">Apenas estoque baixo</span>
                        </label>
                      </div>
                    </>
                  )}
                  
                  {activeTab === 'movements' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Movimentação
                        </label>
                        <select 
                          className="input"
                          value={filters.movementType}
                          onChange={(e) => setFilters({...filters, movementType: e.target.value})}
                        >
                          <option value="">Todos</option>
                          {Object.entries(movementTypeLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data Inicial
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data Final
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={filters.dateTo}
                          onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-end">
                    <button 
                      onClick={clearFilters}
                      className="btn btn-outline w-full"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="card">
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Mínimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Atualização
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Carregando estoque...
                    </td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Nenhum item encontrado
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => {
                    const stockStatus = getStockStatus(item.currentStock, item.minStock);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.product?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.product?.sku || 'Sem SKU'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.currentStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.minStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.lastUpdated).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedItem(item);
                                setAdjustForm({
                                  newQuantity: item.currentStock.toString(),
                                  reason: ''
                                });
                                setShowAdjustModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Ajustar estoque"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginação */}
          {inventoryTotal > inventoryLimit && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchInventory(searchTerm, Math.max(1, inventoryPage - 1))}
                  disabled={inventoryPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => fetchInventory(searchTerm, inventoryPage + 1)}
                  disabled={inventoryPage * inventoryLimit >= inventoryTotal}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{Math.min((inventoryPage - 1) * inventoryLimit + 1, inventoryTotal)}</span> até{' '}
                    <span className="font-medium">{Math.min(inventoryPage * inventoryLimit, inventoryTotal)}</span> de{' '}
                    <span className="font-medium">{inventoryTotal}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => fetchInventory(searchTerm, Math.max(1, inventoryPage - 1))}
                      disabled={inventoryPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Anterior</span>
                      ←
                    </button>
                    <button
                      onClick={() => fetchInventory(searchTerm, inventoryPage + 1)}
                      disabled={inventoryPage * inventoryLimit >= inventoryTotal}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Próximo</span>
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Movements Tab */}
      {activeTab === 'movements' && (
        <div className="card">
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Anterior
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movementsLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Carregando movimentações...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma movimentação encontrada
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(movement.movementDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {movement.product?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {movement.product?.sku || 'Sem SKU'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${movementTypeColors[movement.movementType]}`}>
                          {getMovementIcon(movement.movementType)}
                          <span className="ml-1">
                            {movementTypeLabels[movement.movementType]}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.previousStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {movement.newStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.reason || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.user?.name || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginação */}
          {movementsTotal > movementsLimit && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchMovements(Math.max(1, movementsPage - 1))}
                  disabled={movementsPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => fetchMovements(movementsPage + 1)}
                  disabled={movementsPage * movementsLimit >= movementsTotal}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{Math.min((movementsPage - 1) * movementsLimit + 1, movementsTotal)}</span> até{' '}
                    <span className="font-medium">{Math.min(movementsPage * movementsLimit, movementsTotal)}</span> de{' '}
                    <span className="font-medium">{movementsTotal}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => fetchMovements(Math.max(1, movementsPage - 1))}
                      disabled={movementsPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Anterior</span>
                      ←
                    </button>
                    <button
                      onClick={() => fetchMovements(movementsPage + 1)}
                      disabled={movementsPage * movementsLimit >= movementsTotal}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Próximo</span>
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Ajustar Estoque */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAdjustModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAdjustStock}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Ajustar Estoque</h3>
                    <button type="button" onClick={() => setShowAdjustModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Produto</p>
                      <p className="text-sm text-gray-900">{selectedItem.product?.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Localização</p>
                      <p className="text-sm text-gray-900">{selectedItem.location}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Estoque Atual</p>
                      <p className="text-sm text-gray-900">{selectedItem.currentStock}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nova Quantidade *</label>
                      <input
                        type="number"
                        min="0"
                        className={`input w-full ${formErrors.newQuantity ? 'border-red-500' : ''}`}
                        value={adjustForm.newQuantity}
                        onChange={(e) => setAdjustForm({...adjustForm, newQuantity: e.target.value})}
                      />
                      {formErrors.newQuantity && <p className="mt-1 text-sm text-red-600">{formErrors.newQuantity}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motivo do Ajuste *</label>
                      <textarea
                        className={`input w-full h-20 ${formErrors.reason ? 'border-red-500' : ''}`}
                        placeholder="Ex: Inventário físico, correção de erro..."
                        value={adjustForm.reason}
                        onChange={(e) => setAdjustForm({...adjustForm, reason: e.target.value})}
                      />
                      {formErrors.reason && <p className="mt-1 text-sm text-red-600">{formErrors.reason}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto sm:ml-3">Ajustar Estoque</button>
                  <button type="button" onClick={() => setShowAdjustModal(false)} className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Movimentação */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowMovementModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateMovement}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Nova Movimentação</h3>
                    <button type="button" onClick={() => setShowMovementModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
                      <input
                        type="text"
                        className={`input w-full ${formErrors.productId ? 'border-red-500' : ''}`}
                        placeholder="ID do produto"
                        value={movementForm.productId}
                        onChange={(e) => setMovementForm({...movementForm, productId: e.target.value})}
                      />
                      {formErrors.productId && <p className="mt-1 text-sm text-red-600">{formErrors.productId}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimentação *</label>
                      <select
                        className="input w-full"
                        value={movementForm.movementType}
                        onChange={(e) => setMovementForm({...movementForm, movementType: e.target.value as Movement['movementType']})}
                      >
                        {Object.entries(movementTypeLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                      <input
                        type="number"
                        min="1"
                        className={`input w-full ${formErrors.quantity ? 'border-red-500' : ''}`}
                        value={movementForm.quantity}
                        onChange={(e) => setMovementForm({...movementForm, quantity: e.target.value})}
                      />
                      {formErrors.quantity && <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Localização *</label>
                      <input
                        type="text"
                        className={`input w-full ${formErrors.location ? 'border-red-500' : ''}`}
                        placeholder="Ex: Armazém A"
                        value={movementForm.location}
                        onChange={(e) => setMovementForm({...movementForm, location: e.target.value})}
                      />
                      {formErrors.location && <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
                      <textarea
                        className={`input w-full h-20 ${formErrors.reason ? 'border-red-500' : ''}`}
                        placeholder="Ex: Compra, venda, transferência..."
                        value={movementForm.reason}
                        onChange={(e) => setMovementForm({...movementForm, reason: e.target.value})}
                      />
                      {formErrors.reason && <p className="mt-1 text-sm text-red-600">{formErrors.reason}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto sm:ml-3">Criar Movimentação</button>
                  <button type="button" onClick={() => setShowMovementModal(false)} className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};