const fs = require('fs');
let content = fs.readFileSync('src/pages/seller/SellerOrdersPage.tsx', 'utf-8');

// Remove all imports at the top
const importsRegex = /^(import[\s\S]*?;|(?:\/\/ @ts-nocheck))\s*/gm;
let newContent = content.replace(importsRegex, '');

const correctImports = `// @ts-nocheck
import { useState, useEffect } from 'react';
import { Search, Filter, Package, Clock, CheckCircle2, XCircle, Truck, Eye, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../store/useAuth';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../store/useToast';
import { useOrders } from '../../hooks/useOrders';\n\n`;

fs.writeFileSync('src/pages/seller/SellerOrdersPage.tsx', correctImports + newContent.trim());
