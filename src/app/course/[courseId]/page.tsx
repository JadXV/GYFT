'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// import 'highlight.js/styles/github-dark.css'; // or any theme you prefer
import rehypeHighlight from 'rehype-highlight';

interface ContentBlock {
  type: 'p' | 'code';
  text?: string;
  lang?: string;
  code?: string;
}

interface Section {
  t: string; // title
  c: ContentBlock[]; // content
}

interface Chapter {
  n: string; // name
  d: string; // description
  s: Section[]; // sections
}

interface Course {
  _id: string;
  title: string;
  description: string;
  language: string;
  chapters: Chapter[];
  topic: string;
  created_at: string;
  user_id: string;
  original_course_id?: string;
  original_author?: string;
  author_name?: string;
}

export default function CoursePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && courseId) {
      fetchCourse();
    }
  }, [status, router, courseId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && currentSectionIndex > 0) {
        navigateToSection('prev');
      } else if (event.key === 'ArrowRight' && currentSectionIndex < allSections.length - 1) {
        navigateToSection('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSectionIndex, allSections.length]);

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
        
        // Flatten all sections from all chapters
        const flatSections = data.chapters.flatMap((chapter: Chapter) => chapter.s);
        setAllSections(flatSections);
        
        if (flatSections.length > 0) {
          setSelectedSection(flatSections[0]);
          setCurrentSectionIndex(0);
        }
      } else if (response.status === 404) {
        setError('Course not found');
      } else {
        setError('Failed to load course');
      }
    } catch (error) {
      setError('Error loading course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section);
    const index = allSections.findIndex(s => s.t === section.t);
    setCurrentSectionIndex(index);
  };

  const navigateToSection = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next' ? currentSectionIndex + 1 : currentSectionIndex - 1;
    if (newIndex >= 0 && newIndex < allSections.length) {
      setSelectedSection(allSections[newIndex]);
      setCurrentSectionIndex(newIndex);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 py-8 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-[26px]">
          <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-slate-400 mb-6">{error || 'Course not found'}</p>
            <Link href="/dashboard">
              <Button variant="primary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 mt-[26px]">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              ← Back to Dashboard
            </Button>
          </Link>
          <div className="flex-grow text-center">
            <h1 className="text-2xl font-bold mb-2">{course?.title}</h1>
            {allSections.length > 0 && (
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm text-slate-400">Progress:</span>
                <div className="w-48 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentSectionIndex + 1) / allSections.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-slate-400">
                  {currentSectionIndex + 1}/{allSections.length}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-4 h-fit">
            <h2 className="text-xl font-bold mb-4">Course Content</h2>
            <div className="space-y-2">
              {course?.chapters?.map((chapter, chapterIndex) => (
                <div key={chapterIndex}>
                  <h3 className="font-semibold text-lg mb-2 text-slate-300">{chapter.n}</h3>
                  <div className="space-y-1">
                    {chapter.s.map((section, sectionIndex) => (
                      <button
                        key={sectionIndex}
                        onClick={() => handleSectionSelect(section)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-300 ${
                          selectedSection?.t === section.t
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white'
                        }`}
                      >
                        {section.t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {selectedSection ? (
              <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-8">
                <h2 className="text-3xl font-bold mb-6">{selectedSection.t}</h2>
                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed mb-8">
                {Array.isArray(selectedSection.c) ? selectedSection.c.map((block, index) => {
                      if (block.type === 'p') {
                        return <ReactMarkdown key={index} rehypePlugins={[rehypeHighlight]}>{block.text || ''}</ReactMarkdown>;
                      }
                      if (block.type === 'code' && block.code) {
                        const codeMarkdown = `\`\`\`${block.lang || ''}\n${block.code}\n\`\`\``;
                        return <ReactMarkdown key={index} rehypePlugins={[rehypeHighlight]}>{codeMarkdown}</ReactMarkdown>;
                      }
                      return null;
                    }) : (
                      <div className="text-slate-400">No content available for this section.</div>
                    )}
                </div>
                
                {/* Navigation Buttons */}
                <div className="pt-6 border-t border-white/20">
                  <div className="flex justify-between items-center mb-3 mt-6">
                    <Button
                      onClick={() => navigateToSection('prev')}
                      disabled={currentSectionIndex === 0}
                      variant="outline"
                    >
                      ← Previous Section
                    </Button>
                    
                    <Link href={`/course/${courseId}/quiz/section?section=${encodeURIComponent(selectedSection.t)}`}>
                      <Button variant="primary">
                        Quiz This Section
                      </Button>
                    </Link>
                    
                    <Button
                      onClick={() => navigateToSection('next')}
                      disabled={currentSectionIndex === allSections.length - 1}
                      variant="outline"
                    >
                      Next Section →
                    </Button>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-400">
                      Section {currentSectionIndex + 1} of {allSections.length} • Use ← → keys to navigate
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-8">
                <div className="text-center text-slate-500">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.747-5.747h11.494" />
                  </svg>
                  <p className="mt-4 text-lg">Select a section from the sidebar to view its content.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
