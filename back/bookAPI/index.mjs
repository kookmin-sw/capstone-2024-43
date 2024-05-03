import { requestAladin } from './aladin.mjs'

// Test
(async () => {
    console.log("============Test Search============");
    await requestAladin("search", "심너울")
        .then(console.log);
    console.log("===================================");
    
    console.log("============Test LookUp============");
    await requestAladin("lookUp", "9791168341760")
        .then(console.log);
    console.log("===================================");
})()
