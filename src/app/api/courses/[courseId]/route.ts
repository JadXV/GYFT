import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoursesCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = params;

    if (!ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const courses = await getCoursesCollection();
    const course = await courses.findOne({
      _id: new ObjectId(courseId),
      user_id: new ObjectId(session.user.id)
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course);

  } catch (error) {
    console.error('Course fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = params;
    const { is_public } = await request.json();

    if (!ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const courses = await getCoursesCollection();

    // Check if course exists and belongs to user
    const course = await courses.findOne({
      _id: new ObjectId(courseId),
      user_id: new ObjectId(session.user.id)
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
    }

    // Update course visibility
    const updateData: any = { is_public };
    
    // If making public, add author information
    if (is_public) {
      updateData.author_name = session.user.name;
      updateData.author_username = session.user.email; // Using email as username for now
      updateData.install_count = updateData.install_count || 0;
      updateData.like_count = updateData.like_count || 0;
      updateData.likes = updateData.likes || [];
    }

    await courses.updateOne(
      { _id: new ObjectId(courseId) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = params;

    if (!ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const courses = await getCoursesCollection();

    // Check if course exists and belongs to user
    const course = await courses.findOne({
      _id: new ObjectId(courseId),
      user_id: new ObjectId(session.user.id)
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
    }

    // Delete the course
    await courses.deleteOne({ _id: new ObjectId(courseId) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
