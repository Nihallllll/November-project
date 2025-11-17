import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Eye, EyeOff, Key, Database, Mail, MessageSquare, Brain } from 'lucide-react';
import { credentialsApi, type Credential } from '../../api/credentials';
import { toast } from 'sonner';

interface CredentialManagerProps {
  userId: string;
  onClose: () => void;
}

interface CredentialFormData {
  name: string;
  type: string;
  data: Record<string, any>;
}

const credentialTypes = [
    { value: 'openai', label: 'OpenAI (GPT-5, o3)', icon: Brain, fields: ['apiKey'] },
    { value: 'google', label: 'Google Gemini 2.5 (FREE)', icon: Brain, fields: ['apiKey'] },
  { value: 'telegram', label: 'Telegram Bot', icon: MessageSquare, fields: ['token', 'chatId'] },
  { value: 'gmail-oauth2', label: 'Gmail OAuth2', icon: Mail, fields: ['clientId', 'clientSecret', 'refreshToken', 'from'] },
  { value: 'resend', label: 'Resend Email', icon: Mail, fields: ['apiKey', 'from'] },
  { value: 'sendgrid', label: 'SendGrid', icon: Mail, fields: ['apiKey', 'from'] },
  { value: 'smtp', label: 'SMTP Server', icon: Mail, fields: ['host', 'port', 'user', 'password', 'from'] },
  { value: 'postgres_db', label: 'PostgreSQL Database', icon: Database, fields: ['connectionUrl'] },
  { value: 'solana_rpc', label: 'Solana RPC Endpoint', icon: Key, fields: ['rpcUrl'] },
];

export default function CredentialManager({ userId, onClose }: CredentialManagerProps) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState<CredentialFormData>({
    name: '',
    type: '',
    data: {},
  });

  useEffect(() => {
    loadCredentials();
  }, [userId]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const data = await credentialsApi.list(userId);
      setCredentials(data);
    } catch (error) {
      console.error('Failed to load credentials:', error);
      toast.error('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate that all required fields in data are filled
    const emptyFields = Object.entries(formData.data).filter(([_, value]) => !value);
    if (emptyFields.length > 0) {
      toast.error('Please fill in all credential fields');
      return;
    }

    try {
      console.log('Creating credential:', {
        userId,
        name: formData.name,
        type: formData.type,
        dataKeys: Object.keys(formData.data)
      });

      await credentialsApi.create(userId, {
        name: formData.name,
        type: formData.type,
        data: formData.data,
      });
      
      toast.success('Credential saved successfully');
      setShowForm(false);
      setFormData({ name: '', type: '', data: {} });
      loadCredentials();
    } catch (error: any) {
      console.error('Failed to create credential:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to save credential';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (credentialId: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) return;
    
    try {
      await credentialsApi.delete(userId, credentialId);
      toast.success('Credential deleted');
      loadCredentials();
    } catch (error) {
      console.error('Failed to delete credential:', error);
      toast.error('Failed to delete credential');
    }
  };

  const handleTypeChange = (type: string) => {
    const credType = credentialTypes.find(t => t.value === type);
    const initialData: Record<string, any> = {};
    
    credType?.fields.forEach(field => {
      initialData[field] = '';
    });
    
    setFormData({ ...formData, type, data: initialData });
  };

  const getTypeIcon = (type: string) => {
    const credType = credentialTypes.find(t => t.value === type);
    const Icon = credType?.icon || Key;
    return <Icon className="w-4 h-4" />;
  };

  const selectedType = credentialTypes.find(t => t.value === formData.type);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl border border-border/50 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-2xl font-bold text-gradient">Credential Manager</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Securely manage your API keys and credentials
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showForm ? (
            <>
              {/* Add New Button */}
              <button
                onClick={() => setShowForm(true)}
                className="w-full p-4 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 mb-6"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New Credential</span>
              </button>

              {/* Credentials List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">Loading credentials...</p>
                </div>
              ) : credentials.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No credentials yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Add your first credential to get started
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="glass p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {getTypeIcon(cred.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{cred.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {cred.type.replace(/_/g, ' ').replace('-', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              Created: {new Date(cred.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(cred.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Delete credential"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Add Credential Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Credential Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., My OpenAI API Key"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  required
                >
                  <option value="">Select credential type</option>
                  {credentialTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedType && (
                <div className="space-y-4 p-4 bg-accent/30 rounded-lg border border-border/50">
                  <h4 className="font-medium text-sm">Credential Details</h4>
                  {selectedType.fields.map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-2 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()} *
                      </label>
                      {field.includes('password') || field.includes('token') || field.includes('secret') || field.includes('apiKey') ? (
                        <div className="relative">
                          <input
                            type={showSecrets[field] ? 'text' : 'password'}
                            value={formData.data[field] || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                data: { ...formData.data, [field]: e.target.value },
                              })
                            }
                            placeholder={`Enter ${field}`}
                            className="w-full px-4 py-2 pr-10 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowSecrets({ ...showSecrets, [field]: !showSecrets[field] })
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
                          >
                            {showSecrets[field] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <input
                          type={field === 'port' ? 'number' : 'text'}
                          value={formData.data[field] || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              data: { ...formData.data, [field]: e.target.value },
                            })
                          }
                          placeholder={`Enter ${field}`}
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                          required
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', type: '', data: {} });
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Save Credential
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
