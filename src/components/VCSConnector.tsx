import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppStore } from '@/store/appStore';
import { GitBranch, FolderOpen, AlertCircle, HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VCSFile {
  name: string;
  path: string;
  content: string;
  size: number;
}

const VCSConnector: React.FC = () => {
  const { addUploadedFile } = useAppStore();
  const [repoUrl, setRepoUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<VCSFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      // For demo purposes, we'll simulate finding COBOL files based on the provider
      const mockFiles: VCSFile[] = [
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
          size: repoInfo.provider === 'Bitbucket' ? 567 : 542
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
          size: 398
        }
      ];

      setAvailableFiles(mockFiles);
      setIsDialogOpen(true);
      
      toast({
        title: "Repository Connected",
        description: `Found ${mockFiles.length} COBOL files in ${repoInfo.provider} repository`
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

  const importFile = () => {
    const file = availableFiles.find(f => f.path === selectedFile);
    if (!file) return;

    addUploadedFile({
      id: Date.now().toString(),
      name: file.name,
      type: 'text/plain',
      size: file.size,
      content: file.content,
      uploadedAt: new Date()
    });

    setIsDialogOpen(false);
    setSelectedFile('');
    
    const provider = detectVCSProvider(repoUrl);
    toast({
      title: "File Imported",
      description: `${file.name} has been imported from ${provider}`
    });
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select COBOL File</DialogTitle>
            <DialogDescription>
              Choose a COBOL file from the repository to import
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableFiles.length > 0 ? (
              <>
                <div className="space-y-2">
                  <Label>Available Files</Label>
                  <Select value={selectedFile} onValueChange={setSelectedFile}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a file" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFiles.map((file) => (
                        <SelectItem key={file.path} value={file.path}>
                          <div className="flex items-center justify-between w-full">
                            <span>{file.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={importFile} 
                    disabled={!selectedFile}
                    className="flex-1"
                  >
                    Import File
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No COBOL files found in this repository</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VCSConnector;
