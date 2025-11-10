import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-primary">Configuration Tool 2.0 POC</h1>
      </div>
    </header>
  );
}
