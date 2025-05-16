
import React from 'react';
import { Stethoscope, Volume2 } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-medical-light via-white to-medical-accent p-4 border-b border-medical-light shadow-sm">
      <div className="container max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-medical-primary to-medical-secondary p-2 rounded-lg shadow-md">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-medical-secondary">GPAI</h1>
            <div className="text-xs text-muted-foreground">General Practitioner AI</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-medical-light">
          <Volume2 className="h-4 w-4 text-medical-secondary" />
          <div className="text-sm font-medium text-medical-secondary">Voice Enabled</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
