import { NextRequest, NextResponse } from 'next/server';
import { getCoursesCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const courses = await getCoursesCollection();
    
    // Get unique languages/categories from public courses
    const categories = await courses.distinct('language', { is_public: true });
    
    // Filter out empty/null values and sort
    const validCategories = categories
      .filter(category => category && category.trim() !== '')
      .sort();

    return NextResponse.json(validCategories);

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
