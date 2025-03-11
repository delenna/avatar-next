import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge"
import CryptoJS from "crypto-js";
import NUM from "@/app/lib/encrypt-number";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function encryptor(text: string, secret = "k384y0r4nTRIANGLE") {


  
  /**
   * 
   * Pada legacy code fungsi ini menggunakan method dari lodash yaitu "padEnd" untuk generate secretKey.
   * 
   * ex: 
   * 
   * VUE_APP_SECRET_KEY=verysecret
   * NUM.secretKeyPadChar = '0'
   * NUM.secretKeyPadLength = 32
   * 
   * result --> verysecret0000000000000000000000 (32 char length) -> to base64
   * 
   * 
   * VUE_APP_SECRET_KEY=asd
   * NUM.secretKeyPadChar = '0'
   * NUM.secretKeyPadLength = 32
   * 
   * result --> asd00000000000000000000000000000 (32 char length) -> to base64
   */
  
  const secretKey = secret.concat(`${NUM.secretKeyPadChar.repeat(NUM.secretKeyPadLength - secret.length)}`);
  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const iv = CryptoJS.enc.Utf8.parse('0000000000000000');
  const chiper = CryptoJS.AES.encrypt(text, key, {
    keySize: 256,
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  let output = chiper.ciphertext.toString(CryptoJS.enc.Base64);
  return output;
}


