'use strict';
const $ = (id) => document.getElementById(id);
const COMMON = ['password','password123','123456','12345678','123456789','qwerty','qwerty123','admin','letmein','welcome','iloveyou','abc123','111111','monkey','dragon'];
function analyze(value){
  const length=value.length;
  const lower=/[a-z]/.test(value), upper=/[A-Z]/.test(value), number=/[0-9]/.test(value), symbol=/[^a-zA-Z0-9]/.test(value);
  const types=[lower,upper,number,symbol].filter(Boolean).length;
  const normalized=value.toLowerCase();
  const predictable=COMMON.some(x=>normalized.includes(x)) || /(.)\1{3,}/.test(value) || /(?:abcd|1234|qwer|asdf|zxcv|4321)/i.test(value);
  const pool=(lower?26:0)+(upper?26:0)+(number?10:0)+(symbol?33:0);
  const entropy=pool>0?Math.round(length*Math.log2(pool)):0;
  let score=Math.min(60,length*3)+(types-1)*10+(length>=16?10:0);
  if(predictable)score=Math.min(score,15);
  if(length<8)score=Math.min(score,20);
  else if(length<12)score=Math.min(score,45);
  score=Math.max(0,Math.min(100,score));
  let label='Not tested',color='#f07171',advice='Enter a sample password to see your results.';
  if(length){
    if(score<30){label='Very weak';advice='Try a longer, unique password or a randomly generated one.';}
    else if(score<50){label='Weak';advice='Increase the length and avoid predictable patterns.';}
    else if(score<75){label='Moderate';color='#f2bf62';advice='Good start. A longer, unique password is safer.';}
    else {label='Strong';color='#55f0bb';advice='Looks stronger by these basic checks. Make sure it is unique to this account.';}
  }
  return {length,types,entropy,score,label,color,advice,lower,upper,number,symbol,predictable};
}
function update(){
 const a=analyze($('password').value);
 $('length').textContent=String(a.length);$('types').textContent=`${a.types} / 4`;$('entropy').textContent=a.length?`${a.entropy} bits`:'—';
 $('strength-label').textContent=a.label;$('strength-label').style.color=a.color;
 $('meter-fill').style.width=`${a.score}%`;$('meter-fill').style.background=a.color;$('meter').setAttribute('aria-valuenow',String(a.score));
 for(const [id,ok] of [['c-length',a.length>=12],['c-upper',a.upper&&a.lower],['c-number',a.number],['c-symbol',a.symbol],['c-common',a.length>0&&!a.predictable]]) $(''+id).classList.toggle('ok',ok);
 $('advice').textContent=a.advice;
}
$('password').addEventListener('input',update);
$('toggle').addEventListener('click',()=>{const input=$('password');const show=input.type==='password';input.type=show?'text':'password';$('toggle').textContent=show?'HIDE':'SHOW';$('toggle').setAttribute('aria-label',show?'Hide password':'Show password');});
$('size').addEventListener('input',()=>{$('size-label').textContent=$('size').value;});
function secureIndex(max){const maxUint=4294967296;const limit=Math.floor(maxUint/max)*max;const buffer=new Uint32Array(1);let n;do{crypto.getRandomValues(buffer);n=buffer[0];}while(n>=limit);return n%max;}
function generate(){
 const groups=['abcdefghijklmnopqrstuvwxyz'];if($('uppercase').checked)groups.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');if($('numbers').checked)groups.push('0123456789');if($('symbols').checked)groups.push('!@#$%^&*()-_=+[]{}?');
 const pool=groups.join('');const length=Number($('size').value);const chars=[];
 for(const group of groups)chars.push(group[secureIndex(group.length)]);
 while(chars.length<length)chars.push(pool[secureIndex(pool.length)]);
 for(let i=chars.length-1;i>0;i--){const j=secureIndex(i+1);[chars[i],chars[j]]=[chars[j],chars[i]];}
 $('generated').value=chars.join('');$('copy-status').textContent='Generated locally using cryptographically secure randomness.';
}
$('generate').addEventListener('click',generate);
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('generated').value);$('copy-status').textContent='Copied! Remember: clipboard contents may be accessible to other apps.';}catch{$('copy-status').textContent='Clipboard unavailable. Select the password and copy it manually.';}});
for(const id of ['uppercase','numbers','symbols'])$(id).addEventListener('change',generate);
generate();
update();
const savedRating = localStorage.getItem('lastStrengthRating');

if (savedRating !== null) {
  $('strength-label').textContent = savedRating;
}
