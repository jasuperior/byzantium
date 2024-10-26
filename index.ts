declare const Reason: unique symbol;
declare const Data: unique symbol;
type Type = typeof Reason;
type Data = typeof Data;

export type Exception<Message extends string | symbol, Data = Is.Nothing> = {
    [Reason]: Message;
    [Data]: Data;
};
export namespace Exception {}

export type Assert<
    Test,
    Message extends string | symbol = Is.Fail,
    OnSuccess = Test,
    Data = Is.Nothing
> = Test extends Is.Fail ? Exception<Message, Data> : OnSuccess;
export namespace Assert {
    export type Todo<
        Message extends string = "Code path not yet implemented!"
    > = Exception<`TODO: ${Message}`>;

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
 *
 * Operations
 *
 */
export type And<A = Is.Fail, B = Is.Fail> = A & B extends Is.Fail
    ? Is.Fail
    : Is.Success;
export type Or<A, B> = A | B extends Is.Fail ? Is.Fail : Is.Success;
export type Nor<A, B> = Is.Not<Or<A, B>>;
export type Nand<A, B> = Is.Not<And<A, B>>;

export type If<Condition, Success, Fail = Is.Fail> = Condition extends Is.Fail
    ? Fail
    : Success;
export type Switch<Test, Cases> = If<
    Is.On<Cases, Test>,
    Get.Member<Cases, Test>
>;

export type Is<Actual, Expected> = [Expected, Actual] extends [Actual, Expected]
    ? Is.Success
    : Is.Fail;
export namespace Is {
    export declare const Fail: unique symbol;
    export type Fail = typeof Fail;
    export declare const Success: unique symbol;
    export type Success = typeof Success;
    export declare const Nothing: unique symbol;
    export type Nothing = typeof Nothing;

    export type Attempt = Success | Fail;

    export type Actually<A, B> = Is<A, B>;
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

    export type All<Attempts extends Is.Attempt[] = []> = Attempts extends [
        infer Head,
        ...infer Tail
    ]
        ? Tail extends Is.Attempt[]
            ? And<Head, All<Tail>>
            : And<Head, All<[]>>
        : Attempts[To.Number<keyof Attempts>];
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

    export type On<Parent, Member> = Member extends keyof Parent
        ? Success
        : Parent extends Map<Member, any>
        ? Success
        : Member extends Object
        ? Parent extends WeakMap<Member, any>
            ? Success
            : Fail
        : Fail;

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
    export type Is<A, B> = Is.Actually<A, B>;
}

export namespace Get {
    type PropertyMatch<Parent, Value> = keyof {
        [Key in keyof Parent as Parent[Key] extends Value
            ? Key
            : never]: Parent[Key];
    };
    export type Member<Parent, Key> = Key extends keyof Parent
        ? Parent[Key]
        : Is.Fail;
    export type Property<Parent, Value> = PropertyMatch<
        Parent,
        Value
    > extends never
        ? Is.Fail
        : PropertyMatch<Parent, Value>;

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

// Helper to index arrays
export type To<Type, T> = T extends Type ? T : never;
export namespace To {
    export type Number<T> = To<number, T>;
    export type String<T> = To<string, T>;
    export type Boolean<T> = To<boolean, T>;
    export type Symbol<T> = To<symbol, T>;
}
