# === .github/scripts/create-history-cmdt.js ===
const { execSync } = require('child_process');
const commitSha = execSync('git rev-parse HEAD').toString().trim();
const deployer = execSync('git config user.name').toString().trim();
const taskName = execSync('git log -1 --pretty=%s').toString().trim();
const filePath = execSync('git diff-tree --no-commit-id --name-only -r ' + commitSha).toString().trim();

const historyRecord = {
  DeveloperName: `Hist_${Date.now()}`,
  Label: `Change - ${new Date().toISOString()}`,
  GitHub_Commit_Sha__c: commitSha,
  Task_Name__c: taskName,
  Deployed_By__c: deployer,
  Deployed_At__c: new Date().toISOString(),
  GitHub_File_Path__c: filePath
};

try {
  execSync(`sfdx force:data:record:create -s DevAssist_Metadata_History__mdt -v "${Object.entries(historyRecord).map(([k,v]) => `${k}='${v}'`).join(' ')}"`, { stdio: 'inherit' });
} catch (e) {
  console.error('Failed to insert history CMDT record:', e);
}