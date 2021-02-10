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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvb3RzdHJhcC1zcmMvYm9vdHN0cmFwL2Vudi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIExvZ09wdGlvbnM8Q2F0ZWdvcnkgZXh0ZW5kcyBzdHJpbmc-IHtcbiAgcmVhZG9ubHkgaWNvbnM6IHsgW1AgaW4gc3RyaW5nXTogc3RyaW5nIH0gJiB7IGRlZmF1bHQ6IHN0cmluZyB9O1xuICByZWFkb25seSBlbmFibGVkOiBTZXQ8Q2F0ZWdvcnkgfCBcIipcIj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9uczxDYXRlZ29yeSBleHRlbmRzIHN0cmluZz4ge1xuICByZWFkb25seSBsb2c6IExvZ09wdGlvbnM8Q2F0ZWdvcnk-O1xufVxuXG5leHBvcnQgY2xhc3MgRW52aXJvbm1lbnQ8Q2F0ZWdvcnkgZXh0ZW5kcyBzdHJpbmc-IHtcbiAgc3RhdGljIGRlZmF1bHQ8Q2F0ZWdvcnkgZXh0ZW5kcyBzdHJpbmc-KFxuICAgIGRlZmF1bHRJY29uOiBzdHJpbmdcbiAgKTogRW52aXJvbm1lbnQ8Q2F0ZWdvcnk-IHtcbiAgICByZXR1cm4gbmV3IEVudmlyb25tZW50KHtcbiAgICAgIGljb25zOiB7XG4gICAgICAgIGRlZmF1bHQ6IGRlZmF1bHRJY29uLFxuICAgICAgfSxcbiAgICAgIGVuYWJsZWQ6IG5ldyBTZXQoKSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgbG9nOiBMb2dPcHRpb25zPENhdGVnb3J5PjtcblxuICBjb25zdHJ1Y3Rvcihsb2c6IExvZ09wdGlvbnM8Q2F0ZWdvcnk-KSB7XG4gICAgdGhpcy5sb2cgPSBsb2c7XG4gIH1cblxuICBpY29uKGNhdGVnb3J5OiBDYXRlZ29yeSwgaWNvbjogc3RyaW5nKTogRW52aXJvbm1lbnQ8Q2F0ZWdvcnk-IHtcbiAgICByZXR1cm4gbmV3IEVudmlyb25tZW50KHtcbiAgICAgIC4uLnRoaXMubG9nLFxuICAgICAgaWNvbnM6IHtcbiAgICAgICAgLi4udGhpcy5sb2cuaWNvbnMsXG4gICAgICAgIFtjYXRlZ29yeV06IGljb24sXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgZW5hYmxlKC4uLmNhdGVnb3JpZXM6IChDYXRlZ29yeSB8IFwiKlwiKVtdKTogRW52aXJvbm1lbnQ8Q2F0ZWdvcnk-IHtcbiAgICByZXR1cm4gbmV3IEVudmlyb25tZW50KHtcbiAgICAgIC4uLnRoaXMubG9nLFxuICAgICAgZW5hYmxlZDogbmV3IFNldChbLi4udGhpcy5sb2cuZW5hYmxlZCwgLi4uY2F0ZWdvcmllc10pLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRJY29uKGNhdGVnb3J5OiBDYXRlZ29yeSk6IHN0cmluZyB7XG4gICAgbGV0IGljb25zID0gdGhpcy5sb2cuaWNvbnM7XG4gICAgcmV0dXJuIGljb25zW2NhdGVnb3J5XSB8fCBpY29ucy5kZWZhdWx0O1xuICB9XG5cbiAgdHJhY2UoXG4gICAgLi4uYXJnczpcbiAgICAgIHwgW2NhdGVnb3J5OiBDYXRlZ29yeSwgLi4ubWVzc2FnZTogdW5rbm93bltdXVxuICAgICAgfCBbZm9yY2U6IHRydWUsIGNhdGVnb3J5OiBDYXRlZ29yeSwgLi4ubWVzc2FnZTogdW5rbm93bltdXVxuICApOiB2b2lkIHtcbiAgICBsZXQgeyBmb3JjZSwgY2F0ZWdvcnksIG1lc3NhZ2UgfSA9IHRyYWNlQXJncyhhcmdzKTtcblxuICAgIGlmIChmb3JjZSB8fCB0aGlzLmxvZy5lbmFibGVkLmhhcyhjYXRlZ29yeSkgfHwgdGhpcy5sb2cuZW5hYmxlZC5oYXMoXCIqXCIpKSB7XG4gICAgICBjb25zb2xlLmxvZyhgJHt0aGlzLmdldEljb24oY2F0ZWdvcnkpfSA8JHtjYXRlZ29yeX0-YCwgLi4ubWVzc2FnZSk7XG4gICAgfVxuICB9XG59XG5cbnR5cGUgVHJhY2VBcmdzPENhdGVnb3J5IGV4dGVuZHMgc3RyaW5nPiA9XG4gIHwgW2NhdGVnb3J5OiBDYXRlZ29yeSwgLi4ubWVzc2FnZTogdW5rbm93bltdXVxuICB8IFtmb3JjZTogdHJ1ZSwgY2F0ZWdvcnk6IENhdGVnb3J5LCAuLi5tZXNzYWdlOiB1bmtub3duW11dO1xuXG5mdW5jdGlvbiB0cmFjZUFyZ3M8Q2F0ZWdvcnkgZXh0ZW5kcyBzdHJpbmc-KGFyZ3M6IFRyYWNlQXJnczxDYXRlZ29yeT4pIHtcbiAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSBcImJvb2xlYW5cIikge1xuICAgIGxldCBbLCBjYXRlZ29yeSwgLi4ubWVzc2FnZV0gPSBhcmdzIGFzIFtcbiAgICAgIGZvcmNlOiB0cnVlLFxuICAgICAgY2F0ZWdvcnk6IENhdGVnb3J5LFxuICAgICAgLi4ubWVzc2FnZTogdW5rbm93bltdXG4gICAgXTtcblxuICAgIHJldHVybiB7IGZvcmNlOiB0cnVlLCBjYXRlZ29yeSwgbWVzc2FnZSB9O1xuICB9IGVsc2Uge1xuICAgIGxldCBbY2F0ZWdvcnksIC4uLm1lc3NhZ2VdID0gYXJncyBhcyBbXG4gICAgICBjYXRlZ29yeTogQ2F0ZWdvcnksXG4gICAgICAuLi5tZXNzYWdlOiB1bmtub3duW11cbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGZvcmNlOiBmYWxzZSxcbiAgICAgIGNhdGVnb3J5LFxuICAgICAgbWVzc2FnZSxcbiAgICB9O1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6ImFBU0EsV0FBQTtXQUNBLE9BQUEsQ0FDQSxXQUFBO21CQUVBLFdBQUE7QUFDQSxpQkFBQTtBQUNBLHVCQUFBLEVBQUEsV0FBQTs7QUFFQSxtQkFBQSxNQUFBLEdBQUE7OztBQVVBLFFBQUEsQ0FBQSxRQUFBLEVBQUEsSUFBQTttQkFDQSxXQUFBO29CQUNBLEdBQUE7QUFDQSxpQkFBQTt3QkFDQSxHQUFBLENBQUEsS0FBQTtpQkFDQSxRQUFBLEdBQUEsSUFBQTs7OztBQUtBLFVBQUEsSUFBQSxVQUFBO21CQUNBLFdBQUE7b0JBQ0EsR0FBQTtBQUNBLG1CQUFBLE1BQUEsR0FBQTt3QkFBQSxHQUFBLENBQUEsT0FBQTttQkFBQSxVQUFBOzs7O0FBSUEsV0FBQSxDQUFBLFFBQUE7WUFDQSxLQUFBLFFBQUEsR0FBQSxDQUFBLEtBQUE7ZUFDQSxLQUFBLENBQUEsUUFBQSxLQUFBLEtBQUEsQ0FBQSxPQUFBOztBQUdBLFNBQUEsSUFDQSxJQUFBO2NBSUEsS0FBQSxHQUFBLFFBQUEsR0FBQSxPQUFBLE1BQUEsU0FBQSxDQUFBLElBQUE7WUFFQSxLQUFBLFNBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxVQUFBLEdBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsU0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLEVBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQSxNQUFBLE9BQUE7OztnQkFsQ0EsR0FBQTthQUNBLEdBQUEsR0FBQSxHQUFBOzs7U0EwQ0EsU0FBQSxDQUFBLElBQUE7ZUFDQSxJQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUE7ZUFDQSxRQUFBLEtBQUEsT0FBQSxJQUFBLElBQUE7O0FBTUEsaUJBQUEsRUFBQSxJQUFBO0FBQUEsb0JBQUE7QUFBQSxtQkFBQTs7O2FBRUEsUUFBQSxLQUFBLE9BQUEsSUFBQSxJQUFBOztBQU1BLGlCQUFBLEVBQUEsS0FBQTtBQUNBLG9CQUFBO0FBQ0EsbUJBQUEifQ==