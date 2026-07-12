// Port of skills/league-manager/scripts/venue_scheduler.py — same
// courts x groups x slot-length math, kept in JS for the same reason as
// roundRobin.js (one runtime, no shelling out to Python).

function parseHHMM(s) {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

function fmtHHMM(totalMinutes) {
  const tm = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(tm / 60);
  const m = tm % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function computeVenue(venue, defaultCutoffMin = 23 * 60 + 30) {
  const courts = venue.courts || 0;
  const groups = venue.groups || [];
  const slotMinutes = venue.slot_minutes || 60;
  const start = parseHHMM(venue.start_time || "18:00");

  const totalMatches = groups.reduce((sum, g) => sum + (g.matches_per_round || 0), 0);
  const slotsNeeded = courts > 0 ? Math.ceil(totalMatches / courts) : 0;
  const durationMin = slotsNeeded * slotMinutes;
  const end = start + durationMin;

  const warnings = [];
  if (courts === 0 && totalMatches > 0) {
    warnings.push(`${venue.name}: ${totalMatches} matches assigned but 0 courts recorded.`);
  }
  if (end > defaultCutoffMin) {
    warnings.push(
      `${venue.name}: schedule runs until ${fmtHHMM(end)}, past the ${fmtHHMM(defaultCutoffMin)} cutoff — ` +
        `reduce groups at this venue, add courts, or shorten the slot length.`
    );
  }

  return {
    name: venue.name,
    day: venue.day,
    courts,
    num_groups: groups.length,
    total_matches: totalMatches,
    slots_needed: slotsNeeded,
    duration_hours: Math.round((durationMin / 60) * 100) / 100,
    window: totalMatches > 0 ? `${fmtHHMM(start)}–${fmtHHMM(end)}` : "—",
    warnings,
  };
}

function checkDoubleBooking(venues) {
  const seen = new Set();
  const conflicts = [];
  for (const v of venues) {
    const key = `${v.name}__${v.day}`;
    if (seen.has(key)) {
      conflicts.push(
        `${v.name} on ${v.day} appears in more than one entry — merge into a single venue entry with all ` +
          `groups listed together so capacity is calculated correctly.`
      );
    }
    seen.add(key);
  }
  return conflicts;
}

function computeSchedule(venues, cutoff = "23:30") {
  const cutoffMin = parseHHMM(cutoff);
  const results = venues.map((v) => computeVenue(v, cutoffMin));
  const allWarnings = results.flatMap((r) => r.warnings).concat(checkDoubleBooking(venues));
  return {
    venues: results,
    total_venues: results.length,
    total_matches_all_venues: results.reduce((s, r) => s + r.total_matches, 0),
    conflicts: allWarnings,
  };
}

module.exports = { computeSchedule, computeVenue, checkDoubleBooking, fmtHHMM, parseHHMM };
