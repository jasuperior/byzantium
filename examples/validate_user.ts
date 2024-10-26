import { Assert, Is } from "..";

interface ValidUser {
    username: string;
    password: string;
}
interface InvalidUser {
    username: number;
    password: string;
}

type ValidateUser<User> = Assert<
    Is.Type<
        User,
        {
            username: string;
            password: string;
        }
    >,
    "User requires both a username and password",
    User
>;

function loginUser<T>(user: ValidateUser<T>) {
    // .... business logic
}

declare const user1: ValidUser;
declare const user2: InvalidUser;

loginUser(user1);
loginUser(user2);
