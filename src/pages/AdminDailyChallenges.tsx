import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Sun, Plus, Trash2, Calendar, Trophy, AlertCircle } from 'lucide-react';
import { collection, setDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DailyChallenge } from '../types';

export default function AdminDailyChallenges() {
  const { dailyChallenges, quizzes } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    quizId: '',
    activeDate: new Date().toISOString().split('T')[0],
    points: 100
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const id = `challenge-${Date.now()}`;
      await setDoc(doc(db, 'dailyChallenges', id), {
        quizId: formData.quizId,
        activeDate: formData.activeDate,
        points: Number(formData.points),
        createdAt: serverTimestamp()
      });
      setShowForm(false);
      setFormData({ quizId: '', activeDate: new Date().toISOString().split('T')[0], points: 100 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this daily challenge?')) {
      try {
        await deleteDoc(doc(db, 'dailyChallenges', id));
      } catch (err: any) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sun className="w-6 h-6 text-amber-500" />
          Manage Daily Challenges
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Challenge
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Quiz</label>
              <select
                required
                value={formData.quizId}
                onChange={e => setFormData({ ...formData, quizId: e.target.value })}
                className="input-field"
              >
                <option value="">Select a Quiz</option>
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>{q.title} ({q.medium})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Active Date</label>
              <input
                type="date"
                required
                value={formData.activeDate}
                onChange={e => setFormData({ ...formData, activeDate: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Points</label>
              <input
                type="number"
                min="10"
                step="10"
                required
                value={formData.points}
                onChange={e => setFormData({ ...formData, points: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl text-slate-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Add Challenge'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dailyChallenges.map(challenge => {
          const quiz = quizzes.find(q => q.id === challenge.quizId);
          return (
            <div key={challenge.id} className="glass-panel p-6 rounded-2xl border border-white/10 relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(challenge.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{challenge.activeDate}</h3>
                  <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                     <Trophy className="w-3 h-3" /> {challenge.points} Points
                  </div>
                </div>
              </div>
              
              <div className="bg-black/20 p-4 rounded-xl">
                 <div className="text-xs text-slate-400 mb-1">Assigned Quiz:</div>
                 <div className="text-sm text-white font-medium line-clamp-2">{quiz?.title || 'Unknown Quiz (Deleted?)'}</div>
              </div>
            </div>
          );
        })}
        {dailyChallenges.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
             No daily challenges scheduled. Add one above.
          </div>
        )}
      </div>
    </div>
  );
}
