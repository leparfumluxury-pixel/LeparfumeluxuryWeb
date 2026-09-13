interface FragrancePyramidProps {
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
}

export function FragrancePyramid({ notes }: FragrancePyramidProps) {
  return (
    <div className="py-8">
      <h3 className="font-heading text-2xl text-cream mb-8 text-center">
        Fragrance Notes
      </h3>

      <div className="relative max-w-md mx-auto">
        {/* SVG Pyramid Background */}
        <svg
          viewBox="0 0 400 320"
          className="w-full h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Triangle */}
          <polygon
            points="200,20 130,120 270,120"
            fill="rgba(201, 169, 110, 0.08)"
            stroke="rgba(201, 169, 110, 0.3)"
            strokeWidth="1"
          />
          {/* Middle Trapezoid */}
          <polygon
            points="130,125 270,125 300,220 100,220"
            fill="rgba(201, 169, 110, 0.05)"
            stroke="rgba(201, 169, 110, 0.2)"
            strokeWidth="1"
          />
          {/* Base Trapezoid */}
          <polygon
            points="100,225 300,225 340,310 60,310"
            fill="rgba(201, 169, 110, 0.03)"
            stroke="rgba(201, 169, 110, 0.15)"
            strokeWidth="1"
          />
        </svg>

        {/* Top Notes */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 text-center w-full px-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium">
            Top
          </span>
          <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {notes.top.map((note) => (
              <span
                key={note}
                className="text-xs text-cream-muted"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Middle Notes */}
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 text-center w-full px-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium">
            Heart
          </span>
          <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {notes.middle.map((note) => (
              <span
                key={note}
                className="text-xs text-cream-muted"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Base Notes */}
        <div className="absolute top-[72%] left-1/2 -translate-x-1/2 text-center w-full px-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium">
            Base
          </span>
          <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {notes.base.map((note) => (
              <span
                key={note}
                className="text-xs text-cream-muted"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
