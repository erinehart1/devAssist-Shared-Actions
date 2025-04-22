# === .github/scripts/create-current-cmdt.js ===
const { execSync } = require('child_process');
const commitSha = execSync('git rev-parse HEAD').toString().trim();
const deployer = execSync('git config user.name').toString().trim();
const filePath = execSync('git diff-tree --no-commit-id --name-only -r ' + commitSha).toString().trim();
const developerName = `Current_${filePath.replace(/[\/]/g, '_').replace(/\.[^/.]+$/, '')}`;

const currentRecord = {
  DeveloperName: developerName,
  Label: `Current Metadata - ${new Date().toISOString()}`,
  GitHub_File_Path__c: filePath,
  Repo_Owner__c: process.env.GITHUB_REPOSITORY?.split('/')[0] || '',
  Repo_Name__c: process.env.GITHUB_REPOSITORY?.split('/')[1] || '',
  Last_Commit_Sha__c: commitSha,
  GitHub_File_URL__c: `https://github.com/${process.env.GITHUB_REPOSITORY}/blob/main/${filePath}`,
  Source__c: 'GitHub Action',
  Task__c: execSync('git log -1 --pretty=%s').toString().trim(),
  Last_Deployed_By__c: deployer
};

try {
  execSync(`sfdx force:data:record:update -s DevAssist_Metadata__mdt -w "DeveloperName='${developerName}'" -v "${Object.entries(currentRecord).map(([k,v]) => `${k}='${v}'`).join(' ')}"`, { stdio: 'inherit' });
} catch (e) {
  try {
    execSync(`sfdx force:data:record:create -s DevAssist_Metadata__mdt -v "${Object.entries(currentRecord).map(([k,v]) => `${k}='${v}'`).join(' ')}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to insert or update current CMDT record:', err);
  }
}