'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Video,
  Trophy,
  Brain,
  Code,
  Globe2,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  CheckCircle2,
  Play,
  Zap,
  Target,
  BarChart3,
  MessageCircle,
  GraduationCap,
  Flame,
  Star,
  ChevronRight,
  ChevronDown,
  Monitor,
  Smartphone,
  Shield,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// =============================================================================
// HERO SECTION
// =============================================================================

export function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 decorative" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(var(--primary)/0.04)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[hsl(var(--secondary)/0.04)] rounded-full blur-3xl" />
      </div>

      <div className="container-narrow relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 md:py-24 lg:py-28">
          {/* Left — Copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-xl"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))] bg-[hsl(var(--primary-light))] rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Nepal&apos;s learning platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[hsl(var(--foreground))] leading-[1.1] tracking-tight text-balance"
            >
              {t('headline')}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 text-base sm:text-lg text-[hsl(var(--foreground-secondary))] leading-relaxed max-w-lg"
            >
              {t('subheadline')}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[hsl(var(--primary))] rounded-xl hover:bg-[hsl(var(--primary-hover))] transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {t('cta')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/live"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[hsl(var(--foreground))] bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl hover:bg-[hsl(var(--muted))] transition-all active:scale-[0.98]"
              >
                <Play className="w-4 h-4" />
                {t('ctaSecondary')}
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap gap-6 text-sm text-[hsl(var(--foreground-secondary))]"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[hsl(var(--primary))]" />
                <span><strong className="text-[hsl(var(--foreground))]">2,500+</strong> {t('stats.students')}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[hsl(var(--primary))]" />
                <span><strong className="text-[hsl(var(--foreground))]">120+</strong> {t('stats.courses')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[hsl(var(--primary))]" />
                <span><strong className="text-[hsl(var(--foreground))]">25+</strong> {t('stats.liveClasses')}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Mini dashboard preview for the hero
function DashboardPreview() {
  return (
    <div className="relative">
      {/* Main card */}
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow-xl border border-[hsl(var(--border))] overflow-hidden">
        {/* Header bar */}
        <div className="px-5 py-3.5 border-b border-[hsl(var(--border))] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white text-xs font-bold">A</div>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Good evening, Aarav</p>
              <p className="text-xs text-[hsl(var(--foreground-tertiary))]">Grade 8 · Kathmandu</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--secondary))]">
            <Flame className="w-3.5 h-3.5" />
            12 day streak
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Weekly progress */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[hsl(var(--foreground-secondary))] mb-1">Weekly Goal</p>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">72% complete</p>
            </div>
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="4"
                  strokeDasharray={`${0.72 * 150.8} 150.8`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[hsl(var(--primary))]">72%</span>
            </div>
          </div>

          {/* Tonight's class */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--primary-light))] border border-[hsl(var(--primary)/0.1)]">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
              <Video className="w-5 h-5 text-[hsl(var(--primary))]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[hsl(var(--primary))]">Tonight · 7:00 PM</p>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">Mathematics — Linear Equations</p>
            </div>
            <div className="px-2.5 py-1 text-xs font-medium bg-[hsl(var(--primary))] text-white rounded-full">Join</div>
          </div>

          {/* Subject progress */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-[hsl(var(--foreground-secondary))]">Progress</p>
            {[
              { name: 'Mathematics', pct: 68, trend: '+12%', color: 'hsl(var(--primary))' },
              { name: 'Science', pct: 55, trend: '+8%', color: 'hsl(var(--accent))' },
              { name: 'English', pct: 42, trend: '+5%', color: 'hsl(var(--secondary))' },
            ].map(subject => (
              <div key={subject.name} className="flex items-center gap-3">
                <span className="text-xs text-[hsl(var(--foreground-secondary))] w-20 shrink-0">{subject.name}</span>
                <div className="flex-1 h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${subject.pct}%`, backgroundColor: subject.color }}
                  />
                </div>
                <span className="text-xs font-medium text-[hsl(var(--success))] w-10 text-right">{subject.trend}</span>
              </div>
            ))}
          </div>

          {/* Daily challenge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--secondary-light))] border border-[hsl(var(--secondary)/0.1)]">
            <Zap className="w-5 h-5 text-[hsl(var(--secondary))]" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Today&apos;s Challenge</p>
              <p className="text-xs text-[hsl(var(--foreground-secondary))]">10 questions · 8 min</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[hsl(var(--foreground-tertiary))]" />
          </div>
        </div>
      </div>

      {/* Floating XP badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-4 -left-6 bg-[hsl(var(--card))] rounded-xl shadow-lg border border-[hsl(var(--border))] px-4 py-2.5 flex items-center gap-2"
      >
        <Star className="w-5 h-5 text-[hsl(var(--xp))] fill-[hsl(var(--xp))]" />
        <div>
          <p className="text-xs text-[hsl(var(--foreground-secondary))]">XP Earned</p>
          <p className="text-sm font-bold text-[hsl(var(--foreground))]">+45 today</p>
        </div>
      </motion.div>
    </div>
  );
}

// =============================================================================
// MISSION SECTION
// =============================================================================

export function MissionSection() {
  const t = useTranslations('mission');

  const features = [
    { icon: BookOpen, title: t('curriculum'), desc: t('curriculumDesc'), color: 'primary' },
    { icon: Video, title: t('liveInstruction'), desc: t('liveInstructionDesc'), color: 'secondary' },
    { icon: Target, title: t('practice'), desc: t('practiceDesc'), color: 'accent' },
    { icon: Code, title: t('modernSkills'), desc: t('modernSkillsDesc'), color: 'primary' },
    { icon: Trophy, title: t('competitions'), desc: t('competitionsDesc'), color: 'secondary' },
    { icon: Monitor, title: t('digital'), desc: t('digitalDesc'), color: 'accent' },
  ];

  const colorMap: Record<string, string> = {
    primary: 'bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]',
    secondary: 'bg-[hsl(var(--secondary-light))] text-[hsl(var(--secondary))]',
    accent: 'bg-[hsl(var(--accent-light))] text-[hsl(var(--accent))]',
  };

  return (
    <section className="py-20 md:py-28 bg-[hsl(var(--background-secondary))]">
      <div className="container-narrow">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight"
          >
            {t('title')}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-base text-[hsl(var(--foreground-secondary))] leading-relaxed"
          >
            {t('description')}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group bg-[hsl(var(--card))] rounded-xl p-6 border border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))] transition-all hover:shadow-md"
            >
              <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center mb-4', colorMap[f.color])}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-1.5">{f.title}</h3>
              <p className="text-sm text-[hsl(var(--foreground-secondary))] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// HOW IT WORKS
// =============================================================================

export function HowItWorksSection() {
  const t = useTranslations('howItWorks');

  const steps = [
    { icon: BookOpen, title: t('learn'), desc: t('learnDesc'), num: '01' },
    { icon: Target, title: t('practice'), desc: t('practiceDesc'), num: '02' },
    { icon: Trophy, title: t('compete'), desc: t('competeDesc'), num: '03' },
    { icon: TrendingUp, title: t('improve'), desc: t('improveDesc'), num: '04' },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container-narrow">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight"
          >
            {t('title')}
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, i) => (
            <motion.div key={i} variants={fadeUp} className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(var(--primary-light))] mb-5">
                <step.icon className="w-7 h-7 text-[hsl(var(--primary))]" />
              </div>
              <p className="text-xs font-bold text-[hsl(var(--primary))] mb-2 tracking-widest uppercase">{step.num}</p>
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">{step.title}</h3>
              <p className="text-sm text-[hsl(var(--foreground-secondary))] leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-[hsl(var(--border))]" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// LEARNING PATHWAYS
// =============================================================================

export function PathwaysSection() {
  const t = useTranslations('pathways');

  const pathways = [
    {
      icon: GraduationCap,
      title: t('schoolFoundation'),
      desc: t('schoolFoundationDesc'),
      grades: 'Grade 1–10',
      subjects: ['Mathematics', 'Science', 'English', 'Nepali', 'Social Studies'],
      color: 'primary',
      href: '/courses?pathway=school',
    },
    {
      icon: Target,
      title: t('seePrep'),
      desc: t('seePrepDesc'),
      grades: 'Grade 10',
      subjects: ['Mock Exams', 'Chapter Tests', 'Revision Plans'],
      color: 'secondary',
      href: '/courses?pathway=see',
    },
    {
      icon: BookOpen,
      title: t('plus2'),
      desc: t('plus2Desc'),
      grades: 'Grade 11–12',
      subjects: ['Science', 'Management', 'Humanities'],
      color: 'accent',
      href: '/courses?pathway=plus2',
    },
    {
      icon: Code,
      title: t('futureSkills'),
      desc: t('futureSkillsDesc'),
      grades: 'All levels',
      subjects: ['AI Basics', 'Coding', 'Web Dev', 'Cybersecurity'],
      color: 'primary',
      href: '/courses?pathway=skills',
    },
    {
      icon: Globe2,
      title: t('languageAcademy'),
      desc: t('languageAcademyDesc'),
      grades: 'All levels',
      subjects: ['English Speaking', 'IELTS', 'German'],
      color: 'secondary',
      href: '/courses?pathway=language',
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
    primary: {
      bg: 'bg-[hsl(var(--primary-light))]',
      border: 'border-[hsl(var(--primary)/0.15)] hover:border-[hsl(var(--primary)/0.3)]',
      icon: 'text-[hsl(var(--primary))]',
    },
    secondary: {
      bg: 'bg-[hsl(var(--secondary-light))]',
      border: 'border-[hsl(var(--secondary)/0.15)] hover:border-[hsl(var(--secondary)/0.3)]',
      icon: 'text-[hsl(var(--secondary))]',
    },
    accent: {
      bg: 'bg-[hsl(var(--accent-light))]',
      border: 'border-[hsl(var(--accent)/0.15)] hover:border-[hsl(var(--accent)/0.3)]',
      icon: 'text-[hsl(var(--accent))]',
    },
  };

  return (
    <section className="py-20 md:py-28 bg-[hsl(var(--background-secondary))]">
      <div className="container-narrow">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight"
          >
            {t('title')}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-3 text-base text-[hsl(var(--foreground-secondary))]"
          >
            {t('subtitle')}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {pathways.map((p, i) => {
            const colors = colorMap[p.color];
            return (
              <motion.div key={i} variants={fadeUp}>
                <Link
                  href={p.href}
                  className={cn(
                    'group block bg-[hsl(var(--card))] rounded-xl p-6 border transition-all hover:shadow-md h-full',
                    colors.border
                  )}
                >
                  <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center mb-4', colors.bg)}>
                    <p.icon className={cn('w-5 h-5', colors.icon)} />
                  </div>
                  <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-1">{p.title}</h3>
                  <p className="text-xs text-[hsl(var(--foreground-tertiary))] mb-2">{p.grades}</p>
                  <p className="text-sm text-[hsl(var(--foreground-secondary))] mb-4 leading-relaxed">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.subjects.map(s => (
                      <span
                        key={s}
                        className="px-2 py-0.5 text-xs text-[hsl(var(--foreground-secondary))] bg-[hsl(var(--muted))] rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--primary))] opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// LIVE CLASSES SECTION
// =============================================================================

export function LiveClassesSection() {
  const t = useTranslations('liveClasses');

  const SCHEDULED_LIVE_CLASSES = [
    { subject: 'Mathematics', topic: 'Linear Equations — Solving Systems', teacher: 'Ram Sharma', grade: 'Grade 8', time: '7:00 PM', color: 'primary' },
    { subject: 'Science', topic: 'Chemical Bonding & Reactions', teacher: 'Sujata Adhikari', grade: 'Grade 9', time: '7:00 PM', color: 'accent' },
    { subject: 'English', topic: 'Academic Essay Writing & Grammar', teacher: 'Binod Thapa', grade: 'Grade 10', time: '7:30 PM', color: 'secondary' },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container-narrow">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[hsl(var(--destructive))] bg-[hsl(var(--destructive-light))] rounded-full mb-4">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--destructive))] pulse-dot" />
              LIVE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight">
              {t('title')}
            </h2>
            <p className="mt-4 text-base text-[hsl(var(--foreground-secondary))] leading-relaxed max-w-md">
              {t('subtitle')}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-[hsl(var(--foreground-secondary))]">
              {[
                { icon: Clock, text: 'Every evening 7 PM NPT' },
                { icon: MessageCircle, text: 'Live Q&A and polls' },
                { icon: Play, text: 'Recordings available' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-[hsl(var(--primary))]" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <Link
              href="/live"
              className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-[hsl(var(--primary))] hover:underline"
            >
              {t('schedule')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-3">
            <p className="text-xs font-semibold text-[hsl(var(--foreground-secondary))] uppercase tracking-wider mb-3">{t('tonight')}</p>
            {SCHEDULED_LIVE_CLASSES.map((cls, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))] transition-all hover:shadow-sm"
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                  cls.color === 'primary' ? 'bg-[hsl(var(--primary-light))]' :
                  cls.color === 'accent' ? 'bg-[hsl(var(--accent-light))]' :
                  'bg-[hsl(var(--secondary-light))]'
                )}>
                  <Video className={cn(
                    'w-5 h-5',
                    cls.color === 'primary' ? 'text-[hsl(var(--primary))]' :
                    cls.color === 'accent' ? 'text-[hsl(var(--accent))]' :
                    'text-[hsl(var(--secondary))]'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">{cls.subject} — {cls.topic}</p>
                  <p className="text-xs text-[hsl(var(--foreground-secondary))]">{cls.teacher} · {cls.grade}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-[hsl(var(--foreground))]">{cls.time}</p>
                  <p className="text-xs text-[hsl(var(--foreground-tertiary))]">NPT</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// FUTURE SKILLS
// =============================================================================

export function FutureSkillsSection() {
  const t = useTranslations('futureSkills');

  const skills = [
    {
      icon: Brain,
      title: t('ai'),
      courses: ['AI Basics', 'ChatGPT for Students', 'Gemini Workflows', 'AI Safety'],
      color: 'primary',
    },
    {
      icon: Code,
      title: t('coding'),
      courses: ['HTML & CSS', 'JavaScript', 'Python', 'Web Development'],
      color: 'accent',
    },
    {
      icon: Globe2,
      title: t('english'),
      courses: ['Speaking', 'Grammar', 'Presentation Skills', 'Interview English'],
      color: 'secondary',
    },
    {
      icon: Monitor,
      title: t('digital'),
      courses: ['Google Workspace', 'Canva', 'Note-taking', 'Research Skills'],
      color: 'primary',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[hsl(var(--background-secondary))]">
      <div className="container-narrow">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight"
          >
            {t('title')}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-base text-[hsl(var(--foreground-secondary))]">
            {t('subtitle')}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {skills.map((skill, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="bg-[hsl(var(--card))] rounded-xl p-6 border border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))] transition-all hover:shadow-md"
            >
              <div className={cn(
                'w-11 h-11 rounded-lg flex items-center justify-center mb-4',
                skill.color === 'primary' ? 'bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]' :
                skill.color === 'accent' ? 'bg-[hsl(var(--accent-light))] text-[hsl(var(--accent))]' :
                'bg-[hsl(var(--secondary-light))] text-[hsl(var(--secondary))]'
              )}>
                <skill.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-3">{skill.title}</h3>
              <ul className="space-y-1.5">
                {skill.courses.map(course => (
                  <li key={course} className="flex items-center gap-2 text-sm text-[hsl(var(--foreground-secondary))]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--success))] shrink-0" />
                    {course}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// AI TUTOR PREVIEW
// =============================================================================

export function AITutorSection() {
  const t = useTranslations('aiTutor');

  return (
    <section className="py-20 md:py-28">
      <div className="container-narrow">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Chat preview */}
          <motion.div variants={fadeUp} className="order-2 lg:order-1">
            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-lg overflow-hidden max-w-md mx-auto lg:mx-0">
              {/* Chat header */}
              <div className="px-5 py-3.5 border-b border-[hsl(var(--border))] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Padhai AI</p>
                  <p className="text-xs text-[hsl(var(--success))]">● Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[280px]">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-[hsl(var(--primary))] text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[80%]">
                    <p className="text-sm">I don&apos;t understand how to solve 2x + 5 = 15</p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-[hsl(var(--muted))] px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[80%]">
                    <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">
                      Great question! Let&apos;s solve it step by step. 🎯
                    </p>
                    <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed mt-2">
                      <strong>Hint:</strong> Think of this like a balance. Whatever you do to one side, you must do to the other.
                    </p>
                    <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed mt-2">
                      First step: What can you subtract from both sides to start isolating x?
                    </p>
                  </div>
                </div>

                {/* User follow-up */}
                <div className="flex justify-end">
                  <div className="bg-[hsl(var(--primary))] text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[80%]">
                    <p className="text-sm">Subtract 5?</p>
                  </div>
                </div>

                {/* AI confirmation */}
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-[hsl(var(--muted))] px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[80%]">
                    <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">
                      Exactly! ✅ Now you have 2x = 10. What&apos;s the next step?
                    </p>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="px-5 py-3 border-t border-[hsl(var(--border))]">
                <div className="flex items-center gap-2 bg-[hsl(var(--muted))] rounded-xl px-4 py-2.5">
                  <MessageCircle className="w-4 h-4 text-[hsl(var(--foreground-tertiary))]" />
                  <span className="text-sm text-[hsl(var(--foreground-tertiary))]">{t('askPlaceholder')}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div variants={fadeUp} className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[hsl(var(--accent))] bg-[hsl(var(--accent-light))] rounded-full mb-4">
              <Brain className="w-3.5 h-3.5" />
              AI-Powered
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight">
              {t('title')}
            </h2>
            <p className="mt-4 text-base text-[hsl(var(--foreground-secondary))] leading-relaxed max-w-md">
              {t('subtitle')}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Explains concepts at your level',
                'Gives hints before answers',
                'Creates practice questions',
                'Helps build study plans',
                'Supports English and नेपाली',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[hsl(var(--foreground-secondary))]">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-[hsl(var(--foreground-tertiary))] italic">
              {t('disclaimer')}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// FOR PARENTS
// =============================================================================

export function ParentsSection() {
  return (
    <section className="py-20 md:py-28 bg-[hsl(var(--background-secondary))]">
      <div className="container-narrow">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[hsl(var(--secondary))] bg-[hsl(var(--secondary-light))] rounded-full mb-4">
              <Shield className="w-3.5 h-3.5" />
              For Parents
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight">
              Know how your child is learning
            </h2>
            <p className="mt-4 text-base text-[hsl(var(--foreground-secondary))] leading-relaxed max-w-md">
              Simple, clear dashboards that show you what matters — without complicated charts or confusing numbers.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Weekly learning time and attendance',
                'Test scores and improvement trends',
                'Subjects that need attention',
                'Upcoming live classes and assignments',
                'Achievement celebrations',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[hsl(var(--foreground-secondary))]">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp}>
            {/* Parent dashboard preview card */}
            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-lg p-6 max-w-sm mx-auto lg:mx-0 lg:ml-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--secondary-light))] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[hsl(var(--secondary))]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Sita&apos;s Progress</p>
                  <p className="text-xs text-[hsl(var(--foreground-tertiary))]">This week</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-[hsl(var(--muted))] rounded-lg">
                  <p className="text-xs text-[hsl(var(--foreground-secondary))]">Study Time</p>
                  <p className="text-lg font-bold text-[hsl(var(--foreground))]">8.5h</p>
                  <p className="text-xs text-[hsl(var(--success))]">↑ 2h more</p>
                </div>
                <div className="p-3 bg-[hsl(var(--muted))] rounded-lg">
                  <p className="text-xs text-[hsl(var(--foreground-secondary))]">Attendance</p>
                  <p className="text-lg font-bold text-[hsl(var(--foreground))]">5/5</p>
                  <p className="text-xs text-[hsl(var(--success))]">100%</p>
                </div>
                <div className="p-3 bg-[hsl(var(--muted))] rounded-lg">
                  <p className="text-xs text-[hsl(var(--foreground-secondary))]">Avg. Score</p>
                  <p className="text-lg font-bold text-[hsl(var(--foreground))]">78%</p>
                  <p className="text-xs text-[hsl(var(--success))]">↑ 5%</p>
                </div>
                <div className="p-3 bg-[hsl(var(--muted))] rounded-lg">
                  <p className="text-xs text-[hsl(var(--foreground-secondary))]">Streak</p>
                  <p className="text-lg font-bold text-[hsl(var(--foreground))]">12 days</p>
                  <p className="text-xs text-[hsl(var(--secondary))]">🔥</p>
                </div>
              </div>

              <div className="p-3 bg-[hsl(var(--warning-light))] rounded-lg border border-[hsl(var(--warning)/0.15)]">
                <p className="text-xs font-medium text-[hsl(var(--warning))] mb-1">Needs attention</p>
                <p className="text-sm text-[hsl(var(--foreground))]">Fractions — Score dropped from 75% to 62%</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// FAQ
// =============================================================================

export function FAQSection() {
  const t = useTranslations('faq');

  const faqs = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
    { q: t('q6'), a: t('a6') },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container-narrow max-w-3xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight text-center mb-10"
          >
            {t('title')}
          </motion.h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                variants={fadeUp}
                className="group bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors list-none">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-[hsl(var(--foreground-tertiary))] shrink-0 ml-4 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-4">
                  <p className="text-sm text-[hsl(var(--foreground-secondary))] leading-relaxed">{faq.a}</p>
                </div>
              </motion.details>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// =============================================================================
// FINAL CTA
// =============================================================================

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-[hsl(var(--primary))]">
      <div className="container-narrow text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight"
          >
            Start learning today
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-base text-white/80 max-w-md mx-auto"
          >
            From textbook basics to future-ready skills. Free to start — no credit card required.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-[hsl(var(--primary))] bg-white rounded-xl hover:bg-white/90 transition-all shadow-md active:scale-[0.98]"
            >
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/live"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <Play className="w-4 h-4" />
              Watch a live class
            </Link>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/60"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Free core education
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              Works on any phone
            </div>
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              Low-bandwidth friendly
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
