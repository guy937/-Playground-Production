// Port of skills/league-manager/scripts/standings.py — same points-table
// logic (win/draw/loss points + head-to-head tiebreak), kept in JS.

function buildStandings(matches, pointsWin = 3, pointsDraw = 1, pointsLoss = 0) {
  const groups = {}; // group -> { teamName -> stats }
  const h2hPoints = {}; // group -> "a__b" -> points a earned vs b

  function ensureTeam(group, team) {
    if (!groups[group]) groups[group] = {};
    if (!groups[group][team]) {
      groups[group][team] = { played: 0, won: 0, drawn: 0, lost: 0, for: 0, against: 0, points: 0 };
    }
    return groups[group][team];
  }

  for (const m of matches) {
    const grp = m.group || "default";
    const { a, b, score_a: sa, score_b: sb } = m;
    const ta = ensureTeam(grp, a);
    const tb = ensureTeam(grp, b);
    ta.played += 1; tb.played += 1;
    ta.for += sa; ta.against += sb;
    tb.for += sb; tb.against += sa;

    if (!h2hPoints[grp]) h2hPoints[grp] = {};

    if (sa > sb) {
      ta.won += 1; ta.points += pointsWin;
      tb.lost += 1; tb.points += pointsLoss;
      h2hPoints[grp][`${a}__${b}`] = 3;
    } else if (sb > sa) {
      tb.won += 1; tb.points += pointsWin;
      ta.lost += 1; ta.points += pointsLoss;
      h2hPoints[grp][`${b}__${a}`] = 3;
    } else {
      ta.drawn += 1; tb.drawn += 1;
      ta.points += pointsDraw; tb.points += pointsDraw;
    }
  }

  const output = {};
  for (const grp of Object.keys(groups)) {
    const rows = Object.entries(groups[grp]).map(([team, t]) => ({
      team,
      ...t,
      diff: t.for - t.against,
    }));

    const h2hScore = (row) =>
      rows.reduce((sum, other) => {
        if (other.team === row.team) return sum;
        return sum + (h2hPoints[grp]?.[`${row.team}__${other.team}`] || 0);
      }, 0);

    rows.sort((r1, r2) => {
      if (r2.points !== r1.points) return r2.points - r1.points;
      if (r2.diff !== r1.diff) return r2.diff - r1.diff;
      if (r2.for !== r1.for) return r2.for - r1.for;
      const h2hDiff = h2hScore(r2) - h2hScore(r1);
      if (h2hDiff !== 0) return h2hDiff;
      return r1.team.localeCompare(r2.team);
    });

    rows.forEach((r, i) => { r.rank = i + 1; });
    output[grp] = rows;
  }

  return output;
}

module.exports = { buildStandings };
