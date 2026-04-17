import { fetchDirectLinkMetadata, isValidLinkUrl, normalizeUrl } from '@/utils/url';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const targetUrl = normalizeUrl(requestUrl.searchParams.get('url') ?? '');

  if (!isValidLinkUrl(targetUrl)) {
    return Response.json({ error: '유효한 URL이 아닙니다.' }, { status: 400 });
  }

  try {
    const metadata = await fetchDirectLinkMetadata(targetUrl, {
      includeUserAgent: true,
    });

    return Response.json(metadata ?? {}, {
      headers: {
        'Cache-Control': 'private, max-age=120',
      },
    });
  } catch {
    return Response.json(
      { error: '메타데이터를 가져오지 못했습니다.' },
      {
        status: 502,
      },
    );
  }
}
