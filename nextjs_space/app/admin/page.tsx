
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import OpenAISettings from './openai-settings';
import { Loader2, Crown, Shield, Trash2, Calendar } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  isPremium: boolean;
  isAdmin: boolean;
  subscriptionStatus: string | null;
  subscriptionEndDate: string | null;
  createdAt: string;
  athleteProfile: {
    id: number;
    runningLevel: string;
    goalDistance: string;
    stravaConnected: boolean;
  } | null;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      
      if (response.status === 403) {
        toast.error('Acesso negado. Você não tem permissão de administrador.');
        router.push('/dashboard');
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPremium: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status premium');
      }

      toast.success(`Status premium ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar premium:', error);
      toast.error('Erro ao atualizar status premium');
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar status admin');
      }

      toast.success(`Status admin ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`);
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar admin:', error);
      toast.error(error.message || 'Erro ao atualizar status admin');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao deletar usuário');
      }

      toast.success('Usuário deletado com sucesso');
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      toast.error(error.message || 'Erro ao deletar usuário');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const stats = {
    total: users.length,
    premium: users.filter(u => u.isPremium).length,
    admins: users.filter(u => u.isAdmin).length,
    withProfile: users.filter(u => u.athleteProfile).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e permissões da plataforma
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Usuários Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.premium}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Administradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.admins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Perfis Criados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.withProfile}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
            <CardDescription>
              Gerencie status premium, permissões de admin e exclua usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">
                        {user.name || 'Sem nome'}
                      </p>
                      {user.isPremium && (
                        <Badge variant="default" className="bg-yellow-600">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      {user.isAdmin && (
                        <Badge variant="default" className="bg-blue-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {user.athleteProfile && (
                        <>
                          <span>
                            Nível: {user.athleteProfile.runningLevel}
                          </span>
                          <span>
                            Meta: {user.athleteProfile.goalDistance}
                          </span>
                          {user.athleteProfile.stravaConnected && (
                            <Badge variant="outline" className="text-orange-600">
                              Strava conectado
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4">
                    {/* Toggle Premium */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Premium</label>
                      <Switch
                        checked={user.isPremium}
                        onCheckedChange={() => togglePremium(user.id, user.isPremium)}
                      />
                    </div>

                    {/* Toggle Admin */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Admin</label>
                      <Switch
                        checked={user.isAdmin}
                        onCheckedChange={() => toggleAdmin(user.id, user.isAdmin)}
                      />
                    </div>

                    {/* Delete Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar o usuário {user.name || user.email}?
                            Esta ação não pode ser desfeita e todos os dados do usuário serão
                            permanentemente removidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteUser(user.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum usuário cadastrado
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* OpenAI API Settings */}
        <div className="mt-8">
          <OpenAISettings />
        </div>
      </main>
    </div>
  );
}
