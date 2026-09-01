import re

def fix_flaws():
    with open('src/App.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add originalTripNodes state
    content = content.replace("const [currentTrip, setCurrentTrip] = useState(seedInitialTripNodes);",
                              "const [currentTrip, setCurrentTrip] = useState(seedInitialTripNodes);\n  const [originalTripNodes, setOriginalTripNodes] = useState([]);")

    # 2. Update initializeSeedTrip to setOriginalTripNodes
    content = content.replace("setCurrentTrip(formattedNodes);\n      if (formattedNodes.length > 0) {\n        setSelectedDisruptNode(formattedNodes[0].id);\n      }\n      setTripRefNum(tripId);",
                              "setCurrentTrip(formattedNodes);\n      setOriginalTripNodes(formattedNodes);\n      if (formattedNodes.length > 0) {\n        setSelectedDisruptNode(formattedNodes[0].id);\n      }\n      setTripRefNum(tripId);")

    # 3. Update handleLockJourney to setOriginalTripNodes
    content = content.replace("setCurrentTrip(formattedNodes);\n      if (formattedNodes.length > 0) {\n        setSelectedDisruptNode(formattedNodes[0].id);\n      }\n      setBuilderNodes([]);",
                              "setCurrentTrip(formattedNodes);\n      setOriginalTripNodes(formattedNodes);\n      if (formattedNodes.length > 0) {\n        setSelectedDisruptNode(formattedNodes[0].id);\n      }\n      setBuilderNodes([]);")

    # 4. Update handleResetJourney to restore original user trip instead of changing itinerary
    reset_logic = """const handleResetJourney = async () => {
    const targetNodes = (originalTripNodes && originalTripNodes.length > 0) ? originalTripNodes : currentTrip;
    if (targetNodes && targetNodes.length > 0) {
      try {
        const res = await fetch('http://localhost:5000/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Trip Journey' })
        });
        const tripData = await res.json();
        const tripId = tripData.id;

        for (const node of targetNodes) {
          const nodeDate = node.date || new Date().toISOString().split('T')[0];
          const st = `${nodeDate}T${node.scheduledStart}:00Z`;
          const et = node.scheduledEnd === 'Onwards' ? `${nodeDate}T23:59:59Z` : `${nodeDate}T${node.scheduledEnd}:00Z`;
          
          let hardCutoff = null;
          if (node.type === 'cab') {
            hardCutoff = addMinutesToISO(st, 30);
          } else if (node.type === 'hotel') {
            hardCutoff = addMinutesToISO(st, 60);
          }

          const payload = {
            trip_id: tripId,
            node_type: (node.type || 'flight').toUpperCase(),
            title: node.title,
            location: node.info || node.sub || '',
            start_time: st,
            end_time: et
          };
          if (hardCutoff) {
            payload.hard_cutoff = hardCutoff;
          }

          await fetch('http://localhost:5000/api/nodes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        const graphRes = await fetch(`http://localhost:5000/api/trips/${tripId}/graph`);
        const graphData = await graphRes.json();
        
        const formattedNodes = formatGraphNodes(graphData.nodes);

        setCurrentTrip(formattedNodes);
        setTripRefNum(tripId);
        setDisruptionState('healthy');
        setImpactMetrics({ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 });
      } catch (err) {
        console.error(err);
        const resetNodes = targetNodes.map(n => ({ ...n, status: 'healthy', actualStart: n.scheduledStart, actualEnd: n.scheduledEnd, delayMinutes: 0, disruptionReason: '' }));
        setCurrentTrip(resetNodes);
        setDisruptionState('healthy');
        setImpactMetrics({ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 });
      }
    } else {
      initializeSeedTrip();
      setDisruptionState('healthy');
      setImpactMetrics({ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 });
    }
  };"""

    content = re.sub(r'const handleResetJourney = \(\) => \{.*?\};', reset_logic, content, flags=re.DOTALL)

    # 5. Make safe nodes distinctly GREEN in timeline card styling
    timeline_card_old = r': node\.status === \'delayed\'\s*\?\s*\'border-\[\#FF7700\] bg-orange-50/20 shadow-orange-105\'\s*:\s*\'border-slate-205 bg-white hover:border-\[\#287DFA\]\''
    timeline_card_new = ": node.status === 'delayed' ? 'border-amber-400 bg-amber-50/30 shadow-amber-100' : 'border-emerald-500 bg-emerald-50/20 shadow-emerald-100 hover:border-emerald-600'"
    content = re.sub(timeline_card_old, timeline_card_new, content)

    # Tag styling
    tag_old = r': node\.status === \'delayed\'\s*\?\s*\'bg-orange-100 text-\[\#FF7700\]\'\s*:\s*\'bg-\[\#EAF3FF\] text-\[\#287DFA\]\''
    tag_new = ": node.status === 'delayed' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700 font-extrabold'"
    content = re.sub(tag_old, tag_new, content)

    # Status text in tag
    status_text_old = r"\{node\.status === 'broken' \? t\('connectionBroken'\) : node\.status === 'delayed' \? t\('delayed'\) : t\('onTime'\)\}"
    status_text_new = "{node.status === 'broken' ? '❌ ' + t('connectionBroken') : node.status === 'delayed' ? '⚠️ ' + t('delayed') : '✓ SAFE & ON TIME'}"
    content = re.sub(status_text_old, status_text_new, content)

    # 6. Update Chaos Lab node selector cards to show GREEN for safe, AMBER for delayed, RED for broken
    chaos_node_button_old = r'<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">\s*\{currentTrip\.map\(node => \(\s*<button.*?</button>\s*\)\)\}\s*</div>'
    chaos_node_button_new = """<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentTrip.map(node => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => setSelectedDisruptNode(node.id)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                            selectedDisruptNode === node.id
                              ? 'border-[#287DFA] bg-[#EAF3FF]/60 ring-2 ring-[#287DFA]/30'
                              : node.status === 'broken'
                              ? 'border-red-300 bg-red-50/30 hover:bg-red-50/50'
                              : node.status === 'delayed'
                              ? 'border-amber-300 bg-amber-50/30 hover:bg-amber-50/50'
                              : 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/50'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {node.type}
                            </span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase font-mono ${
                              node.status === 'broken'
                                ? 'bg-red-100 text-red-700'
                                : node.status === 'delayed'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {node.status === 'broken' ? 'BROKEN' : node.status === 'delayed' ? 'AT RISK' : 'SAFE'}
                            </span>
                          </div>
                          <span className="font-bold text-xs truncate text-slate-900">{node.title}</span>
                          <span className="text-[10px] font-semibold text-slate-500 font-mono">{node.scheduledStart} - {node.scheduledEnd}</span>
                        </button>
                      ))}
                    </div>"""

    content = re.sub(chaos_node_button_old, chaos_node_button_new, content, flags=re.DOTALL)

    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    fix_flaws()
    print("Fixed simulation node visual status and reset functionality successfully.")
