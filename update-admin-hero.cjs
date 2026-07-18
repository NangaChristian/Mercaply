const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminContentPage.tsx', 'utf-8');

// Update HeroSlide interface
const oldInterface = `interface HeroSlide {
  id: string;
  image_url: string;
  cover_image_url?: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  display_order: number;
  is_active: boolean;
}`;

const newInterface = `interface HeroSlide {
  id: string;
  image_url: string;
  cover_image_url?: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  display_order: number;
  is_active: boolean;
  objectFit?: string;
  posX?: string;
  posY?: string;
  scale?: string;
}`;
content = content.replace(oldInterface, newInterface);

// Update fetchData
const oldFetchMap = `
          const parsedSlides = slidesSnap.map(docSnapshot => {
            const slide = docSnapshot;
            let mainImg = slide.image_url || '';
            let coverImg = '';
            if (mainImg && mainImg.includes('|||')) {
              [mainImg, coverImg] = mainImg.split('|||');
            }
            return { ...slide, id: docSnapshot.id, image_url: mainImg, cover_image_url: coverImg };
          });
`.trim();

const newFetchMap = `
          const parsedSlides = slidesSnap.map(docSnapshot => {
            const slide = docSnapshot;
            let mainImg = slide.image_url || '';
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
            return { ...slide, id: docSnapshot.id, image_url: mainImg, cover_image_url: coverImg, objectFit, posX, posY, scale };
          });
`.trim();
content = content.replace(oldFetchMap, newFetchMap);

// Update saveSlide
const oldSaveSlide = `
      let finalImageUrl = currentSlide.image_url || '';
      
      if (currentSlide.cover_image_url) {
        finalImageUrl = \`\${finalImageUrl}|||\${currentSlide.cover_image_url}\`;
      }
`.trim();

const newSaveSlide = `
      let finalImageUrl = currentSlide.image_url || '';
      const cover = currentSlide.cover_image_url || '';
      const fit = currentSlide.objectFit || 'contain';
      const x = currentSlide.posX || '50';
      const y = currentSlide.posY || '50';
      const s = currentSlide.scale || '100';
      
      finalImageUrl = \`\${finalImageUrl}|||\${cover}|||\${fit}|||\${x}|||\${y}|||\${s}\`;
`.trim();
content = content.replace(oldSaveSlide, newSaveSlide);

fs.writeFileSync('src/pages/admin/AdminContentPage.tsx', content, 'utf-8');
