const fs = require('fs');
let content = fs.readFileSync('src/pages/home/HomePage.tsx', 'utf-8');

const oldMap = `
        if (slidesData && slidesData.length > 0) {
          const parsedSlides = slidesData.map(doc => {
            const slide = doc;
            let mainImg = slide.image_url;
            let coverImg = '';
            if (mainImg && mainImg.includes('|||')) {
              [mainImg, coverImg] = mainImg.split('|||');
            }
            return { ...slide, id: doc.id, image_url: mainImg, cover_image_url: coverImg };
          });
          setHeroSlides(parsedSlides);
        }
`.trim();

const newMap = `
        if (slidesData && slidesData.length > 0) {
          const parsedSlides = slidesData.map(doc => {
            const slide = doc;
            let mainImg = slide.image_url;
            let coverImg = '';
            let objectFit = 'contain';
            let posX = '50';
            let posY = '50';
            let scale = '100';
            
            if (mainImg && mainImg.includes('|||')) {
              const parts = mainImg.split('|||');
              mainImg = parts[0] || '';
              coverImg = parts[1] || '';
              objectFit = parts[2] || 'contain';
              posX = parts[3] || '50';
              posY = parts[4] || '50';
              scale = parts[5] || '100';
            }
            return { ...slide, id: doc.id, image_url: mainImg, cover_image_url: coverImg, objectFit, posX, posY, scale };
          });
          setHeroSlides(parsedSlides);
        }
`.trim();

content = content.replace(oldMap, newMap);
fs.writeFileSync('src/pages/home/HomePage.tsx', content, 'utf-8');
