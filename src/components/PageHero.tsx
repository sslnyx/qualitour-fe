import Image, { StaticImageData } from 'next/image';
import Container from '@/components/ui/Container';
import { ReactNode } from 'react';

interface PageHeroProps {
    image: StaticImageData | string;
    title: string | ReactNode;
    subtitle?: string;
    badge?: {
        icon: string;
        text: string;
    };
    children?: ReactNode;
    height?: string; // Allow override, default to min-h-[60vh]
}

export default function PageHero({
    image,
    title,
    subtitle,
    badge,
    children,
    height = 'min-h-[60vh]',
}: PageHeroProps) {
    return (
        <section className={`relative ${height} flex items-center justify-center overflow-hidden`}>
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={image}
                    alt={typeof title === 'string' ? title : 'Page Hero'}
                    fill
                    className="object-cover object-center"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=" // Basic blur
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

            {/* Decorative elements */}
            <div className="absolute top-20 right-20 w-96 h-96 bg-[#f7941e]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <Container className="relative z-10 py-20">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    {badge && (
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 mb-8 border border-white/20">
                            <span className="material-icons text-[#f7941e] text-xl">{badge.icon}</span>
                            <span className="text-white font-medium tracking-wide uppercase">
                                {badge.text}
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 drop-shadow-xl leading-tight">
                        {title}
                    </h1>

                    {/* Subtitle */}
                    {subtitle && (
                        <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed font-light max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    )}

                    {/* Children (Buttons, etc) */}
                    {children}
                </div>
            </Container>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce pointer-events-none hidden md:block">
                <span className="material-icons text-3xl">keyboard_arrow_down</span>
            </div>
        </section>
    );
}
