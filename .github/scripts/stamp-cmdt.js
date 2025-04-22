# === .github/scripts/stamp-cmdt.js ===
// Node.js script to create CMDT records using Salesforce CLI or REST API
// Assumes SF_USERNAME is authenticated and available in the env

const { execSync } = require('child_process');
const commitSha = execSync('git rev-parse HEAD').toString().trim();
const deployer = execSync('git config user.name').toString().trim();
const taskName = execSync('git log -1 --pretty=%s').toString().trim();
const filePath = execSync('git diff-tree --no-commit-id --name-only -r ' + commitSha).toString().trim();

const record = {
  DeveloperName: `Current_${Date.now()}`,
  Label: `Deployed ${new Date().toISOString()}`,
  GitHub_Commit_Sha__c: commitSha,
  Task_Name__c: taskName,
  Deployed_By__c: deployer,
  Deployed_At__c: new Date().toISOString(),
  GitHub_File_Path__c: filePath
};

const cmdtPayload = JSON.stringify(record, null, 2);
const fs = require('fs');
fs.writeFileSync('tempRecord.md-meta.xml', cmdtPayload);

// Example of creating CMDT via Salesforce CLI (you can use Metadata API as well)
try {
  execSync(`sfdx force:data:record:create -s DevAssist_Metadata_History__mdt -v "${Object.entries(record).map(([k,v]) => `${k}='${v}'`).join(' ')}"`, { stdio: 'inherit' });
} catch (e) {
  console.error('Failed to insert CMDT history record:', e);
}