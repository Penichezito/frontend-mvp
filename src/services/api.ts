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
        config.headers.Authorization = `Bearear ${token}`;
    }
    return config;
});

// Auth
export const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
}

export const register = async (name: string, email: string, password: string) => {
    const response = await api. post("/auth/register", { name, email, password });
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

export const getProjectId = async (id: number) => {
    const response = await api.get(`/projects/${id}`);
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
