import { createSignal, createEffect, For, onCleanup } from "solid-js";

interface PatternLockProps {
  size: number;
  onComplete: (pattern: number[]) => void;
  disabled?: boolean;
}

export function PatternLock(props: PatternLockProps) {
  const [selectedDots, setSelectedDots] = createSignal<number[]>([]);
  const [isDrawing, setIsDrawing] = createSignal(false);
  const [lines, setLines] = createSignal<Array<{ from: { x: number; y: number }; to: { x: number; y: number } }>>([]);
  
  let containerRef: HTMLDivElement | undefined;
  let svgRef: SVGSVGElement | undefined;

  const getDotPosition = (index: number) => {
    const row = Math.floor(index / props.size);
    const col = index % props.size;
    const dotSize = 60;
    const spacing = 100;
    return {
      x: col * spacing + dotSize / 2,
      y: row * spacing + dotSize / 2
    };
  };

  const handlePointerDown = (index: number) => {
    if (props.disabled) return;
    setIsDrawing(true);
    setSelectedDots([index]);
    setLines([]);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDrawing() || props.disabled) return;
    
    const rect = containerRef?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if we're over a new dot
    for (let i = 0; i < props.size * props.size; i++) {
      const dotPos = getDotPosition(i);
      const distance = Math.sqrt((x - dotPos.x) ** 2 + (y - dotPos.y) ** 2);
      
      if (distance < 30 && !selectedDots().includes(i)) {
        const current = selectedDots();
        setSelectedDots([...current, i]);
        
        // Add line from previous dot to current dot
        if (current.length > 0) {
          const prevPos = getDotPosition(current[current.length - 1]);
          setLines(prev => [...prev, { from: prevPos, to: dotPos }]);
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing() || props.disabled) return;
    setIsDrawing(false);
    
    if (selectedDots().length > 0) {
      props.onComplete(selectedDots());
    }
    
    // Reset after a short delay
    setTimeout(() => {
      setSelectedDots([]);
      setLines([]);
    }, 500);
  };

  createEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => handlePointerMove(e);
    const handleGlobalPointerUp = () => handlePointerUp();

    if (isDrawing()) {
      document.addEventListener('pointermove', handleGlobalPointerMove);
      document.addEventListener('pointerup', handleGlobalPointerUp);
    }

    onCleanup(() => {
      document.removeEventListener('pointermove', handleGlobalPointerMove);
      document.removeEventListener('pointerup', handleGlobalPointerUp);
    });
  });

  return (
    <div
      ref={containerRef}
      class="relative w-full h-full select-none touch-none"
      style={{ "min-height": `${props.size * 100}px`, "min-width": `${props.size * 100}px` }}
    >
      {/* SVG for lines */}
      <svg
        ref={svgRef}
        class="absolute inset-0 w-full h-full pointer-events-none"
        style={{ "z-index": 1 }}
      >
        <For each={lines()}>
          {(line) => (
            <line
              x1={line.from.x}
              y1={line.from.y}
              x2={line.to.x}
              y2={line.to.y}
              stroke="rgb(59 130 246)"
              stroke-width="4"
              stroke-linecap="round"
            />
          )}
        </For>
      </svg>

      {/* Pattern dots */}
      <For each={Array.from({ length: props.size * props.size }, (_, i) => i)}>
        {(index) => {
          const position = getDotPosition(index);
          const isSelected = () => selectedDots().includes(index);
          
          return (
            <div
              class={`absolute rounded-full transition-all duration-200 cursor-pointer ${
                isSelected() 
                  ? "bg-blue-500 scale-110" 
                  : "bg-gray-300 hover:bg-gray-400"
              } ${props.disabled ? "cursor-not-allowed opacity-50" : ""}`}
              style={{
                left: `${position.x - 30}px`,
                top: `${position.y - 30}px`,
                width: "60px",
                height: "60px",
                "z-index": 2
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                handlePointerDown(index);
              }}
            >
              <div class="w-full h-full rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                {isSelected() && (
                  <div class="w-4 h-4 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}