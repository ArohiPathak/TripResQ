import re

def patch_og_and_rescue():
    with open('src/App.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update formatGraphNodes to preserve OG scheduledStart and scheduledEnd
    old_format_fn = r'const formatGraphNodes = \(nodes\) => \{.*?\n\};'
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
      disruptionReason: '',
      delayMinutes: 0,
      info: n.location || ''
    };
  });
};"""

    content = re.sub(old_format_fn, new_format_fn, content, flags=re.DOTALL)

    # 2. Add recoveryProposals state
    content = content.replace("const [originalTripNodes, setOriginalTripNodes] = useState([]);",
                              "const [originalTripNodes, setOriginalTripNodes] = useState([]);\n  const [recoveryProposals, setRecoveryProposals] = useState([]);")

    # 3. Update triggerDisruptionCascade to pass currentTrip to formatGraphNodes & fetch recovery proposals
    old_disrupt_cascade = r'const triggerDisruptionCascade = async \(nodeId, type, delayMins, reason\) => \{.*?\n  \};'
    new_disrupt_cascade = """const triggerDisruptionCascade = async (nodeId, type, delayMins, reason) => {
    const targetId = nodeId || selectedDisruptNode || (currentTrip.length > 0 ? currentTrip[0].id : '');
    if (!targetId) {
      alert("Please select a travel node to disrupt!");
      return;
    }
    try {
      const delayToApply = (type === 'cancel' || type === 'lockout') ? 360 : delayMins;
      const res = await fetch(`http://localhost:5000/api/trips/${tripRefNum}/disrupt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: targetId,
          delay_minutes: delayToApply,
          reason: reason
        })
      });
      const data = await res.json();
      if (data.error) {
         alert(`Disruption Error: ${data.error}`);
         return;
      }
      
      // Preserve OG scheduled times by passing currentTrip
      const formattedNodes = formatGraphNodes(data.updated_graph.nodes, currentTrip);

      const brokenCount = data.updated_graph.nodes.filter(n => n.status === 'BROKEN').length;
      const affectedCount = data.updated_graph.nodes.filter(n => n.status !== 'OK').length;

      setCurrentTrip(formattedNodes);
      setDisruptionState('disrupted');
      setImpactMetrics({
        delayMinutes: delayToApply,
        brokenConnections: brokenCount,
        affectedNodes: affectedCount
      });

      // Fetch legitimate recovery proposals from backend
      try {
        const propRes = await fetch(`http://localhost:5000/api/trips/${tripRefNum}/recover`, { method: 'POST' });
        const propData = await propRes.json();
        setRecoveryProposals(propData.proposals || []);
      } catch (e) {
        console.error('Error fetching recovery proposals:', e);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to execute disruption simulation');
    }
  };"""

    content = re.sub(old_disrupt_cascade, new_disrupt_cascade, content, flags=re.DOTALL)

    # 4. Update handleAcceptPlan
    old_accept_plan = r'const handleAcceptPlan = async \(planKey\) => \{.*?\n  \};'
    new_accept_plan = """const handleAcceptPlan = async (planKey) => {
    setSuccessPlanAccepted(planKey);
    try {
      let proposalsToApply = recoveryProposals;
      if (!proposalsToApply || proposalsToApply.length === 0) {
        const propRes = await fetch(`http://localhost:5000/api/trips/${tripRefNum}/recover`, { method: 'POST' });
        const propData = await propRes.json();
        proposalsToApply = propData.proposals || [];
      }
      
      if (planKey === 'refund') {
        setTimeout(() => {
          const refundedNodes = currentTrip.map(n => ({
            ...n,
            status: 'broken',
            actualStart: 'CANCELLED',
            actualEnd: 'CANCELLED',
            sub: '100% Refund Claim Processed'
          }));
          setCurrentTrip(refundedNodes);
          setDisruptionState('resolved');
          setSuccessPlanAccepted(null);
          setCurrentPage('my-trip');
        }, 2000);
        return;
      }

      const applyRes = await fetch(`http://localhost:5000/api/trips/${tripRefNum}/apply-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposals: proposalsToApply })
      });
      const applyData = await applyRes.json();
      
      // Preserve OG scheduled times when updating restored graph
      const formattedNodes = formatGraphNodes(applyData.updated_graph.nodes, currentTrip);
      
      setTimeout(() => {
         setCurrentTrip(formattedNodes);
         setDisruptionState('resolved');
         setSuccessPlanAccepted(null);
         setCurrentPage('my-trip');
      }, 2000);
    } catch (err) {
      console.error(err);
      setSuccessPlanAccepted(null);
      alert('Failed to apply recovery plan');
    }
  };"""

    content = re.sub(old_accept_plan, new_accept_plan, content, flags=re.DOTALL)

    # 5. Dynamically display legitimate proposals in Rescue Page card
    old_rescue_card_desc = r'<p className="text-slate-505 text-xs leading-relaxed">\s*\{t\(\'fastestDetails\'\)\}\s*</p>'
    new_rescue_card_desc = """{recoveryProposals && recoveryProposals.length > 0 ? (
                      <div className="space-y-2 bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-left">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#287DFA] block">
                          ⚡ Backend Recovery Action Plan ({recoveryProposals.length}):
                        </span>
                        {recoveryProposals.map((prop, idx) => (
                          <div key={idx} className="p-2 bg-white rounded-lg border border-blue-100 text-xs text-slate-800 flex flex-col gap-0.5 shadow-xs">
                            <span className="font-bold text-[#287DFA] text-[11px]">{prop.node_title} &rarr; {prop.action}</span>
                            <span className="text-[10px] text-slate-600">{prop.description}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-505 text-xs leading-relaxed">
                        {t('fastestDetails')}
                      </p>
                    )}"""

    content = re.sub(old_rescue_card_desc, new_rescue_card_desc, content, flags=re.DOTALL)

    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    patch_og_and_rescue()
    print("Fixed OG scheduled timing preservation and legitimate rescue proposals display successfully.")
