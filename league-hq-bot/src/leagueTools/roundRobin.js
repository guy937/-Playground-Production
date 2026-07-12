// Port of skills/league-manager/scripts/round_robin.py — same circle-method
// algorithm, kept in JS so the bot can call it directly with no Python
// runtime needed on the host. Keep this in sync if the Python script changes.

function generateSingleRoundRobin(participants) {
  const people = [...participants];
  let bye = false;
  if (people.length % 2 === 1) {
    people.push(null); // BYE
    bye = true;
  }

  const n = people.length;
  const rounds = [];
  const fixed = people[0];
  let rest = people.slice(1);

  for (let r = 0; r < n - 1; r++) {
    const current = [fixed, ...rest];
    const matches = [];
    let roundBye = null;
    for (let i = 0; i < n / 2; i++) {
      const a = current[i];
      const b = current[n - 1 - i];
      if (a === null) roundBye = b;
      else if (b === null) roundBye = a;
      else matches.push(r % 2 === 0 ? [a, b] : [b, a]);
    }
    rounds.push({ round: r + 1, matches, bye: roundBye });
    rest = [rest[rest.length - 1], ...rest.slice(0, -1)];
  }

  return { rounds, bye };
}

function doubleRoundRobin(rounds, numRoundsFirstLeg) {
  const secondLeg = rounds.map((rnd) => ({
    round: rnd.round + numRoundsFirstLeg,
    matches: rnd.matches.map(([a, b]) => [b, a]),
    bye: rnd.bye,
  }));
  return [...rounds, ...secondLeg];
}

function buildFixtures(participants, { double = false } = {}) {
  const { rounds: baseRounds, bye } = generateSingleRoundRobin(participants);
  const rounds = double ? doubleRoundRobin(baseRounds, baseRounds.length) : baseRounds;
  return {
    participants,
    has_bye_round: bye,
    num_participants: participants.length,
    matches_per_round: Math.floor(participants.length / 2),
    total_rounds: rounds.length,
    rounds,
  };
}

// Multiple groups at once: groups = [{group: "Bayit 1", participants: [...]}]
function buildFixturesForGroups(groups, opts) {
  return groups.map((g) => ({ group: g.group, ...buildFixtures(g.participants, opts) }));
}

module.exports = { buildFixtures, buildFixturesForGroups, generateSingleRoundRobin, doubleRoundRobin };
