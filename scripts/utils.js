// @ts-check

const WAIT_TIMEOUT = 50;

/**
 * @template T
 * @param {() => T} predicate
 * @returns {Promise<T>}
 */
async function waitUntil(predicate) {
    return new Promise(resolve => {
        function testCondition() {
            const result = predicate();
            
            if (result) {
                resolve(result);
            } else {
                setTimeout(() => testCondition(), WAIT_TIMEOUT);
            }
        }

        testCondition();
    })
}
