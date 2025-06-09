
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/appStore';
import { FileText, Target, CheckCircle, AlertCircle } from 'lucide-react';

const PreviewPanel: React.FC = () => {
  const { currentFile, targetLanguage } = useAppStore();

  if (!currentFile && !targetLanguage) {
    return null;
  }

  const isReady = currentFile && targetLanguage;

  return (
    <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${isReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span>Analysis Preview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Source File</span>
            </div>
            {currentFile ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
          </div>
          {currentFile && (
            <div className="ml-6 space-y-1">
              <p className="text-sm font-medium">{currentFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(currentFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Target Language</span>
            </div>
            {targetLanguage ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
          </div>
          {targetLanguage && (
            <div className="ml-6">
              <Badge variant="secondary" className="text-xs">
                {targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)}
              </Badge>
            </div>
          )}
        </div>

        {isReady && (
          <div className="mt-4 pt-3 border-t border-muted">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Ready for Analysis</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              All requirements met. Click "Start Analysis" to begin conversion.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreviewPanel;
