"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Download, Heart, User, Calendar, Filter, Settings, Trash2, ExternalLink, Eye } from "lucide-react";
import { PublicCourse, CourseData } from "@/types/auth";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

export default function GyftsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [userCourses, setUserCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [installing, setInstalling] = useState<string | null>(null);
  const [liking, setLiking] = useState<string | null>(null);
  const [peekingCourse, setPeekingCourse] = useState<PublicCourse | null>(null);
  const [peekDialogOpen, setPeekDialogOpen] = useState(false);
  const [loadingPeek, setLoadingPeek] = useState(false);

  useEffect(() => {
    fetchPublicCourses();
    if (session) {
      fetchUserCourses();
    }
  }, [searchTerm, category, sortBy, currentPage, session]);

  const fetchPublicCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        category,
        sortBy,
        page: currentPage.toString(),
        limit: "12"
      });

      const response = await fetch(`/api/courses/public?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
        setTotalPages(data.totalPages);
      } else {
        console.error('Failed to fetch public courses');
      }
    } catch (error) {
      console.error('Error fetching public courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const coursesData = await response.json();
        setUserCourses(coursesData);
      }
    } catch (error) {
      console.error('Error fetching user courses:', error);
    }
  };

  const getCourse = async (courseId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setInstalling(courseId);
    try {
      const response = await fetch(`/api/courses/${courseId}/install`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchPublicCourses();
        await fetchUserCourses();
        addToast("Course added to your library!", "success");
      } else {
        const error = await response.json();
        console.error('Failed to get course:', error.error);
        addToast("Failed to get course", "error");
      }
    } catch (error) {
      console.error('Error getting course:', error);
      addToast("Error getting course", "error");
    } finally {
      setInstalling(null);
    }
  };

  const removeCourse = async (courseId: string) => {
    if (!session) return;

    // Find the user's copy of this course
    const userCourse = userCourses.find(course => 
      course.original_course_id === courseId || course._id === courseId
    );
    
    if (!userCourse?._id) return;

    setInstalling(courseId);
    try {
      const response = await fetch(`/api/courses/${userCourse._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUserCourses();
        addToast("Course removed from your library", "success");
      } else {
        addToast("Failed to remove course", "error");
      }
    } catch (error) {
      console.error('Error removing course:', error);
      addToast("Error removing course", "error");
    } finally {
      setInstalling(null);
    }
  };

  const toggleLike = async (courseId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setLiking(courseId);
    try {
      const response = await fetch(`/api/courses/${courseId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchPublicCourses();
        addToast("Like updated", "success");
      } else {
        const error = await response.json();
        console.error('Failed to like course:', error.error);
        addToast("Failed to update like", "error");
      }
    } catch (error) {
      console.error('Error liking course:', error);
      addToast("Error updating like", "error");
    } finally {
      setLiking(null);
    }
  };

  const peekCourse = async (courseId: string) => {
    setLoadingPeek(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/preview`);
      
      if (response.ok) {
        const courseData = await response.json();
        setPeekingCourse(courseData);
        setPeekDialogOpen(true);
      } else {
        console.error('Failed to fetch course preview');
        addToast("Failed to load course preview", "error");
      }
    } catch (error) {
      console.error('Error fetching course preview:', error);
      addToast("Error loading course preview", "error");
    } finally {
      setLoadingPeek(false);
    }
  };

  const isLiked = (course: PublicCourse) => {
    return session?.user?.id && course.likes?.includes(session.user.id);
  };

  const isUserOwned = (course: PublicCourse) => {
    return session?.user?.id && course.user_id === session.user.id;
  };

  const isUserHasCourse = (course: PublicCourse) => {
    return userCourses.some(userCourse => 
      userCourse.original_course_id === course._id || userCourse._id === course._id
    );
  };

  const getUserCourseId = (course: PublicCourse) => {
    const userCourse = userCourses.find(userCourse => 
      userCourse.original_course_id === course._id || userCourse._id === course._id
    );
    return userCourse?._id;
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white flex flex-col pt-24">
      <div className="container mx-auto px-6 py-8 mt-[26px]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Discover Public{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Gyfts
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Explore courses created by the community. Get, like, and learn from others.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search courses, topics, or authors..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-black border-[#535353] text-white placeholder-[#919191] focus:border-white"
              />
            </div>
            <Select value={category || "all"} onValueChange={(value) => { setCategory(value === "all" ? "" : value); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-48 bg-black border-[#535353] text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-black border-[#535353]">
                <SelectItem value="all" className="text-white hover:bg-gray-900">All Categories</SelectItem>
                <SelectItem value="Python" className="text-white hover:bg-gray-900">Python</SelectItem>
                <SelectItem value="JavaScript" className="text-white hover:bg-gray-900">JavaScript</SelectItem>
                <SelectItem value="React" className="text-white hover:bg-gray-900">React</SelectItem>
                <SelectItem value="Machine Learning" className="text-white hover:bg-gray-900">Machine Learning</SelectItem>
                <SelectItem value="Web Development" className="text-white hover:bg-gray-900">Web Development</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-48 bg-black border-[#535353] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-[#535353]">
                <SelectItem value="newest" className="text-white hover:bg-gray-900">Newest</SelectItem>
                <SelectItem value="popular" className="text-white hover:bg-gray-900">Most Popular</SelectItem>
                <SelectItem value="likes" className="text-white hover:bg-gray-900">Most Liked</SelectItem>
                <SelectItem value="oldest" className="text-white hover:bg-gray-900">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="max-w-6xl mx-auto">
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="border border-[#535353] rounded-lg p-6 bg-black hover:border-white transition-colors"
                >
                  {/* Course Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-[#919191] line-clamp-3 mb-3">
                      {course.description || course.topic}
                    </p>
                  </div>

                  {/* Course Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-[#919191]">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{course.author_name || "Anonymous"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(course.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                        {course.language}
                      </span>
                      <span className="text-[#919191]">
                        {course.chapters?.length || 0} chapters
                      </span>
                    </div>

                    {/* Stats and Like Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#535353] mb-4">
                      <div className="flex items-center gap-4 text-sm text-[#919191]">
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          <span>{course.install_count || 0}</span>
                        </div>
                      </div>
                      
                      {/* Unified Heart Button with Count */}
                      <Button
                        onClick={() => toggleLike(course._id!)}
                        disabled={liking === course._id}
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                          isLiked(course)
                            ? "text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20"
                            : "text-[#919191] hover:text-red-500 hover:bg-red-500/10"
                        }`}
                      >
                        <Heart 
                          className={`h-4 w-4 ${isLiked(course) ? "fill-current" : ""}`}
                        />
                        <span className="text-sm font-medium">{course.like_count || 0}</span>
                      </Button>
                    </div>

                    {/* Action Buttons at Bottom */}
                    <div className="flex gap-2">
                      {isUserOwned(course) ? (
                        // Settings dropdown for user's own courses
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Manage
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-black border-[#535353]">
                            <DropdownMenuItem 
                              onClick={() => router.push(`/course/${getUserCourseId(course)}`)}
                              className="text-white hover:bg-gray-900"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Jump to course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        // Action buttons for other users' courses
                        <>
                          {isUserHasCourse(course) ? (
                            <>
                              <Button
                                onClick={() => peekCourse(course._id!)}
                                disabled={loadingPeek}
                                size="sm"
                                variant="outline"
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                {loadingPeek ? "..." : "Peek"}
                              </Button>
                              <Button
                                onClick={() => router.push(`/course/${getUserCourseId(course)}`)}
                                size="sm"
                                variant="primary"
                                className="flex-1"
                              >
                                <ExternalLink className="mr-1 h-3 w-3" />
                                Open Course
                              </Button>
                              <Button
                                onClick={() => removeCourse(course._id!)}
                                disabled={installing === course._id}
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => peekCourse(course._id!)}
                                disabled={loadingPeek}
                                size="sm"
                                variant="outline"
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                {loadingPeek ? "..." : "Peek"}
                              </Button>
                              <Button
                                onClick={() => getCourse(course._id!)}
                                disabled={installing === course._id}
                                size="sm"
                                variant="primary"
                                className="flex-1"
                              >
                                {installing === course._id ? "Getting..." : "Get Course"}
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4 text-white">No courses found</h2>
              <p className="text-[#919191] mb-6">
                Try adjusting your search criteria or check back later for new courses.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
                variant="outline"
              >
                Previous
              </Button>
              
              <span className="text-white">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Course Peek Dialog */}
      <Dialog open={peekDialogOpen} onOpenChange={setPeekDialogOpen}>
        <DialogContent className="bg-black border-[#535353] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Course Preview
            </DialogTitle>
          </DialogHeader>
          
          {peekingCourse && (
            <div className="space-y-6">
              {/* Course Title and Info */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-white">
                  {peekingCourse.title}
                </h2>
                <p className="text-[#919191] leading-relaxed">
                  {peekingCourse.description || peekingCourse.topic}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-[#919191]">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{peekingCourse.author_name || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(peekingCourse.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                    {peekingCourse.language}
                  </span>
                  <span className="text-[#919191]">
                    {peekingCourse.chapters?.length || 0} chapters
                  </span>
                </div>
              </div>

              {/* Course Chapters */}
              {peekingCourse.chapters && peekingCourse.chapters.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Course Outline</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {peekingCourse.chapters.map((chapter: any, index: number) => (
                      <div 
                        key={index}
                        className="p-3 border border-[#535353] rounded-lg bg-gray-900"
                      >
                        <h4 className="font-medium text-white mb-1">
                          Chapter {index + 1}: {chapter.n || chapter.title || 'Untitled Chapter'}
                        </h4>
                        {(chapter.d || chapter.description) && (
                          <p className="text-sm text-[#919191] line-clamp-2">
                            {chapter.d || chapter.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-[#919191] pt-4 border-t border-[#535353]">
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{peekingCourse.install_count || 0} installs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{peekingCourse.like_count || 0} likes</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setPeekDialogOpen(false);
                    getCourse(peekingCourse._id!);
                  }}
                  disabled={installing === peekingCourse._id}
                  variant="primary"
                  className="flex-1"
                >
                  {installing === peekingCourse._id ? "Getting..." : "Get Course"}
                </Button>
                <Button
                  onClick={() => setPeekDialogOpen(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
