const fs = require('fs');
let code = fs.readFileSync('src/pages/buyer/BuyerAddressesPage.tsx', 'utf8');

code = code.replace(/import \{ MapPin, Plus, Edit2, Trash2, CheckCircle2 \} from 'lucide-react';/, "import { MapPin, Plus, Edit2, Trash2, CheckCircle2, Loader2 } from 'lucide-react';");

code = code.replace(/const \[isLoading, setIsLoading\] = useState\(true\);/, "const [isLoading, setIsLoading] = useState(true);\n  const [isSaving, setIsSaving] = useState(false);");

code = code.replace(/const handleSubmit = async \(e: React\.FormEvent\) => \{\n    e\.preventDefault\(\);\n    /, "const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setIsSaving(true);\n    ");

code = code.replace(/await saveToFirebase\(newAddresses\);\n    handleCloseForm\(\);\n  \};/, "await saveToFirebase(newAddresses);\n    setIsSaving(false);\n    handleCloseForm();\n  };");

code = code.replace(/<button \n                type="submit"\n                className="px-6 py-2\.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors"\n              >\n                Enregistrer\n              <\/button>/, `<button \n                type="submit"\n                disabled={isSaving}\n                className="px-6 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center disabled:opacity-70"\n              >\n                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}\n                Enregistrer\n              </button>`);

fs.writeFileSync('src/pages/buyer/BuyerAddressesPage.tsx', code);
