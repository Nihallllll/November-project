import { useState, useEffect } from 'react';
import { User, LogOut, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function UserIndicator() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (!userEmail) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium hidden md:block">{userEmail}</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium truncate">{userEmail}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ID: {localStorage.getItem('user_id')?.slice(0, 8)}...
              </p>
            </div>

            <div className="p-1">
              <button
                onClick={() => {
                  handleGoHome();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">Home</span>
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
