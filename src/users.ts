import { Pool } from 'pg';
import { AuthzIdentity } from './authorization';

// Any valid JSON 
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserData {}

export class UserDB{
    constructor(pool:Pool){
        return this;
    }

    getData(identity: AuthzIdentity): UserData {
        return {};
    }
}
