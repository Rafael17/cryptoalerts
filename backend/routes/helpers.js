const crypto = require('crypto');

const generateSalt = function (numCharacters) {
    const set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    let salt = '';
    for (let i = 0; i < numCharacters; i++) {
        salt += set[Math.floor(Math.random() * set.length)];
    }
    return salt;
}
const md5 = (str) => {
    return crypto.createHash('md5').update(str).digest('hex');
}

const encryptPassword = (pass) => {
    const salt = generateSalt(10);
    return (salt + md5(pass + salt));
}

const validatePassword = (plainPass, hashedPass) => {
    const salt = hashedPass.substr(0, 10);
    const validHash = salt + md5(plainPass + salt);
    return hashedPass === validHash
}

const generateCookie = () => { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16); }); }

module.exports = {
    generateSalt,
    validatePassword,
    generateCookie,
    encryptPassword
}