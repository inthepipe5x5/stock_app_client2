export const defaultIrregulars: { [key: string]: string } = {
    analysis: "analyses",
    antenna: "antennae",
    appendix: "appendices",
    bacterium: "bacteria",
    cactus: "cacti",
    child: "children",
    crisis: "crises",
    curriculum: "curricula",
    datum: "data",
    deer: "deer",
    die: "dice",
    fish: "fish",
    focus: "foci",
    formula: "formulae",
    foot: "feet",
    fungus: "fungi",
    goose: "geese",
    knife: "knives",
    leaf: "leaves",
    life: "lives",
    loaf: "loaves",
    man: "men",
    matrix: "matrices",
    moose: "moose",
    mouse: "mice",
    nucleus: "nuclei",
    ox: "oxen",
    person: "people",
    phenomenon: "phenomena",
    self: "selves",
    sheep: "sheep",
    stimulus: "stimuli",
    syllabus: "syllabi",
    thief: "thieves",
    tooth: "teeth",
    vertex: "vertices",
    wife: "wives",
    wolf: "wolves",
    woman: "women",
};

/**
 * Pluralizes a given word based on English language rules and irregular word exceptions.
 *
 * @param {string} word - The word to be pluralized.
 * @param {Object} [irregularWordObj={}] - An optional object containing irregular word mappings.
 * @returns {string} - The pluralized form of the input word.
 *
 * @example
 * // Regular pluralization
 * pluralizeStr('cat'); // returns 'cats'
 * pluralizeStr('bus'); // returns 'buses'
 * pluralizeStr('baby'); // returns 'babies'
 * pluralizeStr('leaf'); // returns 'leaves'
 *
 * // Irregular pluralization
 * const irregulars = { mouse: 'mice', person: 'people' };
 * pluralizeStr('mouse', irregulars); // returns 'mice'
 */
export const pluralizeStr = (word: string, irregularWordObj: { [key: string]: string } = {}): string => {
    // merge any with special cases with the default exceptions
    const irregulars = { ...defaultIrregulars, ...irregularWordObj };

    // Check for irregular plurals first
    if (irregulars[word.toLowerCase()]) {
        return irregulars[word.toLowerCase()];
    }

    // Rules for regular plurals
    if (
        word.toLowerCase().endsWith("s") ||
        word.toLowerCase().endsWith("ss") ||
        word.toLowerCase().endsWith("sh") ||
        word.toLowerCase().endsWith("ch") ||
        word.toLowerCase().endsWith("x") ||
        word.toLowerCase().endsWith("o")
    ) {
        return word + "es";
    } else if (
        word.toLowerCase().endsWith("y") &&
        !["a", "e", "i", "o", "u"].includes(word[word.length - 2])
    ) {
        return word.slice(0, -1) + "ies";
    } else if (word.toLowerCase().endsWith("f")) {
        return word.slice(0, -1) + "ves";
    } else if (word.toLowerCase().endsWith("fe")) {
        return word.slice(0, -2) + "ves";
    } else {
        return word + "s";
    }
};

/**
 * Singularizes a given word based on English language rules and irregular word exceptions.
 *
 * @param {string} word - The word to be singularized.
 * @param {Object} [irregularWordObj={}] - An optional object containing irregular word mappings.
 * @returns {string} - The singularized form of the input word.
 *
 * @example
 * // Regular singularization
 * singularizeStr('cats'); // returns 'cat'
 * singularizeStr('buses'); // returns 'bus'
 * singularizeStr('babies'); // returns 'baby'
 * singularizeStr('leaves'); // returns 'leaf'
 *
 * // Irregular singularization
 * const irregulars = { mice: 'mouse', people: 'person' };
 * singularizeStr('mice', irregulars); // returns 'mouse'
 */
export const singularizeStr = (word: string, irregularWordObj: { [key: string]: string } = {}): string => {
    // merge any with special cases with the default exceptions
    const irregulars = { ...defaultIrregulars, ...irregularWordObj };

    // Create a reverse mapping for irregular plurals
    const reverseIrregulars = Object.entries(irregulars).reduce(
        (acc: { [key: string]: string }, [singular, plural]) => {
            acc[plural] = singular;
            return acc;
        },
        {}
    );

    // Check for irregular singulars first
    if (reverseIrregulars[word.toLowerCase()]) {
        return reverseIrregulars[word.toLowerCase()];
    }

    // Rules for regular singulars
    if (word.toLowerCase().endsWith("ies")) {
        return word.slice(0, -3) + "y";
    } else if (word.toLowerCase().endsWith("es")) {
        if (
            word.toLowerCase().endsWith("ses") ||
            word.toLowerCase().endsWith("shes") ||
            word.toLowerCase().endsWith("ches") ||
            word.toLowerCase().endsWith("xes") ||
            word.toLowerCase().endsWith("oes")
        )
            return word.slice(0, -2);
    } else if (word.toLowerCase().endsWith("ves")) {
        if (
            word.toLowerCase().endsWith("lves") ||
            word.toLowerCase().endsWith("rves") ||
            word.toLowerCase().endsWith("nives") ||
            word.toLowerCase().endsWith("wives")
        ) {
            return word.slice(0, -3) + "f";
        } else {
            return word.slice(0, -3) + "fe";
        }
    } else if (word.toLowerCase().endsWith("s")) {
        return word.slice(0, -1);
    } else {
        return word;
    }
    return word; // default return statement
};

// // Example use cases
// console.log(pluralizeStr("cat")); // cats
// console.log(pluralizeStr("bus")); // buses
// console.log(pluralizeStr("baby")); // babies
// console.log(pluralizeStr("leaf")); // leaves
// console.log(pluralizeStr("child")); // children
// console.log(pluralizeStr("goose")); // geese

// console.log(singularizeStr("cats")); // cat
// console.log(singularizeStr("buses")); // bus
// console.log(singularizeStr("leaves")); // leaf
// console.log(singularizeStr("babies", {})); // baby
// console.log(singularizeStr("capilliaries", {})); // capilliary
// console.log(singularizeStr("children")); // child
// console.log(singularizeStr("geese")); // goose

