import { requestAladin } from './aladin.mjs'

export const handler = async (event, context, callback) => {
    const res = {
        "statusCode": 200,
        "headers": {
            "Content-Type": "*/*"
        }
    };
    
    res.body = await requestAladin(event.type, event.query);
    callback(null, res);
};
