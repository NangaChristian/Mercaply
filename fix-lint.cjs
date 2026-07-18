const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AdminContentPage.tsx', 'utf-8');
content = content.replace('setSlides((items) => {', 'setSlides((items: HeroSlide[]) => {');
content = content.replace('setBanners((items) => {', 'setBanners((items: PromotionalBanner[]) => {');
fs.writeFileSync('src/pages/admin/AdminContentPage.tsx', content, 'utf-8');

let pForm = fs.readFileSync('src/pages/seller/SellerProductFormPage.tsx', 'utf-8');
if (!pForm.includes("import { Button } from '../../components/ui/Button';")) {
  pForm = pForm.replace("import { Card } from '../../components/ui/Card';", "import { Card } from '../../components/ui/Card';\nimport { Button } from '../../components/ui/Button';");
}
fs.writeFileSync('src/pages/seller/SellerProductFormPage.tsx', pForm, 'utf-8');

let sForm = fs.readFileSync('src/pages/seller/SellerServiceFormPage.tsx', 'utf-8');
if (!sForm.includes("import { Button } from '../../components/ui/Button';")) {
  sForm = sForm.replace("import { Card } from '../../components/ui/Card';", "import { Card } from '../../components/ui/Card';\nimport { Button } from '../../components/ui/Button';");
}
fs.writeFileSync('src/pages/seller/SellerServiceFormPage.tsx', sForm, 'utf-8');
