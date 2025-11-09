import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ShoppingCart, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  User,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  Phone,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';

// Tipos
type Client = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  address?: {
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
};

type Product = {
  id: string;
  name: string;
  sku?: string;
  price: number;
  category?: string;
  currentStock?: number;
};

type SaleItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
};

// Dados mockados removidos - agora carregamos do backend

const statusLabels = {
  draft: 'Rascunho',
  confirmed: 'Confirmada',
  processing: 'Processando',
  completed: 'Concluída',
  cancelled: 'Cancelada'
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const paymentStatusLabels = {
  pending: 'Pendente',
  paid: 'Pago',
  partial: 'Parcial',
  cancelled: 'Cancelado'
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
};

const paymentMethodLabels = {
  cash: 'Dinheiro',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  pix: 'PIX',
  bank_transfer: 'Transferência',
  check: 'Cheque'
};

export const Sales: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);

  // Estados para buscar vendas do backend
  const [sales, setSales] = useState<any[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesPage, setSalesPage] = useState(1);
  const [salesTotal, setSalesTotal] = useState(0);
  const [salesLimit] = useState(10);
  
  // Estados para Nova Venda
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [saleForm, setSaleForm] = useState({
    clientId: '',
    paymentMethod: 'cash',
    discountAmount: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Pagamentos - Stone
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [saleForPayment, setSaleForPayment] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'credit_card' as 'credit_card' | 'debit_card' | 'pix',
    amount: 0,
    installments: 1,
    cardNumber: '',
    cardHolder: '',
    expirationDate: '', // MM/AA
    securityCode: ''
  });

  // Buscar clientes do backend
  const fetchClients = async (search: string = '') => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (search) params.search = search;
      
      const res = await api.get('/clients', { params });
      const payload = res.data?.data;
      setClients(payload?.clients || []);
    } catch (e: any) {
      // Não mostrar erro no console se o backend não estiver disponível
      if (e.code !== 'ECONNABORTED' && e.code !== 'ERR_NETWORK' && !e.message?.includes('Network Error')) {
        // Apenas logar erros do servidor (500, etc) se necessário
        setClients([]);
      } else {
        setClients([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Buscar produtos do backend
  const fetchProducts = async (search: string = '') => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (search) params.search = search;
      
      const res = await api.get('/products', { params });
      const payload = res.data?.data;
      setProducts(payload?.products || []);
    } catch (e: any) {
      // Não mostrar erro no console se o backend não estiver disponível
      if (e.code !== 'ECONNABORTED' && e.code !== 'ERR_NETWORK' && !e.message?.includes('Network Error')) {
        // Apenas logar erros do servidor (500, etc) se necessário
        setProducts([]);
      } else {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Buscar vendas do backend
  const fetchSales = async (search: string = '', page: number = 1) => {
    try {
      setSalesLoading(true);
      const params: any = { page, limit: salesLimit };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      
      const res = await api.get('/sales', { params });
      const payload = res.data?.data;
      setSales(payload?.sales || []);
      setSalesTotal(payload?.pagination?.total || 0);
      setSalesPage(page);
    } catch (e: any) {
      // Não mostrar erro no console se o backend não estiver disponível
      if (e.code === 'ECONNABORTED' || e.code === 'ERR_NETWORK' || e.message?.includes('Network Error')) {
        // Backend não está disponível - silenciar erro
        setSales([]);
        setSalesTotal(0);
        return;
      }
      // Para outros erros (500, etc), apenas não fazer console.error desnecessário
      // O usuário verá que não há vendas na tabela
      setSales([]);
      setSalesTotal(0);
    } finally {
      setSalesLoading(false);
    }
  };

  // Debounce da busca de vendas
  const debouncedSalesSearch = useMemo(() => {
    let timeout: any;
    return (value: string) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        fetchSales(value, 1);
      }, 400);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce da busca de clientes
  const debouncedClientSearch = useMemo(() => {
    let timeout: any;
    return (value: string) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        fetchClients(value);
      }, 400);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce da busca de produtos
  const debouncedProductSearch = useMemo(() => {
    let timeout: any;
    return (value: string) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        fetchProducts(value);
      }, 400);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchClients();
    fetchProducts();
    fetchSales();
  }, []);

  // Recarregar vendas quando filtros mudarem
  useEffect(() => {
    fetchSales(searchTerm, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Os dados já vêm filtrados do backend

  const handleViewSale = async (sale: any) => {
    try {
      const response = await api.get(`/sales/${sale.id}`);
      if (response.data?.success) {
        setSelectedSale(response.data.data);
    setShowSaleModal(true);
      } else {
        alert('Não foi possível carregar os detalhes da venda');
      }
    } catch (e) {
      console.error('Erro ao carregar detalhes da venda', e);
      alert('Erro ao carregar detalhes da venda');
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setSaleForm({...saleForm, clientId: client.id});
    setClientSearchTerm(client.name);
  };

  const handleAddProduct = (product: Product) => {
    const existingItem = saleItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setSaleItems(saleItems.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSaleItems([...saleItems, {
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
        discount: 0
      }]);
    }
  };

  const handleUpdateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSaleItems(saleItems.filter(item => item.productId !== productId));
    } else {
      setSaleItems(saleItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const handleUpdateItemPrice = (productId: string, unitPrice: number) => {
    setSaleItems(saleItems.map(item => 
      item.productId === productId 
        ? { ...item, unitPrice }
        : item
    ));
  };

  const handleUpdateItemDiscount = (productId: string, discount: number) => {
    setSaleItems(saleItems.map(item => 
      item.productId === productId 
        ? { ...item, discount }
        : item
    ));
  };

  const calculateTotal = () => {
    const subtotal = saleItems.reduce((sum, item) => 
      sum + (item.unitPrice * item.quantity), 0
    );
    const totalDiscount = saleItems.reduce((sum, item) => 
      sum + (item.discount || 0), 0
    );
    const formDiscount = parseFloat(saleForm.discountAmount) || 0;
    
    return {
      subtotal,
      itemDiscount: totalDiscount,
      formDiscount,
      total: subtotal - totalDiscount - formDiscount
    };
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    
    if (!saleForm.clientId) errs.clientId = 'Cliente obrigatório';
    if (saleItems.length === 0) errs.items = 'Adicione pelo menos um produto';
    
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      let response;
      const payload = {
        clientId: saleForm.clientId,
        items: saleItems,
        discountAmount: parseFloat(saleForm.discountAmount) || 0,
        paymentMethod: saleForm.paymentMethod,
        notes: saleForm.notes
      };

      // Se está editando, usa PUT, senão POST
      if (selectedSale?.id) {
        response = await api.put(`/sales/${selectedSale.id}`, payload);
      } else {
        response = await api.post('/sales', payload);
      }

      if (response.data.success !== false) {
        alert(selectedSale?.id ? 'Venda atualizada com sucesso!' : 'Venda criada com sucesso!');
        setShowNewSaleModal(false);
        // Reset form
        setSaleForm({
          clientId: '',
          paymentMethod: 'cash',
          discountAmount: '',
          notes: ''
        });
        setSaleItems([]);
        setSelectedClient(null);
        setSelectedSale(null);
        setClientSearchTerm('');
        setProductSearchTerm('');
        // Recarregar lista de vendas
        fetchSales(searchTerm, salesPage);
      } else {
        alert(response.data.message || 'Erro ao salvar venda');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao salvar venda';
      alert(msg);
    }
  };

  const handleEditSale = async (sale: any) => {
    try {
      const response = await api.get(`/sales/${sale.id}`);
      if (response.data?.success) {
        const saleData = response.data.data;
        
        // Preencher formulário com dados da venda
        setSelectedClient({
          id: saleData.client.id,
          name: saleData.client.name,
          email: saleData.client.email,
          phone: saleData.client.phone
        });
        
        setClientSearchTerm(saleData.client.name);
        
        setSaleForm({
          clientId: saleData.clientId,
          paymentMethod: saleData.paymentMethod || 'cash',
          discountAmount: String(saleData.discountAmount || 0),
          notes: saleData.notes || ''
        });
        
        // Mapear itens
        const mappedItems = saleData.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discountAmount || 0
        }));
        
        setSaleItems(mappedItems);
        setSelectedSale(saleData);
        setShowNewSaleModal(true);
      }
    } catch (error) {
      console.error('Erro ao carregar venda para edição:', error);
      alert('Erro ao carregar dados da venda');
    }
  };

  const handleCancelSale = async (sale: any) => {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm('Tem certeza que deseja cancelar esta venda?')) return;
    
    try {
      const response = await api.delete(`/sales/${sale.id}`);
      if (response.data?.success) {
        alert('Venda cancelada com sucesso!');
        fetchSales(searchTerm, salesPage);
      } else {
        alert(response.data.message || 'Erro ao cancelar venda');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao cancelar venda';
      alert(msg);
    }
  };

  const handleConfirmSale = async (sale: any) => {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm('Tem certeza que deseja confirmar esta venda?')) return;
    
    try {
      const response = await api.post(`/sales/${sale.id}/confirm`);
      if (response.data?.success) {
        alert('Venda confirmada com sucesso!');
        fetchSales(searchTerm, salesPage);
      } else {
        alert(response.data.message || 'Erro ao confirmar venda');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao confirmar venda';
      alert(msg);
    }
  };

  // Processar pagamento
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForPayment) return;

    try {
      setPaymentLoading(true);
      const payload: any = {
        saleId: saleForPayment.id,
        paymentMethod: paymentForm.paymentMethod,
        amount: Number(paymentForm.amount || 0),
        installments: paymentForm.paymentMethod === 'credit_card' ? paymentForm.installments : 1
      };

      if (paymentForm.paymentMethod !== 'pix') {
        payload.cardData = {
          cardNumber: paymentForm.cardNumber,
          cardHolder: paymentForm.cardHolder,
          expirationDate: paymentForm.expirationDate,
          securityCode: paymentForm.securityCode
        };
      }

      const response = await api.post('/payments/process', payload);
      setPaymentResult(response.data?.data || response.data);

      // Atualiza lista
      fetchSales(searchTerm, salesPage);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao processar pagamento';
      alert(msg);
    } finally {
      setPaymentLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      paymentMethod: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas vendas e transações ({salesTotal} vendas)
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
            onClick={() => setShowNewSaleModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, email ou ID da venda..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                      debouncedSalesSearch(value);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select 
                      className="input"
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                    >
                      <option value="">Todos</option>
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status Pagamento
                    </label>
                    <select 
                      className="input"
                      value={filters.paymentStatus}
                      onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
                    >
                      <option value="">Todos</option>
                      {Object.entries(paymentStatusLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forma de Pagamento
                    </label>
                    <select 
                      className="input"
                      value={filters.paymentMethod}
                      onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
                    >
                      <option value="">Todas</option>
                      {Object.entries(paymentMethodLabels).map(([key, label]) => (
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vendas do Mês</p>
                <p className="text-2xl font-semibold text-gray-900">
                  R$ {sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + (s.finalAmount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Vendas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {sales.filter(s => s.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendentes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {sales.filter(s => s.status === 'processing' || s.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
                <p className="text-2xl font-semibold text-gray-900">
                  R$ {(sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.finalAmount, 0) / sales.filter(s => s.status === 'completed').length || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="card">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Carregando vendas...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {sale.client?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sale.client?.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(sale.saleDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      R$ {(sale.finalAmount || 0).toFixed(2)}
                    </div>
                    {sale.discountAmount > 0 && (
                      <div className="text-sm text-green-600">
                        -R$ {(sale.discountAmount || 0).toFixed(2)} desconto
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {paymentMethodLabels[sale.paymentMethod as keyof typeof paymentMethodLabels]}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      paymentStatusColors[sale.paymentStatus as keyof typeof paymentStatusColors]
                    }`}>
                      {paymentStatusLabels[sale.paymentStatus as keyof typeof paymentStatusLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[sale.status as keyof typeof statusColors]
                    }`}>
                      {getStatusIcon(sale.status)}
                      <span className="ml-1">
                        {statusLabels[sale.status as keyof typeof statusLabels]}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleViewSale(sale)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {sale.paymentStatus !== 'paid' && (
                        <button
                          onClick={() => {
                            setSaleForPayment(sale);
                            setPaymentForm({
                              paymentMethod: 'credit_card',
                              amount: Number(sale.finalAmount || sale.total || 0),
                              installments: 1,
                              cardNumber: '',
                              cardHolder: '',
                              expirationDate: '',
                              securityCode: ''
                            });
                            setPaymentResult(null);
                            setShowPaymentModal(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Pagar"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                      )}
                      {sale.status === 'draft' && (
                        <button 
                          onClick={() => handleEditSale(sale)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {sale.status !== 'completed' && sale.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleCancelSale(sale)}
                          className="text-red-600 hover:text-red-900"
                          title="Cancelar"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Venda */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
            onClick={(e) => {
              // Fechar modal apenas se clicar no overlay, não no conteúdo
              if (e.target === e.currentTarget) {
                setShowNewSaleModal(false);
              }
            }}
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleCreateSale}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedSale?.id ? 'Editar Venda' : 'Nova Venda'}
                    </h3>
                    <button type="button" onClick={() => {
                      setShowNewSaleModal(false);
                      setSelectedSale(null);
                      setSaleItems([]);
                      setSelectedClient(null);
                      setClientSearchTerm('');
                    }} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  
                  <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
                    {/* Seleção de Cliente */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar cliente por nome ou CPF..."
                          className={`input pl-10 w-full ${formErrors.clientId ? 'border-red-500' : ''}`}
                          value={clientSearchTerm}
                          onChange={(e) => {
                            const value = e.target.value;
                            setClientSearchTerm(value);
                            debouncedClientSearch(value);
                          }}
                          onFocus={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          autoComplete="off"
                        />
                      </div>
                      {formErrors.clientId && <p className="mt-1 text-sm text-red-600">{formErrors.clientId}</p>}
                      
                      {/* Lista de clientes */}
                      {clientSearchTerm && clients.length > 0 && (
                        <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                          {clients.map((client) => (
                            <div
                              key={client.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => handleSelectClient(client)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{client.name}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    {client.cpf && <span>CPF: {client.cpf}</span>}
                                    {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.phone}</span>}
                                    {client.address?.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {client.address.city}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Cliente selecionado */}
                      {selectedClient && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-green-900">{selectedClient.name}</p>
                              <p className="text-sm text-green-700">Cliente selecionado</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedClient(null);
                                setClientSearchTerm('');
                                setSaleForm({...saleForm, clientId: ''});
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Adicionar Produtos */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adicionar Produtos</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar produto por nome ou SKU..."
                          className="input pl-10 w-full"
                          value={productSearchTerm}
                          onChange={(e) => {
                            const value = e.target.value;
                            setProductSearchTerm(value);
                            debouncedProductSearch(value);
                          }}
                          onFocus={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          autoComplete="off"
                        />
                      </div>
                      
                      {/* Lista de produtos */}
                      {productSearchTerm && products.length > 0 && (
                        <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                          {products.map((product) => (
                            <div
                              key={product.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => handleAddProduct(product)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{product.name}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    {product.sku && <span>SKU: {product.sku}</span>}
                                    <span>R$ {product.price.toFixed(2)}</span>
                                    {product.currentStock !== undefined && <span>Estoque: {product.currentStock}</span>}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddProduct(product);
                                  }}
                                >
                                  Adicionar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Itens da Venda */}
                    {saleItems.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Itens da Venda</h4>
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {saleItems.map((item) => {
                                const product = products.find(p => p.id === item.productId);
                                const itemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
                                
                                return (
                                  <tr key={item.productId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {product?.name || 'Produto não encontrado'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input
                                        type="number"
                                        min="1"
                                        className="input w-20 text-sm"
                                        value={item.quantity}
                                        onChange={(e) => handleUpdateItemQuantity(item.productId, parseInt(e.target.value) || 1)}
                                        onFocus={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        autoComplete="off"
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input
                                        type="number"
                                        step="0.01"
                                        className="input w-24 text-sm"
                                        value={item.unitPrice}
                                        onChange={(e) => handleUpdateItemPrice(item.productId, parseFloat(e.target.value) || 0)}
                                        onFocus={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        autoComplete="off"
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input
                                        type="number"
                                        step="0.01"
                                        className="input w-20 text-sm"
                                        value={item.discount || 0}
                                        onChange={(e) => handleUpdateItemDiscount(item.productId, parseFloat(e.target.value) || 0)}
                                        onFocus={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        autoComplete="off"
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      R$ {itemTotal.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        type="button"
                                        onClick={() => setSaleItems(saleItems.filter(i => i.productId !== item.productId))}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
            </tbody>
          </table>
        </div>
      </div>
                    )}

                    {/* Resumo da Venda */}
                    {saleItems.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Resumo da Venda</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>R$ {calculateTotal().subtotal.toFixed(2)}</span>
                          </div>
                          {calculateTotal().itemDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Desconto nos itens:</span>
                              <span>-R$ {calculateTotal().itemDiscount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Desconto geral:</span>
                            <input
                              type="number"
                              step="0.01"
                              className="input w-24 text-sm"
                              value={saleForm.discountAmount}
                              onChange={(e) => setSaleForm({...saleForm, discountAmount: e.target.value})}
                              onFocus={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                              autoComplete="off"
                              placeholder="0.00"
                            />
                          </div>
                          <div className="flex justify-between text-lg font-semibold border-t pt-2">
                            <span>Total:</span>
                            <span>R$ {calculateTotal().total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Forma de Pagamento e Observações */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                        <select
                          className="input w-full"
                          value={saleForm.paymentMethod}
                          onChange={(e) => setSaleForm({...saleForm, paymentMethod: e.target.value})}
                          onFocus={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {Object.entries(paymentMethodLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <textarea
                          className="input w-full h-20"
                          placeholder="Observações adicionais..."
                          value={saleForm.notes}
                          onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})}
                          onFocus={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    {formErrors.items && <p className="text-sm text-red-600">{formErrors.items}</p>}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto sm:ml-3">
                    {selectedSale?.id ? 'Atualizar Venda' : 'Criar Venda'}
                  </button>
                  <button type="button" onClick={() => {
                    setShowNewSaleModal(false);
                    setSelectedSale(null);
                    setSaleItems([]);
                    setSelectedClient(null);
                    setClientSearchTerm('');
                  }} className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      {showSaleModal && selectedSale && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowSaleModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Detalhes da Venda</h3>
                  <button 
                    onClick={() => setShowSaleModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Informações da Venda</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID da Venda</p>
                        <p className="text-sm text-gray-900">#{selectedSale.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Cliente</p>
                        <p className="text-sm text-gray-900">{selectedSale.client?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{selectedSale.client?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Data</p>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedSale.saleDate).toLocaleDateString('pt-BR')} às {new Date(selectedSale.saleDate).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[selectedSale.status as keyof typeof statusColors]
                        }`}>
                          {getStatusIcon(selectedSale.status)}
                          <span className="ml-1">
                            {statusLabels[selectedSale.status as keyof typeof statusLabels]}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Pagamento</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Forma de Pagamento</p>
                        <p className="text-sm text-gray-900">
                          {paymentMethodLabels[selectedSale.paymentMethod as keyof typeof paymentMethodLabels]}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status do Pagamento</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          paymentStatusColors[selectedSale.paymentStatus as keyof typeof paymentStatusColors]
                        }`}>
                          {paymentStatusLabels[selectedSale.paymentStatus as keyof typeof paymentStatusLabels]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Valor Total</p>
                        <p className="text-sm text-gray-900">R$ {(selectedSale.totalAmount || 0).toFixed(2)}</p>
                      </div>
                      {selectedSale.discountAmount > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Desconto</p>
                          <p className="text-sm text-green-600">-R$ {(selectedSale.discountAmount || 0).toFixed(2)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500">Valor Final</p>
                        <p className="text-lg font-semibold text-gray-900">R$ {(selectedSale.finalAmount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Itens da Venda</h4>
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qtd
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Preço Unit.
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedSale.items?.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.product?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              R$ {(item.unitPrice || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              R$ {(item.totalPrice || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {selectedSale.notes && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                    <p className="text-sm text-gray-600">{selectedSale.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowSaleModal(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {salesTotal > salesLimit && (
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{Math.min((salesPage - 1) * salesLimit + 1, salesTotal)}</span> a{' '}
            <span className="font-medium">{Math.min(salesPage * salesLimit, salesTotal)}</span> de{' '}
            <span className="font-medium">{salesTotal}</span> resultados
        </div>
        <div className="flex space-x-2">
            <button 
              onClick={() => fetchSales(searchTerm, Math.max(1, salesPage - 1))}
              disabled={salesPage === 1}
              className="btn btn-outline btn-sm"
            >
            Anterior
          </button>
            <button className="btn btn-primary btn-sm">{salesPage}</button>
            <button 
              onClick={() => fetchSales(searchTerm, salesPage + 1)}
              disabled={salesPage * salesLimit >= salesTotal}
              className="btn btn-outline btn-sm"
            >
            Próximo
          </button>
        </div>
      </div>
      )}

      {/* Modal de Pagamento */}
      {showPaymentModal && saleForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Pagamento da Venda</h2>
              <button
                onClick={() => { setShowPaymentModal(false); setPaymentResult(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded p-4">
                <div className="flex justify-between text-sm">
                  <span>Cliente</span>
                  <span className="font-medium">{saleForPayment.client?.name || 'Cliente'}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Total da venda</span>
                  <span className="font-semibold">R$ {Number(saleForPayment.finalAmount || saleForPayment.total || 0).toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
                    <select
                      className="input w-full"
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                    >
                      <option value="cash">Dinheiro</option>
                      <option value="credit_card">Cartão de Crédito</option>
                      <option value="debit_card">Cartão de Débito</option>
                      <option value="pix">PIX</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input w-full"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    />
                  </div>
                  {paymentForm.paymentMethod === 'credit_card' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parcelas</label>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        className="input w-full"
                        value={paymentForm.installments}
                        onChange={(e) => setPaymentForm({ ...paymentForm, installments: Math.max(1, Math.min(24, Number(e.target.value))) })}
                      />
                    </div>
                  )}
                </div>

                {paymentForm.paymentMethod !== 'pix' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número do Cartão</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="input w-full"
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome impresso</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={paymentForm.cardHolder}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardHolder: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Validade (MM/AA)</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={paymentForm.expirationDate}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expirationDate: e.target.value })}
                        placeholder="MM/AA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="password"
                        className="input w-full"
                        value={paymentForm.securityCode}
                        onChange={(e) => setPaymentForm({ ...paymentForm, securityCode: e.target.value })}
                        placeholder="123"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" className="btn btn-outline" onClick={() => setShowPaymentModal(false)} disabled={paymentLoading}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={paymentLoading}>
                    {paymentLoading ? 'Processando...' : paymentForm.paymentMethod === 'pix' ? 'Gerar PIX' : 'Pagar'}
                  </button>
                </div>
              </form>

              {paymentResult && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-lg font-semibold mb-2">Resultado</h4>
                  {paymentResult.paymentResult?.qrCode || paymentResult.qrCode ? (
                    <div className="space-y-2">
                      {typeof (paymentResult.paymentResult?.qrCode || paymentResult.qrCode) === 'string' && (
                        <img
                          alt="QR Code PIX"
                          className="mx-auto"
                          src={paymentResult.paymentResult?.qrCode || paymentResult.qrCode}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      {(paymentResult.paymentResult?.pixCopyPaste || paymentResult.pixCopyPaste) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Copia e Cola</label>
                          <textarea className="input w-full" rows={3} readOnly value={paymentResult.paymentResult?.pixCopyPaste || paymentResult.pixCopyPaste} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(paymentResult, null, 2)}</pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
