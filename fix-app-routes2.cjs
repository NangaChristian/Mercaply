const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace('          </Route>\n          {/* Main App Routes */}', '          </Route>\n          </Route>\n          {/* Main App Routes */}');

fs.writeFileSync('src/App.tsx', content, 'utf-8');
