import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users as UsersIcon, User } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, error => console.warn('Could not read users', error));
    return () => unsub();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <UsersIcon className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold">Registered Users</h2>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 font-semibold text-gray-300">Name</th>
              <th className="p-4 font-semibold text-gray-300">Email</th>
              <th className="p-4 font-semibold text-gray-300">Role</th>
              <th className="p-4 font-semibold text-gray-300">Signed Up</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-4 text-white font-medium flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <User className="w-4 h-4" />
                  </div>
                  {u.name || 'Unknown'}
                </td>
                <td className="p-4 text-gray-400">{u.email}</td>
                <td className="p-4 text-gray-400 capitalize">{u.role || 'Student'}</td>
                <td className="p-4 text-gray-400">
                  {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'Now'}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
