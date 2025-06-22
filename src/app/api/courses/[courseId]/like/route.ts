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
    const userId = new ObjectId(session.user.id);

    // Check if course exists and is public
    const course = await courses.findOne({
      _id: new ObjectId(courseId),
      is_public: true
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if user already liked this course
    const hasLiked = course.likes?.includes(userId.toString());

    let updateOperation: any;
    let message;

    if (hasLiked) {
      // Unlike the course
      updateOperation = {
        $pull: { likes: userId.toString() },
        $inc: { like_count: -1 }
      };
      message = 'Course unliked';
    } else {
      // Like the course
      updateOperation = {
        $addToSet: { likes: userId.toString() },
        $inc: { like_count: 1 }
      };
      message = 'Course liked';
    }

    await courses.updateOne(
      { _id: new ObjectId(courseId) },
      updateOperation
    );

    return NextResponse.json({
      message,
      liked: !hasLiked
    });

  } catch (error) {
    console.error('Course like error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
