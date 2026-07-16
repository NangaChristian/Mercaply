const fs = require('fs');
let code = fs.readFileSync('src/pages/product/ProductDetailPage.tsx', 'utf8');

const ratingHtml = `
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setActiveTab('reviews')}>
              <div className="flex items-center text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="ml-1.5 font-bold text-text-primary text-lg">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-text-secondary">({reviews.length} avis)</span>
            </div>
          )}
          
          {/* Price & Quantity Box */}
`;

code = code.replace(
  "          </h1>\n          \n          {/* Price & Quantity Box */}",
  "          </h1>\n" + ratingHtml
);

fs.writeFileSync('src/pages/product/ProductDetailPage.tsx', code);
