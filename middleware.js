import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Next references file-based metadata images (opengraph-image.jsx etc.) with the locale
// segment in the URL, e.g. /en/starter/opengraph-image. Serve those as they are instead of
// redirecting the default language to the unprefixed path.
const isMetadataImage = (pathname) =>
    /\/(opengraph|twitter)-image/.test(pathname) &&
    routing.locales.some((locale) => pathname.startsWith(`/${locale}/`));

export default function middleware(request) {
    if (isMetadataImage(request.nextUrl.pathname)) return NextResponse.next();
    return intlMiddleware(request);
}

export const config = {
    // Run on all paths except Next internals, API routes and files with an extension (images, fonts, ...).
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
