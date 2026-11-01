// Used as a default parameter value for required section data, so a section that is
// listed in config/pages.js without its data fails with a readable message at build time.
export function requireProp(type, prop, example) {
    throw new Error(
        `The "${type}" section needs a "${prop}" prop in config/pages.js, e.g. { type: '${type}', ${prop}: ${example} }`
    );
}
