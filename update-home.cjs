const fs = require('fs');

let content = fs.readFileSync('src/pages/home/HomePage.tsx', 'utf-8');

const replacement = `
        if (bannersData && bannersData.length > 0) {
          const now = new Date();
          const activeBanners = bannersData.filter(banner => {
            let actualLink = banner.button_link || '';
            if (actualLink.includes('|||')) {
              const parts = actualLink.split('|||');
              actualLink = parts[0];
              const startDateStr = parts[1];
              const endDateStr = parts[2];
              
              if (startDateStr) {
                const startDate = new Date(startDateStr);
                if (now < startDate) return false;
              }
              if (endDateStr) {
                const endDate = new Date(endDateStr);
                if (now > endDate) return false;
              }
              
              banner.button_link = actualLink;
            }
            return true;
          });
          setPromoBanners(activeBanners);
        }
`;

content = content.replace(/if \(bannersData && bannersData\.length > 0\) \{\s*setPromoBanners\(bannersData\);\s*\}/, replacement.trim());

fs.writeFileSync('src/pages/home/HomePage.tsx', content, 'utf-8');
