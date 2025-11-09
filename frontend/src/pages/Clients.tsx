import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Filter, Star, Calendar, DollarSign, FileText, User, Phone, Mail, MapPin, X, Hash } from 'lucide-react';
import { api } from '../services/api';

interface ClientFormData {
  clientNumber: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  gender: 'M' | 'F' | 'O';
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
}

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  totalPurchases: number;
  lastPurchase: string | null;
  loyaltyPoints: number;
  isActive: boolean;
    address: {
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  birthDate?: string | null;
  gender?: 'M' | 'F' | 'O';
  notes?: string | null;
};

export const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    clientNumber: '',
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    gender: 'M',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });

  const [filters, setFilters] = useState({
    isActive: '',
    minLoyaltyPoints: '',
    minTotalPurchases: '',
    lastPurchaseFrom: '',
    lastPurchaseTo: ''
  });
  // Buscar clientes no backend
  const fetchClients = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (searchTerm) params.search = searchTerm;
      if (isActiveFilter) params.isActive = isActiveFilter === 'active' ? 'true' : 'false';

      const response = await api.get('/clients', { params });
      const payload = response.data?.data;
      setClients(payload?.clients || []);
      setTotal(payload?.pagination?.total || 0);
    } catch (err) {
      console.error('Erro ao carregar clientes', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce simples para busca
  const debouncedSearch = useMemo(() => {
    let timeout: any;
    return (value: string) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSearchTerm(value);
      }, 400);
    };
  }, []);

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm, isActiveFilter]);

  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showClientModal, setShowClientModal] = useState(false);

  // Gerar número único do cliente (6 dígitos numéricos)
  const generateClientNumber = (): string => {
    const random = Math.floor(Math.random() * 900000) + 100000; // Garante 6 dígitos
    return random.toString();
  };

  const handleOpenNewClientModal = () => {
    const clientNumber = generateClientNumber();
    setFormData({
      clientNumber,
      name: '',
      email: '',
      phone: '',
      cpf: '',
      birthDate: '',
      gender: 'M',
      address: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      notes: ''
    });
    setErrors({});
    setShowNewClientModal(true);
  };

  const handleCloseNewClientModal = () => {
    setShowNewClientModal(false);
    setFormData({
      clientNumber: '',
      name: '',
      email: '',
      phone: '',
      cpf: '',
      birthDate: '',
      gender: 'M',
      address: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      notes: ''
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF inválido (formato: 000.000.000-00)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatório';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'CEP é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Preparar dados para enviar
      const clientData = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        cpf: formData.cpf.trim() || undefined,
        birthDate: formData.birthDate || undefined,
        gender: formData.gender,
        address: formData.address.trim(),
        neighborhood: formData.neighborhood.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        zipCode: formData.zipCode.trim(),
        notes: formData.notes.trim() || undefined
      };

      console.log('Enviando dados do cliente:', clientData);

      // Fazer chamada à API
      const response = await api.post('/clients', clientData);
      
      console.log('Cliente criado:', response.data);
      
      // Mostrar mensagem de sucesso
      if (response.data.success) {
        alert(`Cliente criado com sucesso!\nNome: ${response.data.data.name}`);
      } else {
        alert(response.data.message || 'Cliente criado!');
      }
      
      handleCloseNewClientModal();
      
      // Recarregar lista de clientes
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      let errorMessage = 'Erro ao criar cliente';
      
      if (error.response?.data) {
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Erro: ${errorMessage}`);
    }
  };

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Formatar CPF automaticamente
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Formatar CEP automaticamente
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const filteredClients = clients; // filtragem principal feita no backend

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      clientNumber: '',
      name: client.name,
      email: client.email || '',
      phone: client.phone,
      cpf: client.cpf || '',
      birthDate: client.birthDate || '',
      gender: client.gender || 'M',
      address: client.address?.street || '',
      neighborhood: client.address?.neighborhood || '',
      city: client.address?.city || '',
      state: client.address?.state || '',
      zipCode: client.address?.zipCode || '',
      notes: client.notes || ''
    });
    setErrors({});
    setShowEditClientModal(true);
  };

  const handleCloseEditClientModal = () => {
    setShowEditClientModal(false);
    setEditingClient(null);
    setFormData({
      clientNumber: '',
      name: '',
      email: '',
      phone: '',
      cpf: '',
      birthDate: '',
      gender: 'M',
      address: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      notes: ''
    });
    setErrors({});
  };

  const handleDeleteClient = async (client: Client) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Tem certeza que deseja excluir o cliente "${client.name}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/clients/${client.id}`);
      
      if (response.data.success) {
        alert(response.data.message || 'Cliente excluído com sucesso!');
        fetchClients(); // Recarregar lista
      } else {
        alert(response.data.message || 'Erro ao excluir cliente');
      }
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error);
      let errorMessage = 'Erro ao excluir cliente';
      
      if (error.response?.data) {
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Erro: ${errorMessage}`);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !editingClient) {
      return;
    }

    try {
      // Preparar dados para enviar
      const clientData = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        cpf: formData.cpf.trim() || undefined,
        birthDate: formData.birthDate || undefined,
        gender: formData.gender,
        address: formData.address.trim(),
        neighborhood: formData.neighborhood.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        zipCode: formData.zipCode.trim(),
        notes: formData.notes.trim() || undefined
      };

      console.log('Atualizando cliente:', editingClient.id, clientData);

      // Fazer chamada à API
      const response = await api.put(`/clients/${editingClient.id}`, clientData);
      
      console.log('Cliente atualizado:', response.data);
      
      // Mostrar mensagem de sucesso
      if (response.data.success) {
        alert(`Cliente atualizado com sucesso!\nNome: ${response.data.data.name}`);
      } else {
        alert(response.data.message || 'Cliente atualizado!');
      }
      
      handleCloseEditClientModal();
      fetchClients(); // Recarregar lista
    } catch (error: any) {
      console.error('Erro ao atualizar cliente:', error);
      let errorMessage = 'Erro ao atualizar cliente';
      
      if (error.response?.data) {
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Erro: ${errorMessage}`);
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const clearFilters = () => {
    setFilters({
      isActive: '',
      minLoyaltyPoints: '',
      minTotalPurchases: '',
      lastPurchaseFrom: '',
      lastPurchaseTo: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus clientes e histórico de compras ({filteredClients.length} clientes)
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
            onClick={handleOpenNewClientModal}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
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
                    placeholder="Buscar por nome, email, telefone ou CPF..."
                    className="input pl-10"
                    defaultValue={searchTerm}
                    onChange={(e) => debouncedSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select 
                      className="input"
                      value={filters.isActive}
                      onChange={(e) => {
                        setFilters({...filters, isActive: e.target.value});
                        setIsActiveFilter(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="">Todos</option>
                      <option value="active">Ativos</option>
                      <option value="inactive">Inativos</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min. Pontos Fidelidade
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="input"
                      value={filters.minLoyaltyPoints}
                      onChange={(e) => setFilters({...filters, minLoyaltyPoints: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min. Total Compras (R$)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      className="input"
                      value={filters.minTotalPurchases}
                      onChange={(e) => setFilters({...filters, minTotalPurchases: e.target.value})}
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
                <User className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clientes</p>
                <p className="text-2xl font-semibold text-gray-900">{total || clients.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Clientes Ativos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {clients.filter(c => c.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Faturamento Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  R$ {clients.reduce((sum, c) => sum + c.totalPurchases, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pontos Fidelidade</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {clients.reduce((sum, c) => sum + c.loyaltyPoints, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="card hover:shadow-lg transition-shadow">
            <div className="card-content">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">CPF: {client.cpf}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  client.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {client.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {client.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {client.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {client.address.city}, {client.address.state}
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Compras</p>
                  <p className="text-sm font-semibold text-gray-900">
                    R$ {client.totalPurchases.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Pontos Fidelidade</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center">
                    <Star className="h-3 w-3 mr-1 text-yellow-500" />
                    {client.loyaltyPoints}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500">Última Compra</p>
                <p className="text-sm text-gray-900 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {client.lastPurchase ? new Date(client.lastPurchase).toLocaleDateString('pt-BR') : '-'}
                </p>
              </div>
              
              {client.notes && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500">Observações</p>
                  <p className="text-sm text-gray-600 italic">{client.notes}</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-end space-x-2">
                <button 
                  onClick={() => handleViewClient(client)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Ver detalhes"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleEditClient(client)}
                  className="text-indigo-600 hover:text-indigo-900"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDeleteClient(client)}
                  className="text-red-600 hover:text-red-900"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Client Detail Modal */}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowClientModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Detalhes do Cliente</h3>
                  <button 
                    onClick={() => setShowClientModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedClient.name}</h4>
                    <p className="text-sm text-gray-500">CPF: {selectedClient.cpf}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{selectedClient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Telefone</p>
                      <p className="text-sm text-gray-900">{selectedClient.phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Endereço</p>
                    <p className="text-sm text-gray-900">
                      {selectedClient.address.street}<br/>
                      {selectedClient.address.neighborhood}<br/>
                      {selectedClient.address.city} - {selectedClient.address.state}<br/>
                      CEP: {selectedClient.address.zipCode}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Compras</p>
                      <p className="text-sm font-semibold text-gray-900">
                        R$ {selectedClient.totalPurchases.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pontos Fidelidade</p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        {selectedClient.loyaltyPoints}
                      </p>
                    </div>
                  </div>
                  
                  {selectedClient.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Observações</p>
                      <p className="text-sm text-gray-900">{selectedClient.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowClientModal(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {loading ? 'Carregando...' : (
            <>
              Mostrando <span className="font-medium">{filteredClients.length}</span> de{' '}
              <span className="font-medium">{total}</span> resultados
            </>
          )}
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
          <button className="btn btn-primary btn-sm" onClick={() => setPage(1)}>{page}</button>
          <button className="btn btn-outline btn-sm" disabled={page * limit >= total} onClick={() => setPage(p => p + 1)}>Próximo</button>
        </div>
      </div>

      {/* Modal Editar Cliente */}
      {showEditClientModal && editingClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={handleCloseEditClientModal}
            />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <form onSubmit={handleUpdateClient}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Editar Cliente</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Editando: <span className="text-primary font-semibold">{editingClient.name}</span>
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={handleCloseEditClientModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
          </button>
        </div>
                  
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Dados Pessoais */}
                    <div className="border-b pb-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Dados Pessoais
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="Digite o nome completo"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                          )}
      </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CPF *
                          </label>
                          <input
                            type="text"
                            className={`input w-full ${errors.cpf ? 'border-red-500' : ''}`}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            value={formData.cpf}
                            onChange={(e) => {
                              const formatted = formatCPF(e.target.value);
                              handleInputChange('cpf', formatted);
                            }}
                          />
                          {errors.cpf && (
                            <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de Nascimento
                          </label>
                          <input
                            type="date"
                            className="input w-full"
                            value={formData.birthDate}
                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gênero
                          </label>
                          <select
                            className="input w-full"
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                          >
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="O">Outro</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Contato */}
                    <div className="border-b pb-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Contato
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="email"
                              className={`input w-full pl-10 ${errors.email ? 'border-red-500' : ''}`}
                              placeholder="usuario@exemplo.com"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="tel"
                              className={`input w-full pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                              placeholder="(11) 99999-9999"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                            />
                          </div>
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Endereço
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Endereço (Rua, Número) *
                          </label>
                          <input
                            type="text"
                            className={`input w-full ${errors.address ? 'border-red-500' : ''}`}
                            placeholder="Rua Exemplo, 123"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                          />
                          {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bairro *
                            </label>
                            <input
                              type="text"
                              className={`input w-full ${errors.neighborhood ? 'border-red-500' : ''}`}
                              placeholder="Centro"
                              value={formData.neighborhood}
                              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                            />
                            {errors.neighborhood && (
                              <p className="mt-1 text-sm text-red-600">{errors.neighborhood}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CEP *
                            </label>
                            <input
                              type="text"
                              className={`input w-full ${errors.zipCode ? 'border-red-500' : ''}`}
                              placeholder="00000-000"
                              maxLength={9}
                              value={formData.zipCode}
                              onChange={(e) => {
                                const formatted = formatCEP(e.target.value);
                                handleInputChange('zipCode', formatted);
                              }}
                            />
                            {errors.zipCode && (
                              <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cidade *
                            </label>
                            <input
                              type="text"
                              className={`input w-full ${errors.city ? 'border-red-500' : ''}`}
                              placeholder="São Paulo"
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                            />
                            {errors.city && (
                              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Estado (UF) *
                            </label>
                            <input
                              type="text"
                              className={`input w-full ${errors.state ? 'border-red-500' : ''}`}
                              placeholder="SP"
                              maxLength={2}
                              value={formData.state}
                              onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                            />
                            {errors.state && (
                              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        className="input w-full"
                        rows={3}
                        placeholder="Anotações sobre o cliente..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    Atualizar Cliente
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseEditClientModal}
                    className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={handleCloseNewClientModal}
            />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Novo Cliente</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Número: <span className="text-primary font-semibold">{formData.clientNumber}</span>
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={handleCloseNewClientModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Dados Pessoais */}
                    <div className="border-b pb-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Dados Pessoais
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="Digite o nome completo"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CPF *
                          </label>
                          <input
                            type="text"
                            className={`input w-full ${errors.cpf ? 'border-red-500' : ''}`}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            value={formData.cpf}
                            onChange={(e) => {
                              const formatted = formatCPF(e.target.value);
                              handleInputChange('cpf', formatted);
                            }}
                          />
                          {errors.cpf && (
                            <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de Nascimento
                          </label>
                          <input
                            type="date"
                            className="input w-full"
                            value={formData.birthDate}
                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gênero
                          </label>
                          <select
                            className="input w-full"
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                          >
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="O">Outro</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Contato */}
                    <div className="border-b pb-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Contato
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="email"
                              className={`input w-full pl-10 ${errors.email ? 'border-red-500' : ''}`}
                              placeholder="usuario@exemplo.com"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="tel"
                              className={`input w-full pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                              placeholder="(11) 99999-9999"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                            />
                          </div>
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Endereço
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Endereço (Rua, Número) *
                          </label>
                          <input
                            type="text"
                            className={`input w-full ${errors.address ? 'border-red-500' : ''}`}
                            placeholder="Rua Exemplo, 123"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                          />
                          {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bairro *
                            </label>
                            <input
                              type="text"
                              className={`input w-full ${errors.neighborhood ? 'border-red-500' : ''}`}
                              placeholder="Centro"
                              value={formData.neighborhood}
                              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                            />
                            {errors.neighborhood && (
                              <p className="mt-1 text-sm text-red-600">{errors.neighborhood}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CEP *
                            </label>
                            <input
                              type="text"
                              className={`input w-full ${errors.zipCode ? 'border-red-500' : ''}`}
                              placeholder="00000-000"
                              maxLength={9}
                              value={formData.zipCode}
                              onChange={(e) => {
                                const formatted = formatCEP(e.target.value);
                                handleInputChange('zipCode', formatted);
                              }}
                            />
                            {errors.zipCode && (
                              <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cidade *
                            </label>
                            <input
                              type="text"
                              className={`input w-full ${errors.city ? 'border-red-500' : ''}`}
                              placeholder="São Paulo"
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                            />
                            {errors.city && (
                              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Estado (UF) *
                            </label>
                            <input
                              type="text"
                              className={`input w-full ${errors.state ? 'border-red-500' : ''}`}
                              placeholder="SP"
                              maxLength={2}
                              value={formData.state}
                              onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                            />
                            {errors.state && (
                              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        className="input w-full"
                        rows={3}
                        placeholder="Anotações sobre o cliente..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    Criar Cliente
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseNewClientModal}
                    className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
