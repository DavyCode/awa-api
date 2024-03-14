import crypto from 'crypto';
import moment from 'moment';

class Utils {
  getObjectValues(object: Record<string, any> = {}): Array<any> {
    return Object.values(object);
  }

  getObjectKeys(object: Record<string, any> = {}): Array<any> {
    return Object.keys(object);
  }

  getRandomInteger(min = 0, max = Number.MAX_SAFE_INTEGER) {
    return Math.floor(Math.random() * max + min);
  }

  genRandomNum(start: number = 0, end: number | undefined) {
    return this.getRandomInteger().toString().substring(start, end);
  }

  generateReferralCode() {
		return `AWA${this.getRandomInteger().toString().substring(1, 7)}`;
	}

  parseToJSON(item: any) {
    return JSON.parse(JSON.stringify(item));
  }

  cleanUserResponseData(user: any) {
    const {
      passwordHash,
      resetPassOtp,
      verifyEmailOtp,
      smileResBody,
      __v,
      ...rest
    } = this.parseToJSON(user);

    return rest;
  }

  escapeRegex(text: string): string | boolean {
    if (typeof text !== 'string') {
      return false;
      // throw new Error("Input is not a string");
    }
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  genTimeStamp(x: number, y: number, z = 1) {
    return Date.now() + 1000 * x * y * z;
  }

  async generateTrxRef() {
    const hash = crypto.randomBytes(256);
    const randomChar = await crypto.createHmac('sha256', hash).digest('hex');
    let ref = 'AWA';
    const time = new Date(new Date());

    for (let i = 0; i < 5; i++) {
      const a = randomChar.charAt(
        Math.floor(Math.random() * randomChar.length),
      );
      ref += a;
    }

    ref += `${time.getFullYear()}${time.getMonth() + 1}${time.getDate()}${
      time.toTimeString().split(':')[0]
    }`;
    return ref;
  }

  async generateCode(length: number) {
    const hash = crypto.randomBytes(256);
    const randomChar = await crypto.createHmac('sha256', hash).digest('hex');
    let ref = 'trc';

    for (let i = 0; i < length; i++) {
      const a = randomChar.charAt(
        Math.floor(Math.random() * randomChar.length),
      );
      ref += a;
    }

    return ref;
  }

  formatDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':');
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date;
  }

  getTimeNow() {
    const timeNow: Date = new Date();
    const currentTime: Date = new Date(timeNow);
    currentTime.setHours(timeNow.getHours() + 1, timeNow.getMinutes(), 0, 0);

    return currentTime;
  }

  convertDateFormat(originalDate: string): string | null {
    const parts: string[] = originalDate.split('-');

    if (parts.length === 3) {
      // Rearrange the parts to form the desired format
      const formattedDate: string = `${parts[2]}-${parts[0]}-${parts[1]}`;
      return formattedDate;
    } else {
      console.error('Invalid date format');
      return null; // or handle the error in a way that makes sense for your use case
    }
  }

  isValidDateFormatAndConvert(dateString: string): string | null {
    const format = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/; // YYYY-MM-DD

    if (format.test(dateString)) {
      // Convert the matched format to "YYYY-MM-DD"
      const date = new Date(dateString);
      const convertedDate = date.toISOString().split('T')[0];
      return convertedDate;
    }

    console.error('Invalid date format');
    return null; // or handle the error in a way that makes sense for your use case
  }

  makeDateReadable(dateString: string): string {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const readableDate: string = date.toLocaleDateString('en-US', options);

    return readableDate;
  }
}

export default new Utils();
