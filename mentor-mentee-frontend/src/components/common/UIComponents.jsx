import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <Loader2 className="w-10 h-10 animate-spin text-accent" />
  </div>
);

export const Button = ({ children, isLoading, className = "btn-primary", ...props }) => (
  <button className={className} disabled={isLoading} {...props}>
    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
    {children}
  </button>
);

export const Input = React.forwardRef(({ label, error, ...props }, ref) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <input ref={ref} className="input-field" {...props} />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
));

export const Card = ({ children, className = "" }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);
