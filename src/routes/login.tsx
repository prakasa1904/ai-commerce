import { createFileRoute } from '@tanstack/react-router';
import { useAuthContext } from '../application/providers/AuthProvider';
import { useEffect } from 'react';
import LoginPage from '../modules/admin/LoginPage';

function maybeRedirectToAdmin() {
  const search = document.location.search;
  return search.includes('next=%2Fadmin') || search.includes('next=/admin');
}

export const Route = createFileRoute('/login')({
  component: () => {
    const { user, isReady } = useAuthContext();
    const alreadyAuthed = isReady && user;
    // If already logged in, send admins to /admin and everyone else to /
    useEffect(() => {
      if (alreadyAuthed) {
        const to = maybeRedirectToAdmin() ? '/admin' : '/';
        window.location.assign(to);
      }
    }, [alreadyAuthed]);
    return <LoginPage />;
  },
});