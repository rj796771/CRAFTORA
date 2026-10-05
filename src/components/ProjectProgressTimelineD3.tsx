import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { MilestoneStage, ProjectMilestone, ProjectStatus } from '../types';
import { Calendar, CheckCircle2, Circle, Compass, Sparkles, Milestone as MilestoneIcon, ChevronRight } from 'lucide-react';

interface ProjectProgressTimelineD3Props {
  milestones: ProjectMilestone[];
  projectStatus: ProjectStatus;
  onSelectMilestone?: (milestone: ProjectMilestone) => void;
}

const STAGES: MilestoneStage[] = [
  'IDEA',
  'RESEARCH',
  'FIRST PROTOTYPE',
  'ITERATION',
  'TESTING',
  'RELEASE',
];

const STAGE_COLORS: Record<MilestoneStage, { primary: string; light: string; border: string }> = {
  'IDEA': { primary: '#7D7569', light: '#F0ECE4', border: '#D3CCC0' },
  'RESEARCH': { primary: '#4A6B56', light: '#EDF4EF', border: '#B8D4C2' },
  'FIRST PROTOTYPE': { primary: '#D9774E', light: '#FDF1EB', border: '#F4BFA8' },
  'ITERATION': { primary: '#C85A32', light: '#F9EDE7', border: '#F2A98E' },
  'TESTING': { primary: '#B8782E', light: '#FAF2E6', border: '#E7CFA5' },
  'RELEASE': { primary: '#2D6643', light: '#EAF3EC', border: '#9EC9AA' },
};

function getStatusStageIndex(status: ProjectStatus): number {
  switch (status) {
    case 'CONCEPT':
      return 0; // IDEA
    case 'EXPLORING':
      return 1; // RESEARCH
    case 'IN DEVELOPMENT':
      return 3; // ITERATION
    case 'TESTING':
      return 4; // TESTING
    case 'RELEASED':
      return 5; // RELEASE
    case 'PAUSED':
    case 'ARCHIVED':
      return 2; // FIRST PROTOTYPE
    default:
      return 1;
  }
}

export const ProjectProgressTimelineD3: React.FC<ProjectProgressTimelineD3Props> = ({
  milestones,
  projectStatus,
  onSelectMilestone,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(
    milestones.length > 0 ? milestones[milestones.length - 1] : null
  );
  const [hoveredStage, setHoveredStage] = useState<MilestoneStage | null>(null);

  const currentStageIndex = useMemo(() => {
    if (milestones.length > 0) {
      const highestStageIdx = Math.max(
        ...milestones.map((m) => STAGES.indexOf(m.stage))
      );
      if (highestStageIdx >= 0) {
        return Math.max(highestStageIdx, getStatusStageIndex(projectStatus));
      }
    }
    return getStatusStageIndex(projectStatus);
  }, [milestones, projectStatus]);

  const progressPercent = Math.round(((currentStageIndex + 1) / STAGES.length) * 100);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 760;
    const height = 180;
    const margin = { top: 35, right: 55, bottom: 45, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height);

    const defs = svg.append('defs');

    const grad = defs
      .append('linearGradient')
      .attr('id', 'd3-timeline-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    grad.append('stop').attr('offset', '0%').attr('stop-color', '#4A6B56');
    grad.append('stop').attr('offset', '50%').attr('stop-color', '#C85A32');
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#2D6643');

    const filter = defs
      .append('filter')
      .attr('id', 'd3-node-shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '2')
      .attr('stdDeviation', '2.5')
      .attr('flood-color', '#191817')
      .attr('flood-opacity', '0.12');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3
      .scalePoint<string>()
      .domain(STAGES)
      .range([0, innerWidth])
      .padding(0);

    const centerY = innerHeight / 2;

    g.append('line')
      .attr('x1', 0)
      .attr('y1', centerY)
      .attr('x2', innerWidth)
      .attr('y2', centerY)
      .attr('stroke', '#E5DFD4')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round');

    const activeEndX = xScale(STAGES[currentStageIndex]) ?? 0;
    const progressLine = g
      .append('line')
      .attr('x1', 0)
      .attr('y1', centerY)
      .attr('x2', 0)
      .attr('y2', centerY)
      .attr('stroke', 'url(#d3-timeline-gradient)')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round');

    progressLine
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr('x2', activeEndX);

    STAGES.forEach((stage, idx) => {
      const cx = xScale(stage) ?? 0;
      const isCompleted = idx < currentStageIndex;
      const isCurrent = idx === currentStageIndex;
      const isFuture = idx > currentStageIndex;

      const stageMilestones = milestones.filter((m) => m.stage === stage);
      const hasMilestones = stageMilestones.length > 0;
      const color = STAGE_COLORS[stage];

      const stageGroup = g
        .append('g')
        .attr('class', 'stage-node-group')
        .attr('transform', `translate(${cx}, ${centerY})`)
        .style('cursor', hasMilestones ? 'pointer' : 'default')
        .on('mouseenter', () => setHoveredStage(stage))
        .on('mouseleave', () => setHoveredStage(null))
        .on('click', () => {
          if (stageMilestones.length > 0) {
            setSelectedMilestone(stageMilestones[0]);
            if (onSelectMilestone) onSelectMilestone(stageMilestones[0]);
          }
        });

      if (isCurrent) {
        stageGroup
          .append('circle')
          .attr('r', 16)
          .attr('fill', color.primary)
          .attr('fill-opacity', 0.15)
          .append('animate')
          .attr('attributeName', 'r')
          .attr('values', '13;19;13')
          .attr('dur', '2.5s')
          .attr('repeatCount', 'indefinite');
      }

      stageGroup
        .append('circle')
        .attr('r', isCurrent ? 12 : 9)
        .attr('fill', isFuture ? '#FAF8F5' : color.light)
        .attr('stroke', isFuture ? '#D8D2C5' : color.primary)
        .attr('stroke-width', isCurrent ? 3 : 2)
        .attr('filter', isCurrent ? 'url(#d3-node-shadow)' : null);

      if (isCompleted || isCurrent) {
        stageGroup
          .append('circle')
          .attr('r', isCurrent ? 5 : 4)
          .attr('fill', color.primary);
      }

      if (stageMilestones.length > 1) {
        stageGroup
          .append('rect')
          .attr('x', 6)
          .attr('y', -16)
          .attr('width', 16)
          .attr('height', 13)
          .attr('rx', 2)
          .attr('fill', '#191817');

        stageGroup
          .append('text')
          .attr('x', 14)
          .attr('y', -7)
          .attr('text-anchor', 'middle')
          .attr('fill', '#FAF8F5')
          .attr('font-size', '9px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('font-weight', 'bold')
          .text(stageMilestones.length);
      }

      stageGroup
        .append('text')
        .attr('x', 0)
        .attr('y', -22)
        .attr('text-anchor', 'middle')
        .attr('font-size', width < 600 ? '9px' : '10.5px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', isCurrent ? '700' : '500')
        .attr('fill', isCurrent ? '#C85A32' : isCompleted ? '#191817' : '#847E76')
        .text(stage);

      stageGroup
        .append('text')
        .attr('x', 0)
        .attr('y', 26)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-family', 'Plus Jakarta Sans, sans-serif')
        .attr('fill', isCurrent ? '#C85A32' : '#847E76')
        .text(
          hasMilestones
            ? `${stageMilestones.length} logged`
            : isCurrent
            ? 'Active Stage'
            : isCompleted
            ? 'Completed'
            : 'Planned'
        );
    });
  }, [milestones, projectStatus, currentStageIndex]);

  return (
    <div className="bg-[#FAF8F5] border border-[#E5DFD4] p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#ECE7DE] gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F4EFE6] border border-[#E5DFD4] flex items-center justify-center text-[#C85A32]">
            <MilestoneIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono-meta tracking-wider text-[#C85A32] uppercase">
              D3 MILESTONE PROGRESS TRACKER
            </div>
            <h3 className="font-serif-display text-base sm:text-lg font-bold text-[#191817]">
              Project Development Evolution
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-meta">
          <div>
            <span className="text-[#847E76] block text-[10px]">CURRENT PHASE</span>
            <span className="font-bold text-[#191817]">{STAGES[currentStageIndex]}</span>
          </div>
          <div className="h-6 w-px bg-[#E5DFD4]" />
          <div>
            <span className="text-[#847E76] block text-[10px]">PROGRESS</span>
            <span className="font-bold text-[#2D6643]">{progressPercent}%</span>
          </div>
          <div className="h-6 w-px bg-[#E5DFD4]" />
          <div>
            <span className="text-[#847E76] block text-[10px]">LOGGED CHECKPOINTS</span>
            <span className="font-bold text-[#C85A32]">{milestones.length}</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="w-full overflow-x-auto pb-1">
        <svg ref={svgRef} className="w-full min-w-[620px] select-none" />
      </div>

      {selectedMilestone ? (
        <div className="p-4 bg-[#F4EFE6] border border-[#E5DFD4] text-xs space-y-2.5 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#D8D2C5]">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 text-[10px] font-mono-meta font-bold uppercase rounded-none"
                style={{
                  backgroundColor: STAGE_COLORS[selectedMilestone.stage]?.light || '#F4EFE6',
                  color: STAGE_COLORS[selectedMilestone.stage]?.primary || '#191817',
                  border: `1px solid ${STAGE_COLORS[selectedMilestone.stage]?.border || '#E5DFD4'}`,
                }}
              >
                {selectedMilestone.stage}
              </span>
              <span className="font-bold font-serif-display text-sm text-[#191817]">
                {selectedMilestone.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#847E76] font-mono-meta text-[11px]">
              <Calendar className="w-3 h-3" />
              <span>{selectedMilestone.date}</span>
            </div>
          </div>

          <p className="text-[#57524C] leading-relaxed">
            {selectedMilestone.description}
          </p>

          {selectedMilestone.learnings && (
            <div className="p-2.5 bg-[#FAF8F5] border-l-2 border-[#56725F] text-[11px] text-[#191817] leading-relaxed">
              <span className="font-semibold text-[#56725F] block font-mono-meta uppercase text-[10px] mb-0.5">
                Key Milestone Learning:
              </span>
              {selectedMilestone.learnings}
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-[#F4EFE6] text-center text-xs font-mono-meta text-[#847E76]">
          Click any milestone checkpoint in the D3 visualization above to inspect its evolution logs.
        </div>
      )}
    </div>
  );
};
