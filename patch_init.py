import re

def patch_init():
    with open('src/App.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update React import
    content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';")

    # 2. Add initializeSeedTrip and useEffect right after translation helper t
    seed_logic = """
  const initializeSeedTrip = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Deccan & Hyatt Journey' })
      });
      const tripData = await res.json();
      const tripId = tripData.id;

      const seeds = [
        { type: 'TRAIN', title: 'Deccan Express DEC-809', location: 'Platform 4 • Main Terminal', start_time: '2026-08-31T08:00:00Z', end_time: '2026-08-31T11:00:00Z' },
        { type: 'CAB', title: 'Airport/Station Cab Transfer', location: 'Pickup Zone B • Uber Select', start_time: '2026-08-31T11:30:00Z', end_time: '2026-08-31T12:15:00Z' },
        { type: 'HOTEL', title: 'Grand Hyatt Check-In', location: 'Premium Suite Room • Reception Desk', start_time: '2026-08-31T13:00:00Z', end_time: '2026-08-31T23:59:59Z' }
      ];

      for (const s of seeds) {
        await fetch('http://localhost:5000/api/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trip_id: tripId,
            node_type: s.type,
            title: s.title,
            location: s.location,
            start_time: s.start_time,
            end_time: s.end_time
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
      setTripRefNum(tripId);
    } catch (err) {
      console.error('Error seeding trip:', err);
    }
  };

  useEffect(() => {
    initializeSeedTrip();
  }, []);
"""

    content = content.replace("const t = (key) => {\n    return TRANSLATIONS[currentLanguage][key] || TRANSLATIONS['en'][key] || key;\n  };", "const t = (key) => {\n    return TRANSLATIONS[currentLanguage][key] || TRANSLATIONS['en'][key] || key;\n  };\n" + seed_logic)

    # 3. Update handleResetJourney
    reset_mock = r'const handleResetJourney = \(\) => \{\s*setCurrentTrip\(seedInitialTripNodes\(\)\);\s*setDisruptionState\(\'healthy\'\);\s*setImpactMetrics\(\{ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 \}\);\s*\};'
    reset_real = """const handleResetJourney = () => {
    initializeSeedTrip();
    setDisruptionState('healthy');
    setImpactMetrics({ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 });
  };"""
    content = re.sub(reset_mock, reset_real, content)

    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    patch_init()
    print("Patched init seed successfully.")
