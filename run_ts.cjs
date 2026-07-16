const { execSync } = require('child_process');
try {
  const output = execSync('npx tsc --noEmit').toString();
  console.log("Success:\n" + output);
} catch (e) {
  console.log("Error:\n" + e.stdout.toString());
}
