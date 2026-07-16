const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

if (!code.includes('useMessages')) {
    code = code.replace(/import \{ useUI \} from '\.\.\/\.\.\/store\/useUI';/, "import { useUI } from '../../store/useUI';\nimport { useMessages } from '../../hooks/useMessages';");
    
    code = code.replace(/const \{ getCartCount, setIsCartOpen \} = useCart\(\);/, "const { getCartCount, setIsCartOpen } = useCart();\n  const { conversations } = useMessages();\n  const unreadMessagesCount = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);");
}

let linkTo = "user ? (isSeller ? '/seller/messages' : '/buyer/messages') : '/auth/login'";

if (!code.includes('unreadMessagesCount > 0')) {
    let newButton = `            <Link 
              to={user ? (isSeller ? '/seller/messages' : '/buyer/messages') : '/auth/login'}
              className="relative p-2 border border-border-light rounded-full text-text-primary hover:border-text-primary transition-colors flex items-center justify-center mr-2"
            >
              <MessageSquare className="h-4 w-4" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadMessagesCount}
                </span>
              )}
            </Link>
            <button`;
            
    code = code.replace(/<button[^>]*>\s*<ShoppingCart className="h-4 w-4" \/>/, newButton.replace('<button', '<button'));
}

fs.writeFileSync('src/components/layout/Header.tsx', code);
