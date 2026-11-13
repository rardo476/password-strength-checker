
'use strict';

// This shortcut finds an HTML element using its unique ID.
const $ = (id) => document.getElementById(id);

// These are common passwords that the checker treats as predictable.
const COMMON = ['password','password123','123456','12345678','123456789','qwerty','qwerty123','admin','letmein','welcome','iloveyou','abc123','111111','monkey','dragon'];

// This function examines a password and calculates its strength.
function analyze(value){

  // Count the number of characters in the password.
  const length=value.length;

  // Regular expressions check for lowercase letters, uppercase letters,
  // numbers, and symbols. A regular expression is a pattern used to match text.
  const lower=/[a-z]/.test(value), upper=/[A-Z]/.test(value), number=/[0-9]/.test(value), symbol=/[^a-zA-Z0-9]/.test(value);

  // Count how many different character categories are present.
  const types=[lower,upper,number,symbol].filter(Boolean).length;

  // Convert the password to lowercase for case-insensitive comparisons.
  const normalized=value.toLowerCase();

  // Check for common passwords, repeated characters, and easy patterns.
  const predictable=COMMON.some(x=>normalized.includes(x)) || /(.)\1{3,}/.test(value) || /(?:abcd|1234|qwer|asdf|zxcv|4321)/i.test(value);

  // Estimate the number of possible characters used by the password.
  const pool=(lower?26:0)+(upper?26:0)+(number?10:0)+(symbol?33:0);

  // Entropy is an estimate of password unpredictability, measured in bits.
  const entropy=pool>0?Math.round(length*Math.log2(pool)):0;

  // Calculate a score based on password length and character variety.
  let score=Math.min(60,length*3)+(types-1)*10+(length>=16?10:0);

  // Reduce the score when predictable patterns are found.
  if(predictable)score=Math.min(score,15);

  // Limit the score of passwords that are too short.
  if(length<8)score=Math.min(score,20);
  else if(length<12)score=Math.min(score,45);

  // Keep the final score between 0 and 100.
  score=Math.max(0,Math.min(100,score));

  // Set the default label, color, and advice.
  let label='Not tested',color='#f07171',advice='Enter a sample password to see your results.';

  // Assign a strength rating based on the calculated score.
  if(length){
    if(score<30){label='Very weak';advice='Try a longer, unique password or a randomly generated one.';}
    else if(score<50){label='Weak';advice='Increase the length and avoid predictable patterns.';}
    else if(score<75){label='Moderate';color='#f2bf62';advice='Good start. A longer, unique password is safer.';}
    else {label='Strong';color='#55f0bb';advice='Looks stronger by these basic checks. Make sure it is unique to this account.';}
  }

  // Return the analysis results so other functions can use them.
  return {length,types,entropy,score,label,color,advice,lower,upper,number,symbol,predictable};
}

// Update the website whenever the user enters a password.
function update(){

 // Analyze the password entered in the HTML input field.
 const a=analyze($('password').value);

 // Display password length, character categories, and estimated entropy.
 $('length').textContent=String(a.length);$('types').textContent=`${a.types} / 4`;$('entropy').textContent=a.length?`${a.entropy} bits`:'—';

 // Display the strength rating and its corresponding color.
 $('strength-label').textContent=a.label;$('strength-label').style.color=a.color;

 // Update the visual strength meter and its accessibility value.
 $('meter-fill').style.width=`${a.score}%`;$('meter-fill').style.background=a.color;$('meter').setAttribute('aria-valuenow',String(a.score));

 // Mark each password requirement as satisfied or unsatisfied.
 for(const [id,ok] of [['c-length',a.length>=12],['c-upper',a.upper&&a.lower],['c-number',a.number],['c-symbol',a.symbol],['c-common',a.length>0&&!a.predictable]]) $(''+id).classList.toggle('ok',ok);

 // Show advice to help the user improve their password.
 $('advice').textContent=a.advice;

 // Save only the strength rating, never the password itself.
 if (a.length > 0) {
   localStorage.setItem('lastStrengthRating', a.label);
 }
}

// An event listener runs update() whenever the password input changes.
$('password').addEventListener('input',update);

// This event listener lets users show or hide their password.
$('toggle').addEventListener('click',()=>{const input=$('password');const show=input.type==='password';input.type=show?'text':'password';$('toggle').textContent=show?'HIDE':'SHOW';$('toggle').setAttribute('aria-label',show?'Hide password':'Show password');});

// Update the displayed password length when the slider moves.
$('size').addEventListener('input',()=>{$('size-label').textContent=$('size').value;});

// Generate a secure random index for choosing characters.
// crypto.getRandomValues() provides cryptographically secure random numbers.
// The rejection loop avoids favoring some characters over others.
function secureIndex(max){const maxUint=4294967296;const limit=Math.floor(maxUint/max)*max;const buffer=new Uint32Array(1);let n;do{crypto.getRandomValues(buffer);n=buffer[0];}while(n>=limit);return n%max;}

// This function generates a random password using the user's settings.
function generate(){

 // Start with lowercase letters and add selected character categories.
 const groups=['abcdefghijklmnopqrstuvwxyz'];if($('uppercase').checked)groups.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');if($('numbers').checked)groups.push('0123456789');if($('symbols').checked)groups.push('!@#$%^&*()-_=+[]{}?');

 // Combine the available characters and read the requested length.
 const pool=groups.join('');const length=Number($('size').value);const chars=[];

 // Include at least one character from each selected category.
 for(const group of groups)chars.push(group[secureIndex(group.length)]);

 // Add random characters until the requested length is reached.
 while(chars.length<length)chars.push(pool[secureIndex(pool.length)]);

 // Shuffle the characters so their order is unpredictable.
 for(let i=chars.length-1;i>0;i--){const j=secureIndex(i+1);[chars[i],chars[j]]=[chars[j],chars[i]];}

 // Display the generated password and a security message.
 $('generated').value=chars.join('');$('copy-status').textContent='Generated locally using cryptographically secure randomness.';
}

// Generate a new password when the Generate button is clicked.
$('generate').addEventListener('click',generate);

// Copy the generated password to the clipboard.
// The try/catch statement handles cases where copying fails.
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('generated').value);$('copy-status').textContent='Copied! Remember: clipboard contents may be accessible to other apps.';}catch{$('copy-status').textContent='Clipboard unavailable. Select the password and copy it manually.';}});

// Generate a new password when character options are changed.
for(const id of ['uppercase','numbers','symbols'])$(id).addEventListener('change',generate);

// Generates a password and initialize the checker when the page loads.
generate();
update();

// localStorage allows the browser to remember data after a page refresh.
// This retrieves the last saved password strength rating, if one exists.
const savedRating = localStorage.getItem('lastStrengthRating');

// Display the saved rating when a stored value is available.
if (savedRating !== null) {
  $('strength-label').textContent = savedRating;
}
