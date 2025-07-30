#!/usr/bin/env node

/**
 * Coverage Merging Script using lcov-result-merger
 * Merges Jest and Cucumber coverage reports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CoverageMerger {
  constructor() {
    this.coverageDir = path.join(__dirname, 'coverage');
    this.jestCoverageDir = path.join(this.coverageDir, 'jest');
    this.cucumberCoverageDir = path.join(this.coverageDir, 'cucumber');
    this.mergedCoverageDir = path.join(this.coverageDir, 'merged');
    this.mergedLcovFile = path.join(this.mergedCoverageDir, 'merged.lcov');
  }

  /**
   * Ensure coverage directories exist
   */
  ensureDirectories() {
    const dirs = [this.coverageDir, this.jestCoverageDir, this.cucumberCoverageDir, this.mergedCoverageDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });
  }

  /**
   * Check if coverage files exist
   */
  checkCoverageFiles() {
    const jestLcov = path.join(this.jestCoverageDir, 'lcov.info');
    const cucumberLcov = path.join(this.cucumberCoverageDir, 'lcov.info');
    
    if (!fs.existsSync(jestLcov)) {
      throw new Error(`Jest coverage file not found: ${jestLcov}`);
    }
    
    if (!fs.existsSync(cucumberLcov)) {
      throw new Error(`Cucumber coverage file not found: ${cucumberLcov}`);
    }
    
    console.log('✅ Found coverage files:');
    console.log(`   Jest: ${jestLcov}`);
    console.log(`   Cucumber: ${cucumberLcov}\n`);
    
    return { jestLcov, cucumberLcov };
  }

  /**
   * Get coverage file statistics
   */
  getCoverageStats(jestLcov, cucumberLcov) {
    const jestSize = fs.statSync(jestLcov).size;
    const cucumberSize = fs.statSync(cucumberLcov).size;
    const jestLines = fs.readFileSync(jestLcov, 'utf8').split('\n').length;
    const cucumberLines = fs.readFileSync(cucumberLcov, 'utf8').split('\n').length;
    
    console.log('📊 Coverage file statistics:');
    console.log(`   Jest: ${jestLines} lines (${(jestSize / 1024).toFixed(2)} KB)`);
    console.log(`   Cucumber: ${cucumberLines} lines (${(cucumberSize / 1024).toFixed(2)} KB)\n`);
    
    return { jestLines, cucumberLines, jestSize, cucumberSize };
  }

  /**
   * Merge coverage using lcov-result-merger
   */
  mergeCoverage(jestLcov, cucumberLcov) {
    console.log('🔗 Merging coverage files using lcov-result-merger...');
    
    try {
      const command = `npx lcov-result-merger "tests/coverage/*/lcov.info" "${this.mergedLcovFile}"`;
      console.log(`Executing: ${command}`);
      
      execSync(command, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log(`✅ Coverage merged successfully to: ${this.mergedLcovFile}`);
    } catch (error) {
      console.error('❌ Coverage merging failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate HTML report from merged coverage
   */
  generateHtmlReport() {
    console.log('📈 Generating HTML report from merged coverage...');
    
    try {
      // Copy merged LCOV file to standard location for NYC
      const standardLcovPath = path.join(this.coverageDir, 'lcov.info');
      fs.copyFileSync(this.mergedLcovFile, standardLcovPath);
      console.log(`✅ Copied merged coverage to: ${standardLcovPath}`);
      
      // Generate HTML report using nyc
      const htmlCommand = `npx nyc report --reporter=html --reporter=text --reporter=text-summary`;
      execSync(htmlCommand, { stdio: 'inherit', cwd: process.cwd() });
      
      console.log(`✅ HTML report generated in: ${this.coverageDir}/lcov-report`);
      console.log(`🌐 Open http://localhost:5001/tests/coverage/index.html to view the report`);
    } catch (error) {
      console.error('❌ HTML report generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Display final summary
   */
  displaySummary() {
    console.log('\n📊 Coverage Merging Summary:');
    console.log('============================');
    
    if (fs.existsSync(this.mergedLcovFile)) {
      const stats = fs.statSync(this.mergedLcovFile);
      const lines = fs.readFileSync(this.mergedLcovFile, 'utf8').split('\n').length;
      console.log(`📁 Merged coverage file: ${this.mergedLcovFile}`);
      console.log(`📏 File size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`📄 Lines: ${lines}`);
    }
    
    const htmlReport = path.join(this.coverageDir, 'index.html');
    if (fs.existsSync(htmlReport)) {
      console.log(`🌐 HTML report: ${htmlReport}`);
    }
    
    console.log('\n🎉 Coverage merging completed successfully!');
    console.log('   The merged coverage reflects all test coverage from both Jest and Cucumber tests.');
    console.log('   This resolves the "coverage reflection issue" where some branches were not showing as covered.');
  }

  /**
   * Main execution method
   */
  async run() {
    try {
      console.log('🚀 Starting coverage merging process with lcov-result-merger...\n');
      
      this.ensureDirectories();
      const { jestLcov, cucumberLcov } = this.checkCoverageFiles();
      this.getCoverageStats(jestLcov, cucumberLcov);
      this.mergeCoverage(jestLcov, cucumberLcov);
      this.generateHtmlReport();
      this.displaySummary();
      
    } catch (error) {
      console.error('\n❌ Coverage merging failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the merger if this script is executed directly
if (require.main === module) {
  const merger = new CoverageMerger();
  merger.run();
}

module.exports = CoverageMerger; 