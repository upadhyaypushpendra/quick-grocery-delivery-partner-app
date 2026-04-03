import { User } from 'lucide-react';

interface ProfileHeaderProps {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export default function ProfileHeader({ firstName, lastName, email }: ProfileHeaderProps) {
  // Get user initials
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : email?.[0]?.toUpperCase() || '?';

  return (
    <div className="mb-8">
      <div className="flex items-center gap-6 bg-brand-50 border-2 border-brand-200 rounded-lg p-6 mb-6">
        {/* Avatar */}
        <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-white">{initials}</span>
        </div>
        {/* Profile Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-brand-700">
            {firstName && lastName ? `${firstName} ${lastName}` : 'Account'}
          </h1>
          <p className="text-sm text-brand-600 mt-1">{email}</p>
          <p className="text-xs text-brand-400 mt-1 flex items-center gap-1"><User className="w-3 h-3" /> Member since {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
