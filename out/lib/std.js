/**
 * Return the maximum possible threads given a script RAM requirement and available server RAM.
 * @remarks
 * RAM cost: 0 GB
 *
 * @param {number} available - Available server RAM.
 * @param {number} required - Script RAM requirement.
 * @returns {number} Maximum usable threads.
 */
export function max_threads(available, required) {
  return Math.floor(available / required);
}
