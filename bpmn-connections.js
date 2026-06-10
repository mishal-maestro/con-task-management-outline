// BPMN Connection Drawing Module
// Edge-routing: arrows touch shape borders rather than passing through their centres.

(function() {
  // SVG marker definitions for arrows
  const arrowDefs = `
    <defs>
      <marker id="arrow-seq" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#8c8780"/>
      </marker>
      <marker id="arrow-msg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#50a0dc" stroke-width="1.5"/>
      </marker>
      <marker id="arrow-loop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24"/>
      </marker>
    </defs>
  `;

  // Get bounding box of an element relative to a given ancestor (offsetParent chain).
  function getBox(el, ancestor) {
    let x = 0, y = 0;
    let cur = el;
    while (cur && cur !== ancestor) {
      x += cur.offsetLeft;
      y += cur.offsetTop;
      cur = cur.offsetParent;
    }
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    return {
      x, y, w, h,
      cx: x + w / 2,
      cy: y + h / 2,
      right: x + w,
      bottom: y + h
    };
  }

  // Pixel threshold: if source/target horizontal offset is less than this,
  // treat it as "directly above/below" and use vertical edges. Otherwise prefer
  // horizontal (left/right) edges. This is the BPMN convention: tasks are
  // entered from the side, not pierced through their top/bottom.
  const VERT_THRESHOLD = 20;

  // Find the edge point of `box` closest to the target (tx, ty).
  // For gateways (rotated 45° diamonds), use the 4 visible diamond POINTS at
  // distance w·√2/2 from centre — they sit ~7px OUTSIDE the un-rotated
  // bounding box.
  function getEdgePoint(box, tx, ty, isGateway) {
    const dx = tx - box.cx;
    const dy = ty - box.cy;

    if (isGateway) {
      const r = box.w * Math.SQRT2 / 2; // 25.5 for a 36×36 square
      if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0
          ? { x: box.cx + r, y: box.cy, side: 'right' }
          : { x: box.cx - r, y: box.cy, side: 'left' };
      }
      return dy > 0
        ? { x: box.cx, y: box.cy + r, side: 'bottom' }
        : { x: box.cx, y: box.cy - r, side: 'top' };
    }

    // Rectangular shapes (tasks, events): prefer horizontal entry/exit unless
    // source is nearly directly above/below.
    if (Math.abs(dx) > VERT_THRESHOLD) {
      return dx > 0
        ? { x: box.right, y: box.cy, side: 'right' }
        : { x: box.x, y: box.cy, side: 'left' };
    }
    return dy > 0
      ? { x: box.cx, y: box.bottom, side: 'bottom' }
      : { x: box.cx, y: box.y, side: 'top' };
  }

  // Build the SVG path string. Routing rule:
  //   - First segment goes perpendicular to the SOURCE edge (away from source box).
  //   - Last segment goes perpendicular to the TARGET edge (toward target box).
  //   - This guarantees the arrow head approaches the target along its edge normal.
  // Combinations:
  //   horiz exit + horiz entry → straight (same y) or Z-shape (different y)
  //   vert exit + vert entry → straight (same x) or Z-shape (different x)
  //   horiz exit + vert entry → L (horizontal first, then vertical)
  //   vert exit + horiz entry → L (vertical first, then horizontal)
  function buildPath(start, end) {
    const startHoriz = start.side === 'left' || start.side === 'right';
    const endHoriz = end.side === 'left' || end.side === 'right';

    if (startHoriz && endHoriz) {
      if (Math.abs(start.y - end.y) < 1) {
        return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
      }
      // Z-shape: horizontal — vertical — horizontal, turn at midX
      const midX = (start.x + end.x) / 2;
      return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    }
    if (!startHoriz && !endHoriz) {
      if (Math.abs(start.x - end.x) < 1) {
        return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
      }
      // Z-shape: vertical — horizontal — vertical, turn at midY
      const midY = (start.y + end.y) / 2;
      return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
    }
    if (startHoriz && !endHoriz) {
      // L: horizontal then vertical
      return `M ${start.x} ${start.y} L ${end.x} ${start.y} L ${end.x} ${end.y}`;
    }
    // vert exit, horiz entry: L vertical then horizontal
    return `M ${start.x} ${start.y} L ${start.x} ${end.y} L ${end.x} ${end.y}`;
  }

  // Prepare SVG: clear, size to cover diagram, insert arrow defs.
  function prepareSvg(svg, diagram) {
    const w = diagram.scrollWidth;
    const h = diagram.scrollHeight;
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = arrowDefs;
  }

  // Draw a connection between two elements (by ID), with optional label.
  function drawConnection(svg, pool, fromId, toId, connType, label) {
    const fromEl = document.getElementById(fromId);
    const toEl = document.getElementById(toId);
    if (!fromEl || !toEl) return;

    const fromBox = getBox(fromEl, pool);
    const toBox = getBox(toEl, pool);
    const fromIsGateway = fromEl.classList.contains('gateway');
    const toIsGateway = toEl.classList.contains('gateway');

    const start = getEdgePoint(fromBox, toBox.cx, toBox.cy, fromIsGateway);
    const end = getEdgePoint(toBox, fromBox.cx, fromBox.cy, toIsGateway);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-width', '1.5');

    if (connType === 'message') {
      path.setAttribute('d', buildPath(start, end));
      path.setAttribute('stroke', '#50a0dc');
      path.setAttribute('stroke-dasharray', '6,4');
      path.setAttribute('marker-end', 'url(#arrow-msg)');
    } else if (connType === 'loop') {
      // Loop: drop down below both, route across, come back up.
      const bottomY = Math.max(start.y, end.y) + 60;
      path.setAttribute('d', `M ${start.x} ${start.y} L ${start.x} ${bottomY} L ${end.x} ${bottomY} L ${end.x} ${end.y}`);
      path.setAttribute('stroke', '#fbbf24');
      path.setAttribute('marker-end', 'url(#arrow-loop)');
    } else {
      // sequence flow (default)
      path.setAttribute('d', buildPath(start, end));
      path.setAttribute('stroke', '#8c8780');
      path.setAttribute('marker-end', 'url(#arrow-seq)');
    }

    svg.appendChild(path);

    if (label) {
      // Position label on the MIDDLE segment of the path so siblings (multiple
      // out-edges from the same source) don't pile up at the same point.
      // Z-shapes: middle segment is perpendicular to entry/exit, so labels of
      // two siblings naturally separate (different y for h-v-h Z, different x
      // for v-h-v Z).
      const startHoriz = start.side === 'left' || start.side === 'right';
      const endHoriz = end.side === 'left' || end.side === 'right';
      let labelX, labelY;
      if (startHoriz && endHoriz) {
        // Z (h-v-h): middle is vertical at midX
        const midX = (start.x + end.x) / 2;
        labelX = midX;
        labelY = (start.y + end.y) / 2;
      } else if (!startHoriz && !endHoriz) {
        // Z (v-h-v): middle is horizontal at midY
        labelX = (start.x + end.x) / 2;
        labelY = (start.y + end.y) / 2;
      } else if (startHoriz && !endHoriz) {
        // L (h-v): label on horizontal segment, mid-x
        labelX = (start.x + end.x) / 2;
        labelY = start.y - 8;
      } else {
        // L (v-h): label on vertical segment, just below start
        labelX = start.x;
        labelY = (start.y + end.y) / 2;
      }

      // Translucent backdrop rect so labels remain readable over connection lines.
      const padding = 4;
      const measureText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      measureText.setAttribute('font-size', '10');
      measureText.setAttribute('font-weight', '600');
      measureText.textContent = label;
      svg.appendChild(measureText);
      const bbox = measureText.getBBox();
      svg.removeChild(measureText);

      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', labelX - bbox.width / 2 - padding);
      bg.setAttribute('y', labelY - bbox.height + padding / 2);
      bg.setAttribute('width', bbox.width + padding * 2);
      bg.setAttribute('height', bbox.height + padding);
      bg.setAttribute('fill', '#26262a');
      bg.setAttribute('rx', '3');
      svg.appendChild(bg);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', labelX);
      text.setAttribute('y', labelY);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', '600');
      text.setAttribute('fill', connType === 'message' ? '#50a0dc' : '#b4afa8');
      text.textContent = label;
      svg.appendChild(text);
    }
  }

  window.BPMN = { prepareSvg, drawConnection, getBox, getEdgePoint };
})();
