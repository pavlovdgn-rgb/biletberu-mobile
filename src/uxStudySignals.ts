/** Result signals contain no names, contact details or payment data. */
export type StudySignal = 'nearby_activity_opened' | 'activity_favourited' | 'two_theatre_tickets_purchased' | 'planning_opened' | 'favourite_added_to_plan';
export function emitStudySignal(value: StudySignal) {
  window.dispatchEvent(new CustomEvent('ux-success-signal', { detail: { kind: 'prototype_event', value } }));
}

type Evidence = {
  favourites: string[];
  plans: Record<string, string[]>;
};
/** Compare committed states; opening a screen or removing an item is not success. */
export function committedStudySignals(before: Evidence, after: Evidence): StudySignal[] {
  const signals: StudySignal[] = [];
  if (after.favourites.some(id => id.startsWith('place:') && !before.favourites.includes(id))) signals.push('activity_favourited');
  if (Object.entries(after.plans).some(([day, ids]) => ids.some(id => !id.startsWith('event:') && after.favourites.includes(`place:${id}`) && !(before.plans[day] ?? []).includes(id)))) signals.push('favourite_added_to_plan');
  return signals;
}
