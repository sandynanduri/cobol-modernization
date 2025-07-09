import { CobolAnalysis } from '@/store/appStore';

export interface ProgramDependency {
  programName: string;
  calledPrograms: string[];
  calledBy: string[];
  copybooks: string[];
  isSubprogram: boolean;
  isMainProgram: boolean;
}

export interface DependencyGraph {
  programs: Map<string, ProgramDependency>;
  missingPrograms: string[];
  copybooks: string[];
  orphanedPrograms: string[];
}

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

  // Check for divisions and extract dependencies
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.includes('IDENTIFICATION DIVISION')) {
      analysis.hasIdentificationDivision = true;
      analysis.divisions.push('IDENTIFICATION');
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

  // Determine file type based on updated criteria
  if (analysis.fileType !== 'copybook') { // Only if not already determined by extension
    if (!analysis.hasIdentificationDivision && analysis.hasDataDivision) {
      // Copybook: No IDENTIFICATION DIVISION, has data definitions
      analysis.fileType = 'copybook';
    } else if (analysis.hasIdentificationDivision && analysis.hasProcedureDivision) {
      // Check if it's called by other programs (semantic detection)
      const isCalledProgram = analysis.dependencies.callStatements.length === 0 && 
                             lines.some(line => line.includes('LINKAGE SECTION'));
      
      if (isCalledProgram) {
        analysis.fileType = 'subprogram';
      } else {
        analysis.fileType = 'main-program';
      }
    } else if (analysis.hasDataDivision && !analysis.hasProcedureDivision) {
      // Data definitions only, no executable logic
      analysis.fileType = 'copybook';
    }
  }

  return analysis;
};

// Extract program name from COBOL file content
export const extractProgramName = (content: string): string => {
  const lines = content.toUpperCase().split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    const match = trimmedLine.match(/PROGRAM-ID\.\s*([A-Z0-9-]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return '';
};

// Enhanced dependency analysis for multiple files
export const analyzeDependencies = (files: Array<{ name: string; content: string }>): DependencyGraph => {
  const programs = new Map<string, ProgramDependency>();
  const allCallStatements = new Set<string>();
  const copybooks = new Set<string>();

  // First pass: Identify all programs and their immediate dependencies
  files.forEach(file => {
    const analysis = analyzeCobolFile(file.content, file.name);
    const programName = extractProgramName(file.content) || file.name.replace(/\.(cbl|cob|cobol)$/i, '').toUpperCase();
    
    if (analysis.fileType === 'copybook') {
      copybooks.add(programName);
      return;
    }

    const dependency: ProgramDependency = {
      programName,
      calledPrograms: [...new Set(analysis.dependencies.callStatements)], // Remove duplicates
      calledBy: [],
      copybooks: [...new Set(analysis.dependencies.copyStatements)],
      isSubprogram: analysis.fileType === 'subprogram',
      isMainProgram: analysis.fileType === 'main-program'
    };

    programs.set(programName, dependency);
    
    // Collect all call statements for missing program detection
    analysis.dependencies.callStatements.forEach(call => allCallStatements.add(call));
  });

  // Second pass: Build reverse dependencies (calledBy relationships)
  programs.forEach((program, programName) => {
    program.calledPrograms.forEach(calledProgram => {
      const calledProgramData = programs.get(calledProgram);
      if (calledProgramData) {
        calledProgramData.calledBy.push(programName);
        // If a program is called by others, it's likely a subprogram
        if (calledProgramData.calledBy.length > 0) {
          calledProgramData.isSubprogram = true;
          calledProgramData.isMainProgram = false;
        }
      }
    });
  });

  // Identify missing programs (called but not found in uploaded files)
  const existingPrograms = new Set(programs.keys());
  const missingPrograms = Array.from(allCallStatements).filter(call => !existingPrograms.has(call));

  // Identify orphaned programs (not called by anyone and don't call others)
  const orphanedPrograms = Array.from(programs.entries())
    .filter(([_, program]) => program.calledBy.length === 0 && program.calledPrograms.length === 0)
    .map(([name, _]) => name);

  return {
    programs,
    missingPrograms,
    copybooks: Array.from(copybooks),
    orphanedPrograms
  };
};