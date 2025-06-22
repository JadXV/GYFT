import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoursesCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, isPublic = false } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate course using our local AI API
    const response = await fetch(`${request.nextUrl.origin}/api/ai/generate-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: topic }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate course');
    }

    const data = await response.json();
    const courseDataStr = data.response || "";
    
    if (!courseDataStr) {
      return NextResponse.json(
        { error: 'Failed to generate course content' },
        { status: 500 }
      );
    }

    let courseData;
    try {
      courseData = JSON.parse(courseDataStr);
    } catch (error) {
      console.error('Failed to parse course data:', error);
      return NextResponse.json(
        { error: 'Invalid course data received' },
        { status: 500 }
      );
    }

    // Store course in database
    const courses = await getCoursesCollection();
    const fullName = `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim();
    const courseDocument = {
      user_id: new ObjectId(session.user.id),
      author_name: fullName || session.user.username || 'Anonymous',
      author_username: session.user.username,
      title: courseData.t || 'Untitled Course',
      description: courseData.d || '',
      language: courseData.l || '',
      chapters: courseData.c || [],
      topic,
      is_public: isPublic,
      install_count: 0,
      likes: [],
      like_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await courses.insertOne(courseDocument);

    return NextResponse.json({
      message: `Course "${courseData.t || 'Untitled'}" generated successfully!`,
      courseId: result.insertedId,
      course: courseDocument
    });

  } catch (error) {
    console.error('Course generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate course. Please try again.' },
      { status: 500 }
    );
  }
}
