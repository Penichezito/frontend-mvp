'use client';

import { useState, useEffect } from 'react';
import { Upload, FolderOpen, Tag, Search, User, LogOut, Home, Files, Settings, Plus } from 'lucide-react';
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
  tag: string[];
  project_id: number;
  created_at: string;
}

// Componente principal da Home Page.
export default function HomePage() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpLoading, setShowUpLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Verifica o token de autenticação e carrega os dados iniciais.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      loadProjects();
      loadFiles();
    }
  }, []);

  // Carrega a lista de projetos da API.
  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Error ao carregar os projetos", error)
    }
  };

  // Carrega a lista de arquivos da API, opcionalmente filtrando por ID de projeto.
  const loadFiles = async (projectId?: number) => {
    try {
      const data = await api.getFiles(projectId);
      setFiles(data);
    } catch (error) {
      console.error("Error ao carregar os arquivos", error);
    }
  };

  // Autentica o usuário, armazena o token e carrega os dados.
  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const data = await api.login(email, password);
      localStorage.setItem("tooken", data.access_token);
      setIsLoggedIn(true);
      await loadProjects();
      await loadFiles();
    } catch (error) {
      alert("Falha ao fazer login. Verifique sua credenciais.");
    } finally {
      setLoading(false);
    }
  };

  // Registra um novo usuário, armazena o token e carrega os dados.
  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const data = await api.register(name, email, password);
      localStorage.setItem("token", data.access_token);
      setIsLoggedIn(true);
      await loadProjects();
      await loadFiles();
    } catch (error) {
      alert("Erro ao cria sua conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Desconecta o usuário, remove o token e limpa os dados.
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setProjects([]);
    setFiles([]);
  };

  // Envia um arquivo para um projeto específico e atualiza a lista de arquivos.
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, project_id: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await api.uploadFiles(project_id, file);
      await loadFiles();
      setShowProjectModal(false);
      alert("Arquivo enviado com sucesso!");
    } catch (error) {
      alert("Erro ao enviar o arquivo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

// Cria um novo projeto e atualiza a lista de projetos.
  const handleCreateProject = async (name: string, clientName: string) => {
    try {
      setLoading(true);
      await api.createProject({ name, client_name: clientName });
      await loadProjects();
      setShowProjectModal(false);
      alert("Projeto criado com sucesso!");
    } catch (error) {
      alert("Erro ao criar o projeto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Componente para a tela de login e registro.
  const LoginView = () => {
    const [ isRegister, setIsRegister ] = useState(false);
    const [ formData, setFormData ] = useState({ name: "", email: "", password: "" });

    // Lida com o envio do formulário de login ou registro.
    const handlesubmit = () => {
      if (isRegister) {
        handleRegister(formData.name, formData.email, formData.password);
      } else {
        handleLogin(formData.email, formData.password);
      }
    }
  };

  return (
    // Container principal da página, com fundo em gradiente e centralização de conteúdo.
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      {/* Seção do formulário, com fundo branco, bordas arredondadas e sombra. */}
      <section className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Cabeçalho do formulário, incluindo o ícone, título e subtítulo. */}
        <div className= "text-center mb-8" >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <FolderOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Freela Facility</h1>
          <p className= "text-gray-600 mt-2">Organize seus projetos freelance de forma inteligente</p>
        </div>
        

        

      </section>
    </main>
  )

};
