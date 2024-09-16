
function currentDate() {
    const date = new Date();
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

const hexToConsoleColor = (hexColor) => {
    if (typeof hexColor !== 'string') throw new TypeError('La couleur doit être une chaîne de caractères hexadécimale.');

    // Supprimer le "#" du début si présent
    hexColor = hexColor.replace(/^#/, '');

    // Convertir les valeurs hexadécimales en valeurs décimales
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);

    // Retourner le code d'échappement ANSI correspondant
    return `\x1b[38;2;${r};${g};${b}m`;
};


class Logger {

    constructor() {
        this.colors = {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            dim: '\x1b[2m',
            underscore: '\x1b[4m',
            blink: '\x1b[5m',
            reverse: '\x1b[7m',
            hidden: '\x1b[8m',
            fg: {
                black: '\x1b[30m',
                red: '\x1b[31m',
                green: '\x1b[32m',
                yellow: '\x1b[33m',
                blue: '\x1b[34m',
                magenta: '\x1b[35m',
                cyan: '\x1b[36m',
                white: '\x1b[37m',
                crimson: '\x1b[38m',
                pink: '\x1b[38;5;206m',
            },
            bg: {
                black: '\x1b[40m',
                red: '\x1b[41m',
                green: '\x1b[42m',
                yellow: '\x1b[43m',
                blue: '\x1b[44m',
                magenta: '\x1b[45m',
                cyan: '\x1b[46m',
                white: '\x1b[47m',
                crimson: '\x1b[48m',
                pink: '\x1b[48;5;206m',
            }
        }
    }

    async info(log) {
        return this._printLog(currentDate(), await this.setcolor('INFO', 'blue'), log); // Blue color for INFO
    }

    async error(log, error=false) {
        if (error){
            await this._printLog(currentDate(), await this.setcolor('ERROR', 'red'), log); // Blue color for INFO
            return console.error(error);
        }
        else {
            return this._printLog(currentDate(), await this.setcolor('ERROR', 'red'), log); // Blue color for INFO
        }
    }

    async warn(log) {
        return this._printLog(currentDate(), await this.setcolor('WARN', 'yellow'), log); // Yellow color for WARN
    }

    async debug(log) {
        if (process.env.DEBUG !== "true") return
        return this._printLog(currentDate(), await this.setcolor('DEBUG', 'pink'), log);
    }

    async success(log){
        return this._printLog(currentDate(), await this.setcolor('SUCESS', 'green'), log);
    }
    async _printLog(date, level, message) {
        await console.log(`[${date}] [${level}] ${message}`);
    }

    async setcolor(message, color) {
        return `${this.colors.fg[color]}${message}${this.colors.reset}`;
    }

    async custom(input){
        if (typeof input !== 'object') return new TypeError('Input must be an object');
        let str = ""
        if (input.date === true) str += `[${currentDate()}] `;

        const levelColor = input.color ? hexToConsoleColor(input.color) : '\x1b[0m';
        if (input.level !== undefined) str += `[${levelColor}${input.level}\x1b[0m] `;

        const messageColor = input.messageColor ? hexToConsoleColor(input.messageColor) : '';
        if (input.message !== undefined) str += `${messageColor}${input.message}\x1b[0m`;


        await console.log(str);

    }
}

module.exports = Logger;

