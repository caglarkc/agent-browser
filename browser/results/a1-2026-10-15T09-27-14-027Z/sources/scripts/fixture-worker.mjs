import {startFixtures} from '../test/fixtures.mjs';
const fixture = await startFixtures();
process.send({origin:fixture.origin});
let closed;
const close = () => closed ||= fixture.close().then(()=>{process.disconnect?.();});
process.on('message',message=>{if(message==='close')void close();});
process.on('disconnect',()=>{void close();});
process.on('SIGTERM',()=>{void close();});
