const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Ensure import for ProtectedRoute
if (!content.includes("import { ProtectedRoute }")) {
  content = content.replace(
    "import { ProtectedAdminRoute } from './components/auth/ProtectedAdminRoute';",
    "import { ProtectedAdminRoute } from './components/auth/ProtectedAdminRoute';\nimport { ProtectedRoute } from './components/auth/ProtectedRoute';"
  );
}

// Wrap /seller and /buyer
content = content.replace('<Route path="/seller" element={<SellerLayout />}>', '<Route element={<ProtectedRoute allowedRoles={[\'seller\', \'admin\']} />}><Route path="/seller" element={<SellerLayout />}>');
content = content.replace('</Route>\n          {/* Main App Routes */}', '</Route></Route>\n          {/* Main App Routes */}');

content = content.replace('<Route path="/buyer" element={<BuyerLayout />}>', '<Route element={<ProtectedRoute />}><Route path="/buyer" element={<BuyerLayout />}>');
content = content.replace('</Route>\n        </Routes>', '</Route></Route>\n        </Routes>');

fs.writeFileSync('src/App.tsx', content, 'utf-8');
