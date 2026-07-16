const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { OrderNotifications } from './components/orders/OrderNotifications';",
  "import { OrderNotifications } from './components/orders/OrderNotifications';\nimport { ScrollToTopButton } from './components/ui/ScrollToTopButton';"
);

code = code.replace(
  "<OrderNotifications />",
  "<OrderNotifications />\n        <ScrollToTopButton />"
);

fs.writeFileSync('src/App.tsx', code);
