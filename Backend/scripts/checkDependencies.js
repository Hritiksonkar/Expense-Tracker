const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkAndInstallDependencies() {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');

    try {
        // Read package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const requiredDeps = packageJson.dependencies || {};

        // Check each dependency
        Object.keys(requiredDeps).forEach(dep => {
            try {
                require(dep);
            } catch (err) {
                if (err.code === 'MODULE_NOT_FOUND') {
                    console.log(`Installing missing dependency: ${dep}`);
                    execSync('npm install ' + dep, { stdio: 'inherit' });
                }
            }
        });

        console.log('All dependencies are installed correctly.');
    } catch (err) {
        console.error('Error checking dependencies:', err);
        process.exit(1);
    }
}

checkAndInstallDependencies();
