
import React from 'react';
import { Shield, Lock, Zap } from 'lucide-react';

const TrustSignal: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200/50 py-4 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span>AI-Powered Conversion</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Privacy First</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-purple-600" />
            <span>Enterprise Secure</span>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Trusted by enterprise teams for mission-critical COBOL modernization
        </p>
      </div>
    </div>
  );
};

export default TrustSignal;
