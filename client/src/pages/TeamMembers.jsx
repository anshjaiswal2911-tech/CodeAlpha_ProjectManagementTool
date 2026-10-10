import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Users, Mail, Briefcase, Search } from 'lucide-react';

export const TeamMembers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users');
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error('Failed to load team directory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.jobTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-brand-600" />
          <span>Team Directory</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Connect with team members and invite them to your project boards
        </p>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search team members by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Loading team directory..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-300 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <Avatar user={user} size="lg" />
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate">{user.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-brand-600 font-medium mt-0.5">
                    <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{user.jobTitle || 'Team Member'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              {user.bio && (
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {user.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
