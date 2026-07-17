const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('NetworkStatus')) {
  code = code.replace(
    "import { OrderNotifications } from './components/orders/OrderNotifications';",
    "import { OrderNotifications } from './components/orders/OrderNotifications';\nimport { NetworkStatus } from './components/ui/NetworkStatus';"
  );

  code = code.replace(
    "<ToastContainer />",
    "<NetworkStatus />\n        <ToastContainer />"
  );

  fs.writeFileSync('src/App.tsx', code);
}
