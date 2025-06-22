"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Settings, 
  Globe, 
  Lock, 
  Trash2, 
  Plus, 
  BookOpen, 
  Users, 
  Trophy, 
  Sparkles, 
  Search,
  TrendingUp,
  Star,
  Clock,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { CourseData } from "@/types/auth";
import { useToast } from "@/components/ui/toast";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newCourseTopic, setNewCourseTopic] = useState("");

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated') {
      fetchCourses();
    }
  }, [status, router]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const coursesData = await response.json();
        setCourses(coursesData);
      } else {
        console.error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTopic.trim() || generating) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/courses/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: newCourseTopic }),
      });

      if (response.ok) {
        const result = await response.json();
        setNewCourseTopic("");
        await fetchCourses(); // Refresh courses list
        addToast("Course generated successfully!", "success");
      } else {
        const error = await response.json();
        console.error('Failed to generate course:', error.error);
        addToast("Failed to generate course", "error");
      }
    } catch (error) {
      console.error('Error generating course:', error);
      addToast("Error generating course", "error");
    } finally {
      setGenerating(false);
    }
  };

  const toggleCourseVisibility = async (courseId: string, currentlyPublic: boolean) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_public: !currentlyPublic }),
      });

      if (response.ok) {
        await fetchCourses(); // Refresh courses list
        addToast(`Course ${!currentlyPublic ? 'made public' : 'made private'}`, "success");
      } else {
        addToast("Failed to update course visibility", "error");
      }
    } catch (error) {
      console.error('Error updating course visibility:', error);
      addToast("Error updating course visibility", "error");
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCourses(); // Refresh courses list
        addToast("Course deleted successfully", "success");
      } else {
        addToast("Failed to delete course", "error");
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      addToast("Error deleting course", "error");
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex justify-center items-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-400 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black to-slate-900 text-white pt-24">
      <div className="container mx-auto px-6 pb-12 mt-[26px]">
        {/* Course Creation Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create New Course</h2>
                <p className="text-slate-400">Generate a personalized learning experience with AI</p>
              </div>
            </div>
            
            <form onSubmit={generateCourse} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="What would you like to learn? (e.g., 'Python for Data Science', 'React Fundamentals')"
                    value={newCourseTopic}
                    onChange={(e) => setNewCourseTopic(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20 h-12"
                    disabled={generating}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={generating || !newCourseTopic.trim()}
                  className="h-12 px-8"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Course
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* User's Courses */}
        {courses.length > 0 ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <h2 className="text-3xl font-bold text-white mr-4">Your Courses</h2>
                <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                  {courses.length} course{courses.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isOwnCourse = course.user_id === session?.user?.id;
                const isInstalledCourse = course.original_course_id && !isOwnCourse;
                
                return (                  
                  <div
                    key={course._id} 
                    onClick={() => router.push(`/course/${course._id}`)}
                    className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-12 h-12 mr-3 flex-shrink-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                          {course.title.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate" title={course.title}>
                            {course.title}
                          </h3>
                          {isInstalledCourse && (
                            <p className="text-xs text-slate-400 mt-1 truncate" title={course.original_author || course.author_name || 'Unknown Author'}>
                              by {course.original_author || course.author_name || 'Unknown Author'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Only show settings for own courses */}
                      {isOwnCourse && (
                        <div className="flex-shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-slate-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-900/95 backdrop-blur-lg border-white/20">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  course._id && toggleCourseVisibility(course._id, course.is_public || false);
                                }}
                                className="text-white hover:bg-white/10"
                              >
                                {course.is_public ? (
                                  <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Make Private
                                  </>
                                ) : (
                                  <>
                                    <Globe className="mr-2 h-4 w-4" />
                                    Make Public
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  course._id && deleteCourse(course._id);
                                }}
                                className="text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4 overflow-hidden">
                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-2" title={course.description || course.topic}>
                        {course.description || course.topic}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                      <div className="flex items-center gap-2 text-sm text-slate-400 min-w-0 flex-1">
                        <span className="bg-slate-700/50 px-2 py-1 rounded-md text-xs whitespace-nowrap">
                          {course.language}
                        </span>
                        <span className="flex items-center whitespace-nowrap">
                          <BookOpen className="h-4 w-4 mr-1 flex-shrink-0" />
                          {course.chapters?.length || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isInstalledCourse ? (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-md font-medium border border-orange-500/20 whitespace-nowrap">
                            Installed
                          </span>
                        ) : course.is_public ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-md font-medium border border-green-500/20 whitespace-nowrap">
                            Public
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded-md font-medium border border-slate-500/20 whitespace-nowrap">
                            Private
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Beautiful Empty State */
          <div className="mb-12">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">No courses yet</h2>
              <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                Start your learning journey by creating your first AI-generated course. 
                It only takes a few seconds!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => document.querySelector('input')?.focus()}
                  className="bg-black hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Course
                </Button>
                <Link href="/gyfts">
                  <Button
                    variant="outline"
                    className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 px-8 py-3"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Explore Public Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {/* <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Clock className="h-6 w-6 mr-3" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/gyfts">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Explore Courses</h4>
                <p className="text-slate-400 text-sm">Discover courses created by the community</p>
              </div>
            </Link>
            
            <div 
              onClick={() => setNewCourseTopic("Advanced JavaScript")}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">AI Suggestions</h4>
              <p className="text-slate-400 text-sm">Get personalized course recommendations</p>
            </div>
            
            <Link href="/profile">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Your Profile</h4>
                <p className="text-slate-400 text-sm">Manage your account and preferences</p>
              </div>
            </Link>
          </div>
        </div> */}
      </div>
    </div>
  );
}