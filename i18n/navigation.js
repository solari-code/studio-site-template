import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware replacements for Next's navigation APIs.
// Use these instead of `next/link` and `next/navigation` for internal links,
// so the current language prefix is added automatically.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
