import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Quiz, QuizQuestion } from '../types';
import { Plus, Trash2, Edit2, CheckCircle2, Circle, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AdminQuizzes() {
  const { quizzes, subjects, addQuiz, updateQuiz, deleteQuiz } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  
  const initialQuiz: Partial<Quiz> = {
    title: '',
    description: '',
    subjectId: '',
    unit: '',
    medium: 'Sinhala',
    timeLimitMins: 30,
    questions: []
  };
  
  const [newQuiz, setNewQuiz] = useState<Partial<Quiz>>(initialQuiz);

  const addQuestion = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        {
          id: `q-${Date.now()}`,
          type: 'mcq',
          text: '',
          options: ['', '', '', '', ''],
          correctOptionIndex: 0
        }
      ]
    }));
  };

  const removeQuestion = (qId: string) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: (prev.questions || []).filter(q => q.id !== qId)
    }));
  };

  const updateQuestion = (qId: string, updates: Partial<QuizQuestion>) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: (prev.questions || []).map(q => q.id === qId ? { ...q, ...updates } : q)
    }));
  };

  const handleSave = () => {
    if (!newQuiz.title || !newQuiz.subjectId) {
      alert("Please fill title and subject");
      return;
    }
    
    if (newQuiz.id) {
      updateQuiz(newQuiz as Quiz);
    } else {
      addQuiz({ ...newQuiz, id: `quiz-${Date.now()}` } as Quiz);
    }
    setShowForm(false);
    setNewQuiz(initialQuiz);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleExtractFromImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type;
      const data = base64Data.split(',')[1];

      const res = await fetch('/api/extract-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageParams: { mimeType, data }
        })
      });

      if (!res.ok) throw new Error('Extraction failed');
      const jsonStr = await res.json();
      const parsed = JSON.parse(jsonStr.result);
      
      if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
        const generatedQuestions = parsed.questions.map((q: any, i: number) => ({
          ...q,
          id: `q-${Date.now()}-${i}`
        }));

        setNewQuiz(prev => ({
          ...prev,
          questions: [...(prev.questions || []), ...generatedQuestions]
        }));
      }

    } catch (error) {
      console.error(error);
      alert('Failed to extract questions. Please try again.');
    } finally {
      setIsExtracting(false);
      if (e.target) e.target.value = '';
    }
  };

  const [isExtractingAnswers, setIsExtractingAnswers] = useState(false);

  const handleExtractAnswersFromImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!newQuiz.questions || newQuiz.questions.length === 0) {
      alert("Please add or extract some questions first before extracting answers");
      return;
    }

    setIsExtractingAnswers(true);
    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type;
      const data = base64Data.split(',')[1];

      const res = await fetch('/api/extract-quiz-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageParams: { mimeType, data },
          existingQuestions: newQuiz.questions.map((q) => ({ id: q.id, text: q.text }))
        })
      });

      if (!res.ok) throw new Error('Extraction failed');
      const jsonStr = await res.json();
      const parsed = JSON.parse(jsonStr.result);
      
      if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
        setNewQuiz(prev => {
           let updatedQs = [...(prev.questions || [])];
           parsed.questions.forEach((updateQ: any) => {
              const idx = updatedQs.findIndex(q => q.id === updateQ.id);
              if (idx !== -1) {
                 updatedQs[idx] = { 
                   ...updatedQs[idx], 
                   correctOptionIndex: updateQ.correctOptionIndex ?? updatedQs[idx].correctOptionIndex,
                   hints: updateQ.hints ?? updatedQs[idx].hints,
                   markingScheme: updateQ.markingScheme ?? updatedQs[idx].markingScheme 
                 };
              }
           });
           return { ...prev, questions: updatedQs };
        });
      }

    } catch (error) {
      console.error(error);
      alert('Failed to extract answers. Please try again.');
    } finally {
      setIsExtractingAnswers(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Manage Quizzes</h2>
        <button 
          onClick={() => { setShowForm(true); setNewQuiz(initialQuiz); }}
          className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Quiz
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-lg font-semibold">{newQuiz.id ? 'Edit Quiz' : 'New Quiz'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Quiz Title"
              value={newQuiz.title || ''}
              onChange={e => setNewQuiz({...newQuiz, title: e.target.value})}
              className="bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-purple-500 w-full"
            />
            <select
              value={newQuiz.subjectId || ''}
              onChange={e => setNewQuiz({...newQuiz, subjectId: e.target.value})}
              className="bg-slate-900 border border-white/10 p-2 rounded text-white outline-none focus:border-purple-500 w-full"
            >
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input
              type="text"
              placeholder="Unit (Optional)"
              value={newQuiz.unit || ''}
              onChange={e => setNewQuiz({...newQuiz, unit: e.target.value})}
              className="bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-purple-500 w-full"
            />
            <select
              value={newQuiz.medium || ''}
              onChange={e => setNewQuiz({...newQuiz, medium: e.target.value as any})}
              className="bg-slate-900 border border-white/10 p-2 rounded text-white outline-none focus:border-purple-500 w-full"
            >
              <option value="Sinhala">Sinhala</option>
              <option value="English">English</option>
            </select>
            <input
              type="number"
              placeholder="Time Limit (Minutes)"
              value={newQuiz.timeLimitMins || ''}
              onChange={e => setNewQuiz({...newQuiz, timeLimitMins: parseInt(e.target.value)})}
              className="bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-purple-500 w-full"
            />
            <textarea
              placeholder="Description (Optional)"
              value={newQuiz.description || ''}
              onChange={e => setNewQuiz({...newQuiz, description: e.target.value})}
              className="bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-purple-500 w-full"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-purple-400">Questions {newQuiz.questions?.length ? `(${newQuiz.questions.length})` : ''}</h4>
              <div className="flex gap-2">
                <label className="text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded hover:bg-purple-500/30 flex items-center gap-1 cursor-pointer">
                  {isExtracting ? <Loader2 className="w-3 h-3 animate-spin"/> : <Upload className="w-3 h-3"/>}
                  {isExtracting ? 'Extracting...' : 'Extract Qs from PDF/Image'}
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleExtractFromImage} disabled={isExtracting || isExtractingAnswers} />
                </label>
                {(newQuiz.questions?.length ?? 0) > 0 && (
                   <label className="text-sm bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded hover:bg-emerald-500/30 flex items-center gap-1 cursor-pointer">
                     {isExtractingAnswers ? <Loader2 className="w-3 h-3 animate-spin"/> : <CheckCircle2 className="w-3 h-3"/>}
                     {isExtractingAnswers ? 'Mapping...' : 'Map Answers from PDF/Image'}
                     <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleExtractAnswersFromImage} disabled={isExtracting || isExtractingAnswers} />
                   </label>
                )}
                <button onClick={addQuestion} className="text-sm bg-white/5 px-3 py-1 rounded hover:bg-white/10 flex items-center gap-1">
                   <Plus className="w-3 h-3"/> Add Question
                </button>
              </div>
            </div>
            
            {(newQuiz.questions || []).map((q, idx) => (
               <div key={q.id} className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-3 relative">
                 <button onClick={() => removeQuestion(q.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4"/>
                 </button>
                 <div className="flex gap-2 items-center">
                   <h5 className="font-medium text-sm text-gray-400">Question {idx + 1}</h5>
                   <select 
                     value={q.type}
                     onChange={e => updateQuestion(q.id, { type: e.target.value as any })}
                     className="bg-slate-800 text-xs text-white p-1 rounded outline-none border border-white/10"
                   >
                      <option value="mcq">MCQ</option>
                      <option value="structured">Structured</option>
                      <option value="essay">Essay</option>
                   </select>
                 </div>
                 
                 <textarea
                   placeholder="Question text..."
                   value={q.text}
                   onChange={e => updateQuestion(q.id, { text: e.target.value })}
                   className="bg-white/5 w-full p-2 rounded text-sm text-white outline-none focus:border-purple-500 border border-transparent"
                 />
                 <input
                   type="text"
                   placeholder="Image URL (Optional)"
                   value={q.imageUrl || ''}
                   onChange={e => updateQuestion(q.id, { imageUrl: e.target.value })}
                   className="bg-white/5 w-full p-2 rounded text-sm text-white outline-none focus:border-purple-500 border border-transparent"
                 />

                 {q.type === 'mcq' && (
                    <div className="space-y-2 mt-2 pl-4 border-l-2 border-slate-700">
                       {(q.options || ['', '', '', '', '']).map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-2 items-center">
                             <button
                               onClick={() => updateQuestion(q.id, { correctOptionIndex: oIdx })}
                               className={`${q.correctOptionIndex === oIdx ? 'text-green-400' : 'text-gray-500'} hover:text-green-300`}
                             >
                               {q.correctOptionIndex === oIdx ? <CheckCircle2 className="w-4 h-4"/> : <Circle className="w-4 h-4"/>}
                             </button>
                             <input
                               type="text"
                               placeholder={`Option ${oIdx + 1}`}
                               value={opt}
                               onChange={e => {
                                 const newOpts = [...(q.options || ['', '', '', '', ''])];
                                 newOpts[oIdx] = e.target.value;
                                 updateQuestion(q.id, { options: newOpts });
                               }}
                               className="bg-white/5 flex-1 p-1.5 rounded text-sm text-white outline-none focus:border-purple-500 border border-transparent"
                             />
                          </div>
                       ))}
                    </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Hint (Optional)"
                      value={q.hints || ''}
                      onChange={e => updateQuestion(q.id, { hints: e.target.value })}
                      className="bg-white/5 w-full p-2 rounded text-sm text-white outline-none focus:border-purple-500 border border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Marking Scheme (Optional)"
                      value={q.markingScheme || ''}
                      onChange={e => updateQuestion(q.id, { markingScheme: e.target.value })}
                      className="bg-white/5 w-full p-2 rounded text-sm text-white outline-none focus:border-purple-500 border border-transparent"
                    />
                 </div>
               </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/10">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleSave} className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600">
              Save Quiz
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 mt-6">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center group">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {quiz.title} <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">{quiz.questions.length} Qs</span>
              </h3>
              <p className="text-sm text-gray-400">
                {subjects.find(s => s.id === quiz.subjectId)?.name || 'Unknown'} - {quiz.medium} • {quiz.unit || 'General'}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setNewQuiz(quiz); setShowForm(true); }}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this quiz?')) {
                    deleteQuiz(quiz.id);
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete"
              >
                 <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {quizzes.length === 0 && (
          <div className="text-center py-10 text-gray-500">No quizzes mapped. Add one to get started.</div>
        )}
      </div>
    </section>
  );
}
