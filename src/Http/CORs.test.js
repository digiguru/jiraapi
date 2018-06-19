import {isOriginAllowed} from './CORs';

describe("Allowed Headers", () => {

    it("allows whitelisted domains", () => {
        const output = isOriginAllowed("http://localhost");
        expect(output).toBe(true);
    });

    const passingOrigins = [
        {args: "http://localhost", expected: true},
        {args: "http://localhost:4000", expected: true},
        {args: "https://localhost", expected: true},
        {args: "https://localhost:4000", expected: true},
        {args: "http://im-jira-import.herokuapp.com", expected: true},
        {args: "https://im-jira-import.herokuapp.com", expected: true}
    ];

    passingOrigins.forEach(function(test) {
        it("allows " + test.args + " domain", () => {
            const output = isOriginAllowed(test.args);
            expect(output).toBe(test.expected);
        });
    });

    const failingOrigins = [
        {args: "http://hacker", expected: false},
        {args: "http://localhost:4001", expected: false},
        {args: "https://immediate.co.uk", expected: false}
    ];

    failingOrigins.forEach(function(test) {
        it("disallows " + test.args + " domain", () => {
            const output = isOriginAllowed(test.args);
            expect(output).toBe(test.expected);
        });
    });

});
  