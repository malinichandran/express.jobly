const { sqlForPartialUpdate } = require("./sql")

describe("sqlForPartialUpdate", function(){
    test("works: 1 item", function(){
        const result = sqlForPartialUpdate(
            { col1: "val1" },
            { col1: "col1", col2: "col2"});
        
        expect(result).toEqual({
            setCols: "\"col1\"=$1",
            values: ["val1"],
        });
    });

    test("works: 2 items", function(){
        const result = sqlForPartialUpdate(
            {col1 : "val1", col2: "val2"},
            { col2: "col2" }
        );
        expect(result).toEqual({
            setCols: "\"col1\"=$1, \"col2\"=$2",
            values: ["val1", "val2"],
        });
    });
});