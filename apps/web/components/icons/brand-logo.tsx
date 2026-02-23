export function BrandLogo({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) {
    const spokes = [
        { a: 180, r: 43 },
        { a: 155, r: 43 },
        { a: 130, r: 43 },
        { a: 105, r: 43 },
        { a: 80, r: 43 },
        { a: 55, r: 35 },
        { a: 30, r: 27 },
        { a: 5, r: 19 },
        { a: -20, r: 12 }
    ];

    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            {/* Outer Circle */}
            <circle cx="50" cy="50" r="46" />

            {/* Spokes and Connector Lines */}
            {spokes.map((s, i) => {
                const rad = (s.a * Math.PI) / 180;
                const x1 = 50;
                const y1 = 50;
                const x2 = 50 + s.r * Math.cos(rad);
                const y2 = 50 - s.r * Math.sin(rad);

                // Coordinates for the connection to the previous spoke
                let px = x2;
                let py = y2;
                if (i > 0) {
                    const prevRad = (spokes[i - 1].a * Math.PI) / 180;
                    px = 50 + s.r * Math.cos(prevRad);
                    py = 50 - s.r * Math.sin(prevRad);
                }

                return (
                    <g key={i}>
                        {/* Radial Spoke */}
                        <line x1={x1} y1={y1} x2={x2} y2={y2} />
                        {/* Outer connecting step */}
                        {i > 0 && <line x1={x2} y1={y2} x2={px} y2={py} />}
                    </g>
                );
            })}

            {/* The Central Needle Array rotated to ~7:30 position */}
            <g transform="rotate(35 50 50)">
                {/* Masking thick black stroke to cover spokes behind the needle */}
                <path d="M 45 75 L 45 50 A 5 5 0 0 1 55 50 L 55 60" stroke="#000" strokeWidth="6" fill="none" />
                <circle cx="45" cy="75" r="5" fill="#000" stroke="#000" strokeWidth="6" />

                {/* Actual white/current-color outline for the needle */}
                <path d="M 45 75 L 45 50 A 5 5 0 0 1 55 50 L 55 60" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="45" cy="75" r="5" fill="currentColor" stroke="none" />
            </g>
        </svg>
    );
}
