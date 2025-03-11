import { NextResponse } from 'next/server';
import { encryptor } from "@/app/lib/utils";
import dayjs from 'dayjs';
import Hashids from 'hashids';

const OMNICHANNEL_URL = process.env.OMNICHANNEL_URL || "https://staging.lenna.ai/app/public/api";

export async function POST(req: Request) {
    // try {
    //     const hashids = new Hashids('', 6)
    //     // const raw = JSON.parse(localStorage.getItem("lenna_initialize") || "{}");
    //     // const rawUser = JSON.parse(localStorage.getItem("avatar_user") || "{}");
    //     const timestampMilisecond = dayjs().valueOf();
    //     const timestampSecond = dayjs().unix();

    //     const appId = "PdyJge";
    //     const integrationId = "RdGB3b";
    //     const credTime = encryptor(`${timestampSecond}`);
    //     const userId = hashids.decode(rawUser.id)[0];

    //     const header = {
    //         "X-LENNA-WEBCHAT": rawUser.cred,
    //         "X-LENNA-ROBOT": credTime
    //     };

    //     // const { message, headers } = req.isFile ? jsonMessageFile(content) : jsonMessage(content);

    //     const res = await fetch(`${OMNICHANNEL_URL}/${appId}/webhook/webchat`, {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //           ...header
    //         },
    //         body: JSON.stringify({
    //             senderId: rawUser.id,
    //             temporary_id: `${timestampMilisecond}`,
    //             id: `${timestampMilisecond}`,
    //             messageable_id: rawUser.id,
    //             messageable_type: "user",
    //             created_at: null,
    //             content: [
    //                 {
    //                     type: "text",
    //                     text: 'vc',
    //                     speech: 'vc'
    //                 }
    //             ],
    //             events: "message",
    //             integrationId
    //         })
    //     });

    //     const data = await res.json();
    //     return NextResponse.json(data);
    // } catch (error) {
    //     console.log(error);
    //     return NextResponse.json({ error: error.message }, { status: 500 });
    // }
}
