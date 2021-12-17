import { AuthzRequest, AuthzResult, getIdentityFor } from "./authorization";
import { UserData } from "./users";


export type Rule = (r: AuthzRequest, d: UserData) => AuthzResult;

function deny():AuthzResult{
    return { 
        details: "Deny all", 
        allow: false, 
    };
}

function AllowOnly(...subscribers: string[]): Rule{
    return (r:AuthzRequest, d:UserData): AuthzResult => {
        if(subscribers.includes(getIdentityFor(r).guid)){
            return {
                details: "User authorized by AllowOnly rule",
                allow: true,
            };
        }else{
            return {
                details: "User not authorized by AllowOnly rule",
                allow: false,
            };
        }
    };
}


export default {
    deny, 
    AllowOnly, 
};
