'use server'
import Hashids from "hashids";
import dayjs from "dayjs";
import API from "./api";
import { encryptor } from "./utils";

const OMNICHANNEL_URL = "https://staging.lenna.ai";
export async function registerUser(): Promise<object> {
    const appId = "PdyJge";
    const integrationId = "1663";
  
    const hashids = new Hashids("", 6);
    const url = new URL(`/${appId}/register/webchat`, OMNICHANNEL_URL);
    console.log(url.toString());

    try {
        const res = await fetch(url.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `pengguna-${Date.now()}`,
                phone: Date.now(),
                email: `${Date.now()}@gmail.com`
            })
        });
    
        const response = await res.json();
        
        console.log('response', response);
        const user = response.data?.user;
        const cred = response.data?.cred;
        const expiredAt = dayjs().add(7, "day").valueOf();
        
        const userId = hashids.encode(user.id);
      
        const obj = {
          id: userId,
          cred,
          email: user?.email?.toLowerCase(),
          expiredAt,
          name: encryptor(user.name)
        };
      
        return obj;
    } catch (err) {
        console.log('Error:', err);
        throw new Error('Failed to register user' + err);
    }
}