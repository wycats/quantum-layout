export class Environment {
    static default(defaultIcon) {
        return new Environment({
            icons: {
                default: defaultIcon
            },
            enabled: new Set()
        });
    }
    icon(category, icon) {
        return new Environment({
            ...this.log,
            icons: {
                ...this.log.icons,
                [category]: icon
            }
        });
    }
    enable(...categories) {
        return new Environment({
            ...this.log,
            enabled: new Set([
                ...this.log.enabled,
                ...categories
            ])
        });
    }
    getIcon(category) {
        let icons = this.log.icons;
        return icons[category] || icons.default;
    }
    trace(...args) {
        let { force , category , message  } = traceArgs(args);
        if (force || this.log.enabled.has(category) || this.log.enabled.has("*")) {
            console.log(`${this.getIcon(category)} <${category}>`, ...message);
        }
    }
    constructor(log){
        this.log = log;
    }
}
function traceArgs(args) {
    if (typeof args[0] === "boolean") {
        let [, category, ...message] = args;
        return {
            force: true,
            category,
            message
        };
    } else {
        let [category, ...message] = args;
        return {
            force: false,
            category,
            message
        };
    }
}

