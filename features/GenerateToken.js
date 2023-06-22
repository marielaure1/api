import crypto from 'crypto';

export const generatePasswordResetToken = () => {
    const token = crypto.randomBytes(20).toString('hex');
    return token;
};