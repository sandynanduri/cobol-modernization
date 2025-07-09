import { CobolAnalysis } from '@/store/appStore';

export const analyzeCobolFile = (content: string, fileName: string): CobolAnalysis => {
  const lines = content.toUpperCase().split('\n');
  const analysis: CobolAnalysis = {
    fileType: 'unknown',
    divisions: [],
    hasIdentificationDivision: false,
    hasEnvironmentDivision: false,
    hasDataDivision: false,
    hasProcedureDivision: false,
    dependencies: {
      copyStatements: [],
      callStatements: [],
      fileAssignments: [],
      databaseConnections: [],
      externalReferences: []
    }
  };

  // Determine file type based on extension and content
  if (fileName.toLowerCase().includes('.cpy') || fileName.toLowerCase().includes('.copy')) {
    analysis.fileType = 'copybook';
  }

  // Check for divisions
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.includes('IDENTIFICATION DIVISION')) {
      analysis.hasIdentificationDivision = true;
      analysis.divisions.push('IDENTIFICATION');
      if (analysis.fileType === 'unknown') {
        analysis.fileType = 'main-program';
      }
    }
    
    if (trimmedLine.includes('ENVIRONMENT DIVISION')) {
      analysis.hasEnvironmentDivision = true;
      analysis.divisions.push('ENVIRONMENT');
    }
    
    if (trimmedLine.includes('DATA DIVISION')) {
      analysis.hasDataDivision = true;
      analysis.divisions.push('DATA');
    }
    
    if (trimmedLine.includes('PROCEDURE DIVISION')) {
      analysis.hasProcedureDivision = true;
      analysis.divisions.push('PROCEDURE');
    }

    // Extract dependencies
    if (trimmedLine.includes('COPY ')) {
      const copyMatch = trimmedLine.match(/COPY\s+([A-Z0-9-]+)/);
      if (copyMatch && copyMatch[1]) {
        analysis.dependencies.copyStatements.push(copyMatch[1]);
      }
    }

    if (trimmedLine.includes('CALL ')) {
      const callMatch = trimmedLine.match(/CALL\s+['"]([^'"]+)['"]/);
      if (callMatch && callMatch[1]) {
        analysis.dependencies.callStatements.push(callMatch[1]);
      }
    }

    if (trimmedLine.includes('SELECT ') && trimmedLine.includes('ASSIGN TO')) {
      const assignMatch = trimmedLine.match(/ASSIGN\s+TO\s+([A-Z0-9-]+)/);
      if (assignMatch && assignMatch[1]) {
        analysis.dependencies.fileAssignments.push(assignMatch[1]);
      }
    }

    if (trimmedLine.includes('EXEC SQL') || trimmedLine.includes('EXEC CICS')) {
      analysis.dependencies.databaseConnections.push(
        trimmedLine.includes('EXEC SQL') ? 'SQL Database' : 'CICS Transaction'
      );
    }
  });

  // Determine if it's a subprogram
  if (analysis.fileType === 'unknown' && analysis.hasProcedureDivision && !analysis.hasIdentificationDivision) {
    analysis.fileType = 'subprogram';
  }

  // If still unknown but has copybook characteristics
  if (analysis.fileType === 'unknown' && (analysis.hasDataDivision && !analysis.hasProcedureDivision)) {
    analysis.fileType = 'copybook';
  }

  return analysis;
};