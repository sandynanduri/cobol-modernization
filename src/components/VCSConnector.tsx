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
      // Only support GitHub for now
      if (repoInfo.provider !== 'GitHub') {
        toast({
          title: "Provider Not Supported",
          description: "Currently only GitHub repositories are supported",
          variant: "destructive"
        });
        return;
      }

      // Fetch repository content from GitHub API
      const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const contents = await response.json();
      const allFiles: VCSFile[] = [];

      // Process files recursively
      const processContents = async (items: any[], basePath = '') => {
        for (const item of items) {
          if (item.type === 'file') {
            const fileExtension = item.name.split('.').pop()?.toLowerCase();
            const isCobol = isCobolFile(item.name);
            
            // Only fetch content for COBOL files or small non-binary files
            let content = '';
            if (isCobol || (item.size < 10000 && !item.name.match(/\.(jpg|jpeg|png|gif|zip|tar|gz|exe|bin)$/i))) {
              try {
                const fileResponse = await fetch(item.download_url);
                if (fileResponse.ok) {
                  content = await fileResponse.text();
                }
              } catch (e) {
                console.warn(`Failed to fetch content for ${item.name}`);
              }
            }

            allFiles.push({
              name: item.name,
              path: item.path,
              content,
              size: item.size,
              type: isCobol ? 'cobol' : 'other'
            });
          } else if (item.type === 'dir') {
            // Recursively fetch directory contents
            try {
              const dirResponse = await fetch(item.url);
              if (dirResponse.ok) {
                const dirContents = await dirResponse.json();
                await processContents(dirContents, item.path);
              }
            } catch (e) {
              console.warn(`Failed to fetch directory ${item.name}`);
            }
          }
        }
      };

      await processContents(contents);

      const cobolFiles = allFiles.filter(f => f.type === 'cobol');
      const otherFiles = allFiles.filter(f => f.type === 'other');

      const repositoryData: RepositoryInfo = {
        provider: repoInfo.provider,
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        fullUrl: repoInfo.fullUrl,
        totalFiles: allFiles.length,
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
      console.error('Repository fetch error:', error);
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
