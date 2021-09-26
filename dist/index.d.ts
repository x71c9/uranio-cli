declare const _default: {
    init: (root: string, repo: "trx" | "core" | "api" | "adm", options: Partial<import("./types").Options>) => Promise<void>;
    transpose: (root: string, filepath?: string | undefined, options?: Partial<import("./types").Options> | undefined) => void;
    alias: (options?: Partial<import("./types").Options> | undefined) => void;
    hooks: (options?: Partial<import("./types").Options> | undefined) => void;
    build: (root: string, options?: Partial<import("./types").Options> | undefined) => Promise<void>;
};
export default _default;
