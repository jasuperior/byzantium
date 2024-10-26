/**
 * @fileoverview Byzantium - A compile-time type assertion library for TypeScript
 * @author Super Ja 64
 * @version 0.1.0
 */

/** Symbol used to store the reason for type exceptions */
declare const Reason: unique symbol;
/** Symbol used to store additional data for type exceptions */
declare const Data: unique symbol;
/** Type alias for the Reason symbol type */
type Type = typeof Reason;
/** Type alias for the Data symbol type */
type Data = typeof Data;

/**
 * Represents a type-level exception with an error message and optional data
 * @template Message - The error message type (string or symbol)
 * @template Data - Optional additional data about the error
 * @example
 * type MyException = Exception<"Invalid user data", { expected: UserType }>;
 */
export type Exception<Message extends string | symbol, Data = Is.Nothing> = {
    [Reason]: Message;
    [Data]: Data;
};
/**
 * Performs compile-time type assertions with custom error messages
 * @template Test - The type condition to test
 * @template Message - The error message if the test fails
 * @template OnSuccess - The return type if the test passes (defaults to Test)
 * @template Data - Optional additional data about the error
 * @example
 * type ValidUser = Assert<
 *   Is<User, { id: string; name: string }>,
 *   "Invalid user shape"
 * >;
 */
export type Assert<
    Test,
    Message extends string | symbol = Is.Fail,
    OnSuccess = Test,
    Data = Is.Nothing
> = Test extends Is.Fail ? Exception<Message, Data> : OnSuccess;
export namespace Assert {
    /**
     * Marks unimplemented code paths with a TODO message
     * @template Message - Custom TODO message
     * @example
     * type Implementation = Assert.Todo<"Implement user validation">;
     */
    export type Todo<
        Message extends string = "Code path not yet implemented!"
    > = Exception<`TODO: ${Message}`>;

    /**
     * Marks unreachable code paths with a PANIC message
     * @template Message - Custom panic message
     * @example
     * type Unreachable = Assert.Panic<"This should never happen">;
     */
    export type Panic<
        Message extends string = "Code path should not be reachable!"
    > = Exception<`PANIC: ${Message}`>;
}

export namespace Type {
    // export type
    export type Function =
        | ((...args: any) => any)
        | (new (...args: any) => any);
    export type Arguments<T extends Function> = T extends (
        ...args: infer Args
    ) => any
        ? Args
        : T extends new (...args: infer Args) => any
        ? Args
        : never;
    export type Return<T extends Function> = T extends (
        ...args: any
    ) => infer Ret
        ? Ret
        : T extends new (...args: any) => infer Ret
        ? Ret
        : never;
}

/**
 * Performs a logical AND operation on two type conditions
 * @template A - First condition
 * @template B - Second condition
 * @example
 * type IsValidUser = And<Is<User, BaseUser>, Has<User, 'id'>>;
 */
export type And<A = Is.Fail, B = Is.Fail> = A & B extends Is.Fail
    ? Is.Fail
    : Is.Success;

/**
 * Performs a logical OR operation on two type conditions
 * @template A - First condition
 * @template B - Second condition
 * @example
 * type IsNumberOrString = Or<Is<T, number>, Is<T, string>>;
 */
export type Or<A, B> = A | B extends Is.Fail ? Is.Fail : Is.Success;

/**
 * Performs a logical NOR operation on two type conditions
 * @template A - First condition
 * @template B - Second condition
 */
export type Nor<A, B> = Is.Not<Or<A, B>>;

/**
 * Performs a logical NAND operation on two type conditions
 * @template A - First condition
 * @template B - Second condition
 */
export type Nand<A, B> = Is.Not<And<A, B>>;

/**
 * Type-level if-then-else statement
 * @template Condition - The condition to test
 * @template Success - The type to return if condition is true
 * @template Fail - The type to return if condition is false
 * @example
 * type Result = If<IsAdmin, AdminDashboard, UserDashboard>;
 */
export type If<Condition, Success, Fail = Is.Fail> = Condition extends Is.Fail
    ? Fail
    : Success;
/**
 * Type-level switch statement
 * @template Test - The value to test
 * @template Cases - Object mapping test values to result types
 * @example
 * type Response = Switch<UserRole, {
 *   admin: AdminResponse;
 *   user: UserResponse;
 *   guest: GuestResponse;
 * }>;
 */
export type Switch<Test, Cases> = If<
    Is.On<Cases, Test>,
    Get.Member<Cases, Test>
>;

/**
 * Checks if two types are exactly equal
 * @template Actual - The type to check
 * @template Expected - The type to check against
 * @example
 * type CheckType = Is<string, string>; // Is.Success
 */
export type Is<Actual, Expected> = [Expected, Actual] extends [Actual, Expected]
    ? Is.Success
    : Is.Fail;
export namespace Is {
    /** Represents a failed type check */
    export declare const Fail: unique symbol;
    export type Fail = typeof Fail;

    /** Represents a successful type check */
    export declare const Success: unique symbol;
    export type Success = typeof Success;

    /** Represents no data in an Exception */
    export declare const Nothing: unique symbol;
    export type Nothing = typeof Nothing;

    /** Union type of possible assertion results */
    export type Attempt = Success | Fail;

    /**
     * Alternative syntax for type equality check
     * @template A - First type
     * @template B - Second type
     */
    export type Eq<A, B> = Is<A, B>;

    /**
     * Inverts a type check result
     * @template Attempt - The result to invert
     * @example
     * type NotString = Is.Not<Is<T, string>>;
     */
    export type Not<Attempt> = Attempt extends Fail ? Success : Fail;
    export namespace Not {
        export type In<Parent, Member> = Not<Is.In<Parent, Member>>;
        export type On<Parent, Key> = Not<Is.On<Parent, Key>>;
        export type From<Funct extends Type.Function, Ret> = Not<
            Is.From<Funct, Ret>
        >;
        export type For<Funct extends Type.Function, Args> = Not<
            Is.For<Funct, Args>
        >;
    }

    /**
     * Checks if all type checks in an array pass
     * @template Attempts - Array of type check results
     * @example
     * type AllValid = Is.All<[
     *   Is<User, BaseUser>,
     *   Is.On<User, 'id'>,
     *   Is.On<User, 'name'>
     * ]>;
     */
    export type All<Attempts extends Is.Attempt[] = []> = Attempts extends [
        infer Head,
        ...infer Tail
    ]
        ? Tail extends Is.Attempt[]
            ? And<Head, All<Tail>>
            : And<Head, All<[]>>
        : Attempts[To.Number<keyof Attempts>];
    /**
     * Checks if any type check in an array passes
     * @template Attempts - Array of type check results
     */
    export type Any<Attempts extends Is.Attempt[] = []> = Attempts extends [
        infer Head,
        ...infer Tail
    ]
        ? Tail extends Is.Attempt[]
            ? Or<Head, All<Tail>>
            : Or<Head, All<[]>>
        : Attempts[To.Number<keyof Attempts>];

    export type None<Attempts extends Is.Attempt[] = []> = Not<All<Attempts>>;
    export type Neither<Attempts extends Is.Attempt[] = []> = Not<
        Any<Attempts>
    >;

    /**
     * Checks if a type has a specific member/property
     * @template Parent - The type to check
     * @template Member - The member to look for
     * @example
     * type HasId = Is.On<User, 'id'>;
     */
    export type On<Parent, Member> = Member extends keyof Parent
        ? Success
        : Parent extends Map<Member, any>
        ? Success
        : Member extends Object
        ? Parent extends WeakMap<Member, any>
            ? Success
            : Fail
        : Fail;

    /**
     * Checks if a value exists within a type
     * @template Parent - The type to check
     * @template Member - The value to look for
     * @example
     * type HasAdmin = Is.In<UserRoles, 'admin'>;
     */
    export type In<Parent, Member> = Type<
        Parent,
        Map<any, any> | Set<any> | WeakMap<any, any>
    > extends Fail
        ? Member extends Parent[keyof Parent]
            ? Success
            : Parent extends
                  | Map<any, Member>
                  | Member[]
                  | Set<Member>
                  | WeakMap<any, Member>
            ? Success
            : Fail
        : Fail;

    export type For<Funct extends Type.Function, Args> = Args extends any[]
        ? Type<Args, Type.Arguments<Funct>>
        : Type<[Args], Type.Arguments<Funct>>;
    export type From<Funct extends Type.Function, Ret> = Type<
        Ret,
        Type.Return<Funct>
    >;
    export type Type<SubClass, SuperClass> = SubClass extends SuperClass
        ? Success
        : Fail;
}

// type _Is = Is;
export namespace It {
    export type Is<A, B> = Is.Eq<A, B>;
}

/**
 * Utilities for retrieving properties from types.
 */
export namespace Get {
    type PropertyMatch<Parent, Value> = keyof {
        [Key in keyof Parent as Parent[Key] extends Value
            ? Key
            : never]: Parent[Key];
    };
    export type Property<Parent, Value> = PropertyMatch<
        Parent,
        Value
    > extends never
        ? Is.Fail
        : PropertyMatch<Parent, Value>;
    /**
     * Gets a member from a type by key
     * @template Parent - The type to get from
     * @template Key - The key to get
     * @example
     * type IdType = Get.Member<User, 'id'>;
     */
    export type Member<Parent, Key> = Key extends keyof Parent
        ? Parent[Key]
        : Is.Fail;

    /**
     * Gets a string representation of a type
     * @template T - The type to convert to string
     * @example
     * type TypeName = Get.TypeString<number>; // "number"
     */
    export type TypeString<T> = T extends string
        ? "string"
        : T extends number
        ? "number"
        : T extends boolean
        ? "boolean"
        : T extends symbol
        ? "symbol"
        : T extends Array<infer U>
        ? `Array<${TypeString<U>}>`
        : T extends object
        ? `Record<${TypeString<keyof T>}, ${TypeString<T[keyof T]>}>`
        : "Is.Fail";
}

declare const a: Get.Member<{ a: "3"; b: " 3" }, "a" | "b">;

/**
 * Converts a type to a specific primitive type
 * @template Type - The target type
 * @template T - The type to convert
 * @example
 * type AsNumber = To<number, string | number>; // number
 */
export type To<Type, T> = T extends Type ? T : never;

export namespace To {
    /** Converts to number type */
    export type Number<T> = To<number, T>;
    /** Converts to string type */
    export type String<T> = To<string, T>;
    /** Converts to boolean type */
    export type Boolean<T> = To<boolean, T>;
    /** Converts to symbol type */
    export type Symbol<T> = To<symbol, T>;
}
