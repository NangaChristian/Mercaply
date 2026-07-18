const fs = require('fs');
let content = fs.readFileSync('src/pages/home/HomePage.tsx', 'utf-8');

const oldRender = `
              <div className="absolute top-0 right-0 bottom-0 w-1/2 flex items-center justify-center -z-0">
                <div className="w-[80%] h-[80%] border border-white/5 rounded-full absolute"></div>
                <div className="w-[60%] h-[60%] border border-white/5 rounded-full absolute"></div>
                <div className="w-[40%] h-[40%] border border-white/5 rounded-full absolute"></div>
                <img 
                  src={heroSlides[currentSlideIndex].image_url} 
                  alt={heroSlides[currentSlideIndex].title}
                  className="relative z-10 w-[80%] max-w-[400px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
              </div>
`.trim();

const newRender = `
              <div className="absolute top-0 right-0 bottom-0 w-1/2 flex items-center justify-center -z-0 overflow-hidden">
                <div className="w-[80%] h-[80%] border border-white/5 rounded-full absolute"></div>
                <div className="w-[60%] h-[60%] border border-white/5 rounded-full absolute"></div>
                <div className="w-[40%] h-[40%] border border-white/5 rounded-full absolute"></div>
                <div className="relative z-10 w-full h-full flex items-center justify-center group">
                  <img 
                    src={heroSlides[currentSlideIndex].image_url} 
                    alt={heroSlides[currentSlideIndex].title}
                    className="drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" 
                    style={{
                      width: \`\${heroSlides[currentSlideIndex].scale || 100}%\`,
                      height: \`\${heroSlides[currentSlideIndex].scale || 100}%\`,
                      objectFit: heroSlides[currentSlideIndex].objectFit || 'contain',
                      objectPosition: \`\${heroSlides[currentSlideIndex].posX || 50}% \${heroSlides[currentSlideIndex].posY || 50}%\`
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
`.trim();

content = content.replace(oldRender, newRender);
fs.writeFileSync('src/pages/home/HomePage.tsx', content, 'utf-8');
