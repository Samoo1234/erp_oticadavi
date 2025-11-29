import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  Printer,
  Calendar,
  User,
  Phone,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import { buscarClientesCentral } from '../services/supabaseCentral';

// Dados mockados removidos - agora carregamos do backend

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

type TSO = {
  id: string;
  tsoNumber: string;
  clientId: string;
  clientName: string;
  clientCpf?: string;
  clientAddress?: string;
  clientNeighborhood?: string;
  clientCity?: string;
  clientState?: string;
  emissionDate: string;
  deliveryDate: string;
  deliveryTime: string;
  vendedor: string;
  prescription: {
    addition: number;
    longe: {
      rightEye: { sphere: number; cylinder: number; axis: number; dp: number; altura: number; dnp: number };
      leftEye: { sphere: number; cylinder: number; axis: number; dp: number; altura: number; dnp: number };
    };
    perto: {
      rightEye: { sphere: number; cylinder: number; axis: number; dp: number; altura: number; dnp?: number };
      leftEye: { sphere: number; cylinder: number; axis: number; dp: number; altura: number; dnp?: number };
    };
  };
  frame: {
    type: string;
    value: number;
  };
  lens: {
    code: number;
    type: string;
    material: string;
    value: number;
  };
  totalValue: number;
  status: 'pending' | 'completed';
};

export const TSO: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Input local para exibição
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTSO, setSelectedTSO] = useState<any>(null);
  const [showTSOModal, setShowTSOModal] = useState(false);
  const [showNewTSOModal, setShowNewTSOModal] = useState(false);
  const [showEditTSOModal, setShowEditTSOModal] = useState(false);
  const [editingTSO, setEditingTSO] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientSearchInput, setClientSearchInput] = useState(''); // Input local para exibição
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [tsos, setTsos] = useState<TSO[]>([]);
  const [tsosLoading, setTsosLoading] = useState(false);
  const [tsosPage, setTsosPage] = useState(1);
  const [tsosTotal, setTsosTotal] = useState(0);
  const [tsosLimit] = useState(10);
  const [tsoForm, setTsoForm] = useState({
    clientId: '',
    emissionDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    deliveryTime: '',
    vendedor: '',
    prescription: {
      addition: '',
      longe: {
        rightEye: { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' },
        leftEye: { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' }
      },
      perto: {
        rightEye: { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' },
        leftEye: { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' }
      }
    },
    frame: {
      type: '',
      value: ''
    },
    lens: {
      code: '',
      type: '',
      material: '',
      value: ''
    },
    totalValue: '',
    laboratory: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Buscar clientes do banco central
  const fetchClients = async (search: string = '') => {
    try {
      setLoading(true);
      const clientesCentral = await buscarClientesCentral(search, 50);
      setClients(clientesCentral);
    } catch (e) {
      console.error('Erro ao carregar clientes do banco central', e);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar TSOs do backend
  const fetchTSOs = async (search: string = '', page: number = 1) => {
    try {
      setTsosLoading(true);
      const params: any = { page, limit: tsosLimit };
      if (search) params.search = search;
      
      const res = await api.get('/tso', { params });
      const payload = res.data?.data;
      setTsos(payload?.tsos || []);
      setTsosTotal(payload?.total || 0);
      setTsosPage(page);
    } catch (e) {
      console.error('Erro ao carregar TSOs', e);
    } finally {
      setTsosLoading(false);
    }
  };

  // Debounce da busca de clientes
  const debouncedClientSearch = useMemo(() => {
    let timeout: any;
    return (value: string) => {
      setClientSearchInput(value); // Atualiza input imediatamente
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setClientSearchTerm(value);
        fetchClients(value);
      }, 400);
    };
  }, []);

  // Debounce da busca de TSOs
  const debouncedTSOSearch = useMemo(() => {
    let timeout: any;
    return (value: string) => {
      setSearchInput(value); // Atualiza input imediatamente
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSearchTerm(value);
        fetchTSOs(value, 1);
      }, 400);
    };
  }, []);

  useEffect(() => {
    fetchClients();
    fetchTSOs();
  }, []);


  const handleViewTSO = async (tso: any) => {
    try {
      const response = await api.get(`/tso/${tso.id}`);
      if (response.data?.success) {
        setSelectedTSO(response.data.data);
        setShowTSOModal(true);
      } else {
        alert('Não foi possível carregar os detalhes do TSO');
      }
    } catch (e) {
      console.error('Erro ao carregar detalhes do TSO', e);
      alert('Erro ao carregar detalhes do TSO');
    }
  };

  const handleEditTSO = async (tso: any) => {
    try {
      // Buscar dados completos do TSO
      const response = await api.get(`/tso/${tso.id}`);
      if (response.data.success) {
        const fullTSO = response.data.data;
        setEditingTSO(fullTSO);
        
        // Preencher formulário com dados existentes
        setTsoForm({
          clientId: fullTSO.client_id,
          emissionDate: fullTSO.emission_date ? new Date(fullTSO.emission_date).toISOString().split('T')[0] : '',
          deliveryDate: fullTSO.delivery_date ? new Date(fullTSO.delivery_date).toISOString().split('T')[0] : '',
          deliveryTime: fullTSO.delivery_time || '',
          vendedor: fullTSO.vendedor || '',
          prescription: fullTSO.prescriptions ? {
            addition: fullTSO.prescriptions.addition || '',
            longe: {
              rightEye: fullTSO.prescriptions.right_eye_longe || { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' },
              leftEye: fullTSO.prescriptions.left_eye_longe || { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' }
            },
            perto: {
              rightEye: fullTSO.prescriptions.right_eye_perto || { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' },
              leftEye: fullTSO.prescriptions.left_eye_perto || { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' }
            }
          } : {
            addition: '',
            longe: {
              rightEye: { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' },
              leftEye: { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' }
            },
            perto: {
              rightEye: { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' },
              leftEye: { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' }
            }
          },
          frame: {
            type: fullTSO.sale_items?.find((item: any) => item.item_type === 'frame')?.frame_specifications?.type || '',
            value: fullTSO.sale_items?.find((item: any) => item.item_type === 'frame')?.unit_price || ''
          },
          lens: {
            code: fullTSO.sale_items?.find((item: any) => item.item_type === 'lens')?.lens_specifications?.code || '',
            type: fullTSO.sale_items?.find((item: any) => item.item_type === 'lens')?.lens_specifications?.type || '',
            material: fullTSO.sale_items?.find((item: any) => item.item_type === 'lens')?.lens_specifications?.material || '',
            value: fullTSO.sale_items?.find((item: any) => item.item_type === 'lens')?.unit_price || ''
          },
          totalValue: fullTSO.total || '',
          laboratory: fullTSO.laboratory || '',
          notes: fullTSO.notes || ''
        });

        // Definir cliente selecionado
        if (fullTSO.clients) {
          setSelectedClient(fullTSO.clients);
          setClientSearchTerm(fullTSO.clients.name);
          setClientSearchInput(fullTSO.clients.name);
        }

        setShowEditTSOModal(true);
      }
    } catch (error) {
      console.error('Erro ao carregar TSO para edição:', error);
      alert('Erro ao carregar dados do TSO');
    }
  };

  const handleUpdateTSO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTSO) return;

    const errs: Record<string, string> = {};
    
    if (!tsoForm.clientId) errs.clientId = 'Cliente obrigatório';
    if (!tsoForm.emissionDate) errs.emissionDate = 'Data de emissão obrigatória';
    if (!tsoForm.deliveryDate) errs.deliveryDate = 'Data de entrega obrigatória';
    if (!tsoForm.deliveryTime) errs.deliveryTime = 'Hora de entrega obrigatória';
    if (!tsoForm.vendedor) errs.vendedor = 'Vendedor obrigatório';
    
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      // Por enquanto apenas simular atualização
      alert('TSO atualizado com sucesso! (Funcionalidade em desenvolvimento)');
      setShowEditTSOModal(false);
      setEditingTSO(null);
      fetchTSOs(searchTerm, tsosPage);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao atualizar TSO';
      alert(msg);
    }
  };

  const handlePrintTSO = async (tso: any) => {
    try {
      // Buscar dados completos do TSO antes de imprimir
      const response = await api.get(`/tso/${tso.id}`);
      if (!response.data?.success) {
        alert('Não foi possível carregar os detalhes do TSO para impressão');
        return;
      }
      
      const fullTSO = response.data.data;
      const cliente = fullTSO.clients || {};
      const armacao = fullTSO.sale_items?.find((i: any) => i.item_type === 'frame') || {};
      const lente = fullTSO.sale_items?.find((i: any) => i.item_type === 'lens') || {};
      const rx = fullTSO.prescriptions || {};

    const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>TSO ${fullTSO.tso_number}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; }
          .sheet { width: 190mm; margin: 0 auto; }
          .row { display: grid; grid-template-columns: repeat(12, 1fr); gap: 2mm; }
          .mt { margin-top: 4mm; }
          .box { border: 1px solid #000; padding: 2mm 3mm; font-size: 11px; }
          .title { text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 3mm; }
          .header { text-align: center; font-size: 12px; }
          .label { font-weight: bold; }
          .right { text-align: right; }
          .center { text-align: center; }
          .small { font-size: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 2mm; font-size: 11px; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body onload="window.print()">
        <div class="sheet">
          <div class="header">
            <div class="title">ÓTICA DAVI</div>
            <div>RUA PRESIDENTE TANCREDO NEVES, 465 - CENTRO - MANTENA - MG - Cep: 35290-000</div>
            <div>Fone: (033) 3241-5700 / 3241-5700</div>
          </div>

          <div class="row mt">
            <div class="box center" style="grid-column: span 3">Dt Emissão:<br>${fullTSO.emission_date ? new Date(fullTSO.emission_date).toLocaleDateString('pt-BR') : ''}</div>
            <div class="box center" style="grid-column: span 3">Dt Entrega:<br>${fullTSO.delivery_date ? new Date(fullTSO.delivery_date).toLocaleDateString('pt-BR') : ''}</div>
            <div class="box center" style="grid-column: span 2">Hora:<br>${fullTSO.delivery_time || ''}</div>
            <div class="box center" style="grid-column: span 2">Nº Recibo:<br>${fullTSO.tso_number || ''}</div>
            <div class="box" style="grid-column: span 2">Vendedor:<br>${fullTSO.vendedor || ''}</div>
          </div>

          <div class="row mt">
            <div class="box" style="grid-column: span 8">Cliente: ${cliente.name || ''}</div>
            <div class="box" style="grid-column: span 2">CPF/CNPJ: ${cliente.cpf || ''}</div>
            <div class="box" style="grid-column: span 2">Rg: ${cliente.rg || ''}</div>
          </div>

          <div class="row">
            <div class="box" style="grid-column: span 8">Endereço: ${cliente.address?.street || ''}</div>
            <div class="box" style="grid-column: span 2">Bairro: ${cliente.neighborhood || ''}</div>
            <div class="box" style="grid-column: span 2">Cep: ${cliente.address?.zipCode || ''}</div>
          </div>

          <div class="row">
            <div class="box" style="grid-column: span 6">Cidade: ${cliente.city || cliente.address?.city || ''}</div>
            <div class="box" style="grid-column: span 2">UF: ${cliente.state || cliente.address?.state || ''}</div>
            <div class="box" style="grid-column: span 4">Médico: ${rx.doctor_name || ''}</div>
          </div>

          <div class="mt">
            <table>
              <thead>
                <tr>
                  <th class="center" style="width:20mm">Adição</th>
                  <th class="center">Esférico</th>
                  <th class="center">Cilindro</th>
                  <th class="center">Eixo</th>
                  <th class="center">DNP</th>
                  <th class="center">DP</th>
                  <th class="center">Altura</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="center">${rx.addition ?? ''}</td>
                  <td class="center">${rx.right_eye_longe?.sphere ?? ''}</td>
                  <td class="center">${rx.right_eye_longe?.cylinder ?? ''}</td>
                  <td class="center">${rx.right_eye_longe?.axis ?? ''}</td>
                  <td class="center">${rx.right_eye_longe?.dnp ?? ''}</td>
                  <td class="center">${rx.right_eye_longe?.dp ?? ''}</td>
                  <td class="center">${rx.right_eye_longe?.altura ?? ''}</td>
                </tr>
                <tr>
                  <td class="center"></td>
                  <td class="center">${rx.left_eye_longe?.sphere ?? ''}</td>
                  <td class="center">${rx.left_eye_longe?.cylinder ?? ''}</td>
                  <td class="center">${rx.left_eye_longe?.axis ?? ''}</td>
                  <td class="center">${rx.left_eye_longe?.dnp ?? ''}</td>
                  <td class="center">${rx.left_eye_longe?.dp ?? ''}</td>
                  <td class="center">${rx.left_eye_longe?.altura ?? ''}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="row mt">
            <div class="box" style="grid-column: span 3">Armação:</div>
            <div class="box" style="grid-column: span 3">Lente:</div>
            <div class="box" style="grid-column: span 3">Tipo: ACETATO CLIENTE</div>
            <div class="box right" style="grid-column: span 3">Valor: R$ ${(armacao.unit_price ?? 0).toFixed(2)}</div>
          </div>

          <div class="row">
            <div class="box" style="grid-column: span 3">${armacao.frame_specifications?.type || ''}</div>
            <div class="box" style="grid-column: span 3">${lente.lens_specifications?.type || ''}</div>
            <div class="box" style="grid-column: span 3">${lente.lens_specifications?.material || ''}</div>
            <div class="box right" style="grid-column: span 3">Valor: R$ ${(lente.unit_price ?? 0).toFixed(2)}</div>
          </div>

          <div class="row mt">
            <div class="box" style="grid-column: span 6">Laboratório: ${fullTSO.laboratory || ''}</div>
            <div class="box right" style="grid-column: span 6">Total: R$ ${(Number(fullTSO.total || 0)).toFixed(2)}</div>
          </div>

          <div class="row mt">
            <div class="box" style="grid-column: span 12">Observações: ${fullTSO.notes || ''}</div>
          </div>

          <div class="row mt">
            <div class="box center" style="grid-column: span 12; height: 18mm; display:flex; align-items:flex-end; justify-content:center;">_________________________________<br/><span class="small">Assinatura do Cliente</span></div>
          </div>
        </div>
      </body>
    </html>`;

      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(html);
      w.document.close();
    } catch (error) {
      console.error('Erro ao imprimir TSO:', error);
      alert('Erro ao carregar dados do TSO para impressão');
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setTsoForm({...tsoForm, clientId: client.id});
    setClientSearchTerm(client.name);
    setClientSearchInput(client.name);
  };

  const handleCreateTSO = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    
    if (!tsoForm.clientId) errs.clientId = 'Cliente obrigatório';
    if (!tsoForm.emissionDate) errs.emissionDate = 'Data de emissão obrigatória';
    if (!tsoForm.deliveryDate) errs.deliveryDate = 'Data de entrega obrigatória';
    if (!tsoForm.deliveryTime) errs.deliveryTime = 'Hora de entrega obrigatória';
    if (!tsoForm.vendedor) errs.vendedor = 'Vendedor obrigatório';
    
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      const response = await api.post('/tso', {
        clientId: tsoForm.clientId,
        emissionDate: tsoForm.emissionDate,
        deliveryDate: tsoForm.deliveryDate,
        deliveryTime: tsoForm.deliveryTime,
        vendedor: tsoForm.vendedor,
        prescription: tsoForm.prescription,
        frame: tsoForm.frame,
        lens: tsoForm.lens,
        totalValue: tsoForm.totalValue,
        laboratory: tsoForm.laboratory,
        notes: tsoForm.notes
      });

      if (response.data.success) {
        alert('TSO criado com sucesso!');
        setShowNewTSOModal(false);
        setTsoForm({
          clientId: '',
          emissionDate: new Date().toISOString().split('T')[0],
          deliveryDate: '',
          deliveryTime: '',
          vendedor: '',
          prescription: {
            addition: '',
            longe: {
              rightEye: { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' },
              leftEye: { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' }
            },
            perto: {
              rightEye: { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' },
              leftEye: { sphere: '', cylinder: '', axis: '', dp: '', altura: '', dnp: '' }
            }
          },
          frame: {
            type: '',
            value: ''
          },
          lens: {
            code: '',
            type: '',
            material: '',
            value: ''
          },
          totalValue: '',
          laboratory: '',
          notes: ''
        });
        setSelectedClient(null);
        setClientSearchTerm('');
        setClientSearchInput('');
        // Recarregar lista de TSOs
        fetchTSOs(searchTerm, 1);
      } else {
        alert(response.data.message || 'Erro ao criar TSO');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao criar TSO';
      alert(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TSO - Talão de Serviços Ópticos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os talões de serviços da ótica ({tsosTotal} TSOs)
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
          <button className="btn btn-primary" onClick={() => setShowNewTSOModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo TSO
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, CPF ou número TSO..."
                  className="input pl-10"
                  value={searchInput}
                  onChange={(e) => debouncedTSOSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TSO List */}
      <div className="card">
        <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº TSO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
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
              {tsosLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Carregando TSOs...
                  </td>
                </tr>
              ) : tsos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Nenhum TSO encontrado
                  </td>
                </tr>
              ) : (
                tsos.map((tso: any) => (
                  <tr key={tso.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tso.tso_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tso.clients?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tso.clients?.cpf || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tso.emission_date ? new Date(tso.emission_date).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tso.delivery_time || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R$ {tso.total ? parseFloat(tso.total).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tso.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        tso.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        tso.status === 'ready' ? 'bg-green-100 text-green-800' :
                        tso.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tso.status === 'pending' ? 'Pendente' : 
                         tso.status === 'confirmed' ? 'Confirmado' :
                         tso.status === 'ready' ? 'Pronto' :
                         tso.status === 'delivered' ? 'Entregue' :
                         'Desconhecido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleViewTSO(tso)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handlePrintTSO(tso)}
                          className="text-green-600 hover:text-green-900" 
                          title="Imprimir"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditTSO(tso)}
                          className="text-indigo-600 hover:text-indigo-900" 
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        {tsosTotal > tsosLimit && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchTSOs(searchTerm, Math.max(1, tsosPage - 1))}
                disabled={tsosPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => fetchTSOs(searchTerm, tsosPage + 1)}
                disabled={tsosPage * tsosLimit >= tsosTotal}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{Math.min((tsosPage - 1) * tsosLimit + 1, tsosTotal)}</span> até{' '}
                  <span className="font-medium">{Math.min(tsosPage * tsosLimit, tsosTotal)}</span> de{' '}
                  <span className="font-medium">{tsosTotal}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => fetchTSOs(searchTerm, Math.max(1, tsosPage - 1))}
                    disabled={tsosPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Anterior</span>
                    ←
                  </button>
                  <button
                    onClick={() => fetchTSOs(searchTerm, tsosPage + 1)}
                    disabled={tsosPage * tsosLimit >= tsosTotal}
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

      {/* Modal Novo TSO */}
      {showNewTSOModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowNewTSOModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <form onSubmit={handleCreateTSO}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Novo TSO</h3>
                    <button type="button" onClick={() => setShowNewTSOModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
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
                          value={clientSearchInput}
                          onChange={(e) => debouncedClientSearch(e.target.value)}
                        />
                      </div>
                      {formErrors.clientId && <p className="mt-1 text-sm text-red-600">{formErrors.clientId}</p>}
                      
                      {/* Lista de clientes */}
                      {clientSearchInput && clients.length > 0 && (
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
                                setClientSearchInput('');
                                setTsoForm({...tsoForm, clientId: ''});
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Datas e Vendedor */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão *</label>
                        <input
                          type="date"
                          className={`input w-full ${formErrors.emissionDate ? 'border-red-500' : ''}`}
                          value={tsoForm.emissionDate}
                          onChange={(e) => setTsoForm({...tsoForm, emissionDate: e.target.value})}
                        />
                        {formErrors.emissionDate && <p className="mt-1 text-sm text-red-600">{formErrors.emissionDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega *</label>
                        <input
                          type="date"
                          className={`input w-full ${formErrors.deliveryDate ? 'border-red-500' : ''}`}
                          value={tsoForm.deliveryDate}
                          onChange={(e) => setTsoForm({...tsoForm, deliveryDate: e.target.value})}
                        />
                        {formErrors.deliveryDate && <p className="mt-1 text-sm text-red-600">{formErrors.deliveryDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Entrega *</label>
                        <input
                          type="time"
                          className={`input w-full ${formErrors.deliveryTime ? 'border-red-500' : ''}`}
                          value={tsoForm.deliveryTime}
                          onChange={(e) => setTsoForm({...tsoForm, deliveryTime: e.target.value})}
                        />
                        {formErrors.deliveryTime && <p className="mt-1 text-sm text-red-600">{formErrors.deliveryTime}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor *</label>
                      <input
                        type="text"
                        className={`input w-full ${formErrors.vendedor ? 'border-red-500' : ''}`}
                        value={tsoForm.vendedor}
                        onChange={(e) => setTsoForm({...tsoForm, vendedor: e.target.value})}
                        placeholder="Nome do vendedor"
                      />
                      {formErrors.vendedor && <p className="mt-1 text-sm text-red-600">{formErrors.vendedor}</p>}
                    </div>

                    {/* Prescrição */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Prescrição</h4>
                      
                      {/* Adição - No topo */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adição</label>
                        <input
                          type="number"
                          step="0.25"
                          className="input w-32"
                          placeholder="Ex: 2.25"
                          value={tsoForm.prescription.addition}
                          onChange={(e) => setTsoForm({
                            ...tsoForm,
                            prescription: { ...tsoForm.prescription, addition: e.target.value }
                          })}
                        />
                      </div>

                      {/* Tabela de Prescrição - Estilo similar ao documento físico */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-2 py-2 text-left font-medium text-gray-700 w-20"></th>
                              <th className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-700">Esférico</th>
                              <th className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-700">Cilíndrico</th>
                              <th className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-700">Eixo</th>
                              <th className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-700">D.P.</th>
                              <th className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-700">Altura</th>
                              <th className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-700" colSpan={2}>D.N.P.</th>
                            </tr>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 px-2 py-1"></th>
                              <th className="border border-gray-300 px-2 py-1 text-center text-xs text-gray-500">(+/-)</th>
                              <th className="border border-gray-300 px-2 py-1 text-center text-xs text-gray-500">(+/-)</th>
                              <th className="border border-gray-300 px-2 py-1 text-center text-xs text-gray-500">(°)</th>
                              <th className="border border-gray-300 px-2 py-1 text-center text-xs text-gray-500">(mm)</th>
                              <th className="border border-gray-300 px-2 py-1 text-center text-xs text-gray-500">(mm)</th>
                              <th className="border border-gray-300 px-2 py-1 text-center text-xs text-gray-500">O.D.</th>
                              <th className="border border-gray-300 px-2 py-1 text-center text-xs text-gray-500">O.E.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* LONGE */}
                            <tr className="bg-blue-50">
                              <td className="border border-gray-300 px-2 py-1 font-medium text-gray-700" colSpan={8}>Longe</td>
                            </tr>
                            {/* Longe - OD */}
                            <tr>
                              <td className="border border-gray-300 px-2 py-1 font-medium text-gray-600">O.D.</td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.25" className="input text-sm w-full text-center" placeholder="0.00"
                                  value={tsoForm.prescription.longe.rightEye.sphere}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, longe: {...tsoForm.prescription.longe, rightEye: {...tsoForm.prescription.longe.rightEye, sphere: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.25" className="input text-sm w-full text-center" placeholder="0.00"
                                  value={tsoForm.prescription.longe.rightEye.cylinder}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, longe: {...tsoForm.prescription.longe, rightEye: {...tsoForm.prescription.longe.rightEye, cylinder: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" className="input text-sm w-full text-center" placeholder="0"
                                  value={tsoForm.prescription.longe.rightEye.axis}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, longe: {...tsoForm.prescription.longe, rightEye: {...tsoForm.prescription.longe.rightEye, axis: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.5" className="input text-sm w-full text-center" placeholder="0.0"
                                  value={tsoForm.prescription.longe.rightEye.dp}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, longe: {...tsoForm.prescription.longe, rightEye: {...tsoForm.prescription.longe.rightEye, dp: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.5" className="input text-sm w-full text-center" placeholder="0.0"
                                  value={tsoForm.prescription.longe.rightEye.altura}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, longe: {...tsoForm.prescription.longe, rightEye: {...tsoForm.prescription.longe.rightEye, altura: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.5" className="input text-sm w-full text-center" placeholder="0.0"
                                  value={tsoForm.prescription.longe.rightEye.dnp}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, longe: {...tsoForm.prescription.longe, rightEye: {...tsoForm.prescription.longe.rightEye, dnp: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1 bg-gray-50"></td>
                            </tr>
                            {/* Longe - OE */}
                            <tr>
                              <td className="border border-gray-300 px-2 py-1 font-medium text-gray-600">O.E.</td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.25" className="input text-sm w-full text-center" placeholder="0.00"
                                  value={tsoForm.prescription.longe.leftEye.sphere}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, longe: {...tsoForm.prescription.longe, leftEye: {...tsoForm.prescription.longe.leftEye, sphere: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.25" className="input text-sm w-full text-center" placeholder="0.00"
                                  value={tsoForm.prescription.longe.leftEye.cylinder}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, longe: {...tsoForm.prescription.longe, leftEye: {...tsoForm.prescription.longe.leftEye, cylinder: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" className="input text-sm w-full text-center" placeholder="0"
                                  value={tsoForm.prescription.longe.leftEye.axis}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, longe: {...tsoForm.prescription.longe, leftEye: {...tsoForm.prescription.longe.leftEye, axis: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.5" className="input text-sm w-full text-center" placeholder="0.0"
                                  value={tsoForm.prescription.longe.leftEye.dp}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, longe: {...tsoForm.prescription.longe, leftEye: {...tsoForm.prescription.longe.leftEye, dp: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.5" className="input text-sm w-full text-center" placeholder="0.0"
                                  value={tsoForm.prescription.longe.leftEye.altura}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, longe: {...tsoForm.prescription.longe, leftEye: {...tsoForm.prescription.longe.leftEye, altura: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1 bg-gray-50"></td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.5" className="input text-sm w-full text-center" placeholder="0.0"
                                  value={tsoForm.prescription.longe.leftEye.dnp}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, longe: {...tsoForm.prescription.longe, leftEye: {...tsoForm.prescription.longe.leftEye, dnp: e.target.value}}}})} />
                              </td>
                            </tr>
                            {/* PERTO */}
                            <tr className="bg-green-50">
                              <td className="border border-gray-300 px-2 py-1 font-medium text-gray-700" colSpan={8}>Perto</td>
                            </tr>
                            {/* Perto - OD */}
                            <tr>
                              <td className="border border-gray-300 px-2 py-1 font-medium text-gray-600">O.D.</td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.25" className="input text-sm w-full text-center" placeholder="0.00"
                                  value={tsoForm.prescription.perto.rightEye.sphere}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, perto: {...tsoForm.prescription.perto, rightEye: {...tsoForm.prescription.perto.rightEye, sphere: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.25" className="input text-sm w-full text-center" placeholder="0.00"
                                  value={tsoForm.prescription.perto.rightEye.cylinder}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, perto: {...tsoForm.prescription.perto, rightEye: {...tsoForm.prescription.perto.rightEye, cylinder: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" className="input text-sm w-full text-center" placeholder="0"
                                  value={tsoForm.prescription.perto.rightEye.axis}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, perto: {...tsoForm.prescription.perto, rightEye: {...tsoForm.prescription.perto.rightEye, axis: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.5" className="input text-sm w-full text-center" placeholder="0.0"
                                  value={tsoForm.prescription.perto.rightEye.dp}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, perto: {...tsoForm.prescription.perto, rightEye: {...tsoForm.prescription.perto.rightEye, dp: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.5" className="input text-sm w-full text-center" placeholder="0.0"
                                  value={tsoForm.prescription.perto.rightEye.altura}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, perto: {...tsoForm.prescription.perto, rightEye: {...tsoForm.prescription.perto.rightEye, altura: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1 bg-gray-50" colSpan={2}></td>
                            </tr>
                            {/* Perto - OE */}
                            <tr>
                              <td className="border border-gray-300 px-2 py-1 font-medium text-gray-600">O.E.</td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.25" className="input text-sm w-full text-center" placeholder="0.00"
                                  value={tsoForm.prescription.perto.leftEye.sphere}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, perto: {...tsoForm.prescription.perto, leftEye: {...tsoForm.prescription.perto.leftEye, sphere: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.25" className="input text-sm w-full text-center" placeholder="0.00"
                                  value={tsoForm.prescription.perto.leftEye.cylinder}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, perto: {...tsoForm.prescription.perto, leftEye: {...tsoForm.prescription.perto.leftEye, cylinder: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" className="input text-sm w-full text-center" placeholder="0"
                                  value={tsoForm.prescription.perto.leftEye.axis}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, perto: {...tsoForm.prescription.perto, leftEye: {...tsoForm.prescription.perto.leftEye, axis: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.5" className="input text-sm w-full text-center" placeholder="0.0"
                                  value={tsoForm.prescription.perto.leftEye.dp}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, perto: {...tsoForm.prescription.perto, leftEye: {...tsoForm.prescription.perto.leftEye, dp: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1">
                                <input type="number" step="0.5" className="input text-sm w-full text-center" placeholder="0.0"
                                  value={tsoForm.prescription.perto.leftEye.altura}
                                  onChange={(e) => setTsoForm({...tsoForm, prescription: {...tsoForm.prescription, perto: {...tsoForm.prescription.perto, leftEye: {...tsoForm.prescription.perto.leftEye, altura: e.target.value}}}})} />
                              </td>
                              <td className="border border-gray-300 px-1 py-1 bg-gray-50" colSpan={2}></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Armação e Lentes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Armação</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <input
                              type="text"
                              className="input w-full"
                              placeholder="Ex: ACETATO CLIENTE"
                              value={tsoForm.frame.type}
                              onChange={(e) => setTsoForm({
                                ...tsoForm,
                                frame: { ...tsoForm.frame, type: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input w-full"
                              placeholder="0.00"
                              value={tsoForm.frame.value}
                              onChange={(e) => setTsoForm({
                                ...tsoForm,
                                frame: { ...tsoForm.frame, value: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Lentes</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <input
                              type="text"
                              className="input w-full"
                              placeholder="Ex: LENTE MULTIFOCAL"
                              value={tsoForm.lens.type}
                              onChange={(e) => setTsoForm({
                                ...tsoForm,
                                lens: { ...tsoForm.lens, type: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                            <input
                              type="text"
                              className="input w-full"
                              placeholder="Ex: VS BRANCA LT CR39 ORGaline"
                              value={tsoForm.lens.material}
                              onChange={(e) => setTsoForm({
                                ...tsoForm,
                                lens: { ...tsoForm.lens, material: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input w-full"
                              placeholder="0.00"
                              value={tsoForm.lens.value}
                              onChange={(e) => setTsoForm({
                                ...tsoForm,
                                lens: { ...tsoForm.lens, value: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Laboratório e Observações */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Laboratório</label>
                        <input
                          type="text"
                          className="input w-full"
                          placeholder="Nome do laboratório"
                          value={tsoForm.laboratory}
                          onChange={(e) => setTsoForm({...tsoForm, laboratory: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input w-full"
                          placeholder="0.00"
                          value={tsoForm.totalValue}
                          onChange={(e) => setTsoForm({...tsoForm, totalValue: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                      <textarea
                        className="input w-full h-20"
                        placeholder="Observações adicionais..."
                        value={tsoForm.notes}
                        onChange={(e) => setTsoForm({...tsoForm, notes: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto sm:ml-3">Criar TSO</button>
                  <button type="button" onClick={() => setShowNewTSOModal(false)} className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TSO Detail Modal */}
      {showTSOModal && selectedTSO && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowTSOModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">TSO #{selectedTSO.tsoNumber}</h3>
                  <button 
                    onClick={() => setShowTSOModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
                      <p className="text-sm text-gray-600">{selectedTSO.clients?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">CPF: {selectedTSO.clients?.cpf || 'N/A'}</p>
                      <p className="text-sm text-gray-600">
                        {selectedTSO.clients?.address?.street || ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedTSO.clients?.neighborhood || ''}{selectedTSO.clients?.neighborhood ? ', ' : ''}
                        {selectedTSO.clients?.city || ''}{selectedTSO.clients?.state ? `-${selectedTSO.clients.state}` : ''}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Datas</h4>
                      <p className="text-sm text-gray-600">Emissão: {selectedTSO.emission_date ? new Date(selectedTSO.emission_date).toLocaleDateString('pt-BR') : 'N/A'}</p>
                      <p className="text-sm text-gray-600">Entrega: {selectedTSO.delivery_date ? new Date(selectedTSO.delivery_date).toLocaleDateString('pt-BR') : 'N/A'} {selectedTSO.delivery_time ? `às ${selectedTSO.delivery_time}` : ''}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Prescrição - Longe</h4>
                      <p className="text-sm text-gray-600">OD: {selectedTSO.prescriptions?.right_eye_longe?.sphere ?? ''} / {selectedTSO.prescriptions?.right_eye_longe?.cylinder ?? ''} / {selectedTSO.prescriptions?.right_eye_longe?.axis ?? ''}°</p>
                      <p className="text-sm text-gray-600">OE: {selectedTSO.prescriptions?.left_eye_longe?.sphere ?? ''} / {selectedTSO.prescriptions?.left_eye_longe?.cylinder ?? ''} / {selectedTSO.prescriptions?.left_eye_longe?.axis ?? ''}°</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Armação</h4>
                      <p className="text-sm text-gray-600">{selectedTSO.sale_items?.find((i: any) => i.item_type === 'frame')?.frame_specifications?.type || '—'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Lente</h4>
                      <p className="text-sm text-gray-600">{selectedTSO.sale_items?.find((i: any) => i.item_type === 'lens')?.lens_specifications?.type || '—'}</p>
                      <p className="text-sm text-gray-600">{selectedTSO.sale_items?.find((i: any) => i.item_type === 'lens')?.lens_specifications?.material || '—'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Valor Total</h4>
                      <p className="text-lg font-semibold text-gray-900">R$ {Number(selectedTSO.total ?? 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-primary ml-2"
                  onClick={() => {/* Implementar impressão */}}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowTSOModal(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar TSO */}
      {showEditTSOModal && editingTSO && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditTSOModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <form onSubmit={handleUpdateTSO}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Editar TSO - {editingTSO.tso_number}</h3>
                    <button type="button" onClick={() => setShowEditTSOModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
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
                          value={clientSearchInput}
                          onChange={(e) => debouncedClientSearch(e.target.value)}
                        />
                      </div>
                      {formErrors.clientId && <p className="mt-1 text-sm text-red-600">{formErrors.clientId}</p>}
                      
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
                                setClientSearchInput('');
                                setTsoForm({...tsoForm, clientId: ''});
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Datas e Vendedor */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão *</label>
                        <input
                          type="date"
                          className={`input w-full ${formErrors.emissionDate ? 'border-red-500' : ''}`}
                          value={tsoForm.emissionDate}
                          onChange={(e) => setTsoForm({...tsoForm, emissionDate: e.target.value})}
                        />
                        {formErrors.emissionDate && <p className="mt-1 text-sm text-red-600">{formErrors.emissionDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega *</label>
                        <input
                          type="date"
                          className={`input w-full ${formErrors.deliveryDate ? 'border-red-500' : ''}`}
                          value={tsoForm.deliveryDate}
                          onChange={(e) => setTsoForm({...tsoForm, deliveryDate: e.target.value})}
                        />
                        {formErrors.deliveryDate && <p className="mt-1 text-sm text-red-600">{formErrors.deliveryDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Entrega *</label>
                        <input
                          type="time"
                          className={`input w-full ${formErrors.deliveryTime ? 'border-red-500' : ''}`}
                          value={tsoForm.deliveryTime}
                          onChange={(e) => setTsoForm({...tsoForm, deliveryTime: e.target.value})}
                        />
                        {formErrors.deliveryTime && <p className="mt-1 text-sm text-red-600">{formErrors.deliveryTime}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor *</label>
                      <input
                        type="text"
                        className={`input w-full ${formErrors.vendedor ? 'border-red-500' : ''}`}
                        value={tsoForm.vendedor}
                        onChange={(e) => setTsoForm({...tsoForm, vendedor: e.target.value})}
                        placeholder="Nome do vendedor"
                      />
                      {formErrors.vendedor && <p className="mt-1 text-sm text-red-600">{formErrors.vendedor}</p>}
                    </div>

                    {/* Laboratório e Observações */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Laboratório</label>
                        <input
                          type="text"
                          className="input w-full"
                          placeholder="Nome do laboratório"
                          value={tsoForm.laboratory}
                          onChange={(e) => setTsoForm({...tsoForm, laboratory: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input w-full"
                          placeholder="0.00"
                          value={tsoForm.totalValue}
                          onChange={(e) => setTsoForm({...tsoForm, totalValue: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                      <textarea
                        className="input w-full h-20"
                        placeholder="Observações adicionais..."
                        value={tsoForm.notes}
                        onChange={(e) => setTsoForm({...tsoForm, notes: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto sm:ml-3">Atualizar TSO</button>
                  <button type="button" onClick={() => setShowEditTSOModal(false)} className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};







