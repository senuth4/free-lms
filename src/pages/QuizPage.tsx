import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import SEO from '../components/SEO';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, Info, AlertTriangle } from 'lucide-react';
import { doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDaily = searchParams.get('daily') === 'true';
  const { quizzes, user, submitQuizAttempt, quizAttempts, dailyChallenges } = useAppData();
  
  const quiz = quizzes.find(q => q.id === quizId);
  const alreadyAttemptedDaily = isDaily && quizAttempts.some(a => a.quizId === quizId && a.isDailyChallenge);
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});

  const [startedAt, setStartedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (quiz && quiz.timeLimitMins) {
      setTimeLeft(quiz.timeLimitMins * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (isStarted && !isFinished && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isStarted && !isFinished) {
      handleFinish();
    }
  }, [isStarted, isFinished, timeLeft]);

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Quiz Not Found</h2>
        <button onClick={() => navigate('/saved?tab=quizzes')} className="text-purple-400 hover:text-white">Go Back</button>
      </div>
    );
  }

  if (alreadyAttemptedDaily) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 flex items-center justify-center rounded-2xl mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Challenge Completed</h2>
        <p className="text-slate-400">You have already completed this daily challenge.</p>
        <button onClick={() => navigate('/saved?tab=daily')} className="btn-primary mt-4">Go to Daily Challenges</button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIdx];

  const handleSelectAnswer = (optionIdx: number) => {
    if (isFinished) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIdx
    }));
  };

  const handleStart = () => {
    setIsStarted(true);
    setStartedAt(new Date());
  };

  const handleFinish = async () => {
    setIsFinished(true);
    let rawScore = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctOptionIndex) {
        rawScore += 1;
      }
    });

    const percentage = Math.round((rawScore / quiz.questions.length) * 100);

    if (user && startedAt) {
      const answersList = Object.entries(answers).map(([qId, oIdx]) => ({
         questionId: qId,
         selectedOptionIndex: oIdx
      }));
      
      let pointsAwarded = 0;
      if (isDaily) {
         const challenge = dailyChallenges.find(c => c.quizId === quiz.id && c.activeDate === new Date().toISOString().split('T')[0]);
         if (challenge) {
            pointsAwarded = Math.round((percentage / 100) * challenge.points);
            try {
              // Update user profile points directly in Firestore
              await updateDoc(doc(db, 'users', user.uid), {
                points: increment(pointsAwarded)
              });
            } catch (e) {
              console.error("Failed to update user points", e);
            }
         }
      }
      
      await submitQuizAttempt({
         id: `attempt-${Date.now()}`,
         userId: user.uid,
         quizId: quiz.id,
         score: percentage,
         startedAt: startedAt,
         isDailyChallenge: isDaily,
         pointsAwarded,
         answers: answersList
      });
    }
  };

  const myPreviousAttempt = user ? quizAttempts.find(a => a.quizId === quiz.id && a.userId === user.uid) : null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <SEO title={`${quiz.title} - Practice Quick`} />
      
      {!isStarted ? (
         <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-6">
            <h1 className="text-3xl font-bold text-white">{quiz.title}</h1>
            <p className="text-gray-400">{quiz.description}</p>
            <div className="flex justify-center gap-6 text-sm text-gray-300">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400"/> {quiz.questions.length} Questions</span>
              {quiz.timeLimitMins && (
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-400"/> {quiz.timeLimitMins} Minutes</span>
              )}
            </div>
            {myPreviousAttempt && (
               <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl inline-block text-purple-200">
                 You scored <strong>{myPreviousAttempt.score} / {quiz.questions.length}</strong> previously. Practice again!
               </div>
            )}
            <div>
              <button 
                onClick={handleStart}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
              >
                Start Practice Quiz
              </button>
            </div>
         </div>
      ) : (
         <div className="space-y-6">
            <div className="flex justify-between items-center glass-panel p-4 rounded-2xl border border-white/10 sticky top-4 z-10">
               <div>
                  <span className="text-sm font-medium text-gray-400">Question {currentQuestionIdx + 1} of {quiz.questions.length}</span>
                  <div className="flex gap-1 mt-2">
                     {quiz.questions.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-2 h-2 rounded-full ${idx === currentQuestionIdx ? 'bg-purple-500' : answers[quiz.questions[idx].id] !== undefined ? 'bg-emerald-500' : 'bg-gray-700'}`}
                        />
                     ))}
                  </div>
               </div>
               {quiz.timeLimitMins && !isFinished && (
                  <div className={`font-mono font-bold text-lg flex items-center gap-2 ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                     <Clock className="w-5 h-5"/>
                     {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
               )}
            </div>

            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10">
               {currentQuestion.imageUrl && (
                  <img src={currentQuestion.imageUrl} alt="Question ref" className="max-w-full h-auto rounded-xl mb-6 border border-white/10" />
               )}
               <h2 className="text-xl md:text-2xl font-medium text-white mb-8">{currentQuestion.text}</h2>

               {currentQuestion.type === 'mcq' && (
                  <div className="space-y-3">
                     {currentQuestion.options?.map((opt, oIdx) => {
                       const isSelected = answers[currentQuestion.id] === oIdx;
                       const isCorrect = isFinished && currentQuestion.correctOptionIndex === oIdx;
                       const isWrongSelection = isFinished && isSelected && !isCorrect;

                       let styling = "bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300";
                       if (isSelected && !isFinished) styling = "bg-purple-500/20 border-purple-500 text-white";
                       if (isCorrect) styling = "bg-emerald-500/20 border-emerald-500 text-emerald-200";
                       if (isWrongSelection) styling = "bg-red-500/20 border-red-500 text-red-200";

                       return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectAnswer(oIdx)}
                            className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${styling}`}
                            disabled={isFinished}
                          >
                             {isSelected ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <Circle className="w-5 h-5 shrink-0" />}
                             <span className="flex-1">{opt}</span>
                          </button>
                       );
                     })}
                  </div>
               )}

               {isFinished && currentQuestion.markingScheme && (
                  <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                     <h4 className="text-emerald-400 font-bold mb-2 text-sm uppercase tracking-wide">Marking Scheme / Explanation</h4>
                     <p className="text-emerald-100 text-sm">{currentQuestion.markingScheme}</p>
                  </div>
               )}

               {!isFinished && currentQuestion.hints && (
                  <div className="mt-8">
                     <button 
                       onClick={() => setShowHints(prev => ({ ...prev, [currentQuestion.id]: true }))}
                       className="text-sm text-yellow-500 flex items-center gap-1 hover:text-yellow-400"
                     >
                        <Info className="w-4 h-4"/> Show Hint
                     </button>
                     {showHints[currentQuestion.id] && (
                        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm">
                           {currentQuestion.hints}
                        </div>
                     )}
                  </div>
               )}
            </div>

            <div className="flex justify-between items-center glass-panel p-4 rounded-2xl border border-white/10">
               <button 
                 onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                 disabled={currentQuestionIdx === 0}
                 className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white rounded-lg flex items-center gap-2"
               >
                 <ChevronLeft className="w-4 h-4"/> Previous
               </button>
               
               {currentQuestionIdx < quiz.questions.length - 1 ? (
                  <button 
                    onClick={() => setCurrentQuestionIdx(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                    className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4"/>
                  </button>
               ) : !isFinished ? (
                  <button 
                    onClick={handleFinish}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-lg flex items-center gap-2"
                  >
                    Submit Quiz <CheckCircle2 className="w-4 h-4"/>
                  </button>
               ) : (
                  <button 
                    onClick={() => navigate('/saved?tab=quizzes')}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 font-bold text-white rounded-lg flex items-center gap-2"
                  >
                    Back to Dashboard
                  </button>
               )}
            </div>

            {isFinished && (
               <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 text-center space-y-4">
                  <h2 className="text-3xl font-bold text-emerald-400">Quiz Completed!</h2>
                  <p className="text-xl text-white">Your Score: {Object.values(answers).reduce((acc, ans, idx) => acc + (ans === quiz.questions[idx].correctOptionIndex ? 1 : 0), 0)} / {quiz.questions.length}</p>
                  <p className="text-gray-400">Review your answers above to see detailed explanations.</p>
               </div>
            )}
         </div>
      )}
    </div>
  );
}
