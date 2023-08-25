/**
 * Return the first element of specified port data as an array.
 * @remarks
 * RAM cost: 0 GB
 *
 * Element is not removed from the port. Array data must be space delimited.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 * @returns {string[]} Port data array.
 */
export function peek_port_array(ns, portNumber) {
  return ns.peek(portNumber).trim().replace('NULL PORT DATA', '').split(' ');
}

/**
 * Return the first element of specified port as an array and remove it.
 * @remarks
 * RAM cost: 0 GB
 *
 * Element is removed from the port. Array data must be space delimited.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 * @returns {string[]} Port data array.
 */
export function read_port_array(ns, portNumber) {
  return ns.readPort(portNumber).trim().replace('NULL PORT DATA', '').split(' ');
}

/**
 * Write an array to the specified port.
 * @remarks
 * RAM cost: 0 GB
 *
 * Array data must be space delimited.
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 * @param {string[]} array - Array to write.
 */
export function write_port_array(ns, portNumber, array) {
  ns.writePort(portNumber, array.join(' ').trim(), 'w');
}

/**
 * Push an element to the end of the specified port array.
 * @remarks
 * RAM cost: 0 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 * @param {string} element - Element to push.
 */
export function push_port_array_element(ns, portNumber, element) {
  const array = read_port_array(ns, portNumber);
  array.push(element);
  write_port_array(ns, portNumber, array);
}

/**
 * Delete an element from the specified port array.
 * @remarks
 * RAM cost: 0 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 * @param {string} element - Element to delete.
 */
export function delete_port_array_element(ns, portNumber, element) {
  write_port_array(
    ns,
    portNumber,
    read_port_array(ns, portNumber).filter((x) => x !== element)
  );
}

/**
 * Clear the specified port array.
 * @remarks
 * RAM cost: 0 GB
 *
 * @param {import('@ns').NS} ns - Netscript environment.
 * @param {number} portNumber - Port number.
 */
export function clear_port_array(ns, portNumber) {
  ns.readPort(portNumber);
}
