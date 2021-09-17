/**
 * Init command module
 *
 * @packageDocumentation
 */
/// <reference types="minimist" />
export declare const dev: {
    command: () => Promise<void>;
    server: () => void;
    client: (args?: import("minimist").ParsedArgs | undefined) => void;
};
