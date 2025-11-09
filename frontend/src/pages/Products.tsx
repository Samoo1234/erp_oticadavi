import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus, 
  Search, 
  Filter, 
  Package, 
  Eye, 
  Edit, 
  Trash2, 
  Star, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Grid,
  List
} from 'lucide-react';
import { api } from '../services/api';

type Product = {
  id: string;
  name: string;
  description?: string | null;
  sku: string;
  category: 'oculos_grau' | 'oculos_sol' | 'lentes' | 'acessorios' | 'servicos';
  subcategory?: string | null;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  material?: string | null;
  gender?: 'M' | 'F' | 'U' | 'C';
  price: number;
  costPrice?: number | null;
  profitMargin?: number | null;
  weight?: number | null;
  images?: string[];
  isActive: boolean;
  isPrescriptionRequired?: boolean;
  minStock?: number;
  maxStock?: number | null;
  tags?: string[];
  currentStock?: number;
  location?: string;
};

// Dados mockados removidos - agora carregamos do backend

const categoryLabels = {
  oculos_grau: 'Óculos de Grau',
  oculos_sol: 'Óculos de Sol',
  lentes: 'Lentes',
  acessorios: 'Acessórios',
  servicos: 'Serviços'
};

const genderLabels = {
  M: 'Masculino',
  F: 'Feminino',
  U: 'Unissex',
  C: 'Criança'
};

export const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '', sku: '', category: 'oculos_grau', subcategory: '', brand: '', model: '',
    color: '', material: '', gender: 'U', price: '', costPrice: '', minStock: '', maxStock: '',
    isActive: true, isPrescriptionRequired: false, initialStock: '', imageUrl: '', tags: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    isActive: '',
    lowStock: false
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', sku: '', category: 'oculos_grau', subcategory: '', brand: '', model: '',
    color: '', material: '', gender: 'U', price: '', costPrice: '', minStock: '', maxStock: '',
    isActive: true, isPrescriptionRequired: false, imageUrl: '', tags: ''
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Buscar produtos do backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (searchTerm) params.search = searchTerm;
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.isActive) params.isActive = filters.isActive === 'active' ? 'true' : 'false';

      const res = await api.get('/products', { params });
      const payload = res.data?.data;
      setProducts(payload?.products || []);
      setTotal(payload?.pagination?.total || 0);
    } catch (e) {
      console.error('Erro ao carregar produtos', e);
    } finally {
      setLoading(false);
    }
  };

  // Debounce da busca
  const debouncedSearch = useMemo(() => {
    let timeout: any;
    return (value: string) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSearchTerm(value);
        setPage(1);
      }, 400);
    };
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm, filters.category, filters.brand, filters.isActive]);

  const filteredProducts = products.filter(product => {
    const matchesLowStock = !filters.lowStock || (product.currentStock ?? 0) <= (product.minStock ?? 0);
    return matchesLowStock;
  });

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || 'oculos_grau',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      model: product.model || '',
      color: product.color || '',
      material: product.material || '',
      gender: (product.gender as any) || 'U',
      price: String(product.price ?? ''),
      costPrice: product.costPrice != null ? String(product.costPrice) : '',
      minStock: product.minStock != null ? String(product.minStock) : '',
      maxStock: product.maxStock != null ? String(product.maxStock) : '',
      isActive: !!product.isActive,
      isPrescriptionRequired: !!product.isPrescriptionRequired,
      imageUrl: product.images && product.images.length ? product.images[0] : '',
      tags: product.tags && product.tags.length ? product.tags.join(', ') : ''
    });
    setEditErrors({});
    setShowEditProductModal(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm(`Excluir o produto "${product.name}"? Essa ação não pode ser desfeita.`)) return;
    try {
      const res = await api.delete(`/products/${product.id}`);
      if (res.data?.success !== false) {
        alert('Produto excluído com sucesso!');
        fetchProducts();
      } else {
        alert(res.data?.message || 'Erro ao excluir produto');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao excluir produto';
      alert(msg);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      isActive: '',
      lowStock: false
    });
  };

  const getStockStatus = (current: number, min: number) => {
    if (current <= 0) return { status: 'out', color: 'red', text: 'Sem Estoque' };
    if (current <= min) return { status: 'low', color: 'yellow', text: 'Estoque Baixo' };
    return { status: 'ok', color: 'green', text: 'Em Estoque' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seu catálogo de produtos ({loading ? '...' : total} produtos)
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="btn btn-outline"
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
          <button className="btn btn-primary" onClick={() => setShowNewProductModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
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
                    placeholder="Buscar por nome, SKU ou marca..."
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
                      Categoria
                    </label>
                    <select 
                      className="input"
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                    >
                      <option value="">Todas</option>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca
                    </label>
                    <select 
                      className="input"
                      value={filters.brand}
                      onChange={(e) => { setFilters({...filters, brand: e.target.value}); setPage(1); }}
                    >
                      <option value="">Todas</option>
                      {[...new Set(products.map(p => p.brand).filter(Boolean))].map(brand => (
                        <option key={brand} value={brand || ''}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select 
                      className="input"
                      value={filters.isActive}
                      onChange={(e) => { setFilters({...filters, isActive: e.target.value}); setPage(1); }}
                    >
                      <option value="">Todos</option>
                      <option value="active">Ativos</option>
                      <option value="inactive">Inativos</option>
                    </select>
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
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.lowStock}
                      onChange={(e) => setFilters({...filters, lowStock: e.target.checked})}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Apenas produtos com estoque baixo</span>
                  </label>
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
                <Package className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Produtos</p>
                <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : total}</p>
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
                <p className="text-sm font-medium text-gray-500">Estoque Baixo</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => (p.currentStock ?? 0) <= (p.minStock ?? 0)).length}
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
                <p className="text-sm font-medium text-gray-500">Valor Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  R$ {products.reduce((sum, p) => sum + ((p.currentStock ?? 0) * (p.costPrice ?? 0)), 0).toFixed(2)}
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
                <p className="text-sm font-medium text-gray-500">Margem Média</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.length ? (products.reduce((sum, p) => sum + (p.profitMargin ?? 0), 0) / products.length).toFixed(2) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.currentStock ?? 0, product.minStock ?? 0);
            return (
              <div key={product.id} className="card hover:shadow-lg transition-shadow">
                <div className="card-content">
                  {/* Product Image */}
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={product.images?.[0] || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p><strong>SKU:</strong> {product.sku}</p>
                      <p><strong>Marca:</strong> {product.brand}</p>
                      <p><strong>Categoria:</strong> {categoryLabels[product.category as keyof typeof categoryLabels]}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Preço</p>
                        <p className="text-lg font-semibold text-gray-900">
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-500">Estoque</p>
                        <p className={`text-sm font-semibold ${
                          stockStatus.color === 'red' ? 'text-red-600' :
                          stockStatus.color === 'yellow' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {product.currentStock} {stockStatus.text}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Margem: {product.profitMargin}%
                      </span>
                      <span className="text-gray-500">
                        {genderLabels[product.gender as keyof typeof genderLabels]}
                      </span>
                    </div>
                    
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-4 flex justify-end space-x-2">
                    <button 
                      onClick={() => handleViewProduct(product)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
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
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.currentStock ?? 0, product.minStock ?? 0);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              src={product.images?.[0] || '/placeholder-product.png'}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.brand} - {product.model}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categoryLabels[product.category as keyof typeof categoryLabels]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.currentStock}</div>
                        <div className={`text-xs ${
                          stockStatus.color === 'red' ? 'text-red-600' :
                          stockStatus.color === 'yellow' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {stockStatus.text}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleViewProduct(product)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteProduct(product)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowProductModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Detalhes do Produto</h3>
                  <button 
                    onClick={() => setShowProductModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={selectedProduct.images?.[0] || '/placeholder-product.png'}
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                      <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-500">Categoria</p>
                        <p className="text-gray-900">{categoryLabels[selectedProduct.category as keyof typeof categoryLabels]}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Marca</p>
                        <p className="text-gray-900">{selectedProduct.brand}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Preço</p>
                        <p className="text-gray-900">R$ {selectedProduct.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Custo</p>
                        <p className="text-gray-900">R$ {selectedProduct.costPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Margem</p>
                        <p className="text-gray-900">{selectedProduct.profitMargin}%</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Estoque</p>
                        <p className="text-gray-900">{selectedProduct.currentStock} unidades</p>
                      </div>
                    </div>
                    
                    {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-500 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedProduct.tags.map((tag: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowProductModal(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Produto */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowNewProductModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const errs: Record<string, string> = {};
                if (!productForm.name.trim()) errs.name = 'Nome obrigatório';
                if (!productForm.sku.trim()) errs.sku = 'SKU obrigatório';
                if (!productForm.price) errs.price = 'Preço obrigatório';
                setFormErrors(errs);
                if (Object.keys(errs).length) return;

                try {
                  const payload: any = {
                    name: productForm.name.trim(),
                    sku: productForm.sku.trim(),
                    category: productForm.category,
                    subcategory: productForm.subcategory || undefined,
                    brand: productForm.brand || undefined,
                    model: productForm.model || undefined,
                    color: productForm.color || undefined,
                    material: productForm.material || undefined,
                    gender: productForm.gender,
                    price: Number(productForm.price),
                    costPrice: productForm.costPrice ? Number(productForm.costPrice) : undefined,
                    minStock: productForm.minStock ? Number(productForm.minStock) : undefined,
                    maxStock: productForm.maxStock ? Number(productForm.maxStock) : undefined,
                    isActive: productForm.isActive,
                    isPrescriptionRequired: productForm.isPrescriptionRequired,
                    initialStock: productForm.initialStock ? Number(productForm.initialStock) : undefined,
                    images: productForm.imageUrl ? [productForm.imageUrl] : undefined,
                    tags: productForm.tags ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
                  };

                  const res = await api.post('/products', payload);
                  if (res.data?.success) {
                    alert('Produto criado com sucesso!');
                    setShowNewProductModal(false);
                    setProductForm({
                      name: '', sku: '', category: 'oculos_grau', subcategory: '', brand: '', model: '',
                      color: '', material: '', gender: 'U', price: '', costPrice: '', minStock: '', maxStock: '',
                      isActive: true, isPrescriptionRequired: false, initialStock: '', imageUrl: '', tags: ''
                    });
                    fetchProducts();
                  } else {
                    alert(res.data?.message || 'Erro ao criar produto');
                  }
                } catch (err: any) {
                  const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao criar produto';
                  alert(msg);
                }
              }}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Novo Produto</h3>
                    <button type="button" onClick={() => setShowNewProductModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                        <input className={`input w-full ${formErrors.name ? 'border-red-500' : ''}`} value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} />
                        {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                        <input className={`input w-full ${formErrors.sku ? 'border-red-500' : ''}`} value={productForm.sku} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} />
                        {formErrors.sku && <p className="mt-1 text-sm text-red-600">{formErrors.sku}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                        <select className="input w-full" value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value as any})}>
                          {Object.keys(categoryLabels).map((k) => (<option key={k} value={k}>{categoryLabels[k as keyof typeof categoryLabels]}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoria</label>
                        <input className="input w-full" value={productForm.subcategory} onChange={(e) => setProductForm({...productForm, subcategory: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                        <input className="input w-full" value={productForm.brand} onChange={(e) => setProductForm({...productForm, brand: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                        <input className="input w-full" value={productForm.model} onChange={(e) => setProductForm({...productForm, model: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                        <input className="input w-full" value={productForm.color} onChange={(e) => setProductForm({...productForm, color: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                        <input className="input w-full" value={productForm.material} onChange={(e) => setProductForm({...productForm, material: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                        <select className="input w-full" value={productForm.gender} onChange={(e) => setProductForm({...productForm, gender: e.target.value as any})}>
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                          <option value="U">Unissex</option>
                          <option value="C">Criança</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                        <input type="number" step="0.01" className={`input w-full ${formErrors.price ? 'border-red-500' : ''}`} value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} />
                        {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custo (R$)</label>
                        <input type="number" step="0.01" className="input w-full" value={productForm.costPrice} onChange={(e) => setProductForm({...productForm, costPrice: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                        <input type="number" className="input w-full" value={productForm.minStock} onChange={(e) => setProductForm({...productForm, minStock: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Máximo</label>
                        <input type="number" className="input w-full" value={productForm.maxStock} onChange={(e) => setProductForm({...productForm, maxStock: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Inicial</label>
                        <input type="number" className="input w-full" value={productForm.initialStock} onChange={(e) => setProductForm({...productForm, initialStock: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagem (URL)</label>
                        <input className="input w-full" value={productForm.imageUrl} onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                        <input className="input w-full" value={productForm.tags} onChange={(e) => setProductForm({...productForm, tags: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input id="isActive" type="checkbox" checked={productForm.isActive} onChange={(e) => setProductForm({...productForm, isActive: e.target.checked})} />
                        <label htmlFor="isActive" className="text-sm text-gray-700">Ativo</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input id="isPrescriptionRequired" type="checkbox" checked={productForm.isPrescriptionRequired} onChange={(e) => setProductForm({...productForm, isPrescriptionRequired: e.target.checked})} />
                        <label htmlFor="isPrescriptionRequired" className="text-sm text-gray-700">Requer prescrição</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto sm:ml-3">Criar Produto</button>
                  <button type="button" onClick={() => setShowNewProductModal(false)} className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Produto */}
      {showEditProductModal && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditProductModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const errs: Record<string, string> = {};
                if (!editForm.name.trim()) errs.name = 'Nome obrigatório';
                if (!editForm.sku.trim()) errs.sku = 'SKU obrigatório';
                if (!editForm.price) errs.price = 'Preço obrigatório';
                setEditErrors(errs);
                if (Object.keys(errs).length) return;

                try {
                  const payload: any = {
                    name: editForm.name.trim(),
                    sku: editForm.sku.trim(),
                    category: editForm.category,
                    subcategory: editForm.subcategory || undefined,
                    brand: editForm.brand || undefined,
                    model: editForm.model || undefined,
                    color: editForm.color || undefined,
                    material: editForm.material || undefined,
                    gender: editForm.gender,
                    price: Number(editForm.price),
                    costPrice: editForm.costPrice ? Number(editForm.costPrice) : undefined,
                    minStock: editForm.minStock ? Number(editForm.minStock) : undefined,
                    maxStock: editForm.maxStock ? Number(editForm.maxStock) : undefined,
                    isActive: editForm.isActive,
                    isPrescriptionRequired: editForm.isPrescriptionRequired,
                    images: editForm.imageUrl ? [editForm.imageUrl] : undefined,
                    tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
                  };

                  const res = await api.put(`/products/${selectedProduct.id}` as string, payload);
                  if (res.data?.success !== false) {
                    alert('Produto atualizado com sucesso!');
                    setShowEditProductModal(false);
                    fetchProducts();
                  } else {
                    alert(res.data?.message || 'Erro ao atualizar produto');
                  }
                } catch (err: any) {
                  const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao atualizar produto';
                  alert(msg);
                }
              }}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Editar Produto</h3>
                    <button type="button" onClick={() => setShowEditProductModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                        <input className={`input w-full ${editErrors.name ? 'border-red-500' : ''}`} value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                        {editErrors.name && <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                        <input className={`input w-full ${editErrors.sku ? 'border-red-500' : ''}`} value={editForm.sku} onChange={(e) => setEditForm({...editForm, sku: e.target.value})} />
                        {editErrors.sku && <p className="mt-1 text-sm text-red-600">{editErrors.sku}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                        <select className="input w-full" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value as any})}>
                          {Object.keys(categoryLabels).map((k) => (<option key={k} value={k}>{categoryLabels[k as keyof typeof categoryLabels]}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoria</label>
                        <input className="input w-full" value={editForm.subcategory} onChange={(e) => setEditForm({...editForm, subcategory: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                        <input className="input w-full" value={editForm.brand} onChange={(e) => setEditForm({...editForm, brand: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                        <input className="input w-full" value={editForm.model} onChange={(e) => setEditForm({...editForm, model: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                        <input className="input w-full" value={editForm.color} onChange={(e) => setEditForm({...editForm, color: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                        <input className="input w-full" value={editForm.material} onChange={(e) => setEditForm({...editForm, material: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                        <select className="input w-full" value={editForm.gender} onChange={(e) => setEditForm({...editForm, gender: e.target.value as any})}>
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                          <option value="U">Unissex</option>
                          <option value="C">Criança</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                        <input type="number" step="0.01" className={`input w-full ${editErrors.price ? 'border-red-500' : ''}`} value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} />
                        {editErrors.price && <p className="mt-1 text-sm text-red-600">{editErrors.price}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custo (R$)</label>
                        <input type="number" step="0.01" className="input w-full" value={editForm.costPrice} onChange={(e) => setEditForm({...editForm, costPrice: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                        <input type="number" className="input w-full" value={editForm.minStock} onChange={(e) => setEditForm({...editForm, minStock: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Máximo</label>
                        <input type="number" className="input w-full" value={editForm.maxStock} onChange={(e) => setEditForm({...editForm, maxStock: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagem (URL)</label>
                        <input className="input w-full" value={editForm.imageUrl} onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                        <input className="input w-full" value={editForm.tags} onChange={(e) => setEditForm({...editForm, tags: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input id="isActiveEdit" type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})} />
                        <label htmlFor="isActiveEdit" className="text-sm text-gray-700">Ativo</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input id="isPrescriptionRequiredEdit" type="checkbox" checked={editForm.isPrescriptionRequired} onChange={(e) => setEditForm({...editForm, isPrescriptionRequired: e.target.checked})} />
                        <label htmlFor="isPrescriptionRequiredEdit" className="text-sm text-gray-700">Requer prescrição</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto sm:ml-3">Salvar Alterações</button>
                  <button type="button" onClick={() => setShowEditProductModal(false)} className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {loading ? 'Carregando...' : (
            <>
              Mostrando <span className="font-medium">{filteredProducts.length}</span> de{' '}
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
    </div>
  );
};
