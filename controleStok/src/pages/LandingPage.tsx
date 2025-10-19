import { BarChart3, Bell, Database, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import bracellLogo from 'figma:asset/27c1ea150cdda0370734f0ab0ddb1efbe880832f.png';
import bracellFactory from 'figma:asset/0e39554fa4e7a83650937d2d883eecd4e3569ebc.png';

interface LandingPageProps {
  onNavigateToLogin: () => void;
}

export function LandingPage({ onNavigateToLogin }: LandingPageProps) {
  const features = [
    {
      icon: Package,
      title: 'Controle de Itens',
      description: 'Gerencie todos os materiais e recebimentos em um único lugar.',
    },
    {
      icon: Bell,
      title: 'Alertas Inteligentes',
      description: 'Notificações automáticas para estoque baixo e inconsistências.',
    },
    {
      icon: BarChart3,
      title: 'Painéis Dinâmicos',
      description: 'Visualize dados em tempo real com gráficos interativos.',
    },
    {
      icon: Database,
      title: 'Integração SAP',
      description: 'Sincronização direta com códigos e dados SAP.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-purple-900 to-purple-950">
      {/* Header */}
      <header className="p-6 flex justify-between items-center backdrop-blur-sm bg-white/5">
        <div className="flex items-center gap-2">
          <img src={bracellLogo} alt="Bracell" className="h-8" />
          <span className="text-white">Logística</span>
        </div>
        <Button 
          onClick={onNavigateToLogin}
          className="bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white"
          style={{ borderRadius: '1rem' }}
        >
          Acessar Sistema
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 lg:w-2/3 text-white space-y-6 pr-8">
          <h1 className="text-white font-semibold leading-tight" style={{ fontSize: '3.5rem', lineHeight: 1.05 }}>
            Sistema de Gestão de Estoque
          </h1>
          <h2 className="text-white/80 text-lg md:text-xl">
            Logística - Estradas
          </h2>
          <p className="text-white/70 max-w-xl">
            Controle completo de materiais, recebimentos e movimentações com atualização em tempo real. 
            Desenvolvido especialmente para o setor de Logística/Estradas da Bracell.
          </p>
          <Button 
            onClick={onNavigateToLogin}
            className="bg-white text-purple-900 hover:bg-white/90"
            style={{ borderRadius: '1rem' }}
          >
            Começar Agora
          </Button>
        </div>
  <div className="flex-1 lg:w-1/3">
          <div 
            className="rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md bg-white/10 border border-white/20"
            style={{ borderRadius: '1rem' }}
          >
            <img
              src={bracellFactory}
              alt="Bracell - Fábrica"
              className="w-full h-auto opacity-90"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-center text-white mb-12">
          Recursos do Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 backdrop-blur-md bg-white/15 border border-white/20 hover:bg-white/20 transition-all"
              style={{ 
                borderRadius: '1rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              <feature.icon className="w-12 h-12 text-white mb-4" />
              <h3 className="text-white mb-2">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-white/60 backdrop-blur-sm bg-white/5">
        <p>© 2025 Bracell - Sistema de Gestão de Estoque. Todos os direitos reservados.</p>
        <p className="mt-2">Dev Sócrates</p>
      </footer>
    </div>
  );
}
