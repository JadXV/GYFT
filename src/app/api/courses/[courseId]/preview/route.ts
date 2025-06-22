import { NextRequest, NextResponse } from 'next/server';
import { getCoursesCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    if (!ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const courses = await getCoursesCollection();
    const course = await courses.findOne({
      _id: new ObjectId(courseId),
      is_public: true // Only allow preview of public courses
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Return course data suitable for preview
    // You can modify this to include/exclude specific fields as needed
    return NextResponse.json({
      _id: course._id,
      title: course.title,
      description: course.description,
      topic: course.topic,
      language: course.language,
      chapters: course.chapters,
      author_name: course.author_name,
      created_at: course.created_at,
      like_count: course.like_count,
      install_count: course.install_count
    });

  } catch (error) {
    console.error('Course preview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
