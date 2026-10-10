import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '../../presentation/components/ui/button';
import { Input } from '../../presentation/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../../presentation/components/ui/alert';
import { Loader2 } from 'lucide-react';
import BrandWordmark from '../../presentation/components/atoms/BrandWordmark';
import { useAuthContext } from '../../application/providers/AuthProvider';

const LoginPage: React.FC = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('seller@example.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      await login(email, password);
      await navigate({ to: '/admin' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-forest px-4">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div aria-hidden="true" className="absolute top-0 left-0 h-96 w-full bg-pine/40" />
        <div aria-hidden="true" className="absolute bottom-0 right-0 h-96 w-full bg-moss/20" />
      </div>
      <div className="w-full max-w-md rounded-[32px] border border-moss/30 bg-cream p-8 shadow-2xl">
        <div className="flex justify-center mb-8">
          <BrandWordmark />
        </div>
        <h1 className="text-center text-2xl font-black text-forest font-display">Welcome back to the market</h1>
        <p className="mt-2 text-center text-sm text-soil/60">Sign in to manage your stalls and produce.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Email</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              className="focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
            />
          </label>
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Password</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
            />
          </label>
          {error && (
            <Alert variant="destructive" className="text-left">
              <AlertTitle>Sign in failed</AlertTitle>
              <AlertDescription className="pt-1">{error}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            className="w-full focus-visible:ring-2 focus-visible:ring-honey focus-visible:ring-offset-2"
            disabled={pending}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            Sign in
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-soil/50">
          Demo account · <Link to="/" className="text-pine hover:text-clay underline">browse the market</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;