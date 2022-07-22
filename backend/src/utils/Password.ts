import crypto from 'crypto';

export default abstract class Password {

    // -----[PRIVATE STATIC METHODS]-----

    private static hashing(password: string, salt: string, numberIterations: number): string {
        password += salt;
        for (let i = 0; i < numberIterations; ++i) {
            password = crypto.createHash('sha256').update(password)
                .digest('hex');
        }

        password = password.replace(password.substring(0, 8), salt);
        password = password.substring(0, 32) + numberIterations + password.substring(32);

        return password;
    }


    // ----- [ PUBLIC STATIC METHODS ] ---------------------------------------------------------------------------------

    public static calculateHash(password: string): string {
        const salt = crypto.randomBytes(4).toString('hex');
        const numberIterations = Math.floor(Math.random() * 7 + 3);

        return this.hashing(password, salt, numberIterations);
    }

    public static check(password: string, validPasswordHash: string): boolean {
        const salt = validPasswordHash.substring(0, 8).toString();
        const numberIterations = Number(validPasswordHash[32]);

        const passwordHash = this.hashing(password, salt, numberIterations);

        return (passwordHash === validPasswordHash);
    }


}
