// src/pages/Home.jsx - Aviation Materials Excellence

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Ruler, Gem, Globe, LineChart, BarChart3, FileJson } from "lucide-react";
import airplaneHero from "../src/assets/airplane_hero.png";
import materialsBg from "../src/assets/materials_bg.png";
import engineDetail from "../src/assets/engine_detail.png";
import planerCheckerImg from "../src/assets/planer_checker.png";
import prismImg from "../src/assets/prism.png";
import orbitImg from "../src/assets/Orbit.png";
import analysisImg from "../src/assets/Analysis.png";
import mainChartImg from "../src/assets/Main Chart.png";
import pdfJsonImg from "../src/assets/PDF to JSON.png";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroPlaneRef = useRef(null);
  const heroContentRef = useRef(null);
  const floatingCardsRef = useRef([]);
  const statsRef = useRef([]);
  const [activeCard, setActiveCard] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Hero airplane flies in from left with 4 second delay
    gsap.fromTo(heroPlaneRef.current,
      { x: -1000, opacity: 0 },
      { x: 0, opacity: 1, duration: 2, delay: 4, ease: "power3.out" }
    );

    // Continuous floating animation for plane (starts after fly-in)
    gsap.to(heroPlaneRef.current, {
      y: -20,
      duration: 3,
      delay: 6, // Start after fly-in completes (4s delay + 2s animation)
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    // Hero content fade in with 4 second delay
    gsap.fromTo(heroContentRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, delay: 4.5, ease: "power2.out" }
    );

    // Floating cards animation
    floatingCardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.fromTo(card,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=100",
              toggleActions: "play none none reverse",
            },
            duration: 1,
            delay: index * 0.2,
            ease: "power3.out",
          }
        );
      }
    });
  }, []);

  const modulePages = [
    {
      name: "Planer Checker",
      desc: "Aircraft planer flatness inspection and quality control system",
      detailedDesc: "Advanced inspection tool for verifying aircraft surface flatness and material integrity. Features real-time measurements, automated reporting, and compliance verification with aerospace standards.",
      icon: <Ruler size={48} />,
      textColor: "text-blue-500",
      gradient: "from-blue-500 to-blue-700",
      route: "/data2",
      image: planerCheckerImg
    },
    {
      name: "Prism",
      desc: "Material analysis and data visualization dashboard",
      detailedDesc: "Comprehensive prism-based analytics for aerospace materials. Provides multi-dimensional data visualization, material composition analysis, and trend forecasting for inventory management.",
      icon: <Gem size={48} />,
      textColor: "text-orange-500",
      gradient: "from-orange-500 to-amber-600",
      route: "/Module2Page1",
      image: prismImg
    },
    {
      name: "Orbit",
      desc: "Circular motion tracking and orbital material distribution",
      detailedDesc: "Track and manage material flow across your aerospace supply chain. Visualize distribution patterns, monitor inventory orbits, and optimize material allocation with real-time tracking.",
      icon: <Globe size={48} />,
      textColor: "text-purple-500",
      gradient: "from-purple-500 to-purple-700",
      route: "/Module3Page1",
      image: orbitImg
    },
    {
      name: "Analysis",
      desc: "Comprehensive aerospace materials analytics and reporting",
      detailedDesc: "Deep-dive analytics platform for aerospace materials performance. Generate custom reports, perform statistical analysis, and gain insights into material efficiency and cost optimization.",
      icon: <LineChart size={48} />,
      textColor: "text-gray-500",
      gradient: "from-gray-500 to-gray-600",
      route: "/Analysis1page",
      image: analysisImg
    },
    {
      name: "Main Chart",
      desc: "Primary interactive aerospace data visualization dashboard",
      detailedDesc: "Central hub for all critical aerospace data. Features high-performance interactive charts, real-time data streaming, and advanced filtering options for comprehensive material analysis.",
      icon: <BarChart3 size={48} />,
      textColor: "text-teal-400",
      gradient: "from-teal-400 to-cyan-500",
      route: "/data",
      image: mainChartImg
    },
    {
      name: "PDF to JSON",
      desc: "Convert technical documents to structured data format",
      detailedDesc: "Intelligent document converter that transforms PDF specifications into JSON format. Extract technical data, part numbers, and specifications automatically for easy integration.",
      icon: <FileJson size={48} />,
      textColor: "text-white",
      gradient: "from-gray-600 to-black",
      route: "/pdf-to-json",
      image: pdfJsonImg
    },
  ];

  const handleCardClick = (module) => {
    setSelectedModule(module);
  };

  const handleViewPage = () => {
    if (selectedModule) {
      navigate(selectedModule.route);
      setSelectedModule(null);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-background via-background to-accent/5 text-foreground overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(30deg,transparent_12%,rgba(99,102,241,0.05)_12.5%,rgba(99,102,241,0.05)_37.5%,transparent_37.5%)] bg-[length:50px_50px]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 pt-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={materialsBg}
            alt="Aerospace Materials"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div ref={heroContentRef} className="space-y-8">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm">
              <span className="text-primary font-semibold text-sm">✈️ Aviation Excellence Since 1995</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              Premium
              <span className="block bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Aerospace Materials
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl">
              Supplying aviation-grade materials for aircraft manufacturing, maintenance, and innovation.
              Trusted by leading aerospace companies worldwide.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="group px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/50">
                Explore Materials
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button className="px-8 py-4 bg-card border-2 border-primary/20 hover:border-primary/50 text-foreground rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                Contact Sales
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Materials</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Quality Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>

          {/* Right - Animated Airplane */}
          <div className="relative h-[500px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <img
              ref={heroPlaneRef}
              src={airplaneHero}
              alt="Aircraft"
              className="relative w-full max-w-[600px] drop-shadow-2xl"
            />

            {/* Floating particles */}
            <div className="absolute top-10 left-10 w-3 h-3 bg-primary rounded-full animate-ping"></div>
            <div className="absolute bottom-20 right-10 w-2 h-2 bg-purple-500 rounded-full animate-ping animation-delay-100"></div>
            <div className="absolute top-1/3 right-20 w-4 h-4 bg-blue-500 rounded-full animate-ping animation-delay-200"></div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-2 bg-primary rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Module Pages Section */}
      <section className="relative py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-primary">Modules</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access all aviation materials modules and tools from here
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulePages.map((module, index) => (
              <div
                key={index}
                ref={(el) => (floatingCardsRef.current[index] = el)}
                onClick={() => handleCardClick(module)}
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
                className={`group relative p-6 bg-card/50 backdrop-blur-sm border border-border rounded-2xl transition-all duration-500 cursor-pointer h-full flex flex-col ${activeCard === index ? "scale-105 shadow-2xl shadow-primary/20" : "hover:scale-105"
                  }`}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>

                <div className="relative z-10 flex-1 flex flex-col">
                  <div className={`mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 ${module.textColor}`}>
                    {module.icon}
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 transition-colors bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent`}>
                    {module.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {module.desc}
                  </p>
                  <div className={`mt-4 flex items-center bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <span className="text-sm font-semibold">Learn More</span>
                    <span className="ml-2 transform group-hover:translate-x-2 transition-transform text-foreground">→</span>
                  </div>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module Info Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn" onClick={() => setSelectedModule(null)}>
          <div className="relative max-w-6xl w-full bg-card/95 backdrop-blur-xl border-2 border-primary/30 rounded-3xl overflow-hidden animate-slide-down" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setSelectedModule(null)}
              className="absolute top-6 right-6 z-10 w-10 h-10 bg-background/80 hover:bg-destructive/80 text-foreground hover:text-destructive-foreground rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <span className="text-2xl">×</span>
            </button>

            <div className="grid md:grid-cols-[2.5fr_1fr] min-h-[500px]">
              {/* Left - Image */}
              <div className="relative h-64 md:h-full bg-black/50">
                <img
                  src={selectedModule.image}
                  alt={selectedModule.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Right - Info */}
              <div className="p-8 space-y-6 flex flex-col justify-center">
                <div className="flex items-center gap-4">
                  <span className={`${selectedModule.textColor}`}>{selectedModule.icon}</span>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground">{selectedModule.name}</h3>
                    <p className="text-muted-foreground">{selectedModule.desc}</p>
                  </div>
                </div>

                <div className="h-px bg-border"></div>

                <div>
                  <h4 className={`text-xl font-semibold mb-3 bg-gradient-to-r ${selectedModule.gradient} bg-clip-text text-transparent`}>About this Module</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedModule.detailedDesc}
                  </p>
                </div>

                <div className="flex gap-4 pt-4 mt-auto">
                  <button
                    onClick={handleViewPage}
                    className={`flex-1 px-6 py-4 bg-gradient-to-r ${selectedModule.gradient} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/50 border-0`}
                  >
                    View Page →
                  </button>
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="px-6 py-4 bg-card border-2 border-border hover:border-primary/50 text-foreground rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section with Engine Detail */}
      <section className="relative py-24 px-6 md:px-12 lg:px-24 bg-card/30">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[500px] rounded-3xl overflow-hidden group">
            <img
              src={engineDetail}
              alt="Aircraft Engine"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>

            {/* Floating info badges */}
            <div className="absolute top-6 left-6 px-4 py-2 bg-primary/90 backdrop-blur-md rounded-lg">
              <span className="text-primary-foreground font-semibold">Premium Grade</span>
            </div>
            <div className="absolute bottom-6 right-6 px-4 py-2 bg-card/90 backdrop-blur-md rounded-lg">
              <span className="text-foreground font-semibold">Certified Quality</span>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Why Choose <span className="text-primary">AeroZone?</span>
            </h2>

            <div className="space-y-4">
              {[
                { title: "Certified Quality", desc: "All materials meet international aerospace standards and certifications" },
                { title: "Fast Delivery", desc: "Global logistics network ensuring timely delivery to your facility" },
                { title: "Expert Support", desc: "Technical consultation from aerospace material specialists" },
                { title: "Competitive Pricing", desc: "Best value without compromising on quality or reliability" },
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-accent/20 transition-colors cursor-pointer group">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <span className="text-2xl group-hover:scale-110 transition-transform">✓</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">{feature.title}</h4>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 rounded-3xl border border-primary/20 backdrop-blur-sm overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 animate-pulse-slow"></div>

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Take Flight?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Partner with AeroZone for premium aerospace materials that meet your exact specifications
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-6">
                <button className="px-10 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary/50">
                  Request a Quote
                </button>
                <button className="px-10 py-5 bg-card border-2 border-primary/30 hover:border-primary text-foreground rounded-xl font-bold text-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm">
                  Download Catalog
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
