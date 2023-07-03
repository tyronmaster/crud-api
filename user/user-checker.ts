import IUser from "./user-inreface";

export function userChecker(user: IUser) {
    return (typeof user.id === "string"
        && typeof user.age === "number"
        && typeof user.username === "string"
        && Array.isArray(user.hobbies)
        && hobbiesChecker(user.hobbies)
        && userKeysChecker(user)
    );
}
function hobbiesChecker(hobbies: string[]) {
    return typeof hobbies.find((hobby) => (typeof hobby !== "string")) === "undefined";
}

function userKeysChecker(user: IUser) {
    const userKeys = ["id", "username", "age", "hobbies"];
    const testingKeys = Object.keys(user);
    if (userKeys.length !== testingKeys.length) return false;

    for (let i = 0; i < testingKeys.length; i++) {
        if (!userKeys.includes(testingKeys[i])) return false;
    }
    return true;
}