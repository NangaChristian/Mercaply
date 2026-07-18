const fs = require('fs');
let content = fs.readFileSync('src/components/layout/BottomNav.tsx', 'utf-8');

// We need to import useAuth
if (!content.includes('useAuth')) {
  content = content.replace("import { useUI } from '../../store/useUI';", "import { useUI } from '../../store/useUI';\nimport { useAuth } from '../../store/useAuth';");
}

content = content.replace("export function BottomNav() {", "export function BottomNav() {\n  const { user } = useAuth();\n  const accountPath = user ? (user.role === 'admin' ? '/admin/dashboard' : user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard') : '/auth/login';");

content = content.replace("{ icon: User, label: 'Profil', path: '/buyer/profile' }", "{ icon: User, label: 'Mon compte', path: accountPath }");
content = content.replace("{ icon: User, label: 'Paramètres', path: '/seller/settings' }", "{ icon: User, label: 'Mon compte', path: accountPath }");

fs.writeFileSync('src/components/layout/BottomNav.tsx', content, 'utf-8');
