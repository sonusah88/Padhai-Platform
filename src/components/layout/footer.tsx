import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const year = new Date().getFullYear();

  const productLinks = [
    { label: tNav('courses'), href: '/courses' },
    { label: tNav('liveClasses'), href: '/live' },
    { label: tNav('competitions'), href: '/competitions' },
    { label: tNav('practice'), href: '/practice' },
    { label: tNav('aiLearning'), href: '/ai-tutor' },
    { label: tNav('resources'), href: '/resources' },
  ];

  const companyLinks = [
    { label: tNav('about'), href: '/about' },
    { label: tNav('forParents'), href: '/parents' },
    { label: tNav('forSchools'), href: '/schools' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Scholarships', href: '/scholarships' },
  ];

  const supportLinks = [
    { label: t('help'), href: '/help' },
    { label: t('contact'), href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ];

  const legalLinks = [
    { label: t('privacy'), href: '/privacy' },
    { label: t('terms'), href: '/terms' },
  ];

  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background-secondary))]">
      <div className="container-narrow py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white font-bold text-lg">
                प
              </div>
              <span className="text-xl font-bold font-[var(--font-heading)] text-[hsl(var(--foreground))]">
                Padhai
              </span>
            </Link>
            <p className="text-sm text-[hsl(var(--foreground-secondary))] leading-relaxed max-w-xs">
              Making quality education accessible to students across Nepal — from Kathmandu to Karnali.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">{t('product')}</h3>
            <ul className="space-y-2.5">
              {productLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">{t('company')}</h3>
            <ul className="space-y-2.5">
              {companyLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">{t('support')}</h3>
            <ul className="space-y-2.5">
              {supportLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4 mt-8">{t('legal')}</h3>
            <ul className="space-y-2.5">
              {legalLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[hsl(var(--foreground-secondary))] hover:text-[hsl(var(--foreground))] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[hsl(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[hsl(var(--foreground-tertiary))]">
            © {year} Padhai. Making quality education accessible across Nepal.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-[hsl(var(--foreground-tertiary))]">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}
