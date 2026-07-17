const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('CallbackPage')) {
  code = code.replace(
    "import { RegisterPage } from './pages/auth/RegisterPage';",
    "import { RegisterPage } from './pages/auth/RegisterPage';\nimport { CallbackPage } from './pages/auth/CallbackPage';"
  );

  code = code.replace(
    "<Route path=\"/auth/forgot-password\" element={<ForgotPasswordPage />} />",
    "<Route path=\"/auth/forgot-password\" element={<ForgotPasswordPage />} />\n          <Route path=\"/auth/callback\" element={<CallbackPage />} />"
  );

  fs.writeFileSync('src/App.tsx', code);
}
