import { useMutation } from '@tanstack/react-query';

import { api } from '@/api/client';
import { useAuthStore, type AuthUser } from '@/stores/authStore';

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data } = await api.post<LoginResponse>('/auth/login', input);
      return data;
    },
    onSuccess: (data) => {
      setSession({ accessToken: data.accessToken, user: data.user });
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  return logout;
}
