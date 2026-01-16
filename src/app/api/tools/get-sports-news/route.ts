import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { newsCache } from '@/lib/news-cache';

export async function POST(request: NextRequest) {
    try {
        const { team, competition, limit } = await request.json();

        const cacheKey = `sports:${team || 'all'}:${competition || 'all'}:${limit || 10}`;
        const cached = newsCache.get(cacheKey);

        if (cached) {
            console.log('[Sports] Returning cached results');
            return NextResponse.json({ ...cached, cached: true });
        }

        // URL de Kirolak EITB (página oficial de deportes de EITB)
        const url = 'https://kirolakeitb.eus/es/';

        console.log('[Sports] Fetching from:', url);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; EITBBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const sports: any[] = [];

        // Selectores específicos para Kirolak EITB
        $('article, .noticia-deportiva, .news-item, .card-deporte, .sport-card, .item-kirol').each((index, element) => {
            if (limit && sports.length >= limit) return false;

            const $article = $(element);

            const title = $article.find('h2, h3, h4, .titulo, .title, .headline').first().text().trim() ||
                $article.find('a').first().attr('title')?.trim() || '';

            const summary = $article.find('p, .sumario, .summary, .descripcion').first().text().trim();
            const link = $article.find('a').first().attr('href');
            const image = $article.find('img').first().attr('src') || $article.find('img').first().attr('data-src');
            const date = $article.find('time, .fecha, .date').first().text().trim() ||
                $article.find('time').first().attr('datetime');

            // Detectar deporte/equipo mencionado
            const titleLower = title.toLowerCase();
            const summaryLower = summary.toLowerCase();
            let sport = 'general';

            if (titleLower.includes('athletic') || titleLower.includes('bilbao')) sport = 'Athletic Club';
            else if (titleLower.includes('real sociedad') || titleLower.includes('realeko')) sport = 'Real Sociedad';
            else if (titleLower.includes('alavés') || titleLower.includes('alaves')) sport = 'Deportivo Alavés';
            else if (titleLower.includes('eibar')) sport = 'SD Eibar';
            else if (titleLower.includes('fútbol') || titleLower.includes('futbol')) sport = 'Fútbol';
            else if (titleLower.includes('baloncesto') || titleLower.includes('basket')) sport = 'Baloncesto';
            else if (titleLower.includes('ciclismo')) sport = 'Ciclismo';

            if (title && title.length > 10) {
                const newsItem = {
                    title,
                    summary: summary || 'Sin resumen disponible',
                    url: link ? (link.startsWith('http') ? link : `https://kirolakeitb.eus${link}`) : null,
                    image: image ? (image.startsWith('http') ? image : `https://kirolakeitb.eus${image}`) : null,
                    publishedAt: date || 'Hoy',
                    sport,
                    category: 'deportes',
                    source: 'Kirolak EITB'
                };

                // Filtrar por equipo si se especifica
                if (team) {
                    const teamLower = team.toLowerCase();
                    if (titleLower.includes(teamLower) || summaryLower.includes(teamLower)) {
                        sports.push(newsItem);
                    }
                } else {
                    sports.push(newsItem);
                }
            }
        });

        // Fallback: selectores generales
        if (sports.length === 0) {
            $('.item, .entry, .post, div[class*="noticia"], div[class*="card"]').each((index, element) => {
                if (limit && sports.length >= limit) return false;

                const $item = $(element);
                const title = $item.find('h1, h2, h3, h4').first().text().trim();
                const summary = $item.find('p').first().text().trim();
                const link = $item.find('a').first().attr('href');

                // Solo incluir si parece deportivo
                const titleLower = title.toLowerCase();
                const isRelevant = titleLower.includes('athletic') ||
                    titleLower.includes('real sociedad') ||
                    titleLower.includes('alavés') ||
                    titleLower.includes('eibar') ||
                    titleLower.includes('partido') ||
                    titleLower.includes('gol') ||
                    titleLower.includes('deporte');

                if (title && title.length > 10 && isRelevant) {
                    sports.push({
                        title,
                        summary: summary || 'Sin resumen disponible',
                        url: link ? (link.startsWith('http') ? link : `https://kirolakeitb.eus${link}`) : null,
                        image: null,
                        publishedAt: 'Hoy',
                        sport: 'general',
                        category: 'deportes',
                        source: 'Kirolak EITB'
                    });
                }
            });
        }

        console.log(`[Sports] Found ${sports.length} sports news`);

        const result = {
            success: true,
            count: sports.length,
            team: team || 'todos',
            competition: competition || 'todas',
            news: sports.slice(0, limit || 10),
            scrapedAt: new Date().toISOString(),
            cached: false,
            source: 'https://kirolakeitb.eus/es/'
        };

        newsCache.set(cacheKey, result);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[Sports] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch sports news',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const team = searchParams.get('team') || undefined;
    const competition = searchParams.get('competition') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    return POST(
        new NextRequest(request.url, {
            method: 'POST',
            body: JSON.stringify({ team, competition, limit }),
        })
    );
}
