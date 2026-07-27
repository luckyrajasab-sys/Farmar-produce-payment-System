const KEY="smart_farmer_records_v2";

let records=[];
let selected=null;

const e={
search:document.getElementById("searchInput"),
status:document.getElementById("statusFilter"),
produceFilter:document.getElementById("produceFilter"),
table:document.getElementById("tableBody"),
empty:document.getElementById("emptyState"),
count:document.getElementById("shownCount"),
amount:document.getElementById("totalAmount"),
paid:document.getElementById("paidPending"),
kg:document.getElementById("totalKg"),
display:document.getElementById("displayCountPill"),
detail:document.getElementById("detailPanel"),
form:document.getElementById("recordForm"),
memberId:document.getElementById("memberId"),
memberName:document.getElementById("memberName"),
produce:document.getElementById("produce"),
date:document.getElementById("date"),
quantity:document.getElementById("quantityKg"),
rate:document.getElementById("rate"),
payment:document.getElementById("paymentStatus"),
preview:document.getElementById("amountPreview"),
reset:document.getElementById("resetBtn"),
seed:document.getElementById("seedBtn"),
theme:document.getElementById("themeBtn")
};

function money(n){
return Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2});
}

function save(){
localStorage.setItem(KEY,JSON.stringify(records));
}

async function load(){

let data=localStorage.getItem(KEY);

if(data){
records=JSON.parse(data);
}
else{
let res=await fetch("data.json");
records=await res.json();
save();
}

}

function init(){

load().then(()=>{

loadProduces();

e.date.value=new Date().toISOString().slice(0,10);

events();

loadTheme();

render();

});

}

function loadProduces(){

let list=[...new Set(records.map(x=>x.produce))];

list.forEach(x=>{

let option=document.createElement("option");

option.value=x;
option.textContent=x;

e.produceFilter.appendChild(option);

});

}

function events(){

e.search.oninput=render;

e.status.onchange=render;

e.produceFilter.onchange=render;

e.quantity.oninput=calculate;

e.rate.oninput=calculate;

e.form.onsubmit=addRecord;

e.reset.onclick=()=>{

e.search.value="";
e.status.value="All";
e.produceFilter.value="All";

render();

};

e.seed.onclick=reloadData;

e.theme.onclick=toggleTheme;

}

function calculate(){

let q=Number(e.quantity.value);

let r=Number(e.rate.value);

if(!q||!r){

e.preview.value="0";

return 0;

}

let amount=q*r;

e.preview.value=money(amount);

return Number(amount.toFixed(2));

}

function filtered(){

let text=e.search.value.toLowerCase();

return records.filter(r=>{

let data=
`${r.entry_id}
${r.member_id}
${r.member_name}
${r.produce}`.toLowerCase();


return(
(!text||data.includes(text))&&
(e.status.value==="All"||r.payment_status===e.status.value)&&
(e.produceFilter.value==="All"||r.produce===e.produceFilter.value)
);

});

}
function render(){

let data=filtered();

e.table.innerHTML="";

data.forEach(r=>{

let tr=document.createElement("tr");

if(selected===r.entry_id)
tr.classList.add("active");


tr.innerHTML=`

<td>${r.entry_id}</td>

<td>
${r.member_name}
<br>
<small>${r.member_id}</small>
</td>

<td>${r.produce}</td>

<td>${r.quantity_kg} KG</td>

<td>₹ ${money(r.rate)}</td>

<td>₹ ${money(r.amount)}</td>

<td>${r.payment_status}</td>

`;


tr.onclick=()=>{

selected=r.entry_id;

showDetail(r);

render();

};


e.table.appendChild(tr);

});


e.empty.style.display=data.length?"none":"block";


let total=data.reduce((a,b)=>a+b.amount,0);

let totalKg=data.reduce((a,b)=>a+b.quantity_kg,0);

let paid=data.filter(x=>x.payment_status==="Paid").length;

let pending=data.filter(x=>x.payment_status==="Pending").length;


e.count.textContent=data.length;

e.amount.textContent="₹ "+money(total);

e.kg.textContent=totalKg+" KG";

e.paid.textContent=`${paid}/${pending}`;

e.display.textContent=`Showing ${data.length} Records`;


if(!selected&&data.length)
selected=data[0].entry_id;


let current=records.find(x=>x.entry_id===selected);

showDetail(current);

}


function showDetail(r){

if(!r){

e.detail.innerHTML="Select a record";

return;

}


let farmerRecords=
records.filter(x=>x.member_id===r.member_id);


let totalKg=
farmerRecords.reduce((a,b)=>a+b.quantity_kg,0);


let totalAmount=
farmerRecords.reduce((a,b)=>a+b.amount,0);



e.detail.innerHTML=`

<div class="detail-box">

<h2>${r.member_name}</h2>

<p>ID : ${r.member_id}</p>

<p>Produce : ${r.produce}</p>

<p>Quantity : ${r.quantity_kg} KG</p>

<p>Rate : ₹ ${money(r.rate)}</p>

<p>Amount : ₹ ${money(r.amount)}</p>

<p>Status : ${r.payment_status}</p>


<button onclick="updatePayment('${r.entry_id}')">
Change Status
</button>


</div>


<div class="detail-box">

<h3>Farmer Summary</h3>

<p>Total Quantity : ${totalKg} KG</p>

<p>Total Amount : ₹ ${money(totalAmount)}</p>

</div>

`;

}



function updatePayment(id){

let record=
records.find(x=>x.entry_id===id);


if(!record)return;


record.payment_status=
record.payment_status==="Paid"
?"Pending"
:"Paid";


save();

render();

showDetail(record);

}



function addRecord(event){

event.preventDefault();


let amount=calculate();


if(!amount){

alert("Enter valid quantity and rate");

return;

}


let id=
"ENT-"+String(records.length+1).padStart(3,"0");


let newRecord={

entry_id:id,

member_id:e.memberId.value,

member_name:e.memberName.value,

member_mobile:e.memberMobile.value,

produce:e.produce.value,

quantity_kg:Number(e.quantity.value),

rate:Number(e.rate.value),

amount:amount,

date:e.date.value,

payment_status:e.payment.value

};


records.unshift(newRecord);


save();


selected=id;


e.form.reset();


e.date.value=
new Date().toISOString().slice(0,10);


render();


alert("Record Added Successfully");

}




async function reloadData(){

let check=
confirm("Reload original data?");


if(!check)return;


let res=
await fetch("data.json");


records=
await res.json();


save();


selected=null;


render();

}




function toggleTheme(){

document.body.classList.toggle("light");


let light=
document.body.classList.contains("light");


localStorage.setItem(
"theme",
light?"light":"dark"
);


e.theme.textContent=
light
?"🔦 Bright"
:"🌙 Dark";

}



function loadTheme(){

let theme=
localStorage.getItem("theme");


if(theme==="light"){

document.body.classList.add("light");

e.theme.textContent=" 🔦 Bright";

}

}



window.updatePayment=updatePayment;


init();
