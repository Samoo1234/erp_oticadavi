import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Eye, User, X } from 'lucide-react';
import { api } from '../services/api';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'seller' | 'optician';
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

const roleLabels = {
  admin: 'Administrador',
  manager: 'Gerente',
  seller: 'Vendedor',
  optician: 'Óptico'
};

export const Users: React.FC = () => {
  // Estados para listagem
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Estados para modais
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Estados para formulários
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seller' as 'admin' | 'manager' | 'seller' | 'optician',
    phone: '',
    isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);

  // Função para buscar usuários
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params: any = {
        page: usersPage,
        limit: usersLimit,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      const response = await api.get('/users', { params });
      
      if (response.data.success && response.data.data) {
        setUsers(response.data.data.users || []);
        setUsersTotal(response.data.data.pagination?.total || 0);
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      alert(error.response?.data?.message || 'Erro ao buscar usuários');
    } finally {
      setUsersLoading(false);
    }
  };

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (usersPage === 1) {
        fetchUsers();
      } else {
        setUsersPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter]);

  // Buscar usuários quando página ou filtros mudarem
  useEffect(() => {
    fetchUsers();
  }, [usersPage]);

  // Debounce para busca (alternativa)
  const debouncedUsersSearch = useMemo(() => {
    return (value: string) => {
      setSearchTerm(value);
      setUsersPage(1);
    };
  }, []);

  // Função para criar usuário
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.name || !userForm.email || !userForm.password) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (userForm.password.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setFormLoading(true);
      
      const response = await api.post('/users', {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        phone: userForm.phone || null,
      });

      if (response.data.success) {
        alert('Usuário criado com sucesso!');
        setShowNewUserModal(false);
        setUserForm({
          name: '',
          email: '',
          password: '',
          role: 'seller',
          phone: '',
          isActive: true
        });
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      alert(error.response?.data?.message || 'Erro ao criar usuário');
    } finally {
      setFormLoading(false);
    }
  };

  // Função para visualizar usuário
  const handleViewUser = async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);
      if (response.data.success) {
        setSelectedUser(response.data.data);
        setShowViewUserModal(true);
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error);
      alert(error.response?.data?.message || 'Erro ao buscar usuário');
    }
  };

  // Função para editar usuário
  const handleEditUser = async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);
      if (response.data.success) {
        const user = response.data.data;
        setSelectedUser(user);
        setUserForm({
          name: user.name,
          email: user.email,
          password: '', // Não preencher senha
          role: user.role,
          phone: user.phone || '',
          isActive: user.isActive
        });
        setShowEditUserModal(true);
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error);
      alert(error.response?.data?.message || 'Erro ao buscar usuário');
    }
  };

  // Função para atualizar usuário
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !userForm.name || !userForm.email) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setFormLoading(true);
      
      const updateData: any = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        phone: userForm.phone || null,
        isActive: userForm.isActive,
      };

      // Só atualiza senha se foi preenchida
      if (userForm.password && userForm.password.length >= 6) {
        updateData.password = userForm.password;
      }

      const response = await api.put(`/users/${selectedUser.id}`, updateData);

      if (response.data.success) {
        alert('Usuário atualizado com sucesso!');
        setShowEditUserModal(false);
        setSelectedUser(null);
        setUserForm({
          name: '',
          email: '',
          password: '',
          role: 'seller',
          phone: '',
          isActive: true
        });
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      alert(error.response?.data?.message || 'Erro ao atualizar usuário');
    } finally {
      setFormLoading(false);
    }
  };

  // Função para excluir usuário
  const handleDeleteUser = async (userId: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const response = await api.delete(`/users/${userId}`);
      if (response.data.success) {
        alert('Usuário excluído com sucesso!');
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      alert(error.response?.data?.message || 'Erro ao excluir usuário');
    }
  };

  // Calcular paginação
  const totalPages = Math.ceil(usersTotal / usersLimit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setUserForm({
              name: '',
              email: '',
              password: '',
              role: 'seller',
              phone: '',
              isActive: true
            });
            setShowNewUserModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuários por nome ou email..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => debouncedUsersSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                className="input"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setUsersPage(1);
                }}
              >
                <option value="">Todos os roles</option>
                <option value="admin">Administrador</option>
                <option value="manager">Gerente</option>
                <option value="seller">Vendedor</option>
                <option value="optician">Óptico</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Login
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
                {usersLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Carregando usuários...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'manager'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'seller'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleViewUser(user.id)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => handleEditUser(user.id)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {!usersLoading && usersTotal > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">
              {(usersPage - 1) * usersLimit + 1}
            </span> a{' '}
            <span className="font-medium">
              {Math.min(usersPage * usersLimit, usersTotal)}
            </span> de{' '}
            <span className="font-medium">{usersTotal}</span> resultados
          </div>
          <div className="flex space-x-2">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setUsersPage(p => Math.max(1, p - 1))}
              disabled={usersPage === 1}
            >
              Anterior
            </button>
            <span className="flex items-center px-3 text-sm text-gray-700">
              Página {usersPage} de {totalPages}
            </span>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setUsersPage(p => Math.min(totalPages, p + 1))}
              disabled={usersPage >= totalPages}
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {/* Modal Novo Usuário */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Novo Usuário</h2>
              <button
                onClick={() => setShowNewUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="input w-full"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="input w-full"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  minLength={6}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  className="input w-full"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  required
                >
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="seller">Vendedor</option>
                  <option value="optician">Óptico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={userForm.isActive}
                  onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Usuário ativo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowNewUserModal(false)}
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Criando...' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar Usuário */}
      {showViewUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Detalhes do Usuário</h2>
              <button
                onClick={() => {
                  setShowViewUserModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Role
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.role === 'admin' 
                      ? 'bg-red-100 text-red-800'
                      : selectedUser.role === 'manager'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedUser.role === 'seller'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {roleLabels[selectedUser.role]}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Status
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Telefone
                  </label>
                  <p className="text-sm text-gray-900">{selectedUser.phone || '-'}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Último Login
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.lastLogin 
                      ? new Date(selectedUser.lastLogin).toLocaleString('pt-BR')
                      : 'Nunca'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Criado em
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.createdAt 
                      ? new Date(selectedUser.createdAt).toLocaleString('pt-BR')
                      : '-'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Atualizado em
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.updatedAt 
                      ? new Date(selectedUser.updatedAt).toLocaleString('pt-BR')
                      : '-'
                    }
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowViewUserModal(false);
                    handleEditUser(selectedUser.id);
                  }}
                >
                  Editar Usuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Editar Usuário</h2>
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                  setUserForm({
                    name: '',
                    email: '',
                    password: '',
                    role: 'seller',
                    phone: '',
                    isActive: true
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="input w-full"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha (deixe em branco para manter a atual)
                </label>
                <input
                  type="password"
                  className="input w-full"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  minLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  className="input w-full"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  required
                >
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="seller">Vendedor</option>
                  <option value="optician">Óptico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={userForm.isActive}
                  onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                />
                <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-700">
                  Usuário ativo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setSelectedUser(null);
                    setUserForm({
                      name: '',
                      email: '',
                      password: '',
                      role: 'seller',
                      phone: '',
                      isActive: true
                    });
                  }}
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
