import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, Settings, Trash2, Moon, Sun, Home, Key } from 'lucide-react';
import { flowsApi } from '../api/flows';
import type { Flow } from '../types/flow.types';
import { useTheme } from '../components/ThemeProvider';
import CredentialManager from '../components/canvas/CredentialManager';
import UserIndicator from '../components/UserIndicator';
import { toast } from 'sonner';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCredentialManager, setShowCredentialManager] = useState(false);

  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    try {
      const data = await flowsApi.list();
      setFlows(data);
    } catch (error) {
      console.error('Failed to load flows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/canvas');
  };

  const handleEditFlow = (flowId: string) => {
    navigate(`/canvas/${flowId}`);
  };

  const handleRunFlow = async (flowId: string) => {
    try {
      await flowsApi.run(flowId);
      alert('Flow execution started!');
    } catch (error) {
      console.error('Failed to run flow:', error);
      alert('Failed to run flow');
    }
  };

  const handleToggleActive = async (flowId: string) => {
    try {
      console.log('Toggling flow status for:', flowId);
      const updatedFlow = await flowsApi.toggleActive(flowId);
      console.log('Updated flow:', updatedFlow);
      setFlows(flows.map(f => f.id === flowId ? updatedFlow : f));
      const status = updatedFlow.status === 'ACTIVE' ? 'activated' : 'paused';
      toast.success(`Flow ${status} successfully!`);
    } catch (error: any) {
      console.error('Failed to toggle flow status:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to toggle flow status';
      toast.error(errorMsg);
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (!confirm('Are you sure you want to delete this flow?')) return;
    
    try {
      await flowsApi.delete(flowId);
      setFlows(flows.filter(f => f.id !== flowId));
    } catch (error) {
      console.error('Failed to delete flow:', error);
      alert('Failed to delete flow');
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ zoom: 0.9 }}>
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Workflows</h1>
            <p className="text-sm text-muted-foreground">Manage and monitor your automation flows</p>
          </div>
          <div className="flex items-center gap-3">
            <UserIndicator />
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              title="Go to Home"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCredentialManager(true)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              title="Manage Credentials"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Credentials</span>
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              New Flow
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading flows...</p>
          </div>
        ) : flows.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 rounded-full bg-accent flex items-center justify-center mb-4">
              <Plus className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No flows yet</h3>
            <p className="text-muted-foreground mb-6">Create your first workflow to get started</p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Your First Flow
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className="border border-border rounded-lg p-6 bg-card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{flow.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {flow.description || 'No description'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    flow.status === 'ACTIVE' || flow.isActive
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    {flow.status === 'ACTIVE' || flow.isActive ? '● Active' : '○ Paused'}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{flow.json?.nodes?.length || 0} nodes</span>
                  <span>•</span>
                  <span>{new Date(flow.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunFlow(flow.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 transition-colors text-sm font-medium"
                    title="Run flow"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Run
                  </button>
                  <button
                    onClick={() => handleToggleActive(flow.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded hover:opacity-80 transition-colors text-sm font-medium ${
                      flow.status === 'ACTIVE' || flow.isActive
                        ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
                        : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                    }`}
                    title={flow.status === 'ACTIVE' || flow.isActive ? 'Pause flow' : 'Resume flow'}
                  >
                    {flow.status === 'ACTIVE' || flow.isActive ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Resume
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleEditFlow(flow.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20 transition-colors text-sm font-medium"
                    title="Edit flow"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteFlow(flow.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors text-sm font-medium ml-auto"
                    title="Delete flow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Credential Manager Modal */}
      {showCredentialManager && (
        <CredentialManager
          userId={localStorage.getItem('user_id') || 'demo-user'}
          onClose={() => setShowCredentialManager(false)}
        />
      )}
    </div>
  );
}
