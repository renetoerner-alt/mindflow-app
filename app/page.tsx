'use client';

import { useAuth } from '@/lib/useAuth';
import MindFlowApp from '@/components/MindFlowApp';
import AuthForm from '@/components/AuthForm';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-100">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthForm />;
  return <MindFlowApp userId={user.id} userEmail={user.email} />;
}
