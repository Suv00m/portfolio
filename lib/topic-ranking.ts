import { NewsTopic } from './reddit';

function engagementRate(topic: NewsTopic): number {
  const now = Date.now() / 1000;
  const ageHours = Math.max((now - topic.created_utc) / 3600, 1);
  return (topic.score + topic.num_comments * 2) / ageHours;
}

// Interleaves each source's own top candidates (round-robin by rank) instead of one
// global sort. Papers and Reddit have a much lower engagement scale than Hacker News,
// so a single combined sort always fills every slot with HN and starves the rest.
export function selectTopTopics(topicsBySource: NewsTopic[][], count: number): NewsTopic[] {
  const rankedBySource = topicsBySource
    .filter((topics) => topics.length > 0)
    .map((topics) => [...topics].sort((a, b) => engagementRate(b) - engagementRate(a)));

  const picked: NewsTopic[] = [];
  for (let round = 0; picked.length < count && rankedBySource.some((r) => r[round]); round++) {
    for (const ranked of rankedBySource) {
      if (picked.length >= count) break;
      if (ranked[round]) picked.push(ranked[round]);
    }
  }
  return picked;
}
