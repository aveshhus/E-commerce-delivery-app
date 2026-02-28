const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');

const apiJsPath = path.join(__dirname, 'web-app', 'src', 'services', 'api.js');
let originalApiContent = fs.readFileSync(apiJsPath, 'utf8');

async function start() {
    console.log('Starting tunnels...');

    // Tunnel for backend
    const backendTunnel = await localtunnel({ port: 5000 });
    console.log(`✅ Backend API Tunneled to: ${backendTunnel.url}`);

    // Tunnel for frontend
    const frontendTunnel = await localtunnel({ port: 5173 });
    console.log(`✅ Frontend App Tunneled to: ${frontendTunnel.url}`);
    console.log(`\n=========================================\nShare this URL with your client:\n👉 ${frontendTunnel.url}\n=========================================\n`);

    // Update api.js
    let newApiContent = originalApiContent.replace(
        /const API_BASE_URL = 'http:\/\/localhost:5000\/api';/g,
        `const API_BASE_URL = '${backendTunnel.url}/api';`
    );

    // Add bypass header if not present
    if (!newApiContent.includes('Bypass-Tunnel-Reminder')) {
        newApiContent = newApiContent.replace(
            /'Content-Type': 'application\/json'/g,
            `'Content-Type': 'application/json',\n        'Bypass-Tunnel-Reminder': 'true',\n        'ngrok-skip-browser-warning': 'true'`
        );
    }

    fs.writeFileSync(apiJsPath, newApiContent, 'utf8');
    console.log('✅ Updated web-app to use the live backend API URL.');

    // Cleanup on exit
    const cleanup = () => {
        console.log('\nRestoring original api.js...');
        fs.writeFileSync(apiJsPath, originalApiContent, 'utf8');
        console.log('Original api.js restored. Tunnels closed.');
        process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', () => {
        // Fallback for unexpected exit
        try { fs.writeFileSync(apiJsPath, originalApiContent, 'utf8'); } catch (e) { }
    });
}

start().catch(err => {
    console.error('Error:', err);
    try { fs.writeFileSync(apiJsPath, originalApiContent, 'utf8'); } catch (e) { }
    process.exit(1);
});
