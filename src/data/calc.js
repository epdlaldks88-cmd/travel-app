/**
 * 부모 자체 비용 + 모든 자식 비용의 합
 * @param {Object} parent - useActivities()가 반환하는 부모 (children 포함)
 * @param {Array} [children] - 명시적으로 넘길 경우 우선 사용
 * @returns {number}
 */
export function calcActivityTotal(parent, children) {
  const kids = children ?? parent?.children ?? [];
  const parentCost = Number(parent?.cost) || 0;
  const childrenCost = kids.reduce((sum, c) => sum + (Number(c.cost) || 0), 0);
  return parentCost + childrenCost;
}

/**
 * 부모 카드에 "총 비용" 배지를 보여줄지 판단
 * (자식 중 비용 > 0 이 하나라도 있을 때 true)
 */
export function hasChildrenCost(parent) {
  const kids = parent?.children ?? [];
  return kids.some((c) => Number(c.cost) > 0);
}

/**
 * Trip 전체 비용 (모든 부모 활동의 총합)
 */
export function calcTripTotal(activities) {
  if (!activities?.length) return 0;
  return activities.reduce((sum, parent) => sum + calcActivityTotal(parent), 0);
}
