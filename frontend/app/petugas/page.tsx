import React, { useState } from 'react';
import { User, Lock, Ship, Globe, BarChart3, Calendar, Edit, Trash2, CheckSquare, Plus } from 'lucide-react';

const DishubAcehApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Sample data
  const [schedules, setSchedules] = useState([
    { id: 1, departure: 'Banda Aceh', arrival: 'Sabang', time: '08.00', terminal: 'KMP. BRR' },
    { id: 2, departure: 'Sabang', arrival: 'Banda Aceh', time: '08.00', terminal: 'KMP. Aceh Hebat' },
    { id: 3, departure: 'Banda Aceh', arrival: 'Sabang', time: '11.00', terminal: 'KMP. Aceh Hebat' },
    { id: 4, departure: 'Sabang', arrival: 'Banda Aceh', time: '11.00', terminal: 'KMP. BRR' },
    { id: 5, departure: 'Banda Aceh', arrival: 'Sabang', time: '14.00', terminal: 'KMP. Aceh Hebat' },
    { id: 6, departure: 'Sabang', arrival: 'Banda Aceh', time: '14.00', terminal: 'KMP. BRR' },
    { id: 7, departure: 'Banda Aceh', arrival: 'Sabang', time: '17.00', terminal: 'KMP. Aceh Hebat' },
    { id: 8, departure: 'Sabang', arrival: 'Banda Aceh', time: '17.00', terminal: 'KMP. BRR' },
  ]);

  const [historyData] = useState([
    { id: 1, date: '2024-10-20', passengers: 245, cargo: 5.2, vehicles: 28 },
    { id: 2, date: '2024-10-19', passengers: 298, cargo: 6.8, vehicles: 35 },
  ]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username && loginData.password) {
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
    setLoginData({ username: '', password: '' });
  };

  // Login Page
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
        {/* Background waves */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-blue-400 rounded-full opacity-30 blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-blue-800 rounded-full opacity-30 blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative z-10 w-full max-w-md px-6">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center border-4 border-yellow-400">
                <Globe className="w-16 h-16 text-yellow-400" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 w-5 h-5" />
              <input
                type="text"
                placeholder="USERNAME"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-blue-100 bg-opacity-60 border-2 border-yellow-400 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-yellow-300 focus:bg-opacity-80"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 w-5 h-5" />
              <input
                type="password"
                placeholder="PASSWORD"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-blue-100 bg-opacity-60 border-2 border-yellow-400 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-yellow-300 focus:bg-opacity-80"
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button type="button" className="text-pink-400 hover:text-pink-300 text-sm font-semibold">
                LUPA PASSWORD?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Layout with Sidebar
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Globe className="w-12 h-12" strokeWidth={1.5} />
            <div>
              <div className="font-bold text-2xl">DISHUB</div>
              <div className="font-bold text-2xl">ACEH</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full text-left px-6 py-4 rounded-lg mb-2 transition-colors ${
              currentPage === 'dashboard' ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('input')}
            className={`w-full text-left px-6 py-4 rounded-lg mb-2 transition-colors ${
              currentPage === 'input' ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            Input Historis Pelayaran
          </button>
          <button
            onClick={() => setCurrentPage('jadwal')}
            className={`w-full text-left px-6 py-4 rounded-lg mb-2 transition-colors ${
              currentPage === 'jadwal' ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            Jadwal
          </button>
          <button
            onClick={() => setCurrentPage('historis')}
            className={`w-full text-left px-6 py-4 rounded-lg mb-2 transition-colors ${
              currentPage === 'historis' ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            Historis Pelayaran
          </button>
          <button
            onClick={() => setCurrentPage('profil')}
            className={`w-full text-left px-6 py-4 rounded-lg transition-colors ${
              currentPage === 'profil' ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            Profil
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm p-6 flex justify-between items-center">
          <h1 className="text-4xl font-bold">
            {currentPage === 'dashboard' && 'Dashboard'}
            {currentPage === 'input' && 'Input Historis Pelayaran'}
            {currentPage === 'jadwal' && 'Jadwal'}
            {currentPage === 'historis' && 'Historis Pelayaran'}
            {currentPage === 'profil' && 'Profil'}
          </h1>
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-gray-600" />
            <span className="font-semibold">Tiara Agustin</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          {currentPage === 'dashboard' && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-5xl font-bold mb-2">2.734</div>
                      <div className="opacity-90">Penumpang bulan ini</div>
                    </div>
                    <User className="w-12 h-12 opacity-60" />
                  </div>
                  <button className="text-sm underline opacity-90 hover:opacity-100">Detail ↗</button>
                </div>

                <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-lg p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-5xl font-bold mb-2">6</div>
                      <div className="opacity-90">Berat muatan bulan ini</div>
                    </div>
                    <Ship className="w-12 h-12 opacity-60" />
                  </div>
                  <button className="text-sm underline opacity-90 hover:opacity-100">Detail ↗</button>
                </div>

                <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-5xl font-bold mb-2">300</div>
                      <div className="opacity-90">Kapal berangkat bulan ini</div>
                    </div>
                    <Ship className="w-12 h-12 opacity-60" />
                  </div>
                  <button className="text-sm underline opacity-90 hover:opacity-100">Detail ↗</button>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-black rounded-lg p-6 text-white">
                <h2 className="text-xl font-semibold mb-6">Tren Pergerakan Jumlah Penumpang</h2>
                <div className="h-80 flex items-end justify-around">
                  {[200, 350, 480, 520, 780, 450, 580, 380, 620, 450, 680].map((height, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className="w-16 bg-blue-500 rounded-t"
                        style={{ height: `${(height / 800) * 100}%` }}
                      ></div>
                      <div className="text-xs mt-2 opacity-60">
                        {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][i % 7]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentPage === 'input' && (
            <div className="max-w-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 font-semibold">Id Jadwal</label>
                  <select className="w-full p-3 border rounded-lg">
                    <option>Pilih id jadwal</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Jumlah penumpang</label>
                  <input type="text" placeholder="Jumlah penumpang" className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Jumlah kendaraan roda 2</label>
                  <input type="text" placeholder="Jumlah kendaraan roda 2" className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Jumlah kendaraan roda 4</label>
                  <input type="text" placeholder="Jumlah kendaraan roda 4" className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Berat Muatan (ton)</label>
                  <input type="text" placeholder="Berat Muatan (ton)" className="w-full p-3 border rounded-lg" />
                </div>
                <div className="flex justify-end">
                  <button className="px-12 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800">
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'jadwal' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <input
                  type="text"
                  placeholder="Cari jadwal"
                  className="px-4 py-2 border rounded-lg w-96"
                />
                <button className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-black font-semibold rounded-lg hover:bg-gray-400">
                  <Plus className="w-5 h-5" />
                  Tambah Data
                </button>
              </div>

              <div className="bg-teal-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-teal-800 text-white">
                      <th className="p-4 text-left">Keberangkatan</th>
                      <th className="p-4 text-left">Kedatangan</th>
                      <th className="p-4 text-left">Jam</th>
                      <th className="p-4 text-left">Armada</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule, index) => (
                      <tr key={schedule.id} className={index % 2 === 0 ? 'bg-gray-200' : 'bg-white'}>
                        <td className="p-4">{schedule.departure}</td>
                        <td className="p-4">{schedule.arrival}</td>
                        <td className="p-4">{schedule.time}</td>
                        <td className="p-4">{schedule.terminal}</td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentPage === 'historis' && (
            <div>
              <div className="mb-6 flex justify-end">
                <button className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800">
                  Export Data
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-4 text-left">
                        <input type="checkbox" />
                      </th>
                      <th className="p-4 text-left">Tanggal</th>
                      <th className="p-4 text-left">Penumpang</th>
                      <th className="p-4 text-left">Muatan (ton)</th>
                      <th className="p-4 text-left">Kendaraan</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-4">
                          <input type="checkbox" />
                        </td>
                        <td className="p-4">{item.date}</td>
                        <td className="p-4">{item.passengers}</td>
                        <td className="p-4">{item.cargo}</td>
                        <td className="p-4">{item.vehicles}</td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentPage === 'profil' && (
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-4">Tiara Agustin</div>
                  <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <User className="w-16 h-16 text-gray-600" />
                  </div>
                  <button className="px-6 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400">
                    Change Picture
                  </button>
                </div>

                <div className="space-y-2">
                  <button className="w-full text-left px-6 py-3 bg-gray-600 text-white rounded-lg">
                    Personal Information
                  </button>
                  <button className="w-full text-left px-6 py-3 hover:bg-gray-100 rounded-lg">
                    Account Security
                  </button>
                  <button className="w-full text-left px-6 py-3 hover:bg-gray-100 rounded-lg">
                    Notifications
                  </button>
                  <button className="w-full text-left px-6 py-3 hover:bg-gray-100 rounded-lg">
                    Payment Methods
                  </button>
                  <button className="w-full text-left px-6 py-3 hover:bg-gray-100 rounded-lg">
                    Shipping Information
                  </button>
                  <button className="w-full text-left px-6 py-3 hover:bg-gray-100 rounded-lg">
                    Privacy Settings
                  </button>
                </div>
              </div>

              <div className="col-span-2 bg-gray-100 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm text-gray-600">Full Name</label>
                    <input
                      type="text"
                      value="Tiara Agustin"
                      className="w-full p-3 border rounded-lg"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-gray-600">Email Address</label>
                    <input
                      type="email"
                      value="tiara@gmail.com"
                      className="w-full p-3 border rounded-lg"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-gray-600">Phone Number</label>
                    <input
                      type="text"
                      value="082211111100005"
                      className="w-full p-3 border rounded-lg"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-gray-600">Company (Optional)</label>
                    <input
                      type="text"
                      value="Construction Professional Inc."
                      className="w-full p-3 border rounded-lg"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-gray-600">Job Title (Optional)</label>
                    <input
                      type="text"
                      value="Construction Manager"
                      className="w-full p-3 border rounded-lg"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm text-gray-600">About Me (Optional)</label>
                    <textarea
                      value="Construction professional with 10+ years of experience. Passionate about sustainable building practices and reducing construction waste through material reuse."
                      className="w-full p-3 border rounded-lg h-32"
                      readOnly
                    />
                  </div>
                  <div className="flex justify-end">
                    <button className="px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800">
                      Edit Profil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishubAcehApp;