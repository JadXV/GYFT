import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoursesCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await context.params;

    if (!ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const courses = await getCoursesCollection();
    
    // Get the original course
    const originalCourse = await courses.findOne({
      _id: new ObjectId(courseId),
      is_public: true
    });

    if (!originalCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if user already has this course
    const existingCourse = await courses.findOne({
      user_id: new ObjectId(session.user.id),
      original_course_id: new ObjectId(courseId)
    });

    if (existingCourse) {
      return NextResponse.json({ error: 'Course already installed' }, { status: 400 });
    }

    // Create a copy for the user
    const installedCourse = {
      ...originalCourse,
      _id: new ObjectId(),
      user_id: new ObjectId(session.user.id),
      original_course_id: new ObjectId(courseId),
      original_author: originalCourse.author_name,
      is_public: false, // User's copy is private by default
      install_count: 0,
      likes: [],
      like_count: 0,
      installed_at: new Date()
    };

    // Insert the copy and increment install count
    await Promise.all([
      courses.insertOne(installedCourse),
      courses.updateOne(
        { _id: new ObjectId(courseId) },
        { $inc: { install_count: 1 } }
      )
    ]);

    return NextResponse.json({
      message: 'Course installed successfully',
      courseId: installedCourse._id
    });

  } catch (error) {
    console.error('Course install error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
