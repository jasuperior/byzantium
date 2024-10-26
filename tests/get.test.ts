import { Get, Is, Assert } from "..";

namespace GetTests {
    namespace TypeString {
        type TypeString = Get.TypeString<{ a: 1; b: "2" }>;
        type Expected = "Record<string, string>" | "Record<string, number>";
        type TestTypeString = Assert<
            //    ^?
            Is<TypeString, Expected>,
            "Should provide a string representation of the type"
        >;

        const GenericFunction = <T, U>(
            value: T,
            arg: {
                type: Get.TypeString<T>;
            }
        ) => {};

        //@ts-expect-error: should match the type name
        const invalid = GenericFunction(3, { type: 3 });
        const valid = GenericFunction(3, { type: "number" });
    }
}
