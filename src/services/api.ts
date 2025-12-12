import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para tratar erros de autenticação (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token inválido ou expirado - limpa localStorage e recarrega página
            // Mas só se realmente tinha um token (evita reload em loop na tela de login)
            if (typeof window !== 'undefined') {
                const hadToken = localStorage.getItem('token');
                localStorage.removeItem('token');

                // Só recarrega se tinha token antes (usuário estava logado)
                if (hadToken) {
                    window.location.reload();
                }
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = async (email: string, password: string) => {
    // Backend usa OAuth2PasswordRequestForm que espera 'username' (não 'email')
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post("/auth/login", formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.data;
}

export const register = async (name: string, email: string, password: string) => {
    const response = await api.post("/auth/register", { name, email, password });
    return response.data;
}

// Projects
export const getProjects = async () => {
    const response = await api.get('/projects');
    return response.data;
};

export const createProject = async (data: { name: string, client_name: string, description?: string }) => {
    const response = await api.post('/projects', data);
    return response.data;
};

export const getProject = async (id: number) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
};

export const deleteProject = async (id: number) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
};

// Files
export const getFiles = async (projectId?: number) => {
    const url = projectId ? `/files?project_id=${projectId}` : "/files";
    const response = await api.get(url);
    return response.data;
};

export const uploadFiles = async (projectID: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectID.toString());

    const response = await api.post("/files/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const searchFiles = async (query: string) => {
    const response = await api.get(`/files/search?q=${query}`);
    return response.data;
};

export const deleteFiles = async (id: number) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
};

export default api;
