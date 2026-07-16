const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

const target = `<button 
              onClick={() => setIsCartOpen(true)}`;

const replacement = `            {user && (
              <Link 
                to={isSeller ? '/seller/messages' : '/buyer/messages'}
                className="relative p-2 border border-border-light rounded-full text-text-primary hover:border-text-primary transition-colors flex items-center justify-center mr-2"
              >
                <MessageSquare className="h-4 w-4" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </span>
                )}
              </Link>
            )}
            <button 
              onClick={() => setIsCartOpen(true)}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/layout/Header.tsx', code);
