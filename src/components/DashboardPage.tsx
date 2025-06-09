
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { 
  BarChart3, 
  FileText, 
  Code, 
  CheckCircle, 
  XCircle, 
  Plus,
  TrendingUp 
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { 
    sessions, 
    totalFilesUploaded, 
    totalLinesProcessed, 
    pythonConversions, 
    javaConversions,
    setCurrentStep,
    resetCurrentSession
  } = useAppStore();

  const handleNewConversion = () => {
    resetCurrentSession();
    setCurrentStep('upload');
  };

  const stats = [
    {
      title: "Total Files",
      value: totalFilesUploaded,
      icon: FileText,
      description: "Files uploaded and processed"
    },
    {
      title: "Lines Processed",
      value: totalLinesProcessed.toLocaleString(),
      icon: Code,
      description: "Total lines of COBOL code analyzed"
    },
    {
      title: "Python Conversions",
      value: pythonConversions,
      icon: TrendingUp,
      description: "Successful Python conversions"
    },
    {
      title: "Java Conversions",
      value: javaConversions,
      icon: TrendingUp,
      description: "Successful Java conversions"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Conversion Dashboard</h1>
          <p className="text-muted-foreground">
            Track your COBOL conversion projects and statistics
          </p>
        </div>
        <Button onClick={handleNewConversion}>
          <Plus className="mr-2 h-4 w-4" />
          New Conversion
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Recent Conversion Sessions</span>
          </CardTitle>
          <CardDescription>
            Your latest COBOL conversion projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.slice(-5).reverse().map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`
                      h-2 w-2 rounded-full
                      ${session.status === 'completed' ? 'bg-green-500' : 
                        session.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}
                    `} />
                    <div>
                      <h3 className="font-medium">{session.fileName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {session.linesProcessed} lines → {session.targetLanguage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium capitalize">{session.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    {session.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : session.status === 'failed' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Conversions Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first COBOL conversion to see statistics here
              </p>
              <Button onClick={handleNewConversion}>
                <Plus className="mr-2 h-4 w-4" />
                Start First Conversion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
