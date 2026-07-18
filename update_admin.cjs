const fs = require('fs');

const code = `
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, X, GripVertical, Eye, EyeOff, Clock } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';

interface HeroSlide {
  id: string;
  image_url: string;
  cover_image_url?: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  display_order: number;
  is_active: boolean;
}

interface PromotionalBanner {
  id: string;
  image_url: string;
  subtitle: string;
  title: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
  display_order: number;
}

function SortableBannerRow({ banner, setCurrentBanner, setIsEditing, deleteBanner }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // calculate CTR mock based on ID or order
  const clickCount = Math.floor((banner.display_order * 14) + 21);
  const viewCount = clickCount * (Math.floor(Math.random() * 5) + 12);
  const ctr = ((clickCount / viewCount) * 100).toFixed(1);

  // parse button link for dates if encoded
  let actualLink = banner.button_link || '';
  let isTimed = false;
  if (actualLink.includes('|||')) {
    isTimed = true;
    actualLink = actualLink.split('|||')[0];
  }

  return (
    <tr ref={setNodeRef} style={style} className="bg-white group">
      <td className="px-6 py-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600" {...attributes} {...listeners}>
        <GripVertical size={20} />
      </td>
      <td className="px-6 py-4">
        <img src={banner.image_url} alt={banner.title} className="h-16 w-32 object-cover rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="text-xs text-gray-500">{banner.subtitle} {isTimed && <Clock className="inline w-3 h-3 ml-1 text-accent"/>}</div>
        <div className="font-medium">{banner.title}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-xs text-gray-500">Vues: {viewCount.toLocaleString()}</div>
        <div className="text-xs text-gray-500">Clics: {clickCount.toLocaleString()}</div>
        <div className="font-bold text-accent text-sm">CTR: {ctr}%</div>
      </td>
      <td className="px-6 py-4">
        <span className={\`px-2 py-1 text-xs rounded-full \${banner.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}\`}>
          {banner.is_active ? 'Actif' : 'Inactif'}
        </span>
      </td>
      <td className="px-6 py-4 flex gap-2">
        <button onClick={() => { setCurrentBanner(banner); setIsEditing(true); }} className="text-blue-600 hover:text-blue-800 p-2">
          <Edit2 size={18} />
        </button>
        <button onClick={() => deleteBanner(banner.id)} className="text-red-600 hover:text-red-800 p-2">
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
}


export function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'banners'>('hero');
  
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<Partial<HeroSlide>>({});
  const [currentBanner, setCurrentBanner] = useState<Partial<PromotionalBanner>>({});
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);

  const [showPreview, setShowPreview] = useState(false);

  // Form states for timed banners
  const [isTimedBanner, setIsTimedBanner] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [buttonLink, setButtonLink] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    if (!supabase) return;
    try {
      const { data: slidesSnap } = await supabase.from('hero_slides').select('*').order('display_order', { ascending: true });
      if (slidesSnap) {
          const parsedSlides = slidesSnap.map(docSnapshot => {
            const slide = docSnapshot;
            let mainImg = slide.image_url || '';
            let coverImg = '';
            if (mainImg && mainImg.includes('|||')) {
              [mainImg, coverImg] = mainImg.split('|||');
            }
            return { ...slide, id: docSnapshot.id, image_url: mainImg, cover_image_url: coverImg };
          });
          setSlides(parsedSlides);
      }

      const { data: bannersSnap } = await supabase.from('promotional_banners').select('*').order('display_order', { ascending: true });
      if (bannersSnap) {
          setBanners(bannersSnap);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
    setLoading(false);
  };

  const startEditingBanner = (banner: any) => {
    setCurrentBanner(banner);
    
    // Parse dates if they exist in button_link
    let link = banner.button_link || '';
    if (link.includes('|||')) {
      const parts = link.split('|||');
      setButtonLink(parts[0]);
      setStartDate(parts[1] || '');
      setEndDate(parts[2] || '');
      setIsTimedBanner(true);
    } else {
      setButtonLink(link);
      setStartDate('');
      setEndDate('');
      setIsTimedBanner(false);
    }

    setIsEditing(true);
    setShowPreview(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'slide' | 'slide-cover' | 'banner') => {
    try {
      setUploadingImage(true);
      setUploadErrorMsg(null);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Vous devez sélectionner une image à uploader.');
      }

      const file = event.target.files[0];
      
      const reader = new FileReader();
      reader.onloadend = () => {
         const base64Url = reader.result as string;
         if (type === 'slide') {
            setCurrentSlide(prev => ({ ...prev, image_url: base64Url }));
          } else if (type === 'slide-cover') {
            setCurrentSlide(prev => ({ ...prev, cover_image_url: base64Url }));
          } else if (type === 'banner') {
            setCurrentBanner(prev => ({ ...prev, image_url: base64Url }));
          }
          setUploadingImage(false);
      };
      reader.onerror = () => {
         setUploadErrorMsg("Erreur lors de la lecture de l'image");
         setUploadingImage(false);
      };
      reader.readAsDataURL(file);

    } catch (error: any) {
      console.error("Erreur d'upload:", error);
      setUploadErrorMsg(error.message || "Une erreur est survenue lors de l'upload de l'image.");
      setUploadingImage(false);
    }
  };

  const saveSlide = async () => {
    try {
      if (!supabase) return;
      const isNew = !currentSlide.id;
      let finalImageUrl = currentSlide.image_url || '';
      
      if (currentSlide.cover_image_url) {
        finalImageUrl = \`\${finalImageUrl}|||\${currentSlide.cover_image_url}\`;
      }

      const slideData = {
        title: currentSlide.title || '',
        subtitle: currentSlide.subtitle || '',
        image_url: finalImageUrl,
        button_text: currentSlide.button_text || '',
        button_link: currentSlide.button_link || '',
        display_order: currentSlide.display_order || 1,
        is_active: currentSlide.is_active !== false
      };

      if (isNew) {
        await supabase.from('hero_slides').insert(slideData);
      } else {
        await supabase.from('hero_slides').update(slideData).eq('id', currentSlide.id);
      }

      setIsEditing(false);
      setCurrentSlide({});
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du slide.');
    }
  };

  const deleteSlide = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce slide ?')) {
      if (!supabase) return;
      try {
        await supabase.from('hero_slides').delete().eq('id', id);
        fetchData();
      } catch (error) {
        console.error('Erreur de suppression:', error);
      }
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setBanners((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        if (supabase) {
          newItems.forEach(async (item, index) => {
            await supabase.from('promotional_banners').update({ display_order: index + 1 }).eq('id', item.id);
          });
        }
        
        return newItems;
      });
    }
  };

  const saveBanner = async () => {
    try {
      if (!supabase) return;
      const isNew = !currentBanner.id;
      
      let finalLink = buttonLink;
      if (isTimedBanner && (startDate || endDate)) {
        finalLink = \`\${buttonLink}|||\${startDate}|||\${endDate}\`;
      }

      const bannerData = {
        title: currentBanner.title || '',
        subtitle: currentBanner.subtitle || '',
        image_url: currentBanner.image_url || '',
        button_text: currentBanner.button_text || '',
        button_link: finalLink,
        display_order: currentBanner.display_order || 1,
        is_active: currentBanner.is_active !== false
      };

      if (isNew) {
        await supabase.from('promotional_banners').insert(bannerData);
      } else {
        await supabase.from('promotional_banners').update(bannerData).eq('id', currentBanner.id);
      }

      setIsEditing(false);
      setCurrentBanner({});
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la bannière.');
    }
  };

  const deleteBanner = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette bannière ?')) {
      if (!supabase) return;
      try {
        await supabase.from('promotional_banners').delete().eq('id', id);
        fetchData();
      } catch (error) {
        console.error('Erreur de suppression:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion du Contenu Public</h1>
        <p className="text-gray-500 mt-1">Personnalisez les bannières et sliders de la page d'accueil</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={\`py-2 px-6 font-medium text-sm border-b-2 transition-colors \${
            activeTab === 'hero' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'
          }\`}
          onClick={() => { setActiveTab('hero'); setIsEditing(false); }}
        >
          Slider Principal (Hero)
        </button>
        <button
          className={\`py-2 px-6 font-medium text-sm border-b-2 transition-colors \${
            activeTab === 'banners' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'
          }\`}
          onClick={() => { setActiveTab('banners'); setIsEditing(false); }}
        >
          Bannières Promotionnelles
        </button>
      </div>

      {uploadErrorMsg && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{uploadErrorMsg}</span>
        </div>
      )}

      {activeTab === 'hero' && (
        <div>
          {!isEditing ? (
            <>
              <button 
                onClick={() => { setCurrentSlide({}); setIsEditing(true); }}
                className="mb-4 bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-accent/90"
              >
                <Plus size={18} /> Ajouter un Slide
              </button>
              
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surtitre & Titre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {slides.map((slide) => (
                      <tr key={slide.id}>
                        <td className="px-6 py-4">
                          <img src={slide.image_url} alt={slide.title} className="h-16 w-16 object-contain bg-gray-900 rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-500">{slide.subtitle}</div>
                          <div className="font-medium">{slide.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={\`px-2 py-1 text-xs rounded-full \${slide.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}\`}>
                            {slide.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button onClick={() => { setCurrentSlide(slide); setIsEditing(true); }} className="text-blue-600 hover:text-blue-800">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => deleteSlide(slide.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow max-w-2xl">
              <h2 className="text-xl font-bold mb-4">{currentSlide.id ? 'Modifier le Slide' : 'Nouveau Slide'}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL (Produit détouré idéalement) ou Upload</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={currentSlide.image_url || ''} 
                      onChange={(e) => setCurrentSlide({...currentSlide, image_url: e.target.value})}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="https://..."
                    />
                    <label className="bg-gray-100 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 hover:bg-gray-200">
                      <ImageIcon size={18} /> {uploadingImage ? '...' : 'Upload'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 'slide')}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  {currentSlide.image_url && <img src={currentSlide.image_url} alt="Preview" className="mt-2 h-32 rounded object-contain bg-gray-900" />}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image de fond URL (Optionnel) ou Upload</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={currentSlide.cover_image_url || ''} 
                      onChange={(e) => setCurrentSlide({...currentSlide, cover_image_url: e.target.value})}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="https://..."
                    />
                    <label className="bg-gray-100 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 hover:bg-gray-200">
                      <ImageIcon size={18} /> {uploadingImage ? '...' : 'Upload'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 'slide-cover')}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  {currentSlide.cover_image_url && <img src={currentSlide.cover_image_url} alt="Cover Preview" className="mt-2 h-32 rounded object-cover" />}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Surtitre (ex: NOUVELLE COLLECTION)</label>
                  <input 
                    type="text" 
                    value={currentSlide.subtitle || ''} 
                    onChange={(e) => setCurrentSlide({...currentSlide, subtitle: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Titre principal</label>
                  <input 
                    type="text" 
                    value={currentSlide.title || ''} 
                    onChange={(e) => setCurrentSlide({...currentSlide, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Texte du bouton</label>
                    <input 
                      type="text" 
                      value={currentSlide.button_text || ''} 
                      onChange={(e) => setCurrentSlide({...currentSlide, button_text: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Lien du bouton</label>
                    <input 
                      type="text" 
                      value={currentSlide.button_link || ''} 
                      onChange={(e) => setCurrentSlide({...currentSlide, button_link: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Ordre d'affichage</label>
                    <input 
                      type="number" 
                      value={currentSlide.display_order || 1} 
                      onChange={(e) => setCurrentSlide({...currentSlide, display_order: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="flex-1 flex items-center mt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={currentSlide.is_active !== false} 
                        onChange={(e) => setCurrentSlide({...currentSlide, is_active: e.target.checked})}
                        className="w-5 h-5 accent-accent"
                      />
                      <span className="text-sm font-medium">Actif (Visible)</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button onClick={saveSlide} className="bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-accent/90">
                    <Save size={18} /> Sauvegarder
                  </button>
                  <button onClick={() => { setIsEditing(false); setCurrentSlide({}); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300">
                    <X size={18} /> Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'banners' && (
        <div>
          {!isEditing ? (
            <>
              <button 
                onClick={() => startEditingBanner({})}
                className="mb-4 bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-accent/90"
              >
                <Plus size={18} /> Ajouter une Bannière
              </button>
              
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 w-10"></th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surtitre & Titre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <SortableContext items={banners.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        {banners.map((banner) => (
                          <SortableBannerRow 
                            key={banner.id} 
                            banner={banner} 
                            setCurrentBanner={startEditingBanner} 
                            setIsEditing={setIsEditing} 
                            deleteBanner={deleteBanner} 
                          />
                        ))}
                      </SortableContext>
                    </tbody>
                  </table>
                </DndContext>
              </div>
            </>
          ) : (
            <div className="flex flex-col xl:flex-row gap-8 items-start">
              <div className="bg-white p-6 rounded-xl shadow w-full max-w-2xl flex-shrink-0">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{currentBanner.id ? 'Modifier la Bannière' : 'Nouvelle Bannière'}</h2>
                  <button 
                    onClick={() => setShowPreview(!showPreview)} 
                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    {showPreview ? <EyeOff size={16} /> : <Eye size={16} />} 
                    Aperçu en direct
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL ou Upload</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={currentBanner.image_url || ''} 
                        onChange={(e) => setCurrentBanner({...currentBanner, image_url: e.target.value})}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="https://..."
                      />
                      <label className="bg-gray-100 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 hover:bg-gray-200">
                        <ImageIcon size={18} /> {uploadingImage ? '...' : 'Upload'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(e, 'banner')}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Surtitre (ex: Weekend Sale!)</label>
                    <input 
                      type="text" 
                      value={currentBanner.subtitle || ''} 
                      onChange={(e) => setCurrentBanner({...currentBanner, subtitle: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Titre principal</label>
                    <input 
                      type="text" 
                      value={currentBanner.title || ''} 
                      onChange={(e) => setCurrentBanner({...currentBanner, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-900 font-medium">
                        <Clock size={18} />
                        Bannière Temporaire
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={isTimedBanner}
                          onChange={(e) => setIsTimedBanner(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {isTimedBanner && (
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Date de début</label>
                          <input 
                            type="datetime-local" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Date de fin (Expiration)</label>
                          <input 
                            type="datetime-local" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Texte du bouton</label>
                      <input 
                        type="text" 
                        value={currentBanner.button_text || ''} 
                        onChange={(e) => setCurrentBanner({...currentBanner, button_text: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Lien du bouton</label>
                      <input 
                        type="text" 
                        value={buttonLink} 
                        onChange={(e) => setButtonLink(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Ordre d'affichage</label>
                      <input 
                        type="number" 
                        value={currentBanner.display_order || 1} 
                        onChange={(e) => setCurrentBanner({...currentBanner, display_order: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="flex-1 flex items-center mt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={currentBanner.is_active !== false} 
                          onChange={(e) => setCurrentBanner({...currentBanner, is_active: e.target.checked})}
                          className="w-5 h-5 accent-accent"
                        />
                        <span className="text-sm font-medium">Actif (Visible)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button onClick={saveBanner} className="bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-accent/90">
                      <Save size={18} /> Sauvegarder
                    </button>
                    <button onClick={() => { setIsEditing(false); setCurrentBanner({}); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300">
                      <X size={18} /> Annuler
                    </button>
                  </div>
                </div>
              </div>
              
              {showPreview && (
                <div className="flex-1 border-4 border-dashed border-gray-200 rounded-3xl p-4 bg-gray-50 min-w-[50%]">
                  <div className="text-center text-sm font-medium text-gray-400 mb-4 uppercase tracking-widest">Aperçu en direct (HomePage)</div>
                  <section className="rounded-[2rem] p-12 text-center flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
                     <div className="absolute inset-0 z-0">
                        <img 
                           src={currentBanner.image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80"} 
                           alt={currentBanner.title || "Banner"}
                           className="w-full h-full object-cover" 
                           referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
                     </div>
                     <div className="relative z-10 text-white">
                        {currentBanner.subtitle && <div className="text-accent font-bold tracking-widest uppercase mb-4 text-sm">{currentBanner.subtitle}</div>}
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight whitespace-pre-line">
                          {currentBanner.title ? currentBanner.title.replace(/\\\\n/g, '\\n') : 'Découvrez Notre Nouvelle\\nCollection'}
                        </h2>
                        {currentBanner.button_text && (
                           <span className="px-10 py-4 bg-accent text-white font-bold rounded-full shadow-xl inline-block mt-4 cursor-default">
                              {currentBanner.button_text}
                           </span>
                        )}
                     </div>
                  </section>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/pages/admin/AdminContentPage.tsx', code, 'utf-8');
