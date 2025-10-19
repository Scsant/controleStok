import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import bracellLogo from '../assets/bracell_logo-2020.png';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error('Erro ao fazer login', {
          description: error.message,
        });
      } else {
        toast.success('Login realizado com sucesso!');
      }
    } catch (err) {
      toast.error('Erro inesperado', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-purple-900 to-purple-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div 
          className="backdrop-blur-md bg-white/15 border border-white/20 p-8 w-full"
          style={{ 
            borderRadius: '1rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}
        >
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6 bg-white rounded-lg px-6 py-4">
              <img src={bracellLogo} alt="Bracell" className="h-10" />
            </div>
            <h1 className="text-white text-center">Logística</h1>
            <p className="text-white/70 text-center">Sistema de Gestão de Estoque</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@bracell.com"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  style={{ borderRadius: '1rem' }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  style={{ borderRadius: '1rem' }}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-purple-900 hover:bg-white/90"
                style={{ borderRadius: '1rem' }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </motion.div>
          </form>

          <p className="text-center text-white/50 mt-6">
            Acesso restrito a colaboradores autorizados
          </p>
        </div>
      </motion.div>
    </div>
  );
}
