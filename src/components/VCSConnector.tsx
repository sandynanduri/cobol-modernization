import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppStore } from '@/store/appStore';
import { GitBranch, FolderOpen, AlertCircle, HelpCircle, FileText, Download, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VCSFile {
  name: string;
  path: string;
  content: string;
  size: number;
  type: 'cobol' | 'other';
}

interface RepositoryInfo {
  provider: string;
  owner: string;
  repo: string;
  fullUrl: string;
  totalFiles: number;
  cobolFiles: VCSFile[];
  otherFiles: VCSFile[];
}

const VCSConnector: React.FC = () => {
  const { addUploadedFile } = useAppStore();
  const [repoUrl, setRepoUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [repositoryInfo, setRepositoryInfo] = useState<RepositoryInfo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const detectVCSProvider = (url: string) => {
    if (url.includes('github.com')) return 'GitHub';
    if (url.includes('bitbucket.org')) return 'Bitbucket';
    if (url.includes('gitlab.com')) return 'GitLab';
    if (url.includes('azure.com') || url.includes('visualstudio.com')) return 'Azure DevOps';
    return 'Git Repository';
  };

  const parseRepositoryUrl = (url: string) => {
    // Support various Git repository URL formats
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/,
      /(?:https?:\/\/)?(?:www\.)?bitbucket\.org\/([^\/]+)\/([^\/]+)/,
      /(?:https?:\/\/)?(?:www\.)?gitlab\.com\/([^\/]+)\/([^\/]+)/,
      /(?:https?:\/\/)?([^\/]+)\/([^\/]+)\/([^\/]+)/ // Generic Git URL pattern
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const provider = detectVCSProvider(url);
        return { 
          provider,
          owner: match[1], 
          repo: match[2].replace('.git', ''),
          fullUrl: url
        };
      }
    }
    return null;
  };

  const isCobolFile = (filename: string): boolean => {
    const cobolExtensions = ['.cbl', '.cob', '.cobol', '.CBL', '.COB', '.COBOL'];
    return cobolExtensions.some(ext => filename.endsWith(ext));
  };

  const fetchRepositoryFiles = async () => {
    if (!repoUrl.trim()) {
      toast({
        title: "Repository URL Required",
        description: "Please enter a valid Git repository URL",
        variant: "destructive"
      });
      return;
    }

    const repoInfo = parseRepositoryUrl(repoUrl);
    if (!repoInfo) {
      toast({
        title: "Invalid Repository URL",
        description: "Please enter a valid Git repository URL (GitHub, Bitbucket, GitLab, etc.)",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Mock API call - in a real implementation, this would use the appropriate VCS API
      // Generate mock repository structure with both COBOL and other files
      const allMockFiles: VCSFile[] = [
        {
          name: repoInfo.provider === 'Bitbucket' ? 'accounting.cbl' : 'payroll.cbl',
          path: repoInfo.provider === 'Bitbucket' ? 'src/accounting.cbl' : 'src/payroll.cbl',
          content: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. ${repoInfo.provider === 'Bitbucket' ? 'ACCOUNTING' : 'PAYROLL'}.
       
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 ${repoInfo.provider === 'Bitbucket' ? 'ACCOUNT-RECORD' : 'EMPLOYEE-RECORD'}.
          05 ${repoInfo.provider === 'Bitbucket' ? 'ACC-ID' : 'EMP-ID'}       PIC 9(5).
          05 ${repoInfo.provider === 'Bitbucket' ? 'ACC-NAME' : 'EMP-NAME'}     PIC X(30).
          05 ${repoInfo.provider === 'Bitbucket' ? 'ACC-BALANCE' : 'EMP-SALARY'}   PIC 9(7)V99.
       
       PROCEDURE DIVISION.
       MAIN-PARA.
           DISPLAY "${repoInfo.provider === 'Bitbucket' ? 'ACCOUNTING' : 'PAYROLL'} SYSTEM STARTED".
           PERFORM ${repoInfo.provider === 'Bitbucket' ? 'CALCULATE-BALANCE' : 'CALCULATE-PAY'}.
           STOP RUN.
       
       ${repoInfo.provider === 'Bitbucket' ? 'CALCULATE-BALANCE' : 'CALCULATE-PAY'}.
           ${repoInfo.provider === 'Bitbucket' ? 'COMPUTE ACC-BALANCE = ACC-BALANCE * 1.02' : 'COMPUTE EMP-SALARY = EMP-SALARY * 1.05'}.
           DISPLAY "${repoInfo.provider === 'Bitbucket' ? 'Updated balance: " ACC-BALANCE' : 'Updated salary: " EMP-SALARY'}.`,
          size: repoInfo.provider === 'Bitbucket' ? 567 : 542,
          type: 'cobol'
        },
        {
          name: 'inventory.cbl',
          path: 'modules/inventory.cbl',
          content: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. INVENTORY.
       
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 ITEM-RECORD.
          05 ITEM-CODE    PIC X(10).
          05 ITEM-QTY     PIC 9(5).
          05 ITEM-PRICE   PIC 9(5)V99.
       
       PROCEDURE DIVISION.
       MAIN-PARA.
           DISPLAY "INVENTORY MANAGEMENT".
           PERFORM UPDATE-STOCK.
           STOP RUN.
       
       UPDATE-STOCK.
           ADD 1 TO ITEM-QTY.
           DISPLAY "Stock updated: " ITEM-QTY.`,
          size: 398,
          type: 'cobol'
        },
        {
          name: 'customer.cbl',
          path: 'legacy/customer.cbl',
          content: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. CUSTOMER.
       
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 CUSTOMER-RECORD.
          05 CUST-ID      PIC 9(6).
          05 CUST-NAME    PIC X(25).
          05 CUST-STATUS  PIC X(10).
       
       PROCEDURE DIVISION.
       MAIN-PARA.
           DISPLAY "CUSTOMER MANAGEMENT SYSTEM".
           STOP RUN.`,
          size: 312,
          type: 'cobol'
        },
        {
          name: 'README.md',
          path: 'README.md',
          content: '# Legacy COBOL System\n\nThis repository contains legacy COBOL programs...',
          size: 156,
          type: 'other'
        },
        {
          name: 'build.xml',
          path: 'build.xml',
          content: '<?xml version="1.0"?>\n<project name="cobol-legacy">...</project>',
          size: 245,
          type: 'other'
        },
        {
          name: 'config.properties',
          path: 'config/config.properties',
          content: 'database.host=localhost\ndatabase.port=5432',
          size: 78,
          type: 'other'
        }
      ];

      const cobolFiles = allMockFiles.filter(f => f.type === 'cobol');
      const otherFiles = allMockFiles.filter(f => f.type === 'other');

      const repositoryData: RepositoryInfo = {
        provider: repoInfo.provider,
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        fullUrl: repoInfo.fullUrl,
        totalFiles: allMockFiles.length,
        cobolFiles,
        otherFiles
      };

      setRepositoryInfo(repositoryData);
      setIsDialogOpen(true);
      
      toast({
        title: "Repository Connected",
        description: `Found ${cobolFiles.length} COBOL files in ${repoInfo.provider} repository`
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the repository. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const importAllCobolFiles = async () => {
    if (!repositoryInfo || repositoryInfo.cobolFiles.length === 0) return;

    setIsImporting(true);

    try {
      // Import all COBOL files at once
      repositoryInfo.cobolFiles.forEach((file, index) => {
        addUploadedFile({
          id: `${Date.now()}-${index}`,
          name: file.name,
          type: 'text/plain',
          size: file.size,
          content: file.content,
          uploadedAt: new Date()
        });
      });

      setIsDialogOpen(false);
      
      toast({
        title: "Files Imported Successfully",
        description: `Imported ${repositoryInfo.cobolFiles.length} COBOL files from ${repositoryInfo.provider}`
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import COBOL files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getProviderIcon = () => {
    const provider = detectVCSProvider(repoUrl);
    return <GitBranch className="h-5 w-5" />;
  };

  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5" />
            <span>Import from Git</span>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Import COBOL code directly from a Git repository<br/>(GitHub, Bitbucket, GitLab, Azure DevOps)</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            Connect to your existing repositories to import COBOL programs and dependencies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/example/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            {repoUrl && (
              <p className="text-sm text-muted-foreground">
                Detected provider: {detectVCSProvider(repoUrl)}
              </p>
            )}
          </div>
          <Button 
            onClick={fetchRepositoryFiles}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <FolderOpen className="mr-2 h-4 w-4" />
                Browse Repository Files
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Repository Overview</DialogTitle>
            <DialogDescription>
              {repositoryInfo && `${repositoryInfo.provider} • ${repositoryInfo.owner}/${repositoryInfo.repo}`}
            </DialogDescription>
          </DialogHeader>
          
          {repositoryInfo && (
            <div className="space-y-6">
              {/* Repository Stats */}
              <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{repositoryInfo.cobolFiles.length}</div>
                  <div className="text-sm text-muted-foreground">COBOL Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{repositoryInfo.totalFiles}</div>
                  <div className="text-sm text-muted-foreground">Total Files</div>
                </div>
              </div>

              {repositoryInfo.cobolFiles.length > 0 ? (
                <>
                  {/* COBOL Files Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>COBOL Files to Import</span>
                        <Badge variant="secondary">{repositoryInfo.cobolFiles.length}</Badge>
                      </h3>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {repositoryInfo.cobolFiles.map((file) => (
                        <div key={file.path} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                          <div className="flex items-center space-x-3">
                            <Check className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="font-medium text-sm">{file.name}</div>
                              <div className="text-xs text-muted-foreground">{file.path}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {(file.size / 1024).toFixed(1)} KB
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Other Files Section */}
                  {repositoryInfo.otherFiles.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center space-x-2">
                        <FolderOpen className="h-4 w-4" />
                        <span>Other Files</span>
                        <Badge variant="outline">{repositoryInfo.otherFiles.length}</Badge>
                      </h3>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {repositoryInfo.otherFiles.map((file) => (
                          <div key={file.path} className="flex items-center justify-between p-2 border rounded bg-muted/20">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-3 w-3 text-muted-foreground" />
                              <div>
                                <div className="text-sm">{file.name}</div>
                                <div className="text-xs text-muted-foreground">{file.path}</div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {(file.size / 1024).toFixed(1)} KB
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button 
                      onClick={importAllCobolFiles} 
                      disabled={isImporting}
                      className="flex-1"
                    >
                      {isImporting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Import All COBOL Files ({repositoryInfo.cobolFiles.length})
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No COBOL Files Found</h3>
                  <p className="text-muted-foreground text-sm">
                    This repository doesn't contain any files with COBOL extensions (.cbl, .cob, .cobol)
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VCSConnector;
