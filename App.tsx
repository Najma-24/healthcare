
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Activity, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Loader2,
  Filter,
  ArrowRight
} from 'lucide-react';
import { ReviewAnalysis, Sentiment, Category } from './types';
import { analyzeMedicalReview } from './services/geminiService';

// Initial dummy data to populate the view
const INITIAL_REVIEWS: ReviewAnalysis[] = [
  {
    id: '1',
    originalText: "The nurses were incredibly patient and the facility was spotless. I felt very well cared for during my stay.",
    sentiment: Sentiment.POSITIVE,
    sentimentScore: 0.95,
    category: Category.STAFF_BEHAVIOR,
    summary: "High praise for nursing staff and cleanliness.",
    improvementSuggestion: "Recognize the nursing team for their exceptional patient care.",
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    originalText: "Waited for over 3 hours just to see a doctor for a 5-minute consultation. Completely unacceptable.",
    sentiment: Sentiment.NEGATIVE,
    sentimentScore: 0.88,
    category: Category.WAIT_TIME,
    summary: "Extreme dissatisfaction with long wait times.",
    improvementSuggestion: "Implement a more efficient triage or appointment scheduling system.",
    timestamp: new Date(Date.now() - 172800000).toISOString()
  }
];

const COLORS = ['#10b981', '#f43f5e', '#64748b'];

const App: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewAnalysis[]>(INITIAL_REVIEWS);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reviews'>('dashboard');

  const stats = useMemo(() => {
    const total = reviews.length;
    const pos = reviews.filter(r => r.sentiment === Sentiment.POSITIVE).length;
    const neg = reviews.filter(r => r.sentiment === Sentiment.NEGATIVE).length;
    const neu = reviews.filter(r => r.sentiment === Sentiment.NEUTRAL).length;

    const sentimentData = [
      { name: 'Positive', value: pos },
      { name: 'Negative', value: neg },
      { name: 'Neutral', value: neu },
    ];

    const categoryCounts: Record<string, number> = {};
    reviews.forEach(r => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

    return {
      total,
      positivePercent: total ? Math.round((pos / total) * 100) : 0,
      negativePercent: total ? Math.round((neg / total) * 100) : 0,
      sentimentData,
      categoryData
    };
  }, [reviews]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeMedicalReview(inputText);
      const newReview: ReviewAnalysis = {
        id: Math.random().toString(36).substr(2, 9),
        originalText: inputText,
        sentiment: analysis.sentiment || Sentiment.NEUTRAL,
        sentimentScore: analysis.sentimentScore || 0,
        category: analysis.category || Category.OTHER,
        summary: analysis.summary || "Summary unavailable",
        improvementSuggestion: analysis.improvementSuggestion || "No specific advice",
        timestamp: new Date().toISOString()
      };
      setReviews(prev => [newReview, ...prev]);
      setInputText('');
      setActiveTab('reviews');
    } catch (error) {
      alert("Failed to analyze review. Please check your API configuration.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Activity size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">MedInsight</h1>
          </div>
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`text-sm font-medium transition-colors ${activeTab === 'reviews' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              All Reviews
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Input Form (Always Visible for quick access) */}
          <div className="w-full lg:w-1/3 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-blue-600" />
                Analyze New Review
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Paste patient feedback or survey comments here for real-time sentiment analysis and categorization.
              </p>
              <form onSubmit={handleAnalyze}>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Example: The waiting area was crowded but the doctor was very professional and explained everything clearly..."
                  className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none mb-4"
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !inputText.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      AI Processing...
                    </>
                  ) : (
                    <>
                      <TrendingUp size={20} />
                      Run NLP Analysis
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Dynamic Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard 
                    label="Total Analyzed" 
                    value={stats.total} 
                    icon={<MessageSquare className="text-blue-600" />}
                    trend="+12% from last month"
                  />
                  <StatCard 
                    label="Patient Satisfaction" 
                    value={`${stats.positivePercent}%`} 
                    icon={<ThumbsUp className="text-emerald-600" />}
                    trend="Based on positive sentiment"
                  />
                  <StatCard 
                    label="Complaint Rate" 
                    value={`${stats.negativePercent}%`} 
                    icon={<ThumbsDown className="text-rose-600" />}
                    trend="Needs immediate attention"
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Sentiment Distribution</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.sentimentData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {stats.sentimentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Issues by Category</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.categoryData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100} 
                            fontSize={12} 
                            tick={{fill: '#64748b'}} 
                          />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent High-Impact Reviews */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">Priority Action Items</h3>
                    <button onClick={() => setActiveTab('reviews')} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                      View All <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {reviews.slice(0, 3).map((review) => (
                      <ReviewRow key={review.id} review={review} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900">Patient Review Feed</h2>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 flex items-center gap-2 hover:bg-slate-50">
                      <Filter size={16} /> Filter
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-400">No reviews analyzed yet. Use the sidebar to start.</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-2 mb-4">
            <Activity className="text-blue-400" size={24} />
            <span className="text-white font-bold text-lg">MedInsight</span>
          </div>
          <p className="text-sm mb-6">Empowering healthcare providers through advanced feedback intelligence.</p>
          <div className="flex justify-center gap-8 text-xs uppercase tracking-widest font-semibold">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Compliance</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <p className="mt-8 text-[10px] text-slate-600">&copy; 2024 MedInsight AI Platforms. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; trend?: string }> = ({ label, value, icon, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      {trend && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{trend}</span>}
    </div>
    <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</div>
  </div>
);

const ReviewRow: React.FC<{ review: ReviewAnalysis }> = ({ review }) => (
  <div className="p-6 hover:bg-slate-50 transition-colors">
    <div className="flex items-center gap-3 mb-2">
      <SentimentBadge sentiment={review.sentiment} />
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{review.category}</span>
    </div>
    <p className="text-slate-900 font-medium text-sm mb-1">{review.summary}</p>
    <div className="flex items-center gap-2 text-blue-600">
      <AlertCircle size={14} />
      <span className="text-xs font-medium">{review.improvementSuggestion}</span>
    </div>
  </div>
);

const ReviewCard: React.FC<{ review: ReviewAnalysis }> = ({ review }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <SentimentBadge sentiment={review.sentiment} />
        <CategoryBadge category={review.category} />
      </div>
      <span className="text-xs text-slate-400">{new Date(review.timestamp).toLocaleDateString()}</span>
    </div>
    <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{review.originalText}"</p>
    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-2">
        <TrendingUp size={12} /> AI Insight
      </h4>
      <p className="text-sm text-blue-800 font-medium mb-3">{review.summary}</p>
      <div className="flex items-start gap-2 bg-white/60 p-3 rounded-lg border border-blue-100">
        <AlertCircle size={14} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] font-bold text-blue-500 uppercase block mb-1">Recommendation</span>
          <p className="text-xs text-slate-700 leading-normal">{review.improvementSuggestion}</p>
        </div>
      </div>
    </div>
  </div>
);

const SentimentBadge: React.FC<{ sentiment: Sentiment }> = ({ sentiment }) => {
  const styles = {
    [Sentiment.POSITIVE]: "bg-emerald-100 text-emerald-700 border-emerald-200",
    [Sentiment.NEGATIVE]: "bg-rose-100 text-rose-700 border-rose-200",
    [Sentiment.NEUTRAL]: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[sentiment]}`}>
      {sentiment}
    </span>
  );
};

const CategoryBadge: React.FC<{ category: Category }> = ({ category }) => (
  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-blue-50 text-blue-700 border-blue-200">
    {category}
  </span>
);

export default App;
