const topics=['Research','Design','Support','Market','Analytics'];
export function makeVariant(base,index){
  if(index===0)return {...base,variant:0,config:{}};
  const topic=topics[index%topics.length],name=['Mira','Deniz','Eren','Selin','Robin'][index%5],price=String(93+index*37)+' TRY',record=42+index;
  const config={topic,topicValue:topic.toLowerCase(),delay:80+(index%4)*170,reverse:index%2===1,record,price,prefilled:index%3===0,termsChecked:index%4===0,variant:index};
  const task={...base,variant:index,config};
  if(base.id==='read'){task.goal='Read the price of Notebook, ignoring other products.';task.expected={price}}
  if(base.id==='form'){
    task.goal=`Set name to ${name}, category to ${topic}, accept terms, then submit exactly once.`;
    task.values={Name:name};task.expected={name,category:topic.toLowerCase(),terms:true};
    config.name=name;task.steps=[...(!config.prefilled?['Name']:[]),'Category → '+topic,...(!config.termsChecked?['Accept terms']:[]),'Submit'];
  }
  if(['menu','shadow','iframe','css-hidden','pointer','trusted-pointer'].includes(base.id)){
    task.goal=base.goal.replaceAll('Research',topic);task.expected={selected:topic.toLowerCase()};task.steps=base.steps.map(s=>s.replaceAll('Research',topic));
  }
  if(base.id==='lazy'){task.goal=`Scroll to load the additional record, then choose Record ${record}.`;task.steps=['Scroll down','Record '+record];task.expected={record}}
  if(base.id==='autocomplete'){const city=['Lisbon','Berlin','Ankara','London','Paris'][index%5];config.city=city;task.goal=`Enter ${city} in City, select the matching suggestion, then Search exactly once.`;task.values={City:city};task.steps=['City',city,'Search'];task.expected={city,selected:city}}
  if(base.id==='records'){config.caseId=104+index;task.goal=`Open Case ${config.caseId}, not the other case.`;task.expected={record:config.caseId}}
  return task;
}
