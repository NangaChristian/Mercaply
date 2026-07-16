const fs = require('fs');

let content = fs.readFileSync('src/pages/home/HomePage.tsx', 'utf8');

// Add imports
if (!content.includes('import { supabase }')) {
  content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { supabase } from '../../lib/supabase';");
}

// Add state
const stateAddition = `
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [promoBanners, setPromoBanners] = useState<any[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const [slidesRes, bannersRes] = await Promise.all([
          supabase.from('hero_slides').select('*').eq('is_active', true).order('display_order'),
          supabase.from('promotional_banners').select('*').eq('is_active', true).order('display_order')
        ]);
        if (slidesRes.data) setHeroSlides(slidesRes.data);
        if (bannersRes.data) setPromoBanners(bannersRes.data);
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };
    fetchBanners();
  }, []);
`;

if (!content.includes('const [heroSlides, setHeroSlides]')) {
  content = content.replace("const { products, isLoading } = useProducts({ limitCount: 20 });", stateAddition + "\n  const { products, isLoading } = useProducts({ limitCount: 20 });");
}

fs.writeFileSync('src/pages/home/HomePage.tsx', content);
