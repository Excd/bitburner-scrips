/**
 * Prints the partition value of the number passed as the first arg, the second arg restricts component numbers.
 * A partition is the amount of ways to write a number as a sum of positive integers (or components).
 * 
 * @author excd
 * @param {NS} ns Netscript environment.
**/
export async function main(ns) {
	//	Help flag message.
	if (ns.flags([["help", false]]).help) {
		ns.tprint("This script calculates a partition value of number N with component number restriction M.");
		ns.tprint(`Usage: run ${ns.getScriptName()} N M`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} 4 3`);
		return;
	}

	const count = await p(ns.args[0], ns.args[1]);	//	Calculate partition value with passed args.
	ns.tprint(`Partition count: ${count}`);			//	Print output to terminal.
}

/**
 * Recursively counts the number of ways of representing n as a distinct sum of positive integers <= m.
 * Based on the following Wikipedia example algorithm: 
 * https://en.wikipedia.org/w/index.php?title=Partition_(number_theory)&oldid=682278876#Algorithm
 * 
 * @remarks RAM cost: 0 GB
 * @param {number} n Number to sum to.
 * @param {number} m Restriction on the component numbers.
 * @returns {number} Partition value.
**/
async function p(n, m) {
	//	Recursion stopper.
	if (n <= 1) {
		return 1;
	}

	//	Components greater than n do not contribute.
	if (m > n) {
		return await p(n, n);
	}

	//	Recursively calculate partition value.
	let pVal = 0;
	for (let k = 1; k <= m; k++) {
		pVal += await p(n - k, k);
	}
	return pVal;	//	Return partition value.
}