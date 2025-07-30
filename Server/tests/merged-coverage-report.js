const fs = require('fs');
const path = require('path');

/**
 * Generate a comprehensive merged coverage report combining Jest and Cucumber data
 */
class MergedCoverageReport {
  constructor() {
    this.coverageDir = path.join(__dirname, 'coverage');
    this.jestCoveragePath = path.join(this.coverageDir, 'jest', 'coverage-final.json');
    this.cucumberCoveragePath = path.join(this.coverageDir, 'cucumber', 'lcov.info');
    this.outputPath = path.join(this.coverageDir, 'merged-coverage.html');
  }

  /**
   * Parse Jest coverage data
   */
  parseJestCoverage() {
    if (!fs.existsSync(this.jestCoveragePath)) {
      return { files: {}, summary: { statements: 0, branches: 0, functions: 0, lines: 0 } };
    }

    try {
      const data = JSON.parse(fs.readFileSync(this.jestCoveragePath, 'utf8'));
      const files = {};
      let totalStatements = 0, totalBranches = 0, totalFunctions = 0, totalLines = 0;
      let coveredStatements = 0, coveredBranches = 0, coveredFunctions = 0, coveredLines = 0;

      Object.keys(data).forEach(filePath => {
        const fileData = data[filePath];
        const relativePath = path.relative(process.cwd(), filePath);
        
        // Calculate coverage metrics
        const statements = Object.keys(fileData.s).length;
        const branches = Object.keys(fileData.b).length;
        const functions = Object.keys(fileData.f).length;
        const lines = Object.keys(fileData.s).length;

        const coveredS = Object.values(fileData.s).filter(count => count > 0).length;
        const coveredB = Object.values(fileData.b).flat().filter(count => count > 0).length;
        const coveredF = Object.values(fileData.f).filter(count => count > 0).length;
        const coveredL = Object.values(fileData.s).filter(count => count > 0).length;

        files[relativePath] = {
          statements: { total: statements, covered: coveredS, percentage: statements > 0 ? (coveredS / statements * 100).toFixed(1) : 0 },
          branches: { total: branches, covered: coveredB, percentage: branches > 0 ? (coveredB / branches * 100).toFixed(1) : 0 },
          functions: { total: functions, covered: coveredF, percentage: functions > 0 ? (coveredF / functions * 100).toFixed(1) : 0 },
          lines: { total: lines, covered: coveredL, percentage: lines > 0 ? (coveredL / lines * 100).toFixed(1) : 0 }
        };

        totalStatements += statements;
        totalBranches += branches;
        totalFunctions += functions;
        totalLines += lines;
        coveredStatements += coveredS;
        coveredBranches += coveredB;
        coveredFunctions += coveredF;
        coveredLines += coveredL;
      });

      return {
        files,
        summary: {
          statements: { total: totalStatements, covered: coveredStatements, percentage: totalStatements > 0 ? (coveredStatements / totalStatements * 100).toFixed(1) : 0 },
          branches: { total: totalBranches, covered: coveredBranches, percentage: totalBranches > 0 ? (coveredBranches / totalBranches * 100).toFixed(1) : 0 },
          functions: { total: totalFunctions, covered: coveredFunctions, percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100).toFixed(1) : 0 },
          lines: { total: totalLines, covered: coveredLines, percentage: totalLines > 0 ? (coveredLines / totalLines * 100).toFixed(1) : 0 }
        }
      };
    } catch (error) {
      console.error('Error parsing Jest coverage:', error.message);
      return { files: {}, summary: { statements: 0, branches: 0, functions: 0, lines: 0 } };
    }
  }

  /**
   * Parse Cucumber coverage data
   */
  parseCucumberCoverage() {
    if (!fs.existsSync(this.cucumberCoveragePath)) {
      return { scenarios: 0, steps: 0, features: 0 };
    }

    try {
      const lcovData = fs.readFileSync(this.cucumberCoveragePath, 'utf8');
      const lines = lcovData.split('\n');
      let scenarios = 0, steps = 0, features = 0;

      // Count scenarios and steps from feature files
      const featuresDir = path.join(__dirname, 'features');
      if (fs.existsSync(featuresDir)) {
        const featureFiles = fs.readdirSync(featuresDir).filter(file => file.endsWith('.feature'));
        features = featureFiles.length;

        featureFiles.forEach(file => {
          const content = fs.readFileSync(path.join(featuresDir, file), 'utf8');
          const scenarioMatches = content.match(/Scenario/g);
          const stepMatches = content.match(/(Given|When|Then|And|But)\s+/g);
          
          if (scenarioMatches) scenarios += scenarioMatches.length;
          if (stepMatches) steps += stepMatches.length;
        });
      }

      return { scenarios, steps, features };
    } catch (error) {
      console.error('Error parsing Cucumber coverage:', error.message);
      return { scenarios: 0, steps: 0, features: 0 };
    }
  }

  /**
   * Generate the merged coverage HTML report
   */
  generateReport() {
    const jestData = this.parseJestCoverage();
    const cucumberData = this.parseCucumberCoverage();

    const html = this.generateHTML(jestData, cucumberData);
    
    // Ensure coverage directory exists
    if (!fs.existsSync(this.coverageDir)) {
      fs.mkdirSync(this.coverageDir, { recursive: true });
    }

    fs.writeFileSync(this.outputPath, html);
    console.log(`📊 Merged coverage report generated: ${this.outputPath}`);
    
    return { jestData, cucumberData };
  }

  /**
   * Generate the HTML content
   */
  generateHTML(jestData, cucumberData) {
    const getCoverageColor = (percentage) => {
      const num = parseFloat(percentage);
      if (num >= 80) return '#4CAF50';
      if (num >= 60) return '#FF9800';
      return '#F44336';
    };

    const getCoverageClass = (percentage) => {
      const num = parseFloat(percentage);
      if (num >= 80) return 'high';
      if (num >= 60) return 'medium';
      return 'low';
    };

    const formatFileList = (files) => {
      return Object.entries(files)
        .sort(([,a], [,b]) => parseFloat(b.lines.percentage) - parseFloat(a.lines.percentage))
        .map(([file, coverage]) => `
          <tr class="file-row">
            <td class="file-name">${file}</td>
            <td class="coverage-cell ${getCoverageClass(coverage.statements.percentage)}">
              ${coverage.statements.covered}/${coverage.statements.total} (${coverage.statements.percentage}%)
            </td>
            <td class="coverage-cell ${getCoverageClass(coverage.branches.percentage)}">
              ${coverage.branches.covered}/${coverage.branches.total} (${coverage.branches.percentage}%)
            </td>
            <td class="coverage-cell ${getCoverageClass(coverage.functions.percentage)}">
              ${coverage.functions.covered}/${coverage.functions.total} (${coverage.functions.percentage}%)
            </td>
            <td class="coverage-cell ${getCoverageClass(coverage.lines.percentage)}">
              ${coverage.lines.covered}/${coverage.lines.total} (${coverage.lines.percentage}%)
            </td>
          </tr>
        `).join('');
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Merged Coverage Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 300;
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }

        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            text-align: center;
            border-left: 4px solid #3498db;
        }

        .summary-card.jest {
            border-left-color: #e74c3c;
        }

        .summary-card.cucumber {
            border-left-color: #27ae60;
        }

        .summary-card.merged {
            border-left-color: #9b59b6;
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 10px 0;
        }

        .metric-label {
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .coverage-bar {
            width: 100%;
            height: 8px;
            background: #ecf0f1;
            border-radius: 4px;
            margin: 10px 0;
            overflow: hidden;
        }

        .coverage-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }

        .high { background: #27ae60; }
        .medium { background: #f39c12; }
        .low { background: #e74c3c; }

        .content {
            padding: 30px;
        }

        .section {
            margin-bottom: 40px;
        }

        .section h2 {
            font-size: 1.8rem;
            margin-bottom: 20px;
            color: #2c3e50;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }

        .stat-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #2c3e50;
        }

        .stat-label {
            color: #666;
            font-size: 0.9rem;
            margin-top: 5px;
        }

        .file-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .file-table th {
            background: #34495e;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 500;
        }

        .file-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #ecf0f1;
        }

        .file-name {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9rem;
        }

        .coverage-cell {
            text-align: center;
            font-weight: 500;
        }

        .file-row:hover {
            background: #f8f9fa;
        }

        .footer {
            background: #34495e;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .summary-grid {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .file-table {
                font-size: 0.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Merged Coverage Report</h1>
            <p>Comprehensive test coverage combining Jest unit tests and Cucumber E2E tests</p>
        </div>

        <div class="summary-grid">
            <div class="summary-card jest">
                <h3>🧪 Jest Coverage</h3>
                <div class="metric-value">${jestData.summary.lines.percentage}%</div>
                <div class="metric-label">Lines Covered</div>
                <div class="coverage-bar">
                    <div class="coverage-fill ${getCoverageClass(jestData.summary.lines.percentage)}" 
                         style="width: ${jestData.summary.lines.percentage}%"></div>
                </div>
                <div class="metric-label">${jestData.summary.lines.covered}/${jestData.summary.lines.total} lines</div>
            </div>

            <div class="summary-card cucumber">
                <h3>🥒 Cucumber Tests</h3>
                <div class="metric-value">${cucumberData.scenarios}</div>
                <div class="metric-label">Scenarios</div>
                <div class="metric-value">${cucumberData.steps}</div>
                <div class="metric-label">Steps</div>
                <div class="metric-value">${cucumberData.features}</div>
                <div class="metric-label">Features</div>
            </div>

            <div class="summary-card merged">
                <h3>🚀 Overall Status</h3>
                <div class="metric-value">${jestData.summary.statements.percentage}%</div>
                <div class="metric-label">Statements</div>
                <div class="metric-value">${jestData.summary.branches.percentage}%</div>
                <div class="metric-label">Branches</div>
                <div class="metric-value">${jestData.summary.functions.percentage}%</div>
                <div class="metric-label">Functions</div>
            </div>
        </div>

        <div class="content">
            <div class="section">
                <h2>📈 Coverage Summary</h2>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">${jestData.summary.statements.percentage}%</div>
                        <div class="stat-label">Statements</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${jestData.summary.branches.percentage}%</div>
                        <div class="stat-label">Branches</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${jestData.summary.functions.percentage}%</div>
                        <div class="stat-label">Functions</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${jestData.summary.lines.percentage}%</div>
                        <div class="stat-label">Lines</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>📁 File Coverage Details</h2>
                <table class="file-table">
                    <thead>
                        <tr>
                            <th>File</th>
                            <th>Statements</th>
                            <th>Branches</th>
                            <th>Functions</th>
                            <th>Lines</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${formatFileList(jestData.files)}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Jest + Cucumber Coverage Report</p>
        </div>
    </div>
</body>
</html>`;
  }
}

// Run the report generator
if (require.main === module) {
  const generator = new MergedCoverageReport();
  const result = generator.generateReport();
  console.log('📊 Merged Coverage Report Generated Successfully!');
  console.log(`📄 Report: ${generator.outputPath}`);
  console.log(`📈 Jest Coverage: ${result.jestData.summary.lines.percentage}%`);
  console.log(`🥒 Cucumber Tests: ${result.cucumberData.scenarios} scenarios, ${result.cucumberData.steps} steps`);
}

module.exports = MergedCoverageReport; 