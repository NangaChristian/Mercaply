const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminContentPage.tsx', 'utf-8');

const targetStr = `
                  {currentSlide.cover_image_url && <img src={currentSlide.cover_image_url} alt="Cover Preview" className="mt-2 h-32 rounded object-cover" />}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Surtitre (ex: NOUVELLE COLLECTION)</label>
`.trim();

const newFields = `
                  {currentSlide.cover_image_url && <img src={currentSlide.cover_image_url} alt="Cover Preview" className="mt-2 h-32 rounded object-cover" />}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="col-span-2 md:col-span-4 mb-2">
                    <h3 className="font-semibold text-sm text-gray-700">Paramètres de l'image (Produit/Principale)</h3>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ajustement</label>
                    <select 
                      value={currentSlide.objectFit || 'contain'} 
                      onChange={(e) => setCurrentSlide({...currentSlide, objectFit: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                    >
                      <option value="contain">Contenir (Contain)</option>
                      <option value="cover">Couvrir (Cover)</option>
                      <option value="fill">Remplir (Fill)</option>
                      <option value="none">Aucun (None)</option>
                      <option value="scale-down">Réduire (Scale-down)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Taille / Zoom (%)</label>
                    <input 
                      type="number" 
                      min="10" max="300"
                      value={currentSlide.scale || '100'} 
                      onChange={(e) => setCurrentSlide({...currentSlide, scale: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Position X (%)</label>
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={currentSlide.posX || '50'} 
                      onChange={(e) => setCurrentSlide({...currentSlide, posX: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Position Y (%)</label>
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={currentSlide.posY || '50'} 
                      onChange={(e) => setCurrentSlide({...currentSlide, posY: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Surtitre (ex: NOUVELLE COLLECTION)</label>
`.trim();

content = content.replace(targetStr, newFields);
fs.writeFileSync('src/pages/admin/AdminContentPage.tsx', content, 'utf-8');
