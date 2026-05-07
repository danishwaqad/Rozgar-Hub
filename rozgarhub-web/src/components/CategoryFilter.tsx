import { Link, useParams } from 'react-router-dom';
import { FaBuilding, FaPlane, FaUserTie, FaGlobe, FaGraduationCap } from 'react-icons/fa';

export default function CategoryFilter() {
  const { category } = useParams();
  
  const categories = [
    { name: 'All Jobs', slug: '', icon: FaGlobe, color: 'bg-gray-600' },
    { name: 'Govt Jobs Pakistan', slug: 'govt-pk', icon: FaBuilding, color: 'bg-blue-600' },
    { name: 'Dubai & Gulf', slug: 'international', icon: FaPlane, color: 'bg-green-600' },
    { name: 'Private Jobs', slug: 'private-pk', icon: FaUserTie, color: 'bg-purple-600' },
    { name: 'Scholarships', slug: 'scholarships', icon: FaGraduationCap, color: 'bg-amber-600' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Filter by Category</h3>
      <div className="flex flex-wrap gap-3">
        {categories.map(cat => {
          const isScholarship = cat.slug === 'scholarships';
          const isActive = category === cat.slug || (!category && cat.slug === '');
          return (
            <Link
              key={cat.slug}
              to={isScholarship ? '/scholarships' : (cat.slug ? `/category/${cat.slug}` : '/')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
                isActive && !isScholarship
                 ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
              }`}
            >
              <cat.icon className="text-lg" />
              <span className="font-medium">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}