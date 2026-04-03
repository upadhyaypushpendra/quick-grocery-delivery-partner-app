import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { ClipboardList, User, LogOut } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const logout = useLogout();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      setIsDropdownOpen(false);
      navigate('/auth/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="bg-brand-100 shadow-md border-b-4 border-brand-600 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={'/AppLogoFull.png'} alt="QuickGrocery" className="h-12 w-auto" />
        </Link>

        {/* Right Side - Account Menu */}
        {user && (
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-brand-700">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-brand-600">{user?.identifier}</p>
            </div>

            {/* Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 bg-brand-600 text-white rounded-full font-bold flex items-center justify-center hover:bg-brand-700 transition"
              >
                {initials}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-brand-200 rounded-lg shadow-lg">
                  <button
                    onClick={() => {
                      navigate('/deliveries');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 border-b border-brand-100 flex items-center gap-2"
                  >
                    <ClipboardList className="w-4 h-4" /> Delivery History
                  </button>
                  <button
                    onClick={() => {
                      navigate('/account');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 border-b border-brand-100 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" /> View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4" /> {logout.isPending ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
