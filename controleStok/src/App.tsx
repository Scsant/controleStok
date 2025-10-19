import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { PainelGeral } from './pages/PainelGeral';
import { ControleItens } from './pages/ControleItens';
import { DashboardGraficos } from './pages/DashboardGraficos';
import { Retiradas } from './pages/Retiradas';
import { RetiradaItens } from './pages/RetiradaItens';
import { Layout } from './components/Layout';
import { Toaster } from './components/ui/sonner';

type Page = 'landing' | 'login' | 'painel' | 'itens' | 'graficos' | 'retiradas' | 'retirada-itens';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  useEffect(() => {
    // Keep landing as the default opening page for unauthenticated users.
    // If a user is authenticated, navigate to the painel automatically.
    if (!loading && user) {
      setCurrentPage('painel');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-purple-900 to-purple-950 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    if (currentPage === 'landing') {
      return <LandingPage onNavigateToLogin={() => setCurrentPage('login')} />;
    }
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'painel':
        return <PainelGeral />;
      case 'itens':
        return <ControleItens />;
      case 'graficos':
        return <DashboardGraficos />;
      case 'retiradas':
        return <Retiradas />;
      case 'retirada-itens':
        return <RetiradaItens />;
      default:
        return <PainelGeral />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage as 'painel' | 'itens' | 'graficos' | 'retiradas' | 'retirada-itens'}
      onNavigate={(page) => setCurrentPage(page)}
    >
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
