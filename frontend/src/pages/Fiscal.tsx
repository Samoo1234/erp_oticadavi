import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Download,
  Upload,
  Shield,
  BarChart3,
  Settings,
  Calendar,
  User,
  Building,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileCheck,
  Receipt,
  Calculator,
  Database,
  Zap,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';

// Tipos
type Company = {
  id: string;
  name: string;
  cnpj: string;
  ie?: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  fiscalSettings: {
    regime: 'simples' | 'presumido' | 'real';
    nfeEnabled: boolean;
    nfceEnabled: boolean;
    nfseEnabled: boolean;
    certificateExpiry?: string;
  };
};

type Invoice = {
  id: string;
  number: string;
  type: 'nfe' | 'nfce' | 'nfse';
  status: 'draft' | 'sent' | 'authorized' | 'rejected' | 'cancelled';
  clientId: string;
  clientName: string;
  clientCnpj?: string;
  clientCpf?: string;
  totalValue: number;
  issueDate: string;
  authorizationDate?: string;
  authorizationCode?: string;
  accessKey?: string;
  xmlUrl?: string;
  pdfUrl?: string;
  items: InvoiceItem[];
};

type InvoiceItem = {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ncm?: string;
  cfop?: string;
  icms?: {
    base: number;
    rate: number;
    value: number;
  };
  ipi?: {
    rate: number;
    value: number;
  };
};

type Certificate = {
  id: string;
  name: string;
  serialNumber: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked';
  type: 'a1' | 'a3';
};

const invoiceTypeLabels = {
  nfe: 'NFe',
  nfce: 'NFCe',
  nfse: 'NFS-e'
};

const invoiceStatusLabels = {
  draft: 'Rascunho',
  sent: 'Enviada',
  authorized: 'Autorizada',
  rejected: 'Rejeitada',
  cancelled: 'Cancelada'
};

const invoiceStatusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  authorized: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-red-100 text-red-800'
};

const invoiceStatusIcons = {
  draft: FileText,
  sent: Clock,
  authorized: CheckCircle,
  rejected: XCircle,
  cancelled: XCircle
};

export const Fiscal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'certificates' | 'reports' | 'settings'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Input local para exibição
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    client: ''
  });

  // Estados para notas fiscais
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [invoicesTotal, setInvoicesTotal] = useState(0);
  const [invoicesLimit] = useState(10);

  // Estados para certificados
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);

  // Estados para empresa
  const [company, setCompany] = useState<Company | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  // Estados para modais
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Estados para formulários
  const [invoiceForm, setInvoiceForm] = useState({
    type: 'nfe' as Invoice['type'],
    clientId: '',
    issueDate: new Date().toISOString().split('T')[0],
    items: [] as InvoiceItem[]
  });
  const [certificateForm, setCertificateForm] = useState({
    name: '',
    file: null as File | null,
    password: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Estados para busca de clientes
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientSearchInput, setClientSearchInput] = useState(''); // Input local para exibição
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    // Dados da Empresa
    companyName: '',
    cnpj: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    regimeTributario: 'normal', // normal, simples, presumido
    cnae: '',
    
    // Endereço da Empresa
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: 'MT',
      zipCode: ''
    },
    
    // Contatos
    phone: '',
    email: '',
    website: '',
    
    // Configurações Fiscais
    ambienteNFe: 'homologacao', // homologacao, producao
    serieNFe: '1',
    modeloNFe: '55', // 55=NF-e, 65=NFC-e
    
    // Impostos Padrão
    icmsPadrao: 17,
    ipiPadrao: 8,
    pisPadrao: 1.65,
    cofinsPadrao: 7.6
  });

  // Estados para busca de produtos
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productSearchInput, setProductSearchInput] = useState(''); // Input local para exibição
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Estados para itens da nota
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemForm, setItemForm] = useState({
    productId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    ncm: '',
    cfop: '5102',
    icmsRate: 0,
    ipiRate: 0
  });

  // Buscar notas fiscais (mockado por enquanto)
  const fetchInvoices = async (search: string = '', page: number = 1) => {
    try {
      setInvoicesLoading(true);
      // Simular dados mockados por enquanto
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          number: '000001',
          type: 'nfe',
          status: 'authorized',
          clientId: '1',
          clientName: 'Laboratório Óptico ABC',
          clientCnpj: '12.345.678/0001-90',
          totalValue: 1250.00,
          issueDate: '2024-01-20T10:30:00Z',
          authorizationDate: '2024-01-20T10:35:00Z',
          authorizationCode: '12345678901234567890123456789012345678901234',
          accessKey: '35240114200166000187550010000000011234567890',
          items: [
            {
              id: '1',
              productName: 'Lentes Progressivas',
              quantity: 2,
              unitPrice: 625.00,
              totalPrice: 1250.00,
              ncm: '9001.50.00',
              cfop: '5102'
            }
          ]
        },
        {
          id: '2',
          number: '000002',
          type: 'nfce',
          status: 'authorized',
          clientId: '2',
          clientName: 'João Silva',
          clientCpf: '123.456.789-00',
          totalValue: 450.00,
          issueDate: '2024-01-19T14:15:00Z',
          authorizationDate: '2024-01-19T14:20:00Z',
          authorizationCode: '98765432109876543210987654321098765432109876',
          accessKey: '35240114200166000187550010000000029876543210',
          items: [
            {
              id: '2',
              productName: 'Óculos de Grau',
              quantity: 1,
              unitPrice: 450.00,
              totalPrice: 450.00,
              ncm: '9003.10.00',
              cfop: '5102'
            }
          ]
        }
      ];
      
      setInvoices(mockInvoices);
      setInvoicesTotal(mockInvoices.length);
      setInvoicesPage(page);
    } catch (e) {
      console.error('Erro ao carregar notas fiscais', e);
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Buscar certificados (mockado por enquanto)
  const fetchCertificates = async () => {
    try {
      setCertificatesLoading(true);
      // Simular dados mockados por enquanto
      const mockCertificates: Certificate[] = [
        {
          id: '1',
          name: 'Certificado Ótica Davi',
          serialNumber: '1234567890123456789012345678901234567890',
          expiryDate: '2025-12-31',
          status: 'active',
          type: 'a1'
        }
      ];
      
      setCertificates(mockCertificates);
    } catch (e) {
      console.error('Erro ao carregar certificados', e);
    } finally {
      setCertificatesLoading(false);
    }
  };

  // Buscar dados da empresa (mockado por enquanto)
  const fetchCompany = async () => {
    try {
      setCompanyLoading(true);
      // Simular dados mockados por enquanto
      const mockCompany: Company = {
        id: '1',
        name: 'Ótica Davi',
        cnpj: '14.234.567/0001-89',
        ie: '123456789',
        address: {
          street: 'Rua Presidente Tancredo Neves',
          number: '465',
          neighborhood: 'Centro',
          city: 'Mantena',
          state: 'MG',
          zipCode: '35290-000'
        },
        fiscalSettings: {
          regime: 'simples',
          nfeEnabled: true,
          nfceEnabled: true,
          nfseEnabled: false,
          certificateExpiry: '2025-12-31'
        }
      };
      
      setCompany(mockCompany);
    } catch (e) {
      console.error('Erro ao carregar dados da empresa', e);
    } finally {
      setCompanyLoading(false);
    }
  };

  // Buscar clientes
  const fetchClients = async (search: string = '') => {
    try {
      setClientsLoading(true);
      
      const response = await api.get('/clients', {
        params: {
          search,
          limit: 10,
          page: 1
        }
      });
      
      if (response.data.success && response.data.data && response.data.data.clients && Array.isArray(response.data.data.clients)) {
        setClients(response.data.data.clients);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Detalhes do erro:', (error as any).response?.data);
      }
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  // Buscar produtos
  const fetchProducts = async (search: string = '') => {
    try {
      setProductsLoading(true);
      
      const response = await api.get('/products', {
        params: {
          search,
          limit: 10,
          page: 1
        }
      });
      
      if (response.data.success && response.data.data && response.data.data.products && Array.isArray(response.data.data.products)) {
        setProducts(response.data.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Detalhes do erro:', (error as any).response?.data);
      }
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Debounce da busca de notas fiscais
  const debouncedInvoiceSearch = useMemo(() => {
    let timeout: any;
    return (value: string) => {
      setSearchInput(value); // Atualiza input imediatamente
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSearchTerm(value);
        fetchInvoices(value, 1);
      }, 400);
    };
  }, []);

  // Debounce da busca de clientes
  const debouncedClientSearch = useMemo(() => {
    let timeout: any;
    return (value: string) => {
      setClientSearchInput(value); // Atualiza input imediatamente
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setClientSearchTerm(value);
        if (value.length >= 2) {
          fetchClients(value);
          setShowClientDropdown(true);
        } else {
          setShowClientDropdown(false);
        }
      }, 300);
    };
  }, []);

  // Debounce da busca de produtos
  const debouncedProductSearch = useMemo(() => {
    let timeout: any;
    return (value: string) => {
      setProductSearchInput(value); // Atualiza input imediatamente
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setProductSearchTerm(value);
        if (value.length >= 2) {
          fetchProducts(value);
          setShowProductDropdown(true);
        } else {
          setShowProductDropdown(false);
        }
      }, 300);
    };
  }, []);

  // Funções para gerenciar itens
  const handleSelectProduct = (product: any) => {
    setItemForm({
      ...itemForm,
      productId: product.id,
      productName: product.name,
      unitPrice: product.price || 0,
      ncm: product.ncm || '',
      cfop: product.cfop || '5102'
    });
    setProductSearchTerm(product.name);
    setProductSearchInput(product.name);
    setShowProductDropdown(false);
  };

  const handleAddItem = () => {
    if (!itemForm.productName || !itemForm.quantity || !itemForm.unitPrice) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      productId: itemForm.productId,
      productName: itemForm.productName,
      quantity: parseFloat(itemForm.quantity.toString()),
      unitPrice: parseFloat(itemForm.unitPrice.toString()),
      totalPrice: parseFloat(itemForm.quantity.toString()) * parseFloat(itemForm.unitPrice.toString()),
      ncm: itemForm.ncm,
      cfop: itemForm.cfop,
      icmsRate: parseFloat(itemForm.icmsRate.toString()),
      ipiRate: parseFloat(itemForm.ipiRate.toString())
    };

    setInvoiceItems([...invoiceItems, newItem]);
    setItemForm({
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      ncm: '',
      cfop: '5102',
      icmsRate: 0,
      ipiRate: 0
    });
    setProductSearchTerm('');
    setProductSearchInput('');
    setShowAddItemModal(false);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setItemForm({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      ncm: item.ncm,
      cfop: item.cfop,
      icmsRate: item.icmsRate,
      ipiRate: item.ipiRate
    });
    setShowAddItemModal(true);
  };

  const handleUpdateItem = () => {
    if (!itemForm.productName || !itemForm.quantity || !itemForm.unitPrice) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const updatedItem = {
      ...editingItem,
      productId: itemForm.productId,
      productName: itemForm.productName,
      quantity: parseFloat(itemForm.quantity.toString()),
      unitPrice: parseFloat(itemForm.unitPrice.toString()),
      totalPrice: parseFloat(itemForm.quantity.toString()) * parseFloat(itemForm.unitPrice.toString()),
      ncm: itemForm.ncm,
      cfop: itemForm.cfop,
      icmsRate: parseFloat(itemForm.icmsRate.toString()),
      ipiRate: parseFloat(itemForm.ipiRate.toString())
    };

    setInvoiceItems(invoiceItems.map(item => 
      item.id === editingItem.id ? updatedItem : item
    ));
    
    setItemForm({
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      ncm: '',
      cfop: '5102',
      icmsRate: 0,
      ipiRate: 0
    });
    setEditingItem(null);
    setShowAddItemModal(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalItems = invoiceItems.length;
    return { subtotal, totalItems };
  };

  useEffect(() => {
    if (showSettingsModal) {
      fetchSettings();
    }
  }, [showSettingsModal]);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    setInvoiceForm({...invoiceForm, clientId: client.id});
    setClientSearchTerm(client.name);
    setClientSearchInput(client.name);
    setShowClientDropdown(false);
  };

  const handleClientSearchChange = (value: string) => {
    setClientSearchInput(value); // Atualiza input imediatamente
    setClientSearchTerm(value);
    debouncedClientSearch(value);
    
    // Limpar seleção se o texto for alterado
    if (selectedClient && value !== selectedClient.name) {
      setSelectedClient(null);
      setInvoiceForm({...invoiceForm, clientId: ''});
    }
  };

  // Buscar configurações
  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await api.get('/fiscal/settings');
      
      if (response.data.success && response.data.data) {
        setSettingsForm(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Salvar configurações
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSettingsLoading(true);
      const response = await api.put('/fiscal/settings', settingsForm);
      
      if (response.data.success) {
        alert('Configurações salvas com sucesso!');
        setShowSettingsModal(false);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    
    if (!invoiceForm.clientId || !selectedClient) errs.clientId = 'Cliente obrigatório';
    if (!invoiceForm.issueDate) errs.issueDate = 'Data de emissão obrigatória';
    if (invoiceItems.length === 0) errs.items = 'Adicione pelo menos um item';
    
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      // Criar nota fiscal via API
      const response = await api.post('/fiscal/invoices', {
        type: invoiceForm.type,
        clientId: invoiceForm.clientId,
        issueDate: invoiceForm.issueDate,
        items: invoiceItems,
        observations: '',
        additionalInfo: {}
      });

      if (response.data.success) {
        alert('Nota fiscal criada com sucesso!');
        setShowNewInvoiceModal(false);
        setInvoiceForm({
          type: 'nfe',
          clientId: '',
          issueDate: new Date().toISOString().split('T')[0],
          items: []
        });
        setInvoiceItems([]);
        setSelectedClient(null);
        setClientSearchTerm('');
        setClientSearchInput('');
        setShowClientDropdown(false);
        fetchInvoices(searchTerm, invoicesPage);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao criar nota fiscal';
      alert(msg);
    }
  };

  const handleUploadCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    
    if (!certificateForm.name) errs.name = 'Nome do certificado obrigatório';
    if (!certificateForm.file) errs.file = 'Arquivo do certificado obrigatório';
    if (!certificateForm.password) errs.password = 'Senha do certificado obrigatória';
    
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      // Por enquanto apenas simular upload
      alert('Certificado digital carregado com sucesso! (Funcionalidade em desenvolvimento)');
      setShowCertificateModal(false);
      setCertificateForm({
        name: '',
        file: null,
        password: ''
      });
      fetchCertificates();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao carregar certificado';
      alert(msg);
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      client: ''
    });
  };

  const getInvoiceIcon = (type: Invoice['type']) => {
    switch (type) {
      case 'nfe': return <FileText className="h-4 w-4" />;
      case 'nfce': return <Receipt className="h-4 w-4" />;
      case 'nfse': return <FileCheck className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    const Icon = invoiceStatusIcons[status];
    return <Icon className="h-4 w-4" />;
  };

  const getCertificateStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'bg-red-100 text-red-800', label: 'Expirado' };
    if (daysUntilExpiry <= 30) return { status: 'expiring', color: 'bg-yellow-100 text-yellow-800', label: 'Expirando' };
    return { status: 'active', color: 'bg-green-100 text-green-800', label: 'Ativo' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo Fiscal</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestão de notas fiscais e documentos fiscais
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
          {activeTab === 'invoices' && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowNewInvoiceModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Nota Fiscal
            </button>
          )}
          {activeTab === 'certificates' && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowCertificateModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Carregar Certificado
            </button>
          )}
          {activeTab === 'settings' && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 mr-2 inline" />
            Notas Fiscais ({invoicesTotal})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'certificates'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="h-4 w-4 mr-2 inline" />
            Certificados ({certificates.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2 inline" />
            Relatórios
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="h-4 w-4 mr-2 inline" />
            Configurações
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            {activeTab === 'invoices' && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por número, cliente ou chave de acesso..."
                    className="input pl-10"
                    value={searchInput}
                    onChange={(e) => debouncedInvoiceSearch(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Advanced Filters */}
            {showFilters && activeTab === 'invoices' && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select 
                      className="input"
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                    >
                      <option value="">Todos</option>
                      {Object.entries(invoiceTypeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
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
                      {Object.entries(invoiceStatusLabels).map(([key, label]) => (
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

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="card">
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Emissão
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoicesLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Carregando notas fiscais...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma nota fiscal encontrada
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getInvoiceIcon(invoice.type)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {invoice.number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {invoiceTypeLabels[invoice.type]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.clientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.clientCnpj || invoice.clientCpf || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R$ {invoice.totalValue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${invoiceStatusColors[invoice.status]}`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">
                            {invoiceStatusLabels[invoice.status]}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.issueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleViewInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {invoice.status === 'authorized' && (
                            <button 
                              className="text-green-600 hover:text-green-900"
                              title="Download XML"
                            >
                              <Download className="h-4 w-4" />
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
      )}

      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <div className="card">
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial Number
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certificatesLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Carregando certificados...
                    </td>
                  </tr>
                ) : certificates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Nenhum certificado encontrado
                    </td>
                  </tr>
                ) : (
                  certificates.map((certificate) => {
                    const certStatus = getCertificateStatus(certificate.expiryDate);
                    return (
                      <tr key={certificate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-gray-400" />
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {certificate.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {certificate.type.toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${certStatus.color}`}>
                            {certStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(certificate.expiryDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {certificate.serialNumber.substring(0, 20)}...
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Notas Emitidas (Mês)</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {invoices.filter(i => i.status === 'authorized').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calculator className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Valor Total (Mês)</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    R$ {invoices.filter(i => i.status === 'authorized').reduce((sum, i) => sum + i.totalValue, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Certificados Expirando</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {certificates.filter(c => getCertificateStatus(c.expiryDate).status === 'expiring').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && company && (
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações Fiscais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Dados da Empresa</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Razão Social</p>
                    <p className="text-sm text-gray-900">{company.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">CNPJ</p>
                    <p className="text-sm text-gray-900">{company.cnpj}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Inscrição Estadual</p>
                    <p className="text-sm text-gray-900">{company.ie || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Configurações Fiscais</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Regime Tributário</p>
                    <p className="text-sm text-gray-900 capitalize">{company.fiscalSettings.regime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">NFe Habilitada</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      company.fiscalSettings.nfeEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {company.fiscalSettings.nfeEnabled ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">NFCe Habilitada</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      company.fiscalSettings.nfceEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {company.fiscalSettings.nfceEnabled ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Nota Fiscal */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowNewInvoiceModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <form onSubmit={handleCreateInvoice}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Nova Nota Fiscal</h3>
                    <button type="button" onClick={() => setShowNewInvoiceModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Nota *</label>
                        <select
                          className="input w-full"
                          value={invoiceForm.type}
                          onChange={(e) => setInvoiceForm({...invoiceForm, type: e.target.value as Invoice['type']})}
                        >
                          {Object.entries(invoiceTypeLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão *</label>
                        <input
                          type="date"
                          className={`input w-full ${formErrors.issueDate ? 'border-red-500' : ''}`}
                          value={invoiceForm.issueDate}
                          onChange={(e) => setInvoiceForm({...invoiceForm, issueDate: e.target.value})}
                        />
                        {formErrors.issueDate && <p className="mt-1 text-sm text-red-600">{formErrors.issueDate}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                      <div className="relative">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className={`input flex-1 ${formErrors.clientId ? 'border-red-500' : ''}`}
                            placeholder="Buscar cliente..."
                            value={clientSearchInput}
                            onChange={(e) => handleClientSearchChange(e.target.value)}
                            onFocus={() => {
                              if (Array.isArray(clients) && clients.length > 0) {
                                setShowClientDropdown(true);
                              }
                            }}
                            onBlur={() => {
                              // Delay para permitir clique no dropdown
                              setTimeout(() => setShowClientDropdown(false), 200);
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-outline px-3"
                            onClick={() => setShowClientModal(true)}
                            title="Buscar cliente"
                          >
                            <Search className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Dropdown de clientes */}
                        {showClientDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-auto">
                            {clientsLoading ? (
                              <div className="px-3 py-2 text-sm text-gray-500">Buscando...</div>
                            ) : !Array.isArray(clients) || clients.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-gray-500">Nenhum cliente encontrado</div>
                            ) : (
                              clients.map((client) => (
                                <button
                                  key={client.id}
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSelectClient(client);
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectClient(client);
                                  }}
                                >
                                  <div className="font-medium text-gray-900">{client.name}</div>
                                  <div className="text-gray-500">
                                    {client.cnpj || client.cpf || client.email}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      {formErrors.clientId && <p className="mt-1 text-sm text-red-600">{formErrors.clientId}</p>}
                      
                      {/* Cliente selecionado */}
                      {selectedClient && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                          <div className="text-sm font-medium text-green-800">Cliente selecionado:</div>
                          <div className="text-sm text-green-700">{selectedClient.name}</div>
                          <div className="text-xs text-green-600">
                            {selectedClient.cnpj || selectedClient.cpf || selectedClient.email}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Itens da Nota</h4>
                      
                      {/* Botão Adicionar Item */}
                      <div className="mb-4">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setShowAddItemModal(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Item
                        </button>
                      </div>

                      {/* Lista de Itens */}
                      {invoiceItems.length === 0 ? (
                        <div className="border border-gray-200 rounded-lg p-8 text-center">
                          <div className="text-gray-500 mb-2">Nenhum item adicionado</div>
                          <div className="text-sm text-gray-400">Clique em "Adicionar Item" para começar</div>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NCM</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CFOP</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {invoiceItems.map((item) => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">R$ {item.unitPrice.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">R$ {item.totalPrice.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.ncm}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{item.cfop}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      <div className="flex space-x-2">
                                        <button
                                          type="button"
                                          className="text-blue-600 hover:text-blue-800"
                                          onClick={() => handleEditItem(item)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                          type="button"
                                          className="text-red-600 hover:text-red-800"
                                          onClick={() => handleRemoveItem(item.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Resumo dos Totais */}
                      {invoiceItems.length > 0 && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              Total de itens: {calculateTotals().totalItems}
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                              Subtotal: R$ {calculateTotals().subtotal.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {formErrors.items && <p className="mt-1 text-sm text-red-600">{formErrors.items}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto sm:ml-3">Criar Nota Fiscal</button>
                  <button type="button" onClick={() => setShowNewInvoiceModal(false)} className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes da Nota Fiscal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowInvoiceModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Nota Fiscal #{selectedInvoice.number}
                  </h3>
                  <button 
                    onClick={() => setShowInvoiceModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Informações da Nota</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Número</p>
                        <p className="text-sm text-gray-900">{selectedInvoice.number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tipo</p>
                        <p className="text-sm text-gray-900">{invoiceTypeLabels[selectedInvoice.type]}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${invoiceStatusColors[selectedInvoice.status]}`}>
                          {getStatusIcon(selectedInvoice.status)}
                          <span className="ml-1">
                            {invoiceStatusLabels[selectedInvoice.status]}
                          </span>
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Data de Emissão</p>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedInvoice.issueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {selectedInvoice.authorizationDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Data de Autorização</p>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedInvoice.authorizationDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Cliente</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nome</p>
                        <p className="text-sm text-gray-900">{selectedInvoice.clientName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Documento</p>
                        <p className="text-sm text-gray-900">{selectedInvoice.clientCnpj || selectedInvoice.clientCpf || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Valor Total</p>
                        <p className="text-lg font-semibold text-gray-900">R$ {selectedInvoice.totalValue.toFixed(2)}</p>
                      </div>
                      {selectedInvoice.accessKey && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Chave de Acesso</p>
                          <p className="text-sm text-gray-900 font-mono break-all">{selectedInvoice.accessKey}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Itens da Nota</h4>
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
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              R$ {item.unitPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              R$ {item.totalPrice.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedInvoice.status === 'authorized' && (
                  <button
                    type="button"
                    className="btn btn-primary ml-2"
                    onClick={() => alert('Download XML em desenvolvimento')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download XML
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowInvoiceModal(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Carregar Certificado */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCertificateModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUploadCertificate}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Carregar Certificado Digital</h3>
                    <button type="button" onClick={() => setShowCertificateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Certificado *</label>
                      <input
                        type="text"
                        className={`input w-full ${formErrors.name ? 'border-red-500' : ''}`}
                        placeholder="Ex: Certificado Ótica Davi"
                        value={certificateForm.name}
                        onChange={(e) => setCertificateForm({...certificateForm, name: e.target.value})}
                      />
                      {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo do Certificado *</label>
                      <input
                        type="file"
                        accept=".p12,.pfx"
                        className={`input w-full ${formErrors.file ? 'border-red-500' : ''}`}
                        onChange={(e) => setCertificateForm({...certificateForm, file: e.target.files?.[0] || null})}
                      />
                      {formErrors.file && <p className="mt-1 text-sm text-red-600">{formErrors.file}</p>}
                      <p className="mt-1 text-xs text-gray-500">Formatos aceitos: .p12, .pfx</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Senha do Certificado *</label>
                      <input
                        type="password"
                        className={`input w-full ${formErrors.password ? 'border-red-500' : ''}`}
                        placeholder="Senha do certificado"
                        value={certificateForm.password}
                        onChange={(e) => setCertificateForm({...certificateForm, password: e.target.value})}
                      />
                      {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto sm:ml-3">Carregar Certificado</button>
                  <button type="button" onClick={() => setShowCertificateModal(false)} className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar/Editar Item */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setShowAddItemModal(false);
              setEditingItem(null);
              setItemForm({
                productId: '',
                productName: '',
                quantity: 1,
                unitPrice: 0,
                ncm: '',
                cfop: '5102',
                icmsRate: 0,
                ipiRate: 0
              });
              setProductSearchTerm('');
    setProductSearchInput('');
            }}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingItem ? 'Editar Item' : 'Adicionar Item'}
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddItemModal(false);
                      setEditingItem(null);
                      setItemForm({
                        productId: '',
                        productName: '',
                        quantity: 1,
                        unitPrice: 0,
                        ncm: '',
                        cfop: '5102',
                        icmsRate: 0,
                        ipiRate: 0
                      });
                      setProductSearchTerm('');
    setProductSearchInput('');
                    }} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (editingItem) {
                    handleUpdateItem();
                  } else {
                    handleAddItem();
                  }
                }}>
                  <div className="space-y-4">
                    {/* Busca de Produto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
                      <div className="relative">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="input flex-1"
                            placeholder="Buscar produto..."
                            value={productSearchInput}
                            onChange={(e) => debouncedProductSearch(e.target.value)}
                            onFocus={() => {
                              if (Array.isArray(products) && products.length > 0) {
                                setShowProductDropdown(true);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setShowProductDropdown(false), 200);
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-outline px-3"
                            onClick={() => setShowProductModal(true)}
                            title="Buscar produto"
                          >
                            <Search className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Dropdown de produtos */}
                        {showProductDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-auto">
                            {productsLoading ? (
                              <div className="px-3 py-2 text-sm text-gray-500">Buscando...</div>
                            ) : !Array.isArray(products) || products.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-gray-500">Nenhum produto encontrado</div>
                            ) : (
                              products.map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleSelectProduct(product)}
                                >
                                  <div className="font-medium text-gray-900">{product.name}</div>
                                  <div className="text-gray-500">
                                    R$ {product.price?.toFixed(2) || '0.00'} - {product.category || 'Sem categoria'}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Campos do Item */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          className="input w-full"
                          value={itemForm.quantity}
                          onChange={(e) => setItemForm({...itemForm, quantity: parseFloat(e.target.value) || 0})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unitário *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input w-full"
                          value={itemForm.unitPrice}
                          onChange={(e) => setItemForm({...itemForm, unitPrice: parseFloat(e.target.value) || 0})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NCM</label>
                        <input
                          type="text"
                          className="input w-full"
                          value={itemForm.ncm}
                          onChange={(e) => setItemForm({...itemForm, ncm: e.target.value})}
                          placeholder="Ex: 12345678"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CFOP</label>
                        <input
                          type="text"
                          className="input w-full"
                          value={itemForm.cfop}
                          onChange={(e) => setItemForm({...itemForm, cfop: e.target.value})}
                          placeholder="Ex: 5102"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ICMS (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          className="input w-full"
                          value={itemForm.icmsRate}
                          onChange={(e) => setItemForm({...itemForm, icmsRate: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IPI (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          className="input w-full"
                          value={itemForm.ipiRate}
                          onChange={(e) => setItemForm({...itemForm, ipiRate: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>

                    {/* Resumo do Item */}
                    {itemForm.quantity > 0 && itemForm.unitPrice > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-blue-900 mb-1">Resumo do Item:</div>
                        <div className="text-sm text-blue-800">
                          {itemForm.productName || 'Produto não selecionado'} - 
                          Qtd: {itemForm.quantity} × R$ {itemForm.unitPrice.toFixed(2)} = 
                          <span className="font-semibold"> R$ {(itemForm.quantity * itemForm.unitPrice).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setShowAddItemModal(false);
                        setEditingItem(null);
                        setItemForm({
                          productId: '',
                          productName: '',
                          quantity: 1,
                          unitPrice: 0,
                          ncm: '',
                          cfop: '5102',
                          icmsRate: 0,
                          ipiRate: 0
                        });
                        setProductSearchTerm('');
    setProductSearchInput('');
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      {editingItem ? 'Atualizar Item' : 'Adicionar Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Seleção de Cliente */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowClientModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Selecionar Cliente</h3>
                  <button type="button" onClick={() => setShowClientModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                <div className="mb-4">
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Buscar cliente..."
                    value={clientSearchTerm}
                    onChange={(e) => handleClientSearchChange(e.target.value)}
                  />
                </div>
                
                <div className="max-h-60 overflow-auto">
                  {clientsLoading ? (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">Buscando...</div>
                  ) : !Array.isArray(clients) || clients.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">Nenhum cliente encontrado</div>
                  ) : (
                    clients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          handleSelectClient(client);
                          setShowClientModal(false);
                        }}
                      >
                        <div className="font-medium text-gray-900">{client.name}</div>
                        <div className="text-gray-500">
                          {client.cnpj || client.cpf || client.email}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Configurações Fiscais */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowSettingsModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <form onSubmit={handleSaveSettings}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Configurações Fiscais</h3>
                    <button 
                      type="button" 
                      onClick={() => setShowSettingsModal(false)} 
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {settingsLoading ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500">Carregando configurações...</div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Dados da Empresa */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-4 pb-2 border-b">Dados da Empresa</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social *</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.companyName}
                              onChange={(e) => setSettingsForm({...settingsForm, companyName: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.cnpj}
                              onChange={(e) => setSettingsForm({...settingsForm, cnpj: e.target.value})}
                              placeholder="00.000.000/0000-00"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.inscricaoEstadual}
                              onChange={(e) => setSettingsForm({...settingsForm, inscricaoEstadual: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Municipal</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.inscricaoMunicipal}
                              onChange={(e) => setSettingsForm({...settingsForm, inscricaoMunicipal: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Regime Tributário *</label>
                            <select
                              className="input w-full"
                              value={settingsForm.regimeTributario}
                              onChange={(e) => setSettingsForm({...settingsForm, regimeTributario: e.target.value})}
                              required
                            >
                              <option value="normal">Normal</option>
                              <option value="simples">Simples Nacional</option>
                              <option value="presumido">Lucro Presumido</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CNAE</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.cnae}
                              onChange={(e) => setSettingsForm({...settingsForm, cnae: e.target.value})}
                              placeholder="0000-0/00"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Endereço da Empresa */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-4 pb-2 border-b">Endereço da Empresa</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rua/Avenida *</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.address.street}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                address: {...settingsForm.address, street: e.target.value}
                              })}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.address.number}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                address: {...settingsForm.address, number: e.target.value}
                              })}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.address.complement}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                address: {...settingsForm.address, complement: e.target.value}
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.address.neighborhood}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                address: {...settingsForm.address, neighborhood: e.target.value}
                              })}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.address.city}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                address: {...settingsForm.address, city: e.target.value}
                              })}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                            <select
                              className="input w-full"
                              value={settingsForm.address.state}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                address: {...settingsForm.address, state: e.target.value}
                              })}
                              required
                            >
                              <option value="AC">Acre</option>
                              <option value="AL">Alagoas</option>
                              <option value="AP">Amapá</option>
                              <option value="AM">Amazonas</option>
                              <option value="BA">Bahia</option>
                              <option value="CE">Ceará</option>
                              <option value="DF">Distrito Federal</option>
                              <option value="ES">Espírito Santo</option>
                              <option value="GO">Goiás</option>
                              <option value="MA">Maranhão</option>
                              <option value="MT">Mato Grosso</option>
                              <option value="MS">Mato Grosso do Sul</option>
                              <option value="MG">Minas Gerais</option>
                              <option value="PA">Pará</option>
                              <option value="PB">Paraíba</option>
                              <option value="PR">Paraná</option>
                              <option value="PE">Pernambuco</option>
                              <option value="PI">Piauí</option>
                              <option value="RJ">Rio de Janeiro</option>
                              <option value="RN">Rio Grande do Norte</option>
                              <option value="RS">Rio Grande do Sul</option>
                              <option value="RO">Rondônia</option>
                              <option value="RR">Roraima</option>
                              <option value="SC">Santa Catarina</option>
                              <option value="SP">São Paulo</option>
                              <option value="SE">Sergipe</option>
                              <option value="TO">Tocantins</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.address.zipCode}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm, 
                                address: {...settingsForm.address, zipCode: e.target.value}
                              })}
                              placeholder="00000-000"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contatos */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-4 pb-2 border-b">Contatos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.phone}
                              onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})}
                              placeholder="(00) 00000-0000"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                            <input
                              type="email"
                              className="input w-full"
                              value={settingsForm.email}
                              onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                            <input
                              type="url"
                              className="input w-full"
                              value={settingsForm.website}
                              onChange={(e) => setSettingsForm({...settingsForm, website: e.target.value})}
                              placeholder="https://www.exemplo.com.br"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Configurações NFe */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-4 pb-2 border-b">Configurações NFe</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ambiente *</label>
                            <select
                              className="input w-full"
                              value={settingsForm.ambienteNFe}
                              onChange={(e) => setSettingsForm({...settingsForm, ambienteNFe: e.target.value})}
                              required
                            >
                              <option value="homologacao">Homologação</option>
                              <option value="producao">Produção</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Série *</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={settingsForm.serieNFe}
                              onChange={(e) => setSettingsForm({...settingsForm, serieNFe: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo NFe *</label>
                            <select
                              className="input w-full"
                              value={settingsForm.modeloNFe}
                              onChange={(e) => setSettingsForm({...settingsForm, modeloNFe: e.target.value})}
                              required
                            >
                              <option value="55">55 - NF-e (Nota Fiscal Eletrônica)</option>
                              <option value="65">65 - NFC-e (Nota Fiscal de Consumidor Eletrônica)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Impostos Padrão */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-4 pb-2 border-b">Impostos Padrão (%)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ICMS</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              className="input w-full"
                              value={settingsForm.icmsPadrao}
                              onChange={(e) => setSettingsForm({...settingsForm, icmsPadrao: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">IPI</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              className="input w-full"
                              value={settingsForm.ipiPadrao}
                              onChange={(e) => setSettingsForm({...settingsForm, ipiPadrao: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">PIS</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              className="input w-full"
                              value={settingsForm.pisPadrao}
                              onChange={(e) => setSettingsForm({...settingsForm, pisPadrao: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">COFINS</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              className="input w-full"
                              value={settingsForm.cofinsPadrao}
                              onChange={(e) => setSettingsForm({...settingsForm, cofinsPadrao: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary w-full sm:w-auto sm:ml-3"
                    disabled={settingsLoading}
                  >
                    {settingsLoading ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0"
                    onClick={() => setShowSettingsModal(false)}
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
