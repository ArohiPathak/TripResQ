import re

def fix_simulation_and_dates():
    with open('src/App.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update initial builderDate to current date dynamically
    content = content.replace("const [builderDate, setBuilderDate] = useState('2026-08-31');", 
                              "const todayDateStr = new Date().toISOString().split('T')[0];\n  const [builderDate, setBuilderDate] = useState(todayDateStr);")

    # 2. Add helper function addMinutesToISO and formatGraphNodes
    helpers = """
// Format graph nodes returned by backend to frontend state
const formatGraphNodes = (nodes) => {
  return (nodes || []).map(n => {
    let frontendStatus = 'healthy';
    if (n.status === 'AT_RISK') frontendStatus = 'delayed';
    if (n.status === 'BROKEN') frontendStatus = 'broken';

    const startTimeStr = n.start_time && n.start_time.includes('T') ? n.start_time.split('T')[1].substring(0,5) : (n.start_time || '08:00');
    const endTimeStr = n.end_time && n.end_time.includes('T') ? n.end_time.split('T')[1].substring(0,5) : (n.end_time || '09:00');

    return {
      id: n.id,
      type: (n.type || 'flight').toLowerCase(),
      title: n.title,
      sub: n.location || '',
      scheduledStart: startTimeStr,
      scheduledEnd: endTimeStr,
      actualStart: startTimeStr,
      actualEnd: endTimeStr,
      buffer: 0,
      status: frontendStatus,
      disruptionReason: '',
      delayMinutes: 0,
      info: n.location || ''
    };
  });
};

function addMinutesToISO(isoStr, mins) {
  try {
    const dt = new Date(isoStr);
    dt.setMinutes(dt.getMinutes() + mins);
    return dt.toISOString();
  } catch (e) {
    return isoStr;
  }
}
"""

    content = content.replace("// Generate unique Trip Reference", helpers + "\n// Generate unique Trip Reference")

    # 3. Update initializeSeedTrip & useEffect
    seed_logic_fixed = """
  const initializeSeedTrip = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch('http://localhost:5000/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Deccan & Hyatt Journey' })
      });
      const tripData = await res.json();
      const tripId = tripData.id;

      const seeds = [
        { 
          type: 'TRAIN', 
          title: 'Deccan Express DEC-809', 
          location: 'Platform 4 • Main Terminal', 
          start_time: `${todayStr}T08:00:00Z`, 
          end_time: `${todayStr}T11:00:00Z` 
        },
        { 
          type: 'CAB', 
          title: 'Airport/Station Cab Transfer', 
          location: 'Pickup Zone B • Uber Select', 
          start_time: `${todayStr}T11:30:00Z`, 
          end_time: `${todayStr}T12:15:00Z`,
          hard_cutoff: `${todayStr}T12:00:00Z`
        },
        { 
          type: 'HOTEL', 
          title: 'Grand Hyatt Check-In', 
          location: 'Premium Suite Room • Reception Desk', 
          start_time: `${todayStr}T13:00:00Z`, 
          end_time: `${todayStr}T23:59:59Z`,
          hard_cutoff: `${todayStr}T14:00:00Z`
        }
      ];

      for (const s of seeds) {
        const payload = {
          trip_id: tripId,
          node_type: s.type,
          title: s.title,
          location: s.location,
          start_time: s.start_time,
          end_time: s.end_time
        };
        if (s.hard_cutoff) {
          payload.hard_cutoff = s.hard_cutoff;
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
      if (formattedNodes.length > 0) {
        setSelectedDisruptNode(formattedNodes[0].id);
      }
      setTripRefNum(tripId);
    } catch (err) {
      console.error('Error seeding trip:', err);
    }
  };

  useEffect(() => {
    initializeSeedTrip();
  }, []);

  useEffect(() => {
    if (currentTrip && currentTrip.length > 0) {
      const exists = currentTrip.some(n => n.id === selectedDisruptNode);
      if (!exists || !selectedDisruptNode) {
        setSelectedDisruptNode(currentTrip[0].id);
      }
    }
  }, [currentTrip]);
"""

    old_seed_regex = r'const initializeSeedTrip = async \(\) => \{.*?\n  useEffect\(\(\) => \{\n    initializeSeedTrip\(\);\n  \}, \[\]\);'
    content = re.sub(old_seed_regex, seed_logic_fixed, content, flags=re.DOTALL)

    # 4. Update handleAddBuilderNode to store builderDate
    add_node_mock = r'const newNode = \{\n\s*id: `node-\$\{Date\.now\(\)\}-\$\{Math\.floor\(Math\.random\(\) \* 1000\)\}`,\n\s*type,\n\s*title,\n\s*sub: type === \'hotel\' \? `\$\{to\}` : `\$\{from\} → \$\{to\}`,'
    add_node_real = """const newNode = {
      id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      sub: type === 'hotel' ? `${to}` : `${from} → ${to}`,
      date: builderDate || new Date().toISOString().split('T')[0],"""
    content = re.sub(add_node_mock, add_node_real, content)

    # 5. Update handleLockJourney
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
      if (formattedNodes.length > 0) {
        setSelectedDisruptNode(formattedNodes[0].id);
      }
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
    old_lock_regex = r'const handleLockJourney = async \(\) => \{.*?\n  \};'
    content = re.sub(old_lock_regex, lock_journey_real, content, flags=re.DOTALL)

    # 6. Update triggerDisruptionCascade
    disrupt_real = """const triggerDisruptionCascade = async (nodeId, type, delayMins, reason) => {
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
      const formattedNodes = formatGraphNodes(data.updated_graph.nodes);

      const brokenCount = data.updated_graph.nodes.filter(n => n.status === 'BROKEN').length;
      const affectedCount = data.updated_graph.nodes.filter(n => n.status !== 'OK').length;

      setCurrentTrip(formattedNodes);
      setDisruptionState('disrupted');
      setImpactMetrics({
        delayMinutes: delayToApply,
        brokenConnections: brokenCount,
        affectedNodes: affectedCount
      });
    } catch (err) {
      console.error(err);
      alert('Failed to execute disruption simulation');
    }
  };

  """
    old_disrupt_regex = r'const triggerDisruptionCascade = async \(nodeId, type, delayMins, reason\) => \{.*?\n  \};\n'
    content = re.sub(old_disrupt_regex, disrupt_real, content, flags=re.DOTALL)

    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    fix_simulation_and_dates()
    print("Fixed simulation and date inputs successfully.")
