import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { newsCache } from '@/lib/news-cache';

export async function POST(request: NextRequest) {
    try {
        const { station, date } = await request.json();

        const cacheKey = `radio:${station || 'all'}:${date || 'today'}`;
        const cached = newsCache.get(cacheKey);

        if (cached) {
            console.log('[Radio Schedule] Returning cached results');
            return NextResponse.json({ ...cached, cached: true });
        }

        // URL de Guau (radio de EITB)
        const url = 'https://guau.eus/';

        console.log('[Radio Schedule] Fetching from:', url);

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

        const schedule: any[] = [];

        // Selectores para programación de radio
        $('.programa, .program, .radio-show, .emission, article, .card-programa, .podcast').each((index, element) => {
            const $item = $(element);

            const title = $item.find('h2, h3, h4, .titulo, .title, .program-title').first().text().trim();
            const time = $item.find('.hora, .time, time, .horario').first().text().trim() ||
                $item.find('time').first().attr('datetime');
            const description = $item.find('p, .descripcion, .description').first().text().trim();
            const stationName = $item.find('.emisora, .station, .canal').first().text().trim();
            const host = $item.find('.presentador, .host, .locutor').first().text().trim();
            const image = $item.find('img').first().attr('src') || $item.find('img').first().attr('data-src');
            const link = $item.find('a').first().attr('href');
            const isPodcast = $item.hasClass('podcast') ||
                $item.find('.podcast, .on-demand').length > 0 ||
                title.toLowerCase().includes('podcast');

            // Detectar emisora
            let detectedStation = stationName || station || 'Radio';
            const titleLower = title.toLowerCase();
            const descLower = description.toLowerCase();

            if (titleLower.includes('radio euskadi') || descLower.includes('radio euskadi')) {
                detectedStation = 'Radio Euskadi';
            } else if (titleLower.includes('radio vitoria') || descLower.includes('radio vitoria')) {
                detectedStation = 'Radio Vitoria';
            } else if (titleLower.includes('euskadi irratia')) {
                detectedStation = 'Euskadi Irratia';
            }

            if (title && title.length > 3) {
                const programItem = {
                    station: detectedStation,
                    program: title,
                    time: time || 'Hora no disponible',
                    host: host || '',
                    description: description || 'Sin descripción',
                    image: image ? (image.startsWith('http') ? image : `https://guau.eus${image}`) : null,
                    url: link ? (link.startsWith('http') ? link : `https://guau.eus${link}`) : null,
                    podcast: isPodcast,
                    category: 'radio',
                    source: 'Guau (EITB Radio)'
                };

                // Filtrar por emisora si se especifica
                if (station) {
                    const stationLower = station.toLowerCase();
                    const detectedLower = detectedStation.toLowerCase();
                    if (detectedLower.includes(stationLower) ||
                        titleLower.includes(stationLower) ||
                        descLower.includes(stationLower)) {
                        schedule.push(programItem);
                    }
                } else {
                    schedule.push(programItem);
                }
            }
        });

        // Fallback usando scheduleData existente
        if (schedule.length === 0) {
            console.log('[Radio Schedule] No results from scraping, using fallback data');

            const { scheduleData } = await import('@/data/schedule-loader');
            const { ScheduleParser } = await import('@/lib/schedule-parser');

            const parser = new ScheduleParser(scheduleData);
            const results = parser.search(station || 'radio');

            // Filtrar solo contenido de radio
            const radioResults = results.filter((item: any) => {
                const title = item.title?.toLowerCase() || '';
                const category = item.category?.toLowerCase() || '';
                return title.includes('radio') || category.includes('radio');
            });

            radioResults.slice(0, 20).forEach((item: any) => {
                schedule.push({
                    station: item.station || station || 'Radio Euskadi',
                    program: item.title || item.name || 'Programa',
                    time: item.time || item.schedule || 'N/A',
                    host: item.host || item.presenter || '',
                    description: item.description || item.summary || '',
                    image: item.image || null,
                    url: item.url || null,
                    podcast: item.podcast || false,
                    category: 'radio',
                    source: 'EITB Radio (datos internos)'
                });
            });
        }

        console.log(`[Radio Schedule] Found ${schedule.length} programs`);

        const result = {
            success: true,
            station: station || 'todas las emisoras',
            date: date || 'hoy',
            count: schedule.length,
            schedule: schedule.slice(0, 20),
            timestamp: new Date().toISOString(),
            cached: false,
            source: 'https://guau.eus/'
        };

        newsCache.set(cacheKey, result);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[Radio Schedule] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch radio schedule',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const station = searchParams.get('station') || undefined;
    const date = searchParams.get('date') || undefined;

    return POST(
        new NextRequest(request.url, {
            method: 'POST',
            body: JSON.stringify({ station, date }),
        })
    );
}
