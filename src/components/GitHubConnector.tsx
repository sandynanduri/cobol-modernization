
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/appStore';
import { Github, FolderOpen, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GitHubFile {
  name: string;
  path: string;
  content: string;
  size: number;
}

const GitHubConnector: React.FC = () => {
  const { setCurrentFile } = useAppStore();
  const [repoUrl, setRepoUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<GitHubFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const parseGitHubUrl = (url: string) => {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
    return null;
  };

  const fetchRepositoryFiles = async () => {
    if (!repoUrl.trim()) {
      toast({
        title: "Repository URL Required",
        description: "Please enter a GitHub repository URL",
        variant: "destructive"
      });
      return;
    }

    const repoInfo = parseGitHubUrl(repoUrl);
    if (!repoInfo) {
      toast({
        title: "Invalid GitHub URL",
        description: "Please enter a valid GitHub repository URL",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Mock API call - in a real implementation, this would use GitHub API
      // For demo purposes, we'll simulate finding COBOL files
      const mockFiles: GitHubFile[] = [
        {
          name: 'payroll.cbl',
          path: 'src/payroll.cbl',
          content: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. PAYROLL.
       
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 EMPLOYEE-RECORD.
          05 EMP-ID       PIC 9(5).
          05 EMP-NAME     PIC X(30).
          05 EMP-SALARY   PIC 9(7)V99.
       
       PROCEDURE DIVISION.
       MAIN-PARA.
           DISPLAY "PAYROLL SYSTEM STARTED".
           PERFORM CALCULATE-PAY.
           STOP RUN.
       
       CALCULATE-PAY.
           COMPUTE EMP-SALARY = EMP-SALARY * 1.05.
           DISPLAY "Updated salary: " EMP-SALARY.`,
          size: 542
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
        description: `Found ${mockFiles.length} COBOL files in ${repoInfo.owner}/${repoInfo.repo}`
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

    setCurrentFile({
      id: Date.now().toString(),
      name: file.name,
      type: 'text/plain',
      size: file.size,
      content: file.content,
      uploadedAt: new Date()
    });

    setIsDialogOpen(false);
    setSelectedFile('');
    
    toast({
      title: "File Imported",
      description: `${file.name} has been imported from the repository`
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Github className="h-5 w-5" />
            <span>Connect to GitHub Repository</span>
          </CardTitle>
          <CardDescription>
            Import COBOL files directly from your GitHub repository
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
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

export default GitHubConnector;
