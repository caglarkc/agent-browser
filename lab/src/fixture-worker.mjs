import {startFixtures} from './fixtures.mjs';
const fixtures=await startFixtures();
process.send({ready:true,origin:fixtures.origin});
process.on('message',async message=>{
  try{
    let value;
    if(message.operation==='create')value=fixtures.create(message.task.id,message.task);
    else if(message.operation==='verify')value=fixtures.verify(message.token,message.extracted);
    else if(message.operation==='close'){await fixtures.close();process.send({id:message.id,value:true});process.disconnect();return}
    else throw Error('Unknown fixture operation');
    process.send({id:message.id,value});
  }catch{process.send({id:message.id,error:'Fixture operation failed'})}
});
process.on('disconnect',()=>process.exit(0));
