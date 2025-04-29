import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchRecentPosts();
      } else {
        // Redirect to login if not authenticated
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchRecentPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const postsData = [];
      
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200">
      {/* Navigation Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-400">SocialApp</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-gray-800 text-white pl-8 pr-4 py-2 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="text-gray-300 hover:text-white">
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                
                <div className="relative group">
                  <button className="flex items-center space-x-1">
                    <img 
                      src={user?.photoURL || "/api/placeholder/32/32"} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border border-gray-700"
                    />
                    <span className="hidden md:inline-block">{user?.displayName?.split(' ')[0] || 'User'}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-md shadow-lg hidden group-hover:block">
                    <div className="py-1">
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">Profile</a>
                      <a href="/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">Settings</a>
                      <button 
                        onClick={handleLogout} 
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 sticky top-20">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src={user?.photoURL || "/api/placeholder/64/64"} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                />
                <div>
                  <h2 className="font-semibold text-lg">{user?.displayName || 'User'}</h2>
                  <p className="text-gray-400 text-sm">@{user?.email?.split('@')[0] || 'username'}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('feed'); }}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md ${activeTab === 'feed' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home Feed</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('explore'); }}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md ${activeTab === 'explore' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Explore</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('messages'); }}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md ${activeTab === 'messages' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>Messages</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('friends'); }}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md ${activeTab === 'friends' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Friends</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('events'); }}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md ${activeTab === 'events' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Events</span>
                </a>
              </nav>
            </div>
          </div>
          
          {/* Main Feed */}
          <div className="w-full md:w-2/4">
            {/* Create Post */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-6">
              <div className="flex space-x-3">
                <img 
                  src={user?.photoURL || "/api/placeholder/40/40"} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <textarea 
                    placeholder="What's on your mind?" 
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="2"
                  ></textarea>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-1 text-gray-300 hover:text-purple-400">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Photo</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-300 hover:text-purple-400">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Video</span>
                      </button>
                    </div>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Posts Feed */}
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <img 
                          src={post.authorPhotoURL || "/api/placeholder/40/40"} 
                          alt={post.authorName} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold">{post.authorName}</h3>
                          <p className="text-gray-400 text-xs">{new Date(post.createdAt?.seconds * 1000).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-gray-200 mb-3">{post.content}</p>
                      {post.imageURL && (
                        <div className="w-full h-64 bg-gray-700 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                          <img src={post.imageURL} alt="Post content" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between text-gray-400 pt-3 border-t border-gray-800">
                        <button className="flex items-center space-x-1 hover:text-purple-400">
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>{post.likes || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-purple-400">
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>{post.comments?.length || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-purple-400">
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-medium text-gray-300 mb-2">No Posts Yet</h3>
                <p className="text-gray-400">Connect with friends or create your first post!</p>
              </div>
            )}
          </div>
          
          {/* Right Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-6">
              <h3 className="font-semibold text-lg mb-3">People You May Know</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={`/api/placeholder/${30 + i}/${30 + i}`} alt="Suggested user" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h4 className="font-semibold">User Name {i}</h4>
                        <p className="text-gray-400 text-xs">5 mutual friends</p>
                      </div>
                    </div>
                    <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                      Add
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <a href="#" className="text-purple-400 hover:underline text-sm">View All</a>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 sticky top-20">
              <h3 className="font-semibold text-lg mb-3">Upcoming Events</h3>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start space-x-3">
                      <div className="bg-gray-800 rounded p-2 text-center w-12">
                        <span className="block text-xs text-purple-400">MAY</span>
                        <span className="text-lg font-semibold">{i + 14}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Tech Meetup {i}</h4>
                        <p className="text-gray-400 text-sm">7:00 PM • Virtual Event</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="flex -space-x-2">
                            <img src="/api/placeholder/24/24" alt="Attendee" className="w-6 h-6 rounded-full border border-gray-800" />
                            <img src="/api/placeholder/24/24" alt="Attendee" className="w-6 h-6 rounded-full border border-gray-800" />
                          </div>
                          <span className="text-gray-400 text-xs">+{i * 3 + 5} going</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <a href="#" className="text-purple-400 hover:underline text-sm">View All</a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-4 mt-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">© 2025 SocialApp. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 text-sm">Help Center</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;