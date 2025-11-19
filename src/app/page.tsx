'use client';

import { useState, useEffect } from 'react';
import { Upload, FolderOpen, Tag, Search, User, LogOut, Home as HomeIcon, Files, Settings, Plus } from 'lucide-react';
import * as api from '@/services/api';

interface Project {
  id: number;
  name: string;
  client_name: string;
  file_count?: number;
  tags?: string[];
}

interface FileItem {
  id: number;
  filename: string;
  file_type: string;
  size: number;
  tags: string[];
  project_id: number;
  created_at: string;
}

export default function Home() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      loadProjects();
      loadFiles();
    }
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadFiles = async (projectId?: number) => {
    try {
      const data = await api.getFiles(projectId);
      setFiles(data);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const data = await api.login(email, password);
      localStorage.setItem('token', data.access_token);
      setIsLoggedIn(true);
      await loadProjects();
      await loadFiles();
    } catch (error) {
      alert('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const data = await api.register(name, email, password);
      localStorage.setItem('token', data.access_token);
      setIsLoggedIn(true);
      await loadProjects();
      await loadFiles();
    } catch (error) {
      alert('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setProjects([]);
    setFiles([]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await api.uploadFiles(projectId, file);
      await loadFiles();
      setShowUploadModal(false);
      alert('Arquivo enviado com sucesso!');
    } catch (error) {
      alert('Erro ao enviar arquivo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (name: string, clientName: string) => {
    try {
      setLoading(true);
      await api.createProject({ name, client_name: clientName });
      await loadProjects();
      setShowProjectModal(false);
    } catch (error) {
      alert('Erro ao criar projeto');
    } finally {
      setLoading(false);
    }
  };

  const LoginView = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleSubmit = () => {
      if (isRegister) {
        handleRegister(formData.name, formData.email, formData.password);
      } else {
        handleLogin(formData.email, formData.password);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Freela Facility</h1>
            <p className="text-gray-600 mt-2">Organize seus projetos de forma inteligente</p>
          </div>
          
          <div className="space-y-4">
            {isRegister && (
              <input
                type="text"
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Senha"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : (isRegister ? 'Criar Conta' : 'Entrar')}
            </button>
          </div>
          
          <p className="text-center mt-6 text-gray-600">
            {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="ml-2 text-indigo-600 font-semibold hover:underline"
            >
              {isRegister ? 'Entrar' : 'Registrar'}
            </button>
          </p>
        </div>
      </div>
    );
  };

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowProjectModal(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Projeto
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total de Projetos</p>
              <p className="text-4xl font-bold mt-2">{projects.length}</p>
            </div>
            <FolderOpen className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total de Arquivos</p>
              <p className="text-4xl font-bold mt-2">{files.length}</p>
            </div>
            <Files className="w-12 h-12 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100">Tags Únicas</p>
              <p className="text-4xl font-bold mt-2">
                {[...new Set(files.flatMap(f => f.tags))].length}
              </p>
            </div>
            <Tag className="w-12 h-12 text-pink-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Projetos Recentes</h3>
        <div className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum projeto ainda. Crie um novo projeto!</p>
          ) : (
            projects.map(project => (
              <div
                key={project.id}
                onClick={() => { setSelectedProject(project); setCurrentView('files'); loadFiles(project.id); }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{project.name}</h4>
                    <p className="text-sm text-gray-600">{project.client_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {files.filter(f => f.project_id === project.id).length} arquivos
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const FilesView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredFiles = files
      .filter(file => !selectedProject || file.project_id === selectedProject.id)
      .filter(file => 
        file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {selectedProject ? selectedProject.name : 'Todos os Arquivos'}
            </h2>
            {selectedProject && (
              <p className="text-gray-600 mt-1">Cliente: {selectedProject.client_name}</p>
            )}
          </div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Voltar ao Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-gray-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Nenhum arquivo encontrado
            </div>
          ) : (
            filteredFiles.map(file => (
              <div key={file.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Files className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                
                <h4 className="font-semibold text-gray-800 mb-2 truncate">{file.filename}</h4>
                <p className="text-sm text-gray-600 mb-3">{file.file_type}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {file.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <button className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 transition-colors font-semibold">
                  Visualizar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6 z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Freela Facility</h1>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            Dashboard
          </button>
          
          <button
            onClick={() => { setSelectedProject(null); setCurrentView('files'); loadFiles(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'files' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Files className="w-5 h-5" />
            Arquivos
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5" />
            Configurações
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Freelancer</p>
              <p className="text-xs text-gray-600 truncate">user@email.com</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="ml-64 p-8">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'files' && <FilesView />}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Upload de Arquivo</h3>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4">
              <option value="">Selecione um projeto</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="file"
              onChange={(e) => {
                const select = document.querySelector('select') as HTMLSelectElement;
                if (select.value) {
                  handleFileUpload(e, parseInt(select.value));
                }
              }}
              className="w-full mb-4"
            />
            <button
              onClick={() => setShowUploadModal(false)}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Novo Projeto</h3>
            <input
              type="text"
              placeholder="Nome do projeto"
              id="project-name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
            />
            <input
              type="text"
              placeholder="Nome do cliente"
              id="client-name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const name = (document.getElementById('project-name') as HTMLInputElement).value;
                  const client = (document.getElementById('client-name') as HTMLInputElement).value;
                  handleCreateProject(name, client);
                }}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Criar
              </button>
              <button
                onClick={() => setShowProjectModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}