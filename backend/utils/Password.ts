import crypto from 'crypto-js'

export default abstract class Password {
    constructor() {
    }

    //-----[PRIVATE STATIC METHODS]-----

    private static hashing(password: string, salt: string) : string{
        password += salt;
        password = crypto.createHash('sha256').update(password).digest('hex');
        return password;
    }

    //-----[PUBLIC STATIC METHODS]-----

    public  static calculateHash(password: string) : string {
        const salt = crypto.randomBytes(4).toString('hex');
        return this.hashing(password, salt);
    }

    public static  check(password: string, validPasswordHash: string): boolean {
        const salt = validPasswordHash.substring(0, 8).toString();
        const passwordHash = this.hashing(password, salt);

        return (passwordHash === validPasswordHash);
    }

}
