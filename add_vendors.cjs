const fs = require('fs');
let code = fs.readFileSync('src/pages/home/HomePage.tsx', 'utf8');

const vendorsSection = `
      {/* VENDORS CAROUSEL SECTION */}
      <section className="mb-16 bg-surface p-8 rounded-2xl border border-border-light">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-2xl font-bold text-text-primary mb-1">Vendeurs à la Une</h2>
             <p className="text-text-secondary text-sm">Découvrez nos meilleurs vendeurs recommandés.</p>
           </div>
           <Link to="/vendors" className="bg-white border border-border-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-2 transition-colors">
             Voir tous les vendeurs
           </Link>
        </div>
        <VendorCarousel />
      </section>
`;

code = code.replace(
  "{/* VENDORS CAROUSEL SECTION */}",
  vendorsSection
);

fs.writeFileSync('src/pages/home/HomePage.tsx', code);
