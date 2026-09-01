import re

def update_linker_and_delay():
    # 1. Update app/services/linker.py to calculate realistic min_buffer based on user schedule
    linker_code = """from app.core.db import db
from app.models.node import ItineraryNode
from app.models.edge import DependencyEdge, ConstraintType

def calculate_min_buffer(source: ItineraryNode, target: ItineraryNode) -> int:
    \"\"\"Calculate minimum buffer based on actual scheduled buffer between nodes.\"\"\"
    if source.end_time and target.start_time:
        actual_gap = int((target.start_time - source.end_time).total_seconds() / 60)
        if actual_gap >= 0:
            # Respect user's scheduled gap (capped at reasonable 30 mins)
            return min(actual_gap, 30)
            
    return 30

def run_auto_linker(trip_id: str):
    \"\"\"
    Dynamically analyzes the chronological sequence of nodes for a trip and 
    creates edges between consecutive nodes.
    \"\"\"
    nodes = ItineraryNode.query.filter_by(trip_id=trip_id).order_by(ItineraryNode.start_time).all()
    
    if len(nodes) < 2:
        return

    node_ids = [n.id for n in nodes]
    DependencyEdge.query.filter(
        (DependencyEdge.source_node_id.in_(node_ids)) | 
        (DependencyEdge.target_node_id.in_(node_ids))
    ).delete(synchronize_session='fetch')
    
    new_edges = []
    for i in range(len(nodes) - 1):
        source = nodes[i]
        target = nodes[i+1]
        
        min_buffer = calculate_min_buffer(source, target)
        
        edge = DependencyEdge(
            source_node_id=source.id,
            target_node_id=target.id,
            min_buffer_minutes=min_buffer,
            constraint_type=ConstraintType.TEMPORAL.value
        )
        new_edges.append(edge)
        
    db.session.add_all(new_edges)
    db.session.commit()
"""
    with open('app/services/linker.py', 'w', encoding='utf-8') as f:
        f.write(linker_code)

    # 2. Update formatGraphNodes in src/App.jsx to calculate delayMinutes dynamically from (actualStart - scheduledStart)
    with open('src/App.jsx', 'r', encoding='utf-8') as f:
        app_content = f.read()

    old_format_fn = r'const formatGraphNodes = \(nodes, existingNodes = \[\]\) => \{.*?\n\};'
    new_format_fn = """const formatGraphNodes = (nodes, existingNodes = []) => {
  return (nodes || []).map(n => {
    let frontendStatus = 'healthy';
    if (n.status === 'AT_RISK') frontendStatus = 'delayed';
    if (n.status === 'BROKEN') frontendStatus = 'broken';

    const actualStartStr = n.start_time && n.start_time.includes('T') ? n.start_time.split('T')[1].substring(0,5) : (n.start_time || '08:00');
    const actualEndStr = n.end_time && n.end_time.includes('T') ? n.end_time.split('T')[1].substring(0,5) : (n.end_time || '09:00');

    // Find matching existing node to preserve OG baseline scheduled time
    const existing = (existingNodes || []).find(ex => ex.id === n.id || ex.title === n.title);
    const scheduledStartStr = existing ? existing.scheduledStart : actualStartStr;
    const scheduledEndStr = existing ? existing.scheduledEnd : actualEndStr;

    // Calculate exact delay minutes between scheduled and actual start
    const calcDelay = getMinutesBetween(scheduledStartStr, actualStartStr);

    return {
      id: n.id,
      type: (n.type || 'flight').toLowerCase(),
      title: n.title,
      sub: n.location || '',
      scheduledStart: scheduledStartStr,
      scheduledEnd: scheduledEndStr,
      actualStart: actualStartStr,
      actualEnd: actualEndStr,
      buffer: 0,
      status: frontendStatus,
      disruptionReason: frontendStatus !== 'healthy' ? 'Schedule Slippage' : '',
      delayMinutes: calcDelay > 0 ? calcDelay : 0,
      info: n.location || ''
    };
  });
};"""

    app_content = re.sub(old_format_fn, new_format_fn, app_content, flags=re.DOTALL)

    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(app_content)

if __name__ == '__main__':
    update_linker_and_delay()
    print("Updated linker min_buffer calculation and delayMinutes formatting successfully.")
