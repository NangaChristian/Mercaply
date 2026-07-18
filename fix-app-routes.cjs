const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// I need to add </Route> before {/* Main App Routes */}
content = content.replace(`          </Route>
          {/* Main App Routes */}`, `          </Route>
          </Route>
          {/* Main App Routes */}`);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
