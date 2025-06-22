import { NextRequest, NextResponse } from 'next/server';
import { getCoursesCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const courses = await getCoursesCollection();
    
    // Build query for public courses
    const query: any = { is_public: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { language: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.language = category;
    }

    // Sort options
    let sortOption: any = { created_at: -1 };
    switch (sortBy) {
      case 'popular':
        sortOption = { install_count: -1, like_count: -1 };
        break;
      case 'likes':
        sortOption = { like_count: -1 };
        break;
      case 'newest':
        sortOption = { created_at: -1 };
        break;
      case 'oldest':
        sortOption = { created_at: 1 };
        break;
    }

    const skip = (page - 1) * limit;
    
    const [publicCourses, totalCount] = await Promise.all([
      courses
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .toArray(),
      courses.countDocuments(query)
    ]);

    return NextResponse.json({
      courses: publicCourses,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error('Public courses fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
