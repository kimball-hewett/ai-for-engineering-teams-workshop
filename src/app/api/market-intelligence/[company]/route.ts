/**
 * Market Intelligence API Route
 *
 * Next.js Route Handler: GET /api/market-intelligence/[company]
 * Returns market intelligence data for a specified company
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketIntelligenceService } from '@/services/marketIntelligenceService';
import { MarketIntelligenceError } from '@/types/market';

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ company: string }> }
) {
  try {
    // Await params to get company name (Next.js 15 pattern)
    const { company } = await params;

    // Decode URL-encoded company name
    const decodedCompany = decodeURIComponent(company);

    // Get client identifier for rate limiting (IP address or user ID)
    const clientId = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'anonymous';

    // Check for cache bypass query parameter
    const searchParams = request.nextUrl.searchParams;
    const bypassCache = searchParams.get('refresh') === 'true';

    // Fetch market intelligence
    const intelligence = await marketIntelligenceService.fetchMarketIntelligence(
      decodedCompany,
      clientId,
      bypassCache
    );

    // Return successful response
    return NextResponse.json(intelligence, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': bypassCache ? 'no-cache' : 'public, max-age=600', // 10 minutes
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });

  } catch (error) {
    // Handle MarketIntelligenceError with appropriate status codes
    if (error instanceof MarketIntelligenceError) {
      return NextResponse.json(
        {
          error: error.message,
          category: error.category,
        },
        {
          status: error.statusCode,
          headers: {
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff',
          },
        }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in market intelligence API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        category: 'api_error',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }
}

// Export route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Always run dynamically to check cache
