import { AuthzResult, Rule } from "./authorization";



function deny():AuthzResult{
    return { 
        details: "Deny all", 
        allow: false, 
    };
}


export default {
    deny,   
};
