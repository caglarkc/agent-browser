import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
if(process.platform!=='darwin'){
  if(process.argv.includes('--if-supported'))process.exit(0);
  throw Error('Resource probe currently supports macOS only');
}
const root=fileURLToPath(new URL('..',import.meta.url));
mkdirSync(root+'/bin',{recursive:true});
execFileSync('cc',['-O2','-Wall','-Wextra','-Werror',root+'/native/resource-probe.c','-o',root+'/bin/resource-probe'],{stdio:'inherit'});
console.log('Built macOS resource probe');
