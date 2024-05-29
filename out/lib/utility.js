export const PREFIX = {
  ERROR: 'ERROR!',
  SUCCESS: 'SUCCESS!',
  WARN: 'WARN:',
  INFO: 'INFO:',
};

/**
 * Print message to console.
 * @remarks
 * RAM cost: 0.0 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {string} message - Message to log.
 * @param {PREFIX} prefix - Message prefix. Determines message color. Default INFO.
 */
export function print(ns, message, prefix = PREFIX.INFO) {
  ns.tprint(`${prefix} ${message}`);
}
