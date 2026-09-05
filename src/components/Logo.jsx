import React from 'react';

const Logo = ({ 
    className = "", 
    size = "md", 
    showText = true, 
    iconOnly = false,
    lightText = true 
}) => {
    // Size maps
    const iconSizeMap = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-14 h-14",
        xl: "w-20 h-20"
    };

    const textSizeMap = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-3xl",
        xl: "text-5xl"
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* SVG Emblem */}
            <div className={`relative flex items-center justify-center shrink-0 ${iconSizeMap[size] || size}`}>
                <svg viewBox="0 0 420 420" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="logoNavyBranch" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0B2F52"/>
                            <stop offset="100%" stopColor="#174878"/>
                        </linearGradient>
                        <linearGradient id="logoLeafGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8AC239"/>
                            <stop offset="100%" stopColor="#6DA326"/>
                        </linearGradient>
                    </defs>

                    {/* Circular Navy Branch */}
                    <path d="M 190,340 
                             C 120,340 60,280 60,190 
                             C 60,100 120,40 200,40 
                             C 250,40 290,65 320,100
                             C 270,65 220,55 170,75
                             C 120,95 95,140 100,195
                             C 105,240 140,285 190,295 Z" 
                          fill="url(#logoNavyBranch)" />

                    {/* Center Branch */}
                    <path d="M 105,190 C 120,150 145,115 180,90 C 165,120 155,150 150,185 C 140,165 125,175 105,190 Z" 
                          fill="url(#logoNavyBranch)" />

                    {/* Top Branch */}
                    <path d="M 200,40 C 250,60 310,100 350,150 C 310,115 260,85 215,70 Z" 
                          fill="url(#logoNavyBranch)" />

                    {/* Circuit Lines inside Trunk */}
                    <path d="M 80,160 Q 90,190 105,220" stroke="#3A82B8" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
                    <circle cx="80" cy="160" r="4" fill="#60A5FA" />
                    <circle cx="105" cy="220" r="4" fill="#60A5FA" />

                    <path d="M 95,120 Q 110,140 120,170" stroke="#3A82B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                    <circle cx="95" cy="120" r="3.5" fill="#60A5FA" />

                    <path d="M 120,240 Q 145,270 170,285" stroke="#3A82B8" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
                    <circle cx="120" cy="240" r="4" fill="#60A5FA" />
                    <circle cx="170" cy="285" r="4" fill="#60A5FA" />

                    {/* Organic Green Leaves */}
                    <path d="M 315,50 C 315,25 345,25 360,35 C 360,60 330,60 315,50 Z" fill="url(#logoLeafGreen)" />
                    <path d="M 330,115 C 330,90 365,90 375,105 C 375,130 340,130 330,115 Z" fill="url(#logoLeafGreen)" />
                    <path d="M 330,145 C 340,125 370,135 375,150 C 360,165 330,160 330,145 Z" fill="url(#logoLeafGreen)" />
                    <path d="M 200,130 C 190,110 220,105 235,120 C 235,140 210,145 200,130 Z" fill="url(#logoLeafGreen)" />
                    <path d="M 160,225 C 150,205 185,200 200,215 C 195,235 170,240 160,225 Z" fill="url(#logoLeafGreen)" />
                </svg>
            </div>

            {/* Typography */}
            {showText && !iconOnly && (
                <div className="flex flex-col leading-none">
                    <div className={`font-extrabold tracking-tight flex items-center ${textSizeMap[size] || 'text-2xl'}`}>
                        <span className={lightText ? "text-white" : "text-navy-950"}>PHY</span>
                        <span className="text-neon-green">TERA</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Logo;
