"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, CreditCard, Navigation, Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// Theme Configuration - Easily adjustable
const theme = {
    primary: "blue", // tailwind color name
    secondary: "violet", // tailwind color name
    accent: "emerald", // tailwind color name
};

export default function LandingV2() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 0.8", "end 0.2"]
    });

    const backgroundColor = useTransform(
        scrollYProgress,
        [0, 0.05, 0.95, 1],
        ["#ffffff", "#000000", "#000000", "#ffffff"]
    );

    const navBackgroundColor = useTransform(
        scrollYProgress,
        [0, 0.05, 0.95, 1],
        ["rgba(255, 255, 255, 0.9)", "rgba(0, 0, 0, 0.9)", "rgba(0, 0, 0, 0.9)", "rgba(255, 255, 255, 0.9)"]
    );

    const navTextColor = useTransform(
        scrollYProgress,
        [0, 0.05, 0.95, 1],
        ["#4b5563", "#ffffff", "#ffffff", "#4b5563"]
    );

    const logoFilter = useTransform(
        scrollYProgress,
        [0, 0.05, 0.95, 1],
        ["none", "brightness(0) invert(1)", "brightness(0) invert(1)", "none"]
    );

    // Text Animation Control
    const textRef = useRef(null);
    const { scrollYProgress: textScrollY } = useScroll({
        target: textRef,
        offset: ["start start", "end end"]
    });

    const opacity1 = useTransform(textScrollY, [0, 0.3, 0.5, 1], [0, 1, 1, 1]);
    const blur1 = useTransform(textScrollY, [0, 0.3], ["10px", "0px"]);

    const opacity2 = useTransform(textScrollY, [0.4, 0.7, 0.9, 1], [0, 1, 1, 1]);
    const blur2 = useTransform(textScrollY, [0.4, 0.7], ["10px", "0px"]);

    // Feature Title Animation Control
    const featureTitleRef = useRef(null);
    const { scrollYProgress: featureScrollY } = useScroll({
        target: featureTitleRef,
        offset: ["start start", "end end"]
    });

    // Phase 1: Gathering (0 - 0.25)
    const wordMoveRange = [0, 0.25];
    const wordFadeRange = [0.15, 0.25];
    const finalFadeRange = [0.15, 0.25]; // Text appears as words fade out

    // Phase 2: Hold (0.25 - 0.55) - Strictly static "한곳에서"

    // Phase 3: Split & Reveal (0.55 - 0.9)
    const splitRange = [0.55, 0.9];

    const wordOpacity = useTransform(featureScrollY, wordFadeRange, [1, 0]);
    const finalOpacity = useTransform(featureScrollY, finalFadeRange, [0, 1]);
    const finalScale = useTransform(featureScrollY, finalFadeRange, [0.5, 1]);

    // Split text: "한곳" moves left, "에서" moves right
    // Move enough to clear the logo (approx 200px wide)
    const leftTextX = useTransform(featureScrollY, splitRange, [0, -110]);
    const rightTextX = useTransform(featureScrollY, splitRange, [0, 110]);

    // Reveal Logo in center
    const logoOpacity = useTransform(featureScrollY, splitRange, [0, 1]);
    const logoScale = useTransform(featureScrollY, splitRange, [0.5, 1]);

    // Calculate x-offsets for gathering effect
    // Words: 이곳저곳, 사방팔방, 두루두루, 여기저기, 방방곡곡, 이짝저짝, 구석구석 (7 words)
    // We'll distribute them and move them to 0.

    const scatteredWords = [
        "이곳저곳", "사방팔방", "두루두루", "여기저기", "방방곡곡", "이짝저짝", "구석구석",
        "이곳저곳", "사방팔방", "두루두루", "여기저기", "방방곡곡", "이짝저짝", "구석구석",
        "이곳저곳", "사방팔방", "두루두루", "여기저기", "방방곡곡", "이짝저짝", "구석구석",
        "이곳저곳", "사방팔방", "두루두루", "여기저기", "방방곡곡", "이짝저짝", "구석구석"
    ];

    return (
        <motion.div style={{ backgroundColor }} className={`min-h-screen selection:bg-${theme.primary}-100 selection:text-${theme.primary}-900 font-sans`}>
            {/* Navigation - Updated for Logo Visibility */}
            <motion.nav
                style={{ backgroundColor: navBackgroundColor, borderBottomColor: 'rgba(255,255,255,0.1)' }}
                className="fixed top-0 w-full z-50 backdrop-blur-md border-b transition-all duration-300"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex-shrink-0 flex items-center gap-3">
                            {/* Logo Container */}
                            <div className="relative h-12 w-auto flex items-center justify-center rounded-lg overflow-hidden">
                                <motion.div style={{ filter: logoFilter }}>
                                    <Image
                                        src="/logo-transparent.png"
                                        alt="MY CARDMAPP Logo"
                                        width={140}
                                        height={56}
                                        className="h-10 w-auto object-contain"
                                        priority
                                    />
                                </motion.div>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="#features">
                                <motion.span style={{ color: navTextColor }} className="font-medium text-sm tracking-wide hover:text-blue-600 transition-colors">
                                    기능 소개
                                </motion.span>
                            </Link>
                            <Link href="#about">
                                <motion.span style={{ color: navTextColor }} className="font-medium text-sm tracking-wide hover:text-blue-600 transition-colors">
                                    서비스 안내
                                </motion.span>
                            </Link>
                            <Link
                                href="/map"
                                className={`inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-full text-white bg-${theme.primary}-600 hover:bg-${theme.primary}-700 transition-all shadow-lg hover:shadow-${theme.primary}-500/30`}
                            >
                                지도 바로가기
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section - Enhanced Gradients */}
            <section className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white" />
                    <div className={`absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-${theme.secondary}-100 rounded-full blur-3xl opacity-40 animate-pulse`} />
                    <div className={`absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-${theme.primary}-100 rounded-full blur-3xl opacity-40 animate-pulse`} style={{ animationDelay: '1s' }} />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full bg-${theme.primary}-50 border border-${theme.primary}-100 text-${theme.primary}-700 text-sm font-semibold mb-8 animate-fade-in shadow-sm`}>
                        <span className={`flex h-2 w-2 rounded-full bg-${theme.primary}-600 mr-2 animate-ping`} />
                        새로운 복지카드 지도 서비스
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
                        우리 동네 <span className={`text-${theme.primary}-600`}>복지 혜택</span>을<br />
                        한눈에 확인하세요
                    </h1>

                    <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 mb-12 leading-relaxed font-light">
                        아동급식카드, 문화누리카드, 지역사랑상품권까지.<br className="hidden sm:block" />
                        복잡한 가맹점 찾기, 이제 <span className="font-semibold text-gray-900">MY CARDMAPP</span>에서 쉽고 빠르게 해결하세요.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-5 mb-20">
                        <Link
                            href="/map"
                            className={`inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-${theme.primary}-600 hover:bg-${theme.primary}-700 transition-all shadow-xl hover:shadow-${theme.primary}-500/40 hover:-translate-y-1`}
                        >
                            <MapPin className="w-5 h-5 mr-2" />
                            내 주변 가맹점 찾기
                        </Link>
                        <Link
                            href="#features"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md"
                        >
                            서비스 더 알아보기
                        </Link>
                    </div>
                </div>
            </section>

            {/* Comic Section with Scroll Story */}
            <div ref={containerRef} className="relative">
                {/* Pinned Text Story */}
                <div ref={textRef} className="h-[200vh] relative">
                    <div className="sticky top-0 h-screen flex flex-col items-center justify-center z-10">
                        <motion.h2
                            style={{ opacity: opacity1, filter: blur1 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-4"
                        >
                            이런 경험
                        </motion.h2>
                        <motion.h2
                            style={{ opacity: opacity2, filter: blur2 }}
                            className="text-4xl md:text-6xl font-bold text-white"
                        >
                            있으신가요?
                        </motion.h2>
                        <motion.p
                            style={{ opacity: opacity2 }}
                            className="mt-8 text-xl text-gray-400"
                        >
                            복지카드 사용이 어려웠던 순간들...
                        </motion.p>
                    </div>
                </div>

                {/* Comic Panels */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 relative z-20">
                    <div className="space-y-32">
                        {/* Panel 1: Confusion */}
                        <ComicPanel
                            src="/comic_2d_1_confused_1763728839965.png"
                            alt="Confused User"
                            text="이 카드는 어디서 쓸 수 있는 거지...?"
                            align="left"
                        />

                        {/* Panel 2: Rejection */}
                        <ComicPanel
                            src="/comic_2d_2_rejected_1763728872924.png"
                            alt="Rejected"
                            text="죄송해요, 여기선 그 카드는 안 돼요."
                            align="right"
                            isRejection
                        />

                        {/* Panel 3: Solution */}
                        <ComicPanel
                            src="/comic_2d_3_solution_1763728911490.png"
                            alt="Solution"
                            text="아! MY CARDMAPP으로 찾으면 되는구나!"
                            align="left"
                            isSolution
                        />

                        {/* Panel 4: Happy */}
                        <ComicPanel
                            src="/comic_2d_4_happy_1763728949906.png"
                            alt="Happy"
                            text="맛있게 잘 먹었습니다! 진작 쓸걸!"
                            align="right"
                        />
                    </div>
                </div>
            </div>

            {/* Features Title Animation Section */}
            <div ref={featureTitleRef} className="h-[400vh] relative bg-gray-50">
                <div className="sticky top-0 h-screen flex flex-col items-center justify-center z-10 overflow-hidden">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 relative z-20">
                        모든 복지 카드를
                    </h2>

                    <div className="relative h-20 w-full max-w-5xl flex items-center justify-center">
                        {/* Scattered Words */}
                        {scatteredWords.map((word, idx) => (
                            <ScatteredWord
                                key={idx}
                                word={word}
                                index={idx}
                                total={scatteredWords.length}
                                scrollY={featureScrollY}
                            />
                        ))}

                        {/* Split Text Container */}
                        <div className="absolute z-30 flex items-center justify-center w-full">
                            {/* "한곳" */}
                            <motion.span
                                style={{ opacity: finalOpacity, scale: finalScale, x: leftTextX }}
                                className={`text-4xl md:text-6xl font-extrabold text-${theme.primary}-600 whitespace-nowrap`}
                            >
                                한곳
                            </motion.span>

                            {/* Logo in Center (Absolute) */}
                            <motion.div
                                style={{ opacity: logoOpacity, scale: logoScale }}
                                className="absolute flex items-center justify-center"
                            >
                                <Image
                                    src="/logo-transparent.png"
                                    alt="MY CARDMAPP Logo"
                                    width={200}
                                    height={80}
                                    className="h-12 md:h-20 w-auto object-contain"
                                />
                            </motion.div>

                            {/* "에서" */}
                            <motion.span
                                style={{ opacity: finalOpacity, scale: finalScale, x: rightTextX }}
                                className={`text-4xl md:text-6xl font-extrabold text-${theme.primary}-600 whitespace-nowrap`}
                            >
                                에서
                            </motion.span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <section id="features" className="py-32 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                            다양한 종류의 카드를 지원하여 더 편리한 생활을 돕습니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "아동급식카드",
                                desc: "결식 우려 아동을 위한 급식 지원 카드로 이용 가능한 음식점과 편의점을 찾아보세요.",
                                icon: <CreditCard className="w-8 h-8 text-white" />,
                                bg: "bg-orange-500",
                                lightBg: "bg-orange-50"
                            },
                            {
                                title: "문화누리카드",
                                desc: "문화예술, 여행, 체육 활동을 지원하는 카드로 사용 가능한 문화시설을 확인하세요.",
                                icon: <CreditCard className="w-8 h-8 text-white" />,
                                bg: "bg-violet-500",
                                lightBg: "bg-violet-50"
                            },
                            {
                                title: "지역사랑상품권",
                                desc: "지역 경제 활성화를 위한 상품권으로 이용 가능한 지역 가맹점을 찾아보세요.",
                                icon: <CreditCard className="w-8 h-8 text-white" />,
                                bg: "bg-emerald-500",
                                lightBg: "bg-emerald-50"
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="group bg-white rounded-3xl p-10 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2 relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-32 h-32 ${feature.lightBg} rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500 ease-out`} />
                                <div className={`relative w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 relative">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed relative">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Detailed Features */}
            <section className="py-32 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-6 mt-12">
                                    <div className="bg-blue-50 p-8 rounded-3xl hover:bg-blue-100 transition-colors duration-300">
                                        <Search className="w-10 h-10 text-blue-600 mb-6" />
                                        <h4 className="text-xl font-bold text-gray-900 mb-3">스마트 검색</h4>
                                        <p className="text-gray-600 leading-relaxed">원하는 지역과 업종을 쉽고 빠르게 검색하세요.</p>
                                    </div>
                                    <div className="bg-violet-50 p-8 rounded-3xl hover:bg-violet-100 transition-colors duration-300">
                                        <Navigation className="w-10 h-10 text-violet-600 mb-6" />
                                        <h4 className="text-xl font-bold text-gray-900 mb-3">길찾기 연동</h4>
                                        <p className="text-gray-600 leading-relaxed">현재 위치에서 가장 빠른 경로를 안내합니다.</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-emerald-50 p-8 rounded-3xl hover:bg-emerald-100 transition-colors duration-300">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-6" />
                                        <h4 className="text-xl font-bold text-gray-900 mb-3">정확한 정보</h4>
                                        <p className="text-gray-600 leading-relaxed">실시간으로 업데이트되는 가맹점 정보를 확인하세요.</p>
                                    </div>
                                    <div className="bg-orange-50 p-8 rounded-3xl hover:bg-orange-100 transition-colors duration-300">
                                        <MapPin className="w-10 h-10 text-orange-600 mb-6" />
                                        <h4 className="text-xl font-bold text-gray-900 mb-3">내 주변 찾기</h4>
                                        <p className="text-gray-600 leading-relaxed">위치 기반으로 가까운 가맹점을 바로 보여줍니다.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className={`inline-flex items-center px-4 py-1.5 rounded-full bg-${theme.secondary}-50 border border-${theme.secondary}-100 text-${theme.secondary}-700 text-sm font-semibold mb-6`}>
                                <span className="mr-2">✨</span>
                                더 편리해진 기능
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
                                더 스마트하게,<br />
                                더 편리하게 이용하세요
                            </h2>
                            <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                                복잡한 가맹점 정보, 이제 헤매지 마세요.
                                MY CARDMAPP은 사용자의 위치를 기반으로 가장 가까운 가맹점을 추천하고,
                                상세한 필터링 기능을 통해 원하는 매장을 정확하게 찾아드립니다.
                            </p>
                            <ul className="space-y-5 mb-12">
                                {[
                                    "실시간 위치 기반 가맹점 추천",
                                    "업종별, 카드별 맞춤 필터링",
                                    "상세한 매장 정보 및 영업시간 확인",
                                    "원클릭 길찾기 서비스 연동"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center text-lg text-gray-700">
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-${theme.primary}-100 flex items-center justify-center mr-4`}>
                                            <CheckCircle2 className={`w-4 h-4 text-${theme.primary}-600`} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/map"
                                className={`inline-flex items-center text-${theme.primary}-600 font-bold text-lg hover:text-${theme.primary}-700 transition-colors group`}
                            >
                                지도 서비스 시작하기
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className={`absolute top-0 left-0 w-[500px] h-[500px] bg-${theme.primary}-500 rounded-full blur-[100px] mix-blend-screen opacity-30 animate-pulse`} />
                    <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] bg-${theme.secondary}-500 rounded-full blur-[100px] mix-blend-screen opacity-30 animate-pulse`} style={{ animationDelay: '2s' }} />
                </div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                        지금 바로 시작해보세요
                    </h2>
                    <p className="text-xl text-gray-300 mb-12 font-light">
                        내 주변의 모든 복지 혜택, MY CARDMAPP에서 확인하실 수 있습니다.
                    </p>
                    <Link
                        href="/map"
                        className={`inline-flex items-center justify-center px-10 py-5 text-xl font-bold rounded-full text-${theme.primary}-600 bg-white hover:bg-gray-50 transition-all shadow-2xl hover:shadow-white/20 hover:-translate-y-1`}
                    >
                        무료로 이용하기
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                        <div className="flex items-center mb-6 md:mb-0">
                            <Image
                                src="/logo.png"
                                alt="MY CARDMAPP Logo"
                                width={140}
                                height={56}
                                className="h-9 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                            />
                        </div>
                        <div className="flex space-x-8 text-sm font-medium text-gray-500">
                            <Link href="#" className="hover:text-gray-900 transition-colors">이용약관</Link>
                            <Link href="#" className="hover:text-gray-900 transition-colors">개인정보처리방침</Link>
                            <Link href="#" className="hover:text-gray-900 transition-colors">문의하기</Link>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
                        <p>&copy; {new Date().getFullYear()} MY CARDMAPP. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </motion.div>
    );
}

function ComicPanel({ src, alt, text, align, isRejection, isSolution }: { src: string, alt: string, text: string, align: 'left' | 'right', isRejection?: boolean, isSolution?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ margin: "-20% 0px -20% 0px" }}
            transition={{ duration: 0.8 }}
            className={`flex flex-col md:flex-row items-center gap-8 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}
        >
            <div className="relative w-full md:w-1/2 aspect-square rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className={`relative p-6 rounded-2xl ${isRejection ? 'bg-red-500 text-white' : isSolution ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'} shadow-xl max-w-xs`}
                >
                    <div className={`absolute top-1/2 ${align === 'left' ? '-left-3' : '-right-3'} w-6 h-6 ${isRejection ? 'bg-red-500' : isSolution ? 'bg-blue-500' : 'bg-white'} transform rotate-45 -translate-y-1/2`} />
                    <p className="relative z-10 text-lg font-bold text-center">
                        "{text}"
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}

const ScatteredWord = ({ word, index, total, scrollY }: { word: string, index: number, total: number, scrollY: any }) => {
    // Elliptical distribution with full area coverage
    const angle = (index / total) * 2 * Math.PI - (Math.PI / 2);

    // Distribute words inside the ellipse as well, not just on the border
    // Use deterministic random based on index
    const randomFactor = (Math.abs(Math.sin(index * 7919)) * 0.7) + 0.3; // 0.3 to 1.0

    const radiusX = 400 * randomFactor;
    const radiusY = 180 * randomFactor;

    const initialX = Math.cos(angle) * radiusX;
    const initialY = Math.sin(angle) * radiusY;

    const moveRange = [0, 0.6];
    const fadeRange = [0.5, 0.6];

    // Start center lower (positive Y) to avoid overlapping title
    // This makes the ellipse start lower and the center move upwards to 0
    const startCenterY = 250;

    const x = useTransform(scrollY, moveRange, [initialX, 0]);
    const y = useTransform(scrollY, moveRange, [initialY + startCenterY, 0]);
    const opacity = useTransform(scrollY, fadeRange, [1, 0]);

    return (
        <motion.span
            style={{ x, y, opacity, position: 'absolute' }}
            className="text-xl md:text-3xl font-medium text-gray-400 whitespace-nowrap"
        >
            {word}
        </motion.span>
    );
};
