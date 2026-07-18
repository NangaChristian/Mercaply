const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/AdminContentPage.tsx', 'utf-8');

// Create SortableSlideRow
const sortableSlideRow = `
function SortableSlideRow({ slide, setCurrentSlide, setIsEditing, deleteSlide }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} className="bg-white group">
      <td className="px-6 py-4 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600" {...attributes} {...listeners}>
        <GripVertical size={20} />
      </td>
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
        <button onClick={() => { setCurrentSlide(slide); setIsEditing(true); }} className="text-blue-600 hover:text-blue-800 p-2">
          <Edit2 size={18} />
        </button>
        <button onClick={() => deleteSlide(slide.id)} className="text-red-600 hover:text-red-800 p-2">
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
}
`;

content = content.replace('function SortableBannerRow', sortableSlideRow + '\nfunction SortableBannerRow');

const handleDragEndHero = `
  const handleDragEndHero = async (event: any) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setSlides((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        if (supabase) {
          newItems.forEach(async (item, index) => {
            await supabase.from('hero_slides').update({ display_order: index + 1 }).eq('id', item.id);
          });
        }
        return newItems;
      });
    }
  };
`;

content = content.replace('const handleDragEnd = async (event: any) => {', handleDragEndHero + '\n  const handleDragEnd = async (event: any) => {');

const slideTableReplacement = `
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndHero}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 w-10"></th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surtitre & Titre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        {slides.map((slide) => (
                          <SortableSlideRow 
                            key={slide.id} 
                            slide={slide} 
                            setCurrentSlide={setCurrentSlide} 
                            setIsEditing={setIsEditing} 
                            deleteSlide={deleteSlide} 
                          />
                        ))}
                      </SortableContext>
                    </tbody>
                  </table>
                </DndContext>
              </div>
`;

content = content.replace(/<div className="bg-white rounded-xl shadow overflow-hidden">\s*<table[\s\S]*?<\/table>\s*<\/div>/, slideTableReplacement.trim());

fs.writeFileSync('src/pages/admin/AdminContentPage.tsx', content, 'utf-8');
