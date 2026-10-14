export const tasks = [
  {id:'read', goal:'Read the price of Notebook in the product table.', steps:[], expected:{price:'125 TRY'}},
  {id:'form', goal:'Set name to Ada, category to Research, accept terms, then submit once.', values:{Name:'Ada'}, steps:['Name','Category → Research','Accept terms','Submit'], expected:{name:'Ada',category:'research',terms:true}},
  {id:'upload', goal:'Upload the supplied sample.txt file, then submit once.', steps:['Attachment','Submit'], expected:{filename:'sample.txt',content:'browser-lab-upload\n'}},
  {id:'menu', goal:'Open the menu, wait for its options, and choose Research.', steps:['Open menu','Research'], expected:{selected:'research'}},
  {id:'overlay', goal:'Dismiss the dialog, then activate Continue once.', steps:['Dismiss dialog','Continue'], expected:{continued:true}},
  {id:'lazy', goal:'Scroll to load the additional record, then choose Record 42.', steps:['Scroll down','Record 42'], expected:{record:42}},
  {id:'shadow', goal:'Activate the Research button in the component.', steps:['Research'], expected:{selected:'research'}},
  {id:'iframe', goal:'Activate the Research button inside the frame.', steps:['Research'], expected:{selected:'research'}},
  {id:'css-hidden', goal:'Activate the visible Research button.', steps:['Research'], expected:{selected:'research'}},
  {id:'pointer', goal:'Activate the Research control.', steps:['Research'], expected:{selected:'research'}},
  {id:'trusted-pointer',goal:'Activate the Research control with browser-generated trusted input.',steps:['Research'],expected:{selected:'research'}},
  {id:'autocomplete',goal:'Enter Lisbon in City, select the matching suggestion, then Search once.',values:{City:'Lisbon'},steps:['City','Lisbon','Search'],expected:{city:'Lisbon',selected:'Lisbon'}},
  {id:'records',goal:'Open Case 104, not the other case.',steps:['Open'],expected:{record:104}},
  {id:'canvas', goal:'Select the blue rectangle drawn in the canvas.', steps:['Blue rectangle'], expected:{color:'blue'}, visual:true}
];
