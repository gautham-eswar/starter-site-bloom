import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface WordNode {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  connections: string[];
  category: 'skill' | 'experience' | 'achievement' | 'education';
}

const SemanticVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Define our word nodes (in a real app, this could come from an API)
  const wordNodes: WordNode[] = [
    { id: 'n1', text: 'Leadership', x: 30, y: 40, size: 1.2, connections: ['n2', 'n4', 'n7'], category: 'skill' },
    { id: 'n2', text: 'Project Management', x: 60, y: 20, size: 1.3, connections: ['n1', 'n3'], category: 'skill' },
    { id: 'n3', text: 'Team Building', x: 70, y: 50, size: 1.1, connections: ['n2', 'n5'], category: 'skill' },
    { id: 'n4', text: 'Strategic Planning', x: 40, y: 70, size: 1.25, connections: ['n1', 'n6'], category: 'skill' },
    { id: 'n5', text: 'Budget Optimization', x: 90, y: 30, size: 1, connections: ['n3', 'n8'], category: 'experience' },
    { id: 'n6', text: 'Increased Revenue', x: 20, y: 60, size: 1.15, connections: ['n4', 'n9'], category: 'achievement' },
    { id: 'n7', text: 'Cross-functional Teams', x: 50, y: 10, size: 1.1, connections: ['n1', 'n10'], category: 'experience' },
    { id: 'n8', text: 'MBA', x: 80, y: 80, size: 1.05, connections: ['n5'], category: 'education' },
    { id: 'n9', text: 'Cost Reduction', x: 15, y: 25, size: 1, connections: ['n6'], category: 'achievement' },
    { id: 'n10', text: 'Agile Methodology', x: 65, y: 65, size: 1.1, connections: ['n7'], category: 'skill' },
  ];

  useEffect(() => {
    // Animation loop for subtle movements
    let animationFrameId: number;
    let time = 0;
    
    const animate = () => {
      time += 0.002;
      
      // Update positions with subtle movement
      const nodeElements = document.querySelectorAll('.word-node');
      nodeElements.forEach((node, i) => {
        if (node.id !== activeNodeId) {
          // Calculate subtle movement using sine waves with different frequencies
          const originalX = wordNodes[i]?.x || 50;
          const originalY = wordNodes[i]?.y || 50;
          
          const newX = originalX + Math.sin(time + i * 0.5) * 0.5;
          const newY = originalY + Math.cos(time + i * 0.7) * 0.5;
          
          // Apply the new position
          (node as HTMLElement).style.left = `${newX}%`;
          (node as HTMLElement).style.top = `${newY}%`;
        }
      });
      
      // Update line positions to match the nodes
      const lineElements = document.querySelectorAll('.connection-line');
      lineElements.forEach((line) => {
        const sourceId = line.getAttribute('data-source');
        const targetId = line.getAttribute('data-target');
        
        const sourceElement = document.getElementById(sourceId || '');
        const targetElement = document.getElementById(targetId || '');
        
        if (sourceElement && targetElement) {
          const sourceRect = sourceElement.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          
          if (canvasRef.current) {
            const canvasRect = canvasRef.current.getBoundingClientRect();
            
            // Calculate positions relative to the canvas
            const sourceX = (sourceRect.left + sourceRect.width / 2) - canvasRect.left;
            const sourceY = (sourceRect.top + sourceRect.height / 2) - canvasRect.top;
            const targetX = (targetRect.left + targetRect.width / 2) - canvasRect.left;
            const targetY = (targetRect.top + targetRect.height / 2) - canvasRect.top;
            
            // Set the line coordinates
            (line as SVGLineElement).setAttribute('x1', sourceX.toString());
            (line as SVGLineElement).setAttribute('y1', sourceY.toString());
            (line as SVGLineElement).setAttribute('x2', targetX.toString());
            (line as SVGLineElement).setAttribute('y2', targetY.toString());
          }
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start the animation
    if (!isMobile) {
      animationFrameId = requestAnimationFrame(animate);
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeNodeId, isMobile, wordNodes]);

  // Handle node hover/click
  const handleNodeInteraction = (nodeId: string) => {
    setActiveNodeId(nodeId);
  };

  // Clear active node
  const handleNodeBlur = () => {
    setActiveNodeId(null);
  };

  // Get the CSS class for a line based on node states
  const getLineClass = (sourceId: string, targetId: string) => {
    let classes = "connection-line";
    
    if (activeNodeId === sourceId || activeNodeId === targetId) {
      classes += " connection-line-active";
    } else if (activeNodeId !== null) {
      classes += " connection-line-dimmed";
    }
    
    return classes;
  };

  // Get the CSS class for a node based on its state
  const getNodeClass = (nodeId: string, category: string) => {
    let classes = `word-node word-node-${category}`;
    
    if (activeNodeId === nodeId) {
      classes += " word-node-active";
    } else if (activeNodeId !== null) {
      const activeNode = wordNodes.find(node => node.id === activeNodeId);
      if (activeNode && activeNode.connections.includes(nodeId)) {
        classes += " word-node-connected";
      } else {
        classes += " word-node-dimmed";
      }
    }
    
    return classes;
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-6">
        <div className="text-center mb-12">
          <h2 className="text-heading font-serif mb-6 text-draft-green dark:text-draft-yellow">
            Semantic Intelligence Engine™
          </h2>
          <p className="text-draft-text dark:text-gray-300 max-w-3xl mx-auto text-lg">
            Our algorithm understands meaning, not just keywords. It recognizes relationships between concepts to ensure your resume communicates effectively.
          </p>
        </div>
        
        <div 
          ref={canvasRef}
          className="relative h-[500px] bg-white/30 dark:bg-draft-green/5 rounded-xl border border-gray-100 dark:border-draft-green/20 overflow-hidden"
        >
          {/* SVG for connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {wordNodes.map(node => (
              node.connections.map(targetId => {
                const targetNode = wordNodes.find(n => n.id === targetId);
                if (targetNode) {
                  return (
                    <line
                      key={`${node.id}-${targetId}`}
                      data-source={node.id}
                      data-target={targetId}
                      className={getLineClass(node.id, targetId)}
                      strokeWidth="1"
                      stroke="currentColor"
                    />
                  );
                }
                return null;
              })
            ))}
          </svg>
          
          {/* Word nodes */}
          {wordNodes.map(node => (
            <div
              id={node.id}
              key={node.id}
              className={getNodeClass(node.id, node.category)}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: `translate(-50%, -50%) scale(${node.size})`,
              }}
              onMouseEnter={() => !isMobile && handleNodeInteraction(node.id)}
              onMouseLeave={() => !isMobile && handleNodeBlur()}
              onClick={() => handleNodeInteraction(node.id)}
            >
              {node.text}
            </div>
          ))}
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-draft-green/20 p-3 rounded-md flex flex-col gap-2">
            <div className="text-sm font-medium text-draft-green dark:text-draft-yellow">Categories:</div>
            <div className="flex items-center text-xs">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              <span>Skills</span>
            </div>
            <div className="flex items-center text-xs">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span>Experience</span>
            </div>
            <div className="flex items-center text-xs">
              <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
              <span>Achievements</span>
            </div>
            <div className="flex items-center text-xs">
              <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
              <span>Education</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-draft-text dark:text-gray-300 text-sm">
          <p>Click or hover over nodes to see semantic relationships between resume elements.</p>
        </div>
      </div>
      
      {/* Add the styles for the network visualization */}
      <style>
        {`
        .word-node {
          position: absolute;
          padding: 10px 14px;
          border-radius: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          z-index: 20;
          font-weight: 500;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.3);
        }
        
        .word-node-skill {
          background-color: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
        
        .word-node-experience {
          background-color: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }
        
        .word-node-achievement {
          background-color: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        
        .word-node-education {
          background-color: rgba(168, 85, 247, 0.15);
          color: #a855f7;
        }
        
        .word-node:hover, .word-node-active {
          transform: translate(-50%, -50%) scale(1.2) !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          z-index: 30;
        }
        
        .word-node-connected {
          z-index: 25;
          box-shadow: 0 3px 12px rgba(0,0,0,0.15);
        }
        
        .word-node-dimmed {
          opacity: 0.4;
        }
        
        .connection-line {
          stroke-opacity: 0.5;
          transition: all 0.3s ease;
        }
        
        .connection-line-active {
          stroke-opacity: 1;
          stroke-width: 2;
        }
        
        .connection-line-dimmed {
          stroke-opacity: 0.2;
        }
        
        .dark .word-node-skill {
          background-color: rgba(59, 130, 246, 0.3);
          color: #93c5fd;
        }
        
        .dark .word-node-experience {
          background-color: rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
        }
        
        .dark .word-node-achievement {
          background-color: rgba(245, 158, 11, 0.3);
          color: #fcd34d;
        }
        
        .dark .word-node-education {
          background-color: rgba(168, 85, 247, 0.3);
          color: #d8b4fe;
        }
        
        .dark .connection-line {
          stroke: #d1d5db;
        }
        `}
      </style>
    </section>
  );
};

export default SemanticVisualization;
