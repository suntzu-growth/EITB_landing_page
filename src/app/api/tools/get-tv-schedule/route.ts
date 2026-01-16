import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { newsCache } from '@/lib/news-cache';

export async function POST(request: NextRequest) {
    try {
        const { channel, date } = await request.json();

        const cacheKey = `tv:${channel || 'all'}:${date || 'today'}`;
        const cached = newsCache.get(cacheKey);

        if (cached) {
            console.log('[TV Schedule] Returning cached results');
            return NextResponse.json({ ...cached, cached: true });
        }

        // URL de la sección de televisión de EITB
        const url = 'https://www.eitb.eus/es/television/';

        console.log('[TV Schedule] Fetching from:', url);

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

        // Selectores para programación de TV
        $('.programa, .program, .tv-show, .emission, article, .card-programa').each((index, element) => {
            const $item = $(element);

            const title = $item.find('h2, h3, h4, .titulo, .title, .program-title').first().text().trim();
            const time = $item.find('.hora, .time, time, .horario').first().text().trim() ||
                $item.find('time').first().attr('datetime');
            const description = $item.find('p, .descripcion, .description, .sumario').first().text().trim();
            const channelName = $item.find('.canal, .channel, .cadena').first().text().trim();
            const image = $item.find('img').first().attr('src') || $item.find('img').first().attr('data-src');
            const link = $item.find('a').first().attr('href');

            // Detectar canal si no está especificado
            let detectedChannel = channelName || channel || 'ETB';
            const titleLower = title.toLowerCase();
            if (titleLower.includes('etb1') || $item.hasClass('etb1')) detectedChannel = 'ETB1';
            else if (titleLower.includes('etb2') || $item.hasClass('etb2')) detectedChannel = 'ETB2';
            else if (titleLower.includes('etb3') || $item.hasClass('etb3')) detectedChannel = 'ETB3';
            else if (titleLower.includes('etb4') || $item.hasClass('etb4')) detectedChannel = 'ETB4';

            if (title && title.length > 3) {
                const programItem = {
                    channel: detectedChannel,
                    program: title,
                    time: time || 'Hora no disponible',
                    description: description || 'Sin descripción',
                    image: image ? (image.startsWith('http') ? image : `https://www.eitb.eus${image}`) : null,
                    url: link ? (link.startsWith('http') ? link : `https://www.eitb.eus${link}`) : null,
                    category: 'television',
                    source: 'EITB TV'
                };

                // Filtrar por canal si se especifica
                if (channel) {
                    const channelLower = channel.toLowerCase();
                    const detectedLower = detectedChannel.toLowerCase();
                    if (detectedLower.includes(channelLower) || titleLower.includes(channelLower)) {
                        schedule.push(programItem);
                    }
                } else {
                    schedule.push(programItem);
                }
            }
        });

        // Fallback usando scheduleData existente si no hay resultados del scraping
        if (schedule.length === 0) {
            console.log('[TV Schedule] No results from scraping, using fallback data');

            // Importar scheduleData como fallback
            const { scheduleData } = await import('@/data/schedule-loader');
            const { ScheduleParser } = await import('@/lib/schedule-parser');

            const parser = new ScheduleParser(scheduleData);
            const results = parser.search(channel || 'television');

            results.slice(0, 20).forEach((item: any) => {
                schedule.push({
                    channel: item.channel || channel || 'ETB',
                    program: item.title || item.name || 'Programa',
                    time: item.time || item.schedule || 'N/A',
                    description: item.description || item.summary || '',
                    image: item.image || null,
                    url: item.url || null,
                    category: 'television',
                    source: 'EITB TV (datos internos)'
                });
            });
        }

        console.log(`[TV Schedule] Found ${schedule.length} programs`);

        const result = {
            success: true,
            channel: channel || 'todos los canales',
            date: date || 'hoy',
            count: schedule.length,
            schedule: schedule.slice(0, 20),
            timestamp: new Date().toISOString(),
            cached: false,
            source: 'https://www.eitb.eus/es/television/'
        };

        newsCache.set(cacheKey, result);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[TV Schedule] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch TV schedule',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const channel = searchParams.get('channel') || undefined;
    const date = searchParams.get('date') || undefined;

    return POST(
        new NextRequest(request.url, {
            method: 'POST',
            body: JSON.stringify({ channel, date }),
        })
    );
}
