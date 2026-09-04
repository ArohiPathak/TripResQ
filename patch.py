import re

def patch_app_jsx():
    with open('src/App.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace handleLockJourney
    lock_journey_mock = r'const handleLockJourney = \(\) => \{\n\s*if \(builderNodes\.length === 0\) return;\n\s*setCurrentTrip\(builderNodes\);\n\s*setBuilderNodes\(\[\]\);\n\s*setTripRefNum\(generateTripRef\(\)\);\n\s*setDisruptionState\(\'healthy\'\);\n\s*setImpactMetrics\(\{ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 \}\);\n\s*setCurrentPage\(\'my-trip\'\);\n\s*\};'
    lock_journey_real = """const handleLockJourney = async () => {
    if (builderNodes.length === 0) return;
    try {
      const res = await fetch('http://localhost:5000/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Trip Journey' })
      });
      const tripData = await res.json();
      const tripId = tripData.id;

      for (const node of builderNodes) {
        const baseDate = "2026-08-31T";
        const st = `${baseDate}${node.scheduledStart}:00Z`;
        const et = node.scheduledEnd === 'Onwards' ? `${baseDate}23:59:59Z` : `${baseDate}${node.scheduledEnd}:00Z`;
        
        await fetch('http://localhost:5000/api/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trip_id: tripId,
            node_type: (node.type || 'flight').toUpperCase(),
            title: node.title,
            location: node.info || '',
            start_time: st,
            end_time: et
          })
        });
      }

      const graphRes = await fetch(`http://localhost:5000/api/trips/${tripId}/graph`);
      const graphData = await graphRes.json();
      
      const formattedNodes = graphData.nodes.map(n => ({
        id: n.id,
        type: n.type.toLowerCase(),
        title: n.title,
        sub: n.location,
        scheduledStart: n.start_time.split('T')[1].substring(0,5),
        scheduledEnd: n.end_time.split('T')[1].substring(0,5),
        actualStart: n.start_time.split('T')[1].substring(0,5),
        actualEnd: n.end_time.split('T')[1].substring(0,5),
        buffer: 0,
        status: n.status === 'OK' ? 'healthy' : 'broken',
        disruptionReason: '',
        delayMinutes: 0,
        info: n.location
      }));

      setCurrentTrip(formattedNodes);
      setBuilderNodes([]);
      setTripRefNum(tripId);
      setDisruptionState('healthy');
      setImpactMetrics({ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 });
      setCurrentPage('my-trip');
    } catch (err) {
      console.error(err);
      alert('Failed to lock journey with backend');
    }
  };"""
    content = re.sub(lock_journey_mock, lock_journey_real, content, flags=re.MULTILINE)

    # Replace triggerDisruptionCascade
    disrupt_mock = r'const triggerDisruptionCascade = \(nodeId, type, delayMins, reason\) => \{.*?(?=\s*const handleResetJourney = )'
    disrupt_real = """const triggerDisruptionCascade = async (nodeId, type, delayMins, reason) => {
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${tripRefNum}/disrupt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: nodeId,
          delay_minutes: type === 'delay' ? delayMins : 360,
          reason: reason
        })
      });
      const data = await res.json();
      if(data.error) {
         console.error(data.error);
         return;
      }
      const formattedNodes = data.updated_graph.nodes.map(n => ({
        id: n.id,
        type: n.type.toLowerCase(),
        title: n.title,
        sub: n.location,
        scheduledStart: n.start_time.split('T')[1].substring(0,5),
        scheduledEnd: n.end_time.split('T')[1].substring(0,5),
        actualStart: n.start_time.split('T')[1].substring(0,5),
        actualEnd: n.end_time.split('T')[1].substring(0,5),
        buffer: 0,
        status: n.status === 'OK' ? 'healthy' : (n.status === 'BREACHED' ? 'broken' : 'delayed'),
        disruptionReason: reason,
        delayMinutes: data.impacts?.downstream_delay_minutes || 0,
        info: n.location
      }));

      setCurrentTrip(formattedNodes);
      setDisruptionState('disrupted');
      setImpactMetrics({
        delayMinutes: data.impacts?.downstream_delay_minutes || 0,
        brokenConnections: data.impacts?.broken_nodes_count || 0,
        affectedNodes: data.impacts?.affected_nodes_count || 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  """
    content = re.sub(disrupt_mock, disrupt_real, content, flags=re.DOTALL)

    # Replace handleAcceptPlan
    accept_mock = r'const handleAcceptPlan = \(planKey\) => \{.*?(?=\s*const handleCloseBugReporter = )'
    accept_real = """const handleAcceptPlan = async (planKey) => {
    setSuccessPlanAccepted(planKey);
    try {
      const propRes = await fetch(`http://localhost:5000/api/trips/${tripRefNum}/recover`, { method: 'POST' });
      const propData = await propRes.json();
      
      const applyRes = await fetch(`http://localhost:5000/api/trips/${tripRefNum}/apply-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposals: propData.proposals || [] })
      });
      const applyData = await applyRes.json();
      
      const formattedNodes = applyData.updated_graph.nodes.map(n => ({
        id: n.id,
        type: n.type.toLowerCase(),
        title: n.title,
        sub: n.location,
        scheduledStart: n.start_time.split('T')[1].substring(0,5),
        scheduledEnd: n.end_time.split('T')[1].substring(0,5),
        actualStart: n.start_time.split('T')[1].substring(0,5),
        actualEnd: n.end_time.split('T')[1].substring(0,5),
        buffer: 0,
        status: 'healthy',
        disruptionReason: '',
        delayMinutes: 0,
        info: n.location
      }));
      
      setTimeout(() => {
         setCurrentTrip(formattedNodes);
         setDisruptionState('resolved');
         setSuccessPlanAccepted(null);
         setCurrentPage('my-trip');
      }, 2500);
    } catch (err) {
      console.error(err);
      setSuccessPlanAccepted(null);
    }
  };

  """
    content = re.sub(accept_mock, accept_real, content, flags=re.DOTALL)

    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    patch_app_jsx()
    print("Patched App.jsx successfully.")
