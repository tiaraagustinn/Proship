import Header from '@/app/components/user/Header';
import Footer from '@/app/components/user/Footer';

export default function AisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        {/* Main Title */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AIS</h1>
        </div>



      </main>
      <Footer />
    </div>
  );
}
