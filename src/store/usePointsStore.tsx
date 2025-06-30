import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { pontosService } from '../services/pontosService';

interface PointsContextType {
  pontos: number;
  loading: boolean;
  error: string | null;
  adicionarPontos: (valor: number) => Promise<void>;
  resetarPontos: () => void;
  atualizarPontos: () => Promise<void>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const PointsProvider = ({ children }: { children: ReactNode }) => {
  const [pontos, setPontos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca pontos do usuário logado
  const atualizarPontos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      const total = await pontosService.getTotalPontosUsuario(user.id);
      setPontos(total);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar pontos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Adiciona pontos e atualiza estado global
  const adicionarPontos = useCallback(async (valor: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      // Buscar lojaId do usuário
      const { data: userData, error: userError } = await supabase
        .from('users_regras')
        .select('loja_id')
        .eq('user_ref', user.id)
        .single();
      if (userError) throw new Error('Erro ao buscar loja do usuário');
      const lojaId = userData?.loja_id;
      if (!lojaId) throw new Error('Loja não encontrada para o usuário');
      await pontosService.adicionarPontos(user.id, lojaId, valor);
      setPontos(prev => prev + valor); // Atualiza instantaneamente
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar pontos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reseta pontos localmente (exemplo de função extra)
  const resetarPontos = useCallback(() => {
    setPontos(0);
  }, []);

  useEffect(() => {
    atualizarPontos();
  }, [atualizarPontos]);

  return (
    <PointsContext.Provider value={{ pontos, loading, error, adicionarPontos, resetarPontos, atualizarPontos }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePointsStore = () => {
  const context = useContext(PointsContext);
  if (!context) throw new Error('usePointsStore deve ser usado dentro de um PointsProvider');
  return context;
}; 